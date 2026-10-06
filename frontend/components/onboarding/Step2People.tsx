import React from 'react';
import { Users, Activity, Clock, PersonStanding, Flame, Footprints } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2People({ onNext, onBack }: Step2Props) {
  const { design, updateDesign } = useShelter();

  const handleCapacity = (opt: string) => {
    let num = 1;
    if (opt.includes('3–5')) num = 4;
    else if (opt.includes('6–10')) num = 8;
    else if (opt.includes('10+')) num = 12;
    updateDesign({ occupants: num });
  };

  const getCapacityLabel = () => {
    if (design.occupants <= 2) return '1–2 people';
    if (design.occupants <= 5) return '3–5 people';
    if (design.occupants <= 10) return '6–10 people';
    return '10+ people';
  };

  const capacityOptions = ['1–2 people', '3–5 people', '6–10 people', '10+ people'];

  const activityOptions = [
    { label: 'Resting', icon: PersonStanding, desc: 'Mostly sleeping or sitting' },
    { label: 'Light', icon: Footprints, desc: 'Regular daily activities' },
    { label: 'Active', icon: Flame, desc: 'Heavy physical work' },
  ];

  const durationOptions = ['Hours', 'Days', 'Weeks', 'Months'];

  return (
    <div className="onboarding-step animation-fade-in">
      <h2 className="step-heading">Who will use the shelter?</h2>
      
      <div className="secondary-question" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Users size={20} /> Number of people
        </h3>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
          {capacityOptions.map((opt) => (
            <button 
              key={opt}
              className={`selection-card glass-panel ${getCapacityLabel() === opt ? 'selected' : ''}`}
              style={{ padding: '15px' }}
              onClick={() => handleCapacity(opt)}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="secondary-question" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Activity size={20} /> Activity level
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '1rem' }}>
          This affects how much body heat will be generated inside the shelter.
        </p>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
          {activityOptions.map((opt) => (
            <button 
              key={opt.label}
              className={`selection-card glass-panel ${design.activityLevel === opt.label ? 'selected' : ''}`}
              style={{ padding: '15px' }}
              onClick={() => updateDesign({ activityLevel: opt.label as any })}
            >
              <opt.icon size={24} className="card-icon" />
              <span style={{ fontWeight: 600 }}>{opt.label}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="secondary-question">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Clock size={20} /> Occupancy duration
        </h3>
        <div className="pill-group">
          {durationOptions.map((opt) => (
            <button
              key={opt}
              className={`pill-btn ${design.occupancyDuration === opt ? 'selected' : ''}`}
              onClick={() => updateDesign({ occupancyDuration: opt as any })}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
