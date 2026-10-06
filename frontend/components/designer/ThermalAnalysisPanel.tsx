import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, Sun, Home, Zap, Wind, Thermometer, Activity, ShieldAlert
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { useShelter } from '../../context/ShelterContext';
import { PhysicsPredictor } from '@ml/predictor';
import { CLIMATE_PROFILES } from '@data/climates';

export function ThermalAnalysisPanel() {
  const { design } = useShelter();
  const [expanded, setExpanded] = useState(false);

  const simulationResult = useMemo(() => {
    const climate = CLIMATE_PROFILES.find(c => c.type === design.climateProfile) || CLIMATE_PROFILES[0];
    const predictor = new PhysicsPredictor();
    return predictor.predict(design, climate);
  }, [design]);

  const chartData = useMemo(() => {
    return simulationResult.hourly.map(h => ({
      time: `${h.hour}:00`,
      outdoorTemp: h.outdoorTemp,
      indoorTemp: h.indoorTemp,
      heatEntering: Math.max(0, h.solarGain) + Math.max(0, h.occupantGain) + Math.max(0, h.wallLoss) + Math.max(0, h.roofLoss) + Math.max(0, h.windowLoss) + Math.max(0, h.ventilationLoss),
      heatLeaving: Math.min(0, h.wallLoss) + Math.min(0, h.roofLoss) + Math.min(0, h.windowLoss) + Math.min(0, h.ventilationLoss)
    }));
  }, [simulationResult]);

  const currentHourData = simulationResult.hourly[design.selectedHour ?? 12];

  const totalSolarGain = Math.round(simulationResult.hourly.reduce((acc, curr) => acc + curr.solarGain, 0));
  const avgHeatFlow = Math.round(simulationResult.hourly.reduce((acc, curr) => acc + Math.abs(curr.netHeatFlow), 0) / 24);

  // Dynamic Explanations
  const explanations = useMemo(() => {
    const exp: string[] = [];
    if ((design.insulationThickness || 0) > 50) {
      exp.push("Higher insulation reduced conductive heat loss.");
    } else {
      exp.push("Lower insulation allows more rapid heat exchange with the outside.");
    }
    
    if (design.windowCount > 0) {
      if (design.windowSize === 'Large' || design.windowCount > 2) {
        exp.push("Larger/more windows increased daytime solar gain and potential nighttime loss.");
      } else {
        exp.push("Smaller/fewer windows minimized unwanted heat loss/gain.");
      }
    }
    
    if (design.ventilationLevel === 'High') {
      exp.push("Higher ventilation increased heat exchange with outside air.");
    }
    
    if (design.thermalMassLevel === 'High' || design.wallMaterial === 'Local stone') {
      exp.push("Higher thermal mass slowed temperature changes, keeping things stable.");
    }
    
    if (design.shape === 'Dome') {
      exp.push("The dome shape reduced overall surface area, improving thermal efficiency.");
    }

    return exp;
  }, [design]);

  return (
    <div className="glass-panel mt-4 overflow-hidden border border-slate-200/50 shadow-lg animation-fade-in" style={{ borderRadius: '1rem' }}>
      <button 
        className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800">Thermal Analysis</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" /> CITADEL Prototype Physics Model
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-slate-100/50 space-y-6">
          
          {/* Visual Pipeline */}
          <div className="bg-slate-50 rounded-xl p-4 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Calculation Pipeline</h4>
            <div className="flex items-center justify-between min-w-max gap-2 text-xs font-medium text-slate-600">
            <div className="flex flex-col items-center gap-1"><Sun className="w-5 h-5 text-amber-500"/><span>SUN</span></div>
              <span className="text-slate-300">↓</span>
              <div className="flex flex-col items-center gap-1"><Zap className="w-5 h-5 text-orange-500"/><span>SOLAR HEAT</span></div>
              <span className="text-slate-300">↓</span>
              <div className="flex flex-col items-center gap-1"><Home className="w-5 h-5 text-indigo-500"/><span>SHELTER ENVELOPE</span></div>
              <span className="text-slate-300">↓</span>
              <div className="flex flex-col items-center gap-1"><Wind className="w-5 h-5 text-cyan-500"/><span>INDOOR AIR</span></div>
              <span className="text-slate-300">↓</span>
              <div className="flex flex-col items-center gap-1"><Thermometer className="w-5 h-5 text-red-500"/><span>HEAT LOSS</span></div>
            </div>
          </div>

          {/* Current Hour Stats */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Hour {currentHourData.hour}:00 Snapshot</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Outdoor Temp</span>
                <strong className="text-slate-700">{currentHourData.outdoorTemp}°C</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Solar Gain</span>
                <strong className="text-amber-600">+{currentHourData.solarGain} W</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Wall Loss</span>
                <strong className={currentHourData.wallLoss < 0 ? 'text-blue-600' : 'text-orange-600'}>{currentHourData.wallLoss} W</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Roof Loss</span>
                <strong className={currentHourData.roofLoss < 0 ? 'text-blue-600' : 'text-orange-600'}>{currentHourData.roofLoss} W</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Window Loss</span>
                <strong className={currentHourData.windowLoss < 0 ? 'text-blue-600' : 'text-orange-600'}>{currentHourData.windowLoss} W</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Occupant Gain</span>
                <strong className="text-red-500">+{currentHourData.occupantGain} W</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Ventilation</span>
                <strong className={currentHourData.ventilationLoss < 0 ? 'text-cyan-600' : 'text-orange-600'}>{currentHourData.ventilationLoss} W</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Net Heat Flow</span>
                <strong className={currentHourData.netHeatFlow < 0 ? 'text-blue-600' : 'text-orange-600'}>{currentHourData.netHeatFlow} W</strong>
              </div>
              <div className="bg-slate-100 p-2 rounded-lg">
                <span className="block text-xs text-slate-500 font-bold">Indoor Temp</span>
                <strong className="text-blue-800 font-bold">{currentHourData.indoorTemp}°C</strong>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <div className="h-48">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Temperature (24h)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit="°C" />
                  <RechartsTooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="indoorTemp" name="Indoor °C" stroke="#2563eb" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="outdoorTemp" name="Outdoor °C" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-48">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Heat Flow (24h)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit="W" />
                  <RechartsTooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <ReferenceLine y={0} stroke="#cbd5e1" />
                  <Bar dataKey="heatEntering" name="Heat In (W)" fill="#fbbf24" radius={[2,2,0,0]} />
                  <Bar dataKey="heatLeaving" name="Heat Out (W)" fill="#3b82f6" radius={[0,0,2,2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary & Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Daily Summary</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex justify-between"><span>Average Indoor:</span> <strong>{simulationResult.avgTemp}°C</strong></li>
                <li className="flex justify-between"><span>Minimum Indoor:</span> <strong>{simulationResult.minTemp}°C</strong></li>
                <li className="flex justify-between"><span>Maximum Indoor:</span> <strong>{simulationResult.maxTemp}°C</strong></li>
                <li className="flex justify-between"><span>Total Solar Gain:</span> <strong>{totalSolarGain} W</strong></li>
                <li className="flex justify-between"><span>Average Heat Exchange:</span> <strong>{avgHeatFlow} W</strong></li>
                <li className="flex justify-between"><span>Comfort Rating:</span> <strong className="text-blue-600">{simulationResult.comfortLabel}</strong></li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Why did the temperature change?</h4>
              <ul className="space-y-2 text-sm text-slate-600 list-disc pl-4">
                {explanations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-6 border-t border-slate-200/50 pt-4">
            <details className="group">
              <summary className="text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-700 flex items-center justify-between">
                <span>Technical Details</span>
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                  <h5 className="font-bold mb-1">Model Architecture</h5>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>1D Resistance-Capacitance (RC) Network</li>
                    <li>Euler Integration</li>
                    <li>Timestep: 1 Hour</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold mb-1">Major Assumptions</h5>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Well-mixed single air node</li>
                    <li>No internal partitions</li>
                    <li>Simplified atmospheric attenuation</li>
                  </ul>
                </div>
                <div className="md:col-span-2 bg-slate-50 p-3 rounded-lg font-mono text-xs">
                  <span className="block mb-2 font-bold font-sans text-slate-500">Heat Balance Equation:</span>
                  Net Heat Flow = Solar Gain + Occupant Gain - Wall Loss - Roof Loss - Window Loss - Ventilation Loss
                </div>
              </div>
            </details>
          </div>

        </div>
      )}
    </div>
  );
}
