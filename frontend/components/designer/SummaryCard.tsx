import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface SummaryCardProps {
  onChangeRequirements: () => void;
  onCheckShelter: () => void;
}

export function SummaryCard({ onChangeRequirements, onCheckShelter }: SummaryCardProps) {
  const { design } = useShelter();

  return (
    <div className="summary-card glass-panel animation-fade-in" style={{ animationDelay: '0.5s' }}>
      <h3>Your shelter</h3>
      <ul className="summary-list">
        <li><strong>{design.occupants} people</strong></li>
        <li><strong>{design.shape}</strong></li>
        <li><strong>{design.climateProfile} climate</strong></li>
        <li><strong>{design.wallMaterial}</strong></li>
      </ul>
      
      <div className="summary-actions">
        <button className="btn-primary full-width" onClick={onCheckShelter}>
          Check My Shelter <ArrowRight size={18} style={{ marginLeft: '8px' }} />
        </button>
        <button className="btn-ghost" onClick={onChangeRequirements}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Change Requirements
        </button>
      </div>
    </div>
  );
}
