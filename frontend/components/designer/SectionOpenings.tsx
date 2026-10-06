import React from 'react';
import { Sun, SunMoon, Moon } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

export function SectionOpenings() {
  const { design, updateDesign } = useShelter();

  const options = [
    { label: 'Few windows', icon: Moon },
    { label: 'Balanced', icon: SunMoon },
    { label: 'More daylight', icon: Sun }
  ];

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.3s' }}>
      <h3 className="designer-section-title">4. Openings</h3>
      
      <div className="options-grid">
        {options.map((opt) => (
          <button
            key={opt.label}
            className={`selection-card glass-panel ${design.openingConfiguration === opt.label ? 'selected' : ''}`}
            onClick={() => updateDesign({ openingConfiguration: opt.label })}
          >
            <opt.icon size={28} className="card-icon" />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
