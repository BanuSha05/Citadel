import React, { useState, useEffect } from 'react';
import { LoadingState } from './LoadingState';
import { ResultDashboard } from './ResultDashboard';

interface ShelterResultsProps {
  onImprove: () => void;
}

export function ShelterResults({ onImprove }: ShelterResultsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate the engine analysis time (matches the stages in LoadingState)
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 5500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="results-layout">
      {isAnalyzing ? <LoadingState /> : <ResultDashboard onImprove={onImprove} />}
    </div>
  );
}
