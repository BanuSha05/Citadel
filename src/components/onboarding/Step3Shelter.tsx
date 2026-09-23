import React from 'react';
import { Tent, Home, Box, Maximize } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Shelter({ onNext, onBack }: Step3Props) {
  const { design, updateDesign } = useShelter();

  const shapes = [
    { label: 'Dome', icon: Tent },
    { label: 'A-Frame', icon: Home },
    { label: 'Box', icon: Box },
    { label: 'Gable Roof', icon: Home }
  ];

  return (
    <div className="onboarding-step animation-fade-in" style={{ paddingRight: '1rem' }}>
      <h2 className="step-heading" style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>What shelter do you want?</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8 }}>Choose a shape</h3>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {shapes.map((s) => (
            <button
              key={s.label}
              className={`selection-card glass-panel ${design.shape === s.label ? 'selected' : ''}`}
              style={{ padding: '15px' }}
              onClick={() => updateDesign({ shape: s.label as any })}
            >
              <s.icon size={24} className="card-icon" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Maximize size={16} /> Dimensions
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Width</span>
              <span className="text-gradient" style={{ fontWeight: 600 }}>{design.width} m</span>
            </div>
            <input 
              type="range" 
              min="2" max="10" step="0.5" 
              value={design.width} 
              onChange={(e) => updateDesign({ width: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Length</span>
              <span className="text-gradient" style={{ fontWeight: 600 }}>{design.length} m</span>
            </div>
            <input 
              type="range" 
              min="2" max="15" step="0.5" 
              value={design.length} 
              onChange={(e) => updateDesign({ length: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Height</span>
              <span className="text-gradient" style={{ fontWeight: 600 }}>{design.height} m</span>
            </div>
            <input 
              type="range" 
              min="2" max="6" step="0.5" 
              value={design.height} 
              onChange={(e) => updateDesign({ height: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="step-actions" style={{ paddingTop: '1rem' }}>
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
