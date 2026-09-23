import React, { useMemo, useState } from 'react';
import { 
  Thermometer, Activity, Wind, Sun, Maximize2, ShieldAlert,
  ArrowRight, Cloud, MapPin, Zap, Info, ShieldCheck, Settings2, Download
} from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import { PhysicsPredictor } from '../../engine/predictor';
import { optimizeDesign } from '../../engine/optimizer';
import { CLIMATE_PROFILES } from '../../data/climates';
import { ShelterPreview3D } from '../3d/ShelterPreview3D';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import './FinalResultsView.css';

interface FinalResultsViewProps {
  onBack: () => void;
}

export function FinalResultsView({ onBack }: FinalResultsViewProps) {
  const { design, updateDesign } = useShelter();
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

      {/* OPTIMIZED DESIGN */}
      <section className="optimization-section glass-panel highlight-border">
        <div className="opt-header">
          <Zap className="text-amber-500" size={24} />
          <h2 className="section-title">Alternative Optimized Designs</h2>
        </div>
        
        {optimizationResult.candidates.length === 0 ? (
          <div className="opt-empty-state">
            <ShieldCheck className="text-emerald-500 mb-2" size={32} />
            <h3 className="text-lg font-bold text-center">Current design is already well optimized</h3>
            <p className="text-sm md:text-base px-2">Your current configuration yields a comfort score of <strong>{optimizationResult.originalScore.toFixed(0)}/100</strong>. Our optimization engine couldn't find a significantly better alternative that respects your constraints.</p>
          </div>
        ) : (
          <div className="opt-candidates-grid">
            {optimizationResult.candidates.map(candidate => (
              <div key={candidate.id} className="candidate-card overflow-hidden">
                <div className="candidate-header flex-col md:flex-row items-start md:items-center gap-2">
                  <h3 className="text-base md:text-lg w-full truncate">{candidate.name}</h3>
                  <div className="score text-gradient shrink-0">{candidate.comfortScore.toFixed(0)}<span>/100</span></div>
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
                        <p className="change-reason text-xs">{change.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className="btn-primary w-full mt-4 text-sm" 
                  onClick={() => updateDesign(candidate.design)}
                >
                  Apply this design
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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
                <h4>Solar Model</h4>
                <p>Simplified atmospheric attenuation & projection</p>
              </div>
              <div className="tech-item">
                <h4>Thermal Assumptions</h4>
                <p>Well-mixed single air node, no internal partitions</p>
              </div>
              <div className="tech-item">
                <h4>Climate Source</h4>
                <p>Offline Representative Database (CLIMATE_PROFILES)</p>
              </div>
              <div className="tech-item">
                <h4>Calculation Timestep</h4>
                <p>1 Hour (Euler Integration)</p>
              </div>
            </div>
          </div>
        </details>
      </section>

      {/* Footer Actions */}
      <div className="results-actions">
        <button className="btn-secondary" onClick={onBack}>Start Over</button>
        <button className="btn-primary large-btn"><Download size={20} className="icon-left"/> Save Offline Report</button>
      </div>
    </div>
  );
}
