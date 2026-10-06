import React, { useMemo, useState } from 'react';
import { 
  Thermometer, Activity, Wind, Sun, Maximize2, ShieldAlert,
  ArrowRight, Cloud, MapPin, Zap, Info, ShieldCheck, Settings2, Download
} from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import { PhysicsPredictor } from '@ml/predictor';
import { optimizeDesign } from '@ml/optimizer';
import { CLIMATE_PROFILES } from '@data/climates';
import { ShelterPreview3D } from '../3d/ShelterPreview3D';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import './FinalResultsView.css';

interface FinalResultsViewProps {
  onBack: () => void;
}

export function FinalResultsView({ onBack }: FinalResultsViewProps) {
  const { design, updateDesign, saveDesign, myDesigns } = useShelter();
  const [showTechnical, setShowTechnical] = useState(false);

  const climate = useMemo(() => CLIMATE_PROFILES.find(c => c.type === design.climateProfile) || CLIMATE_PROFILES[0], [design.climateProfile]);
  
  const simulationResult = useMemo(() => {
    const predictor = new PhysicsPredictor();
    return predictor.predict(design, climate);
  }, [design, climate]);

  const optimizationResult = useMemo(() => {
    return optimizeDesign(design, climate);
  }, [design, climate]);

  const currentHourData = simulationResult.hourly[design.selectedHour ?? 12];

  const chartData = useMemo(() => {
    return simulationResult.hourly.map(h => ({
      time: `${h.hour}:00`,
      outdoorTemp: h.outdoorTemp,
      indoorTemp: h.indoorTemp,
      comfortMin: 18,
      comfortMax: 26
    }));
  }, [simulationResult]);

  const explanations = useMemo(() => {
    const exp: string[] = [];
    if ((design.insulationThickness || 0) > 50) {
      exp.push("Higher insulation reduces conductive heat loss to the environment.");
    } else {
      exp.push("Lower insulation allows more rapid heat exchange with the outside air.");
    }
    
    if (design.windowCount > 0) {
      if (design.windowSize === 'Large' || design.windowCount > 2) {
        exp.push("Large windows increase daytime solar gain, but also increase nighttime heat loss.");
      } else {
        exp.push("Smaller windows minimize unwanted heat transfer while providing basic light.");
      }
    }
    
    if (design.ventilationLevel === 'High') {
      exp.push("High ventilation removes indoor heat efficiently, useful for cooling but costly in winter.");
    }
    
    if (design.thermalMassLevel === 'High' || design.wallMaterial === 'Local stone') {
      exp.push("High thermal mass slows temperature changes, keeping the interior stable throughout the day.");
    }
    
    if (design.shape === 'Dome') {
      exp.push("The dome shape reduces overall surface area-to-volume ratio, improving thermal efficiency.");
    }

    return exp;
  }, [design]);

  return (
    <div className="final-results-container animation-fade-in">
      {/* Header */}
      <header className="results-header">
        <h1 className="text-gradient">YOUR SHELTER IS READY TO EXPLORE</h1>
        <p>Review the physics-based thermal analysis of your generated shelter.</p>
      </header>

      {/* Hero 3D Viewer */}
      <section className="hero-3d-section">
        <div className="viewer-wrapper">
          <ShelterPreview3D />
          {/* Note: The 3D view already includes Heat Flow, Structure toggles and Reset Camera */}
          <div className="viewer-hints glass-panel">
            <span className="hint-item"><Maximize2 size={14}/> Scroll to Zoom</span>
            <span className="hint-item"><Settings2 size={14}/> Drag to Rotate</span>
          </div>
        </div>
      </section>

      {/* Main Analysis Grid */}
      <section className="analysis-grid">
        {/* 1. THERMAL COMFORT */}
        <div className="analysis-card glass-panel">
          <div className="card-header">
            <Activity className="card-icon text-blue-500" />
            <h2>Thermal Comfort</h2>
          </div>
          <div className="card-body metrics-layout">
            <div className="metric-box">
              <span className="metric-label">Indoor Temp</span>
              <span className="metric-value text-blue-600">{currentHourData.indoorTemp}°C</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Outdoor Temp</span>
              <span className="metric-value text-slate-500">{currentHourData.outdoorTemp}°C</span>
            </div>
            <div className="metric-box full-width">
              <span className="metric-label">Comfort Status</span>
              <span className="metric-value font-bold">{simulationResult.comfortLabel}</span>
            </div>
          </div>
        </div>

        {/* 2. SOLAR EXPOSURE */}
        <div className="analysis-card glass-panel">
          <div className="card-header">
            <Sun className="card-icon text-amber-500" />
            <h2>Solar Exposure</h2>
          </div>
          <div className="card-body">
             <div className="progress-row">
               <span>Roof ({currentHourData.roofSolarGain} W)</span>
               <div className="progress-bar"><div className="fill amber" style={{width: `${Math.min(100, (currentHourData.roofSolarGain / Math.max(1, currentHourData.solarGain)) * 100)}%`}}></div></div>
             </div>
             <div className="progress-row">
               <span>Walls ({currentHourData.wallSolarGain} W)</span>
               <div className="progress-bar"><div className="fill amber" style={{width: `${Math.min(100, (currentHourData.wallSolarGain / Math.max(1, currentHourData.solarGain)) * 100)}%`}}></div></div>
             </div>
             <div className="progress-row">
               <span>Windows ({currentHourData.windowSolarGain} W)</span>
               <div className="progress-bar"><div className="fill amber" style={{width: `${Math.min(100, (currentHourData.windowSolarGain / Math.max(1, currentHourData.solarGain)) * 100)}%`}}></div></div>
             </div>
          </div>
        </div>

        {/* 3. HEAT BALANCE */}
        <div className="analysis-card glass-panel">
          <div className="card-header">
            <Thermometer className="card-icon text-red-500" />
            <h2>Heat Balance</h2>
          </div>
          <div className="card-body dense-metrics">
            <div className="dense-row"><span>Solar Gain</span><strong className="text-amber-600">+{currentHourData.solarGain} W</strong></div>
            <div className="dense-row"><span>Occupant Gain</span><strong className="text-red-500">+{currentHourData.occupantGain} W</strong></div>
            <div className="dense-row"><span>Wall/Roof Loss</span><strong className="text-blue-600">{currentHourData.wallLoss + currentHourData.roofLoss} W</strong></div>
            <div className="dense-row"><span>Window Loss</span><strong className="text-blue-600">{currentHourData.windowLoss} W</strong></div>
            <div className="dense-row"><span>Ventilation Loss</span><strong className="text-cyan-600">{currentHourData.ventilationLoss} W</strong></div>
            <hr className="divider" />
            <div className="dense-row highlight"><span>Net Heat Flow</span><strong className={currentHourData.netHeatFlow < 0 ? 'text-blue-600' : 'text-orange-600'}>{currentHourData.netHeatFlow} W</strong></div>
          </div>
        </div>

        {/* 4. ENVIRONMENT */}
        <div className="analysis-card glass-panel">
          <div className="card-header">
            <MapPin className="card-icon text-emerald-500" />
            <h2>Environment</h2>
          </div>
          <div className="card-body dense-metrics">
            <div className="dense-row">
              <span className="meta-label">Location:</span>
              <span className="meta-value">{design.location.includes('Manual') ? 'Manual' : 'Device'}</span>
            </div>
            <div className="dense-row">
              <span className="meta-label">Climate:</span>
              <span className="meta-value text-xs">Offline Representative Profile</span>
            </div>
            <hr className="divider" />
            <div className="dense-row"><span>Latitude</span><strong>{design.latitude.toFixed(2)}°</strong></div>
            <div className="dense-row"><span>Longitude</span><strong>{design.longitude.toFixed(2)}°</strong></div>
            <div className="dense-row"><span>Orientation</span><strong>{design.heading}°</strong></div>
            <div className="dense-row"><span>Temperature</span><strong>{currentHourData.outdoorTemp}°C</strong></div>
            <div className="dense-row"><span>Humidity</span><strong>{climate.humidity}%</strong></div>
            <div className="dense-row"><span>Solar Rad</span><strong>{climate.solarRadiation} W/m²</strong></div>
          </div>
        </div>
      </section>

      {/* 24-Hour Thermal Profile */}
      <section className="chart-section glass-panel">
        <h2 className="section-title">24-Hour Thermal Profile</h2>
        <div className="chart-container" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit="°C" />
              <RechartsTooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              
              <Area type="step" dataKey="comfortMax" stroke="none" fill="#ecfdf5" fillOpacity={0.5} name="Comfort Zone Max" />
              
              <Line type="monotone" dataKey="indoorTemp" name="Indoor °C" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="outdoorTemp" name="Outdoor °C" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <ReferenceLine y={18} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={26} stroke="#10b981" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="dot blue"></span> Indoor Temperature</span>
          <span className="legend-item"><span className="dot gray"></span> Outdoor Temperature</span>
          <span className="legend-item"><span className="dot green"></span> Comfort Zone (18-26°C)</span>
        </div>
      </section>

      <div className="insights-container">
        {/* WHY? */}
        <section className="insight-section glass-panel">
          <h2 className="section-title text-gradient">Why?</h2>
          <p className="insight-subtitle">Understanding your thermal results</p>
          <ul className="explanation-list">
            {explanations.map((exp, i) => (
              <li key={i}><Info size={18} className="text-blue-500 shrink-0"/> <span>{exp}</span></li>
            ))}
          </ul>
        </section>

        {/* DESIGN INSIGHTS */}
        <section className="insight-section glass-panel">
          <h2 className="section-title text-gradient">Design Insights</h2>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Insulation Thickness</span>
              <ArrowRight size={14} className="text-slate-400" />
              <strong className="insight-result">Lower heat loss</strong>
            </div>
            <div className="insight-item">
              <span className="insight-label">Window Size</span>
              <ArrowRight size={14} className="text-slate-400" />
              <strong className="insight-result">Window heat transfer</strong>
            </div>
            <div className="insight-item">
              <span className="insight-label">Orientation</span>
              <ArrowRight size={14} className="text-slate-400" />
              <strong className="insight-result">Solar gain adjustment</strong>
            </div>
            <div className="insight-item">
              <span className="insight-label">Thermal Mass</span>
              <ArrowRight size={14} className="text-slate-400" />
              <strong className="insight-result">Temperature stability</strong>
            </div>
          </div>
        </section>
      </div>

      {/* OPTIMIZED DESIGN COMPARISON */}
      <section className="optimization-section glass-panel highlight-border">
        <div className="opt-header">
          <Zap className="text-amber-500" size={24} />
          <h2 className="section-title">Design Comparison</h2>
        </div>
        
        <div className="text-sm md:text-base px-2 mb-4 text-center">
          {optimizationResult.candidates.length === 0 
            ? "No valid alternative satisfies the current constraints." 
            : optimizationResult.candidates.length === 1
            ? "1 valid alternative evaluated. Insufficient valid alternatives for full comparison, but showing the closest match."
            : `${optimizationResult.candidates.length} valid alternatives evaluated.`}
        </div>

        <div className="opt-candidates-grid" style={{ paddingBottom: '1rem' }}>
          
          {/* CURRENT DESIGN CARD */}
          <div className="candidate-card overflow-hidden" style={{ position: 'relative' }}>
            {optimizationResult.candidates.every(c => c.comfortScore <= optimizationResult.originalScore) && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderBottomLeftRadius: '8px' }}>
                BEST MATCH
              </div>
            )}
            <div className="candidate-header flex-col md:flex-row items-start md:items-center gap-2">
              <h3 className="text-base md:text-lg w-full truncate">Current Design</h3>
              <div className="score text-gradient shrink-0">
                {optimizationResult.originalScore !== undefined ? `${optimizationResult.originalScore.toFixed(0)}/100` : 'Comfort score unavailable'}
              </div>
            </div>
            
            <div className="candidate-metrics">
              <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                <span className="mc-label text-xs sm:text-sm">Indoor Temp</span>
                <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                  <span className="mc-after">{optimizationResult.originalAvgTemp.toFixed(1)}°C</span>
                </div>
              </div>
              <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                <span className="mc-label text-xs sm:text-sm">Solar Energy</span>
                <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                  <span className="mc-after">{optimizationResult.originalSolarGain.toLocaleString()} Wh</span>
                </div>
              </div>
              <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                <span className="mc-label text-xs sm:text-sm">Net Heat Loss</span>
                <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                  <span className="mc-after">{optimizationResult.originalHeatLoss.toLocaleString()} Wh</span>
                </div>
              </div>
            </div>
            <div className="candidate-changes">
              <h4 className="text-xs">Base Configuration</h4>
              <p className="text-xs">{design.shape}, {design.wallMaterial}</p>
            </div>
          </div>

          {/* ALTERNATIVE DESIGNS */}
          {optimizationResult.candidates.slice(0, 2).map((candidate, i) => {
            const isBest = candidate.comfortScore > optimizationResult.originalScore && 
                           (i === 0 || candidate.comfortScore >= optimizationResult.candidates[0].comfortScore);
            return (
              <div key={candidate.id} className="candidate-card overflow-hidden" style={{ position: 'relative' }}>
                {isBest && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderBottomLeftRadius: '8px' }}>
                    RECOMMENDED
                  </div>
                )}
                <div className="candidate-header flex-col md:flex-row items-start md:items-center gap-2">
                  <h3 className="text-base md:text-lg w-full truncate">{candidate.name}</h3>
                  <div className="score text-gradient shrink-0">
                    {candidate.comfortScore !== undefined ? `${candidate.comfortScore.toFixed(0)}/100` : 'Comfort score unavailable'}
                  </div>
                </div>
                
                <div className="candidate-metrics">
                  <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                    <span className="mc-label text-xs sm:text-sm">Indoor Temp</span>
                    <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                      <span className="mc-before">{optimizationResult.originalAvgTemp.toFixed(1)}°</span>
                      <ArrowRight size={12} className="text-slate-400 mx-1" />
                      <span className={`mc-after ${candidate.avgTemp > 18 && candidate.avgTemp < 26 ? 'text-emerald-600' : 'text-blue-600'}`}>{candidate.avgTemp.toFixed(1)}°</span>
                    </div>
                  </div>
                  <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                    <span className="mc-label text-xs sm:text-sm">Solar Energy</span>
                    <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                      <span className="mc-before">{optimizationResult.originalSolarGain.toLocaleString()} Wh</span>
                      <ArrowRight size={12} className="text-slate-400 mx-1" />
                      <span className={`mc-after ${candidate.solarGain > optimizationResult.originalSolarGain ? 'text-emerald-600' : 'text-blue-600'}`}>{candidate.solarGain.toLocaleString()} Wh</span>
                    </div>
                  </div>
                  <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                    <span className="mc-label text-xs sm:text-sm">Net Heat Loss</span>
                    <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                      <span className="mc-before">{optimizationResult.originalHeatLoss.toLocaleString()} Wh</span>
                      <ArrowRight size={12} className="text-slate-400 mx-1" />
                      <span className={`mc-after ${candidate.heatLoss < optimizationResult.originalHeatLoss ? 'text-emerald-600' : 'text-red-600'}`}>{candidate.heatLoss.toLocaleString()} Wh</span>
                    </div>
                  </div>
                </div>

                <div className="candidate-changes">
                  <h4 className="text-xs">Key Changes</h4>
                  <ul className="text-xs sm:text-sm">
                    {candidate.changes.map((change, idx) => (
                      <li key={idx} className="break-words">
                        <div className="change-title flex-col sm:flex-row gap-1 sm:gap-2">
                          <span className="change-feature shrink-0">{change.feature}:</span>
                          <span className="change-val break-words">{change.from} &rarr; {change.to}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn-primary flex-1 text-sm" 
                    onClick={() => updateDesign(candidate.design)}
                  >
                    Apply
                  </button>
                  <button 
                    className="btn-secondary flex-1 text-sm" 
                    onClick={() => {
                      const explanation = candidate.changes.map(c => `${c.feature}: ${c.reason}`).join(' | ');
                      saveDesign(explanation, candidate.design);
                      alert('Alternative design saved successfully!');
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SAVED DESIGNS COMPARISON */}
      {myDesigns.length > 0 && (
        <section className="optimization-section glass-panel">
          <div className="opt-header">
            <ShieldCheck className="text-blue-500" size={24} />
            <h2 className="section-title">Saved Designs in Current Climate</h2>
          </div>
          <div className="opt-candidates-grid">
            {myDesigns.map(saved => {
              const predictor = new PhysicsPredictor();
              const savedSimResult = predictor.predict(saved.design, climate);
              return (
                <div key={saved.id} className="candidate-card overflow-hidden">
                  <div className="candidate-header flex-col md:flex-row items-start md:items-center gap-2">
                    <h3 className="text-base md:text-lg w-full truncate">{saved.name || 'Saved Design'}</h3>
                    <div className="score text-gradient shrink-0">
                      {savedSimResult.comfortScore !== undefined ? `${savedSimResult.comfortScore.toFixed(0)}/100` : 'Comfort score unavailable'}
                    </div>
                  </div>
                  
                  <div className="candidate-metrics">
                    <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                      <span className="mc-label text-xs sm:text-sm">Indoor Temp</span>
                      <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                        <span className="mc-before">{simulationResult.avgTemp.toFixed(1)}°</span>
                        <ArrowRight size={12} className="text-slate-400 mx-1" />
                        <span className={`mc-after ${savedSimResult.avgTemp > 18 && savedSimResult.avgTemp < 26 ? 'text-emerald-600' : 'text-blue-600'}`}>{savedSimResult.avgTemp.toFixed(1)}°</span>
                      </div>
                    </div>
                    <div className="metric-comparison flex-col sm:flex-row items-start sm:items-center gap-1">
                      <span className="mc-label text-xs sm:text-sm">Net Heat Loss</span>
                      <div className="mc-values text-xs sm:text-sm w-full sm:w-auto justify-start sm:justify-end">
                        <span className="mc-before">{simulationResult.totalHeatLoss.toLocaleString()} Wh</span>
                        <ArrowRight size={12} className="text-slate-400 mx-1" />
                        <span className={`mc-after ${savedSimResult.totalHeatLoss < simulationResult.totalHeatLoss ? 'text-emerald-600' : 'text-red-600'}`}>{savedSimResult.totalHeatLoss.toLocaleString()} Wh</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-primary w-full mt-4 text-sm" 
                    onClick={() => updateDesign(saved.design)}
                  >
                    Load this design
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TECHNICAL DETAILS */}
      <section className="technical-details-section">
        <details className="technical-details glass-panel" onToggle={(e) => setShowTechnical(e.currentTarget.open)}>
          <summary>
            <span className="summary-title"><ShieldAlert size={18}/> TECHNICAL DETAILS</span>
          </summary>
          <div className="technical-content">
            <div className="tech-grid">
              <div className="tech-item">
                <h4>Physics Model</h4>
                <p>1D Resistance-Capacitance (RC) Network</p>
              </div>
              <div className="tech-item">
                <h4>Calculation Timestep</h4>
                <p>1 Hour (Euler Integration)</p>
              </div>
              <div className="tech-item">
                <h4>Baseline Comfort Score</h4>
                <p>{simulationResult.comfortScore !== undefined ? `${simulationResult.comfortScore.toFixed(1)} / 100 (${simulationResult.comfortLabel})` : 'Comfort score unavailable'}</p>
              </div>
              <div className="tech-item">
                <h4>Total 24h Heat Loss</h4>
                <p>{simulationResult.totalHeatLoss.toLocaleString()} Wh</p>
              </div>
              <div className="tech-item">
                <h4>Total 24h Solar Gain</h4>
                <p>{simulationResult.totalSolarGain.toLocaleString()} Wh</p>
              </div>
              <div className="tech-item">
                <h4>Daily Avg/Min/Max Temp</h4>
                <p>{simulationResult.avgTemp.toFixed(1)}°C / {simulationResult.minTemp.toFixed(1)}°C / {simulationResult.maxTemp.toFixed(1)}°C</p>
              </div>
            </div>
          </div>
        </details>
      </section>

      {/* Footer Actions */}
      <div className="results-actions">
        <button className="btn-secondary" onClick={onBack}>Start Over</button>
        <button className="btn-secondary" onClick={() => { saveDesign('Manually saved current design'); alert('Current design saved successfully!'); }}>Save Current Design</button>
        <button 
          className="btn-primary large-btn"
          onClick={async () => {
            try {

              const doc = new jsPDF();
              const dateStr = new Date().toLocaleString();
              const designName = `${design.shape} in ${design.climateProfile}`;
            
              // Title
              doc.setFontSize(22);
              doc.setTextColor(30, 41, 59);
              doc.text('CITADEL Thermal Report', 14, 22);
            
              // Metadata
              doc.setFontSize(10);
              doc.setTextColor(100, 116, 139);
              doc.text(`Generated on: ${dateStr}`, 14, 30);
              
              // Section: Design Summary
              doc.setFontSize(14);
              doc.setTextColor(30, 41, 59);
              doc.text('Design Summary', 14, 45);
            
              autoTable(doc, {
                startY: 50,
                head: [['Property', 'Value']],
                body: [
                  ['Design Name', designName],
                  ['Location', design.location],
                  ['Climate', climate.type],
                  ['Shape & Size', `${design.shape} (${design.width}m x ${design.length}m, H: ${design.height}m)`],
                  ['Orientation', `${design.heading}°`],
                  ['Wall Material', design.wallMaterial],
                  ['Roof Material', design.roofMaterial],
                  ['Insulation', `${design.insulationMaterial} (${design.insulationThickness} cm)`],
                  ['Thermal Mass', design.thermalMassLevel],
                  ['Ventilation', design.ventilationLevel],
                  ['Openings', `${design.windowCount} Windows (${design.windowSize}), ${design.doorCount} Doors`]
                ],
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
              });
            
              // Section: Thermal Performance
              let finalY = (doc as any).lastAutoTable.finalY || 50;
              
              doc.setFontSize(14);
              doc.text('Thermal Performance', 14, finalY + 15);
            
              autoTable(doc, {
                startY: finalY + 20,
                head: [['Metric', 'Value']],
                body: [
                  ['Comfort Score', simulationResult.comfortScore !== undefined ? `${simulationResult.comfortScore.toFixed(0)}/100 (${simulationResult.comfortLabel})` : 'Comfort score unavailable'],
                  ['Average Indoor Temp', `${simulationResult.avgTemp.toFixed(1)} °C`],
                  ['Temperature Range', `${simulationResult.minTemp.toFixed(1)} °C - ${simulationResult.maxTemp.toFixed(1)} °C`],
                  ['Total Solar Gain', `${simulationResult.totalSolarGain.toLocaleString()} Wh`],
                  ['Total Heat Loss', `${simulationResult.totalHeatLoss.toLocaleString()} Wh`]
                ],
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }
              });
            
              finalY = (doc as any).lastAutoTable.finalY || finalY + 20;
            
              // Section: Alternative Recommendation
              doc.setFontSize(14);
              doc.text('Recommended Alternative', 14, finalY + 15);
            
              doc.setFontSize(11);
              doc.setTextColor(71, 85, 105);
              const recText = optimizationResult.candidates.length > 0 
                ? `${optimizationResult.candidates[0].name}\nChanges: ${optimizationResult.candidates[0].changes.map(c => c.feature + ' (' + c.reason + ')').join(', ')}` 
                : 'Current design is already optimal.';
              
              const splitTitle = doc.splitTextToSize(recText, 180);
              doc.text(splitTitle, 14, finalY + 22);
            
              const filename = `CITADEL_${designName.replace(/[^a-zA-Z0-9]/g, '_')}_Thermal_Report.pdf`;

              let pdfSaved = false;
              let dbSaved = false;
              let savedFileUri = "";

              if (Capacitor.isNativePlatform()) {
                // Generate base64
                const base64Str = doc.output('datauristring').split(',')[1];
                
                console.log(`[REPORT] Starting PDF generation`);
                
                try {
                  const permResult = await Filesystem.requestPermissions();
                  console.log(`[REPORT] Permission status:`, permResult);
                } catch (e) {
                  console.warn(`[REPORT] Permissions request error (ignoring for older Android):`, e);
                }

                let savedFile;
                let targetDir = Directory.Documents;
                
                try {
                  savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Str,
                    directory: Directory.Documents
                  });
                } catch (docErr) {
                  console.warn(`[REPORT] Writing to Documents failed, falling back to Data:`, docErr);
                  targetDir = Directory.Data;
                  savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Str,
                    directory: Directory.Data
                  });
                }
                
                // Verify the file after writing
                const stat = await Filesystem.stat({
                  path: filename,
                  directory: targetDir
                });
                
                if (!stat) throw new Error("File verification failed: File not found.");
                if (stat.size === 0) throw new Error("File verification failed: File size is 0 bytes.");
                if (!filename.toLowerCase().endsWith('.pdf')) throw new Error("File verification failed: Invalid file extension.");

                console.log(`[REPORT] PDF generated`);
                console.log(`[REPORT] PDF path: ${savedFile.uri}`);
                console.log(`[REPORT] PDF size: ${stat.size}`);
                console.log(`[REPORT] PDF verified`);

                pdfSaved = true;
                savedFileUri = savedFile.uri;
              } else {
                console.log(`[REPORT] Starting PDF generation (Web)`);
                doc.save(filename);
                console.log(`[REPORT] PDF generated and triggered download`);
                pdfSaved = true;
              }

              // After successfully generating and verifying PDF, save the design to DB
              if (pdfSaved) {
                try {
                  console.log(`[DESIGN] Saving design for location: ${design.location}`);
                  saveDesign('Saved via Offline Report', undefined, filename);
                  dbSaved = true;
                  console.log(`[DESIGN] Database insert successful`);
                } catch (saveErr) {
                  console.error("Database save failed:", saveErr);
                }
              }

              // Show success notifications conditionally
              if (pdfSaved && dbSaved) {
                alert(`✓ Report saved to device successfully.\n✓ Design saved to My Designs.`);
                if (Capacitor.isNativePlatform() && savedFileUri) {
                  const openFile = window.confirm(`Would you like to open or share the report now?`);
                  if (openFile) {
                    await Share.share({
                      title: 'CITADEL Thermal Report',
                      text: 'CITADEL Thermal Report',
                      url: savedFileUri,
                      dialogTitle: 'Open or Share Report'
                    });
                  }
                }
              } else if (pdfSaved && !dbSaved) {
                alert(`Report saved, but the design could not be saved to My Designs.`);
              } else if (!pdfSaved && dbSaved) {
                alert(`Design saved to My Designs, but the PDF could not be saved.`);
              } else {
                alert(`Failed to save report and design.`);
              }
              
            } catch (error) {
              console.error("Failed to generate PDF:", error);
              alert("Unable to save report. Please try again.");
            }
          }}
        >
          <Download size={20} className="icon-left"/> Save Offline Report
        </button>
      </div>
    </div>
  );
}
