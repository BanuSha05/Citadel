import React, { useState } from 'react';
import { Activity, Info, Sun, Flame, Wind } from 'lucide-react';
import type { HourlyData } from '@thermal/thermal';

interface HeatBalancePanelProps {
  data: HourlyData;
  showHeatFlow: boolean;
  setShowHeatFlow: (v: boolean) => void;
}

export function HeatBalancePanel({ data, showHeatFlow, setShowHeatFlow }: HeatBalancePanelProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  const formatWatt = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${Math.round(val)} W`;
  };

  const getRowClass = (val: number) => {
    if (val > 0) return 'text-orange-600 font-medium';
    if (val < 0) return 'text-blue-600 font-medium';
    return 'text-slate-600 font-medium';
  };

  // Generate 'Why?' statements based on data
  const generateWhyStatements = () => {
    const statements = [];
    
    if (data.solarGain > 300) {
      statements.push("Solar radiation is contributing significant heat.");
    } else if (data.solarGain < 50) {
      statements.push("Solar gain is minimal right now.");
    }
    
    const envLoss = data.wallLoss + data.roofLoss;
    if (envLoss < -300) {
      statements.push("Significant conductive heat is escaping through the walls/roof.");
    } else if (envLoss > 300) {
      statements.push("The hot exterior is transferring heat into the shelter.");
    } else if (Math.abs(envLoss) < 50 && Math.abs(data.outdoorTemp - data.indoorTemp) > 10) {
      statements.push("High insulation is effectively reducing conductive heat transfer.");
    }

    if (data.windowLoss < -150) {
      statements.push("Large windows are increasing heat loss.");
    } else if (data.windowLoss > 150) {
      statements.push("Heat is entering through the windows.");
    }

    if (data.ventilationLoss < -200) {
      statements.push("Ventilation is rapidly removing indoor heat.");
    } else if (data.ventilationLoss > 200) {
      statements.push("Hot outdoor air is entering via ventilation.");
    }

    if (statements.length === 0) {
      statements.push("The shelter is in a relatively stable thermal state.");
    }

    return statements;
  };

  return (
    <div className="heat-balance-panel relative md:absolute md:top-4 md:right-4 z-10 w-full md:w-80">
      {/* Toggle Button */}
      <button
        onClick={() => setShowHeatFlow(!showHeatFlow)}
        className="w-full mb-2 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-lg hover:bg-white transition-all text-sm font-semibold text-slate-800"
      >
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${showHeatFlow ? 'text-orange-500' : 'text-slate-400'}`} />
          Show Heat Flow
        </div>
        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showHeatFlow ? 'bg-orange-500' : 'bg-slate-200'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showHeatFlow ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </button>

      {/* Main Panel */}
      {showHeatFlow && (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl overflow-hidden flex flex-column flex-col">
          
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Heat Balance</h3>
            
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Solar Gain</span>
                <span className={getRowClass(data.solarGain)}>{formatWatt(data.solarGain)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Occupant Gain</span>
                <span className={getRowClass(data.occupantGain)}>{formatWatt(data.occupantGain)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Wall/Roof Loss</span>
                <span className={getRowClass(data.wallLoss + data.roofLoss)}>{formatWatt(data.wallLoss + data.roofLoss)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Window Loss</span>
                <span className={getRowClass(data.windowLoss)}>{formatWatt(data.windowLoss)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans">Ventilation Loss</span>
                <span className={getRowClass(data.ventilationLoss)}>{formatWatt(data.ventilationLoss)}</span>
              </div>
              
              <div className="border-t border-slate-300 my-2 pt-2 flex justify-between items-center font-bold text-base">
                <span className="font-sans text-slate-800">Net Heat Flow</span>
                <span className={getRowClass(data.netHeatFlow)}>{formatWatt(data.netHeatFlow)}</span>
              </div>
              <div className="text-center font-sans text-xs font-bold uppercase tracking-wider mt-1" style={{ color: data.netHeatFlow > 0 ? '#ea580c' : data.netHeatFlow < 0 ? '#2563eb' : '#64748b' }}>
                {data.netHeatFlow > 0 ? 'Heat entering' : data.netHeatFlow < 0 ? 'Heat leaving' : 'Thermally balanced'}
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">Why is it this temperature?</h3>
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
              {generateWhyStatements().map((stmt, i) => (
                <li key={i}>{stmt}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-slate-800 text-slate-200 text-xs flex flex-wrap justify-start gap-3">
            <div className="flex items-center gap-1"><span>☀</span> Solar Gain</div>
            <div className="flex items-center gap-1"><span>🔥</span> Internal Heat</div>
            <div className="flex items-center gap-1"><span>⬆</span> Heat Leaving</div>
            <div className="flex items-center gap-1"><span>❄</span> Cool Air</div>
            <div className="flex items-center gap-1"><span>↔</span> Ventilation</div>
          </div>

          {/* Technical Details Toggle */}
          <button 
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full p-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-1 border-t border-slate-100 transition-colors"
          >
            <Info className="w-3 h-3" />
            {showTechnical ? 'Hide Technical Details' : 'Show Technical Details'}
          </button>

          {showTechnical && (
            <div className="p-4 bg-slate-50 text-xs text-slate-600 border-t border-slate-100 space-y-2">
              <p><strong>Method:</strong> 1D RC-Network (Euler Integration)</p>
              <p><strong>ΔT (Out - In):</strong> {Math.abs(Math.round((data.outdoorTemp - data.indoorTemp)*10)/10)}°C {data.outdoorTemp > data.indoorTemp ? '(Outside Warmer)' : '(Inside Warmer)'}</p>
              <p><strong>Simulation Step:</strong> 1 Hour</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
