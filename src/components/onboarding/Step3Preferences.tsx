import React from 'react';
import { Flame, Snowflake, Zap, Feather, Hammer, Scale } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Preferences({ onNext, onBack }: Step3Props) {
  const { design, updateDesign } = useShelter();

  const togglePref = (val: string) => {
    if (design.priorities.includes(val)) {
      updateDesign({ priorities: design.priorities.filter(p => p !== val) });
    } else {
      updateDesign({ priorities: [...design.priorities, val] });
    }
  };

  const prefOptions = [
    { label: 'Stay warmer', icon: Flame },
    { label: 'Stay cooler', icon: Snowflake },
    { label: 'Use less energy', icon: Zap },
    { label: 'Keep it lightweight', icon: Feather },
    { label: 'Use locally available materials', icon: Hammer },
    { label: 'Balance everything', icon: Scale },
  ];

  return (
    <div className="onboarding-step animation-fade-in">
      <h2 className="step-heading">What matters most to you?</h2>
      <p className="step-subheading">Select all that apply.</p>
      
      <div className="options-grid">
        {prefOptions.map((opt) => (
          <button 
            key={opt.label}
            className={`selection-card glass-panel ${design.priorities.includes(opt.label) ? 'selected' : ''}`}
            onClick={() => togglePref(opt.label)}
          >
            <opt.icon size={28} className="card-icon" />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={design.priorities.length === 0}>
          Continue
        </button>
      </div>
    </div>
  );
}
