import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, AlertTriangle, Info } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import { PhysicsPredictor } from '@ml/predictor';
import { CLIMATE_PROFILES } from '@data/climates';
import type { SavedDesign, ShelterDesign } from '../../types';

interface CompareDesignsProps {
  onBack: () => void;
  onLoadDesign: () => void;
}

export function CompareDesigns({ onBack, onLoadDesign }: CompareDesignsProps) {
  const { myDesigns, loadDesign } = useShelter();

  const handleLoad = (saved: SavedDesign) => {
    loadDesign(saved);
    onLoadDesign();
  };

  const rankedDesigns = useMemo(() => {
    const predictor = new PhysicsPredictor();

    const evaluated = myDesigns.map(saved => {
      const climate = CLIMATE_PROFILES.find(c => c.type === saved.design.climateProfile) || CLIMATE_PROFILES[0];
      let result;
      let hasThermalResults = true;
      try {
        result = predictor.predict(saved.design, climate);
      } catch (e) {
        hasThermalResults = false;
      }

      let isViolation = false;
      let violationReason = '';

      // Simple heuristic for constraint violations based on available data
      if (result && saved.design.hasStructuralFrame && saved.design.frameType === 'Lightweight' && result.estimatedWeight > 1500) {
        isViolation = true;
        violationReason = 'Weight limit exceeded for Lightweight frame.';
      }

      if (saved.design.priorities && saved.design.priorities.includes('Cost-effective') && (saved.design.insulationThickness > 30 || saved.design.wallMaterial === 'Composite panels')) {
         // rough heuristic
         isViolation = true;
         violationReason = 'Cost limit exceeded.';
      }

      return {
        ...saved,
        thermalResult: result,
        hasThermalResults,
        isViolation,
        violationReason
      };
    });

    const valid = evaluated.filter(d => d.hasThermalResults);
    
    // Sort logic: 
    // 1. Valid without constraints first
    // 2. High comfort score
    // 3. Lower heat flow
    valid.sort((a, b) => {
      if (a.isViolation !== b.isViolation) return a.isViolation ? 1 : -1;
      
      const scoreDiff = (b.thermalResult?.comfortScore || 0) - (a.thermalResult?.comfortScore || 0);
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      
      return (a.thermalResult?.totalHeatLoss || 0) - (b.thermalResult?.totalHeatLoss || 0);
    });

    return { valid, all: evaluated };
  }, [myDesigns]);

  if (rankedDesigns.all.length === 0) {
    return (
      <div className="my-designs-layout animation-fade-in">
        <div className="dashboard-header">
          <button className="btn-ghost" onClick={onBack}>
            <ArrowLeft size={16} className="icon-left" /> Back
          </button>
          <h2 className="text-gradient">Compare Designs</h2>
        </div>
        <div className="empty-state glass-panel">
          <p>No designs available to compare.</p>
        </div>
      </div>
    );
  }

  if (rankedDesigns.valid.length < 2) {
    return (
      <div className="my-designs-layout animation-fade-in">
        <div className="dashboard-header">
          <button className="btn-ghost" onClick={onBack}>
            <ArrowLeft size={16} className="icon-left" /> Back
          </button>
          <h2 className="text-gradient">Compare Designs</h2>
        </div>
        <div className="empty-state glass-panel">
          <p>Create at least 2 designs with thermal results to compare.</p>
        </div>
      </div>
    );
  }

  const bestDesign = rankedDesigns.valid[0];

  return (
    <div className="my-designs-layout animation-fade-in pb-12">
      <div className="dashboard-header">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} className="icon-left" /> Back
        </button>
        <h2 className="text-gradient">Compare All Designs</h2>
      </div>

      <div className="glass-panel mb-8 p-6" style={{ background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Trophy className="text-amber-500" /> BEST PERFORMING DESIGN
        </h3>
        {bestDesign.isViolation ? (
          <p className="text-red-500 mb-4 font-medium flex items-center gap-1">
            <AlertTriangle size={18} /> No valid designs without constraint violations. This is the top restricted design.
          </p>
        ) : null}
        
        <div className="bg-white/60 rounded-xl p-4 mb-4">
          <h4 className="text-xl font-bold text-slate-800 cursor-pointer hover:text-blue-600" onClick={() => handleLoad(bestDesign)}>
            {bestDesign.name || bestDesign.design.location}
          </h4>
          <p className="text-sm text-slate-600">
            {bestDesign.design.shape} • {bestDesign.design.wallMaterial} • {bestDesign.design.climateProfile}
          </p>
        </div>

        <h4 className="font-bold text-slate-700 mb-2">WHY THIS DESIGN WAS SELECTED</h4>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li>Highest thermal comfort score ({bestDesign.thermalResult?.comfortScore.toFixed(0)}/100)</li>
          <li>Optimized indoor temperature average of {bestDesign.thermalResult?.avgTemp.toFixed(1)}°C</li>
          <li>Effective net heat loss management ({bestDesign.thermalResult?.totalHeatLoss} W)</li>
          {!bestDesign.isViolation && <li>Meets all structural and feasibility constraints</li>}
        </ul>
        <button className="btn-primary mt-4" onClick={() => handleLoad(bestDesign)}>
          Review Best Design
        </button>
      </div>

      <div className="space-y-4">
        {rankedDesigns.valid.map((item, index) => {
          const sim = item.thermalResult!;
          let rankColor = 'text-slate-400';
          let borderClass = 'border-slate-200/50';
          if (index === 0) { rankColor = 'text-amber-500'; borderClass = 'border-amber-400/50 shadow-md'; }
          else if (index === 1) { rankColor = 'text-slate-300'; }
          else if (index === 2) { rankColor = 'text-orange-700'; }

          return (
            <div key={item.id} className={`glass-panel p-4 flex flex-col md:flex-row gap-4 items-start md:items-center border ${borderClass} relative overflow-hidden`}>
              <div className="flex-none flex items-center justify-center w-12">
                <span className={`text-2xl font-bold ${rankColor}`}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <h4 className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 truncate" onClick={() => handleLoad(item)}>
                  {item.name || item.design.location}
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{item.design.shape}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{item.design.wallMaterial}</span>
                </div>
                {item.isViolation && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded p-1.5 flex items-start gap-1">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span><strong>Constraint Violation:</strong> {item.violationReason}</span>
                  </div>
                )}
              </div>

              <div className="flex-none grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto mt-2 md:mt-0">
                <div className="text-center bg-slate-50 rounded p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Score</div>
                  <div className="font-bold text-slate-700">{sim.comfortScore.toFixed(0)}</div>
                </div>
                <div className="text-center bg-slate-50 rounded p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Avg Temp</div>
                  <div className="font-bold text-slate-700">{sim.avgTemp.toFixed(1)}°C</div>
                </div>
                <div className="text-center bg-slate-50 rounded p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Solar Energy</div>
                  <div className="font-bold text-slate-700">{sim.totalSolarGain}W</div>
                </div>
                <div className="text-center bg-slate-50 rounded p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Heat Loss</div>
                  <div className="font-bold text-slate-700">{sim.totalHeatLoss}W</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rankedDesigns.all.length > rankedDesigns.valid.length && (
        <div className="mt-6 p-4 glass-panel border border-dashed border-slate-300">
          <h4 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1"><Info size={16}/> Thermal analysis required</h4>
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
            {rankedDesigns.all.filter(d => !d.hasThermalResults).map(d => (
              <li key={d.id}>{d.name || d.design.location}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
