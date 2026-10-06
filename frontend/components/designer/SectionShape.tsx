import React from 'react';
import { Tent, Home, Box, Palette } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

export function SectionShape() {
  const { design, updateDesign } = useShelter();

  const shapes = [
    { label: 'Dome', icon: Tent },
    { label: 'A-Frame', icon: Home },
    { label: 'Box', icon: Box },
    { label: 'Gable Roof', icon: Home }
  ];

  return (
    <div className="designer-section animation-fade-in">
      <h3 className="designer-section-title">1. Choose a shelter shape</h3>
      <div className="options-grid">
        {shapes.map((s) => (
          <button
            key={s.label}
            className={`selection-card glass-panel ${design.shape === s.label ? 'selected' : ''}`}
            onClick={() => updateDesign({ shape: s.label as any })}
          >
            <s.icon size={32} className="card-icon" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
