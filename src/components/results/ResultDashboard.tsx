import React, { useMemo } from 'react';
import { ResultCards } from './ResultCards';
import { ComparisonSection } from './ComparisonSection';
import { useShelter } from '../../context/ShelterContext';
import { simulateThermalPerformance } from '../../engine/thermal';
import { CLIMATE_PROFILES } from '../../data/climates';

interface ResultDashboardProps {
  onImprove: () => void;
}

export function ResultDashboard({ onImprove }: ResultDashboardProps) {
  const { design } = useShelter();
  
  const simulationResult = useMemo(() => {
    const climate = CLIMATE_PROFILES.find(c => c.type === design.climateProfile) || CLIMATE_PROFILES[0];
    return simulateThermalPerformance(design, climate);
  }, [design]);

  return (
    <div className="results-dashboard animation-fade-in">
      <div className="results-header">
        <h2 className="text-gradient">Your shelter is ready to explore.</h2>
      </div>

      <div className="results-main">
        {/* Visual Centerpiece */}
        <div className="results-visual-container glass-panel">
          <img src="/shelter_preview.jpg" alt="Shelter Results" className="results-visual" />
          <div className="comfort-badge">
            <span className="badge-label">Thermal Comfort</span>
            <span className="badge-value">{simulationResult.comfortLabel}</span>
          </div>
        </div>
      </div>

      <ResultCards simulationResult={simulationResult} />
      <ComparisonSection onImprove={onImprove} />
    </div>
  );
}
