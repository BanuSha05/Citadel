import React from 'react';
import { Layers, Wind, Sun, Shield, Settings2 } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import { MATERIALS } from '@data/materials';

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step4Materials({ onNext, onBack }: Step4Props) {
  const { design, updateDesign } = useShelter();

  const wallMaterials = MATERIALS.filter(m => m.category === 'wall');
  const insulations = MATERIALS.filter(m => m.category === 'insulation');
  const windowSizes = ['Small', 'Medium', 'Large'];
  const levels = ['Low', 'Medium', 'High'];

  return (
    <div className="onboarding-step animation-fade-in" style={{ paddingRight: '1rem' }}>
      <h2 className="step-heading" style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>What will you build with?</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Wall Material */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} /> Main Material
          </h3>
          <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: 0 }}>
            {wallMaterials.map(m => (
              <button
                key={m.id}
                className={`selection-card glass-panel ${design.wallMaterial === m.name ? 'selected' : ''}`}
                style={{ padding: '10px', gap: '8px' }}
                onClick={() => updateDesign({ wallMaterial: m.name })}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'center' }}>{m.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insulation */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} /> Insulation
          </h3>
          <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: 0 }}>
            {insulations.map(m => (
              <button
                key={m.id}
                className={`selection-card glass-panel ${design.insulationMaterial === m.name ? 'selected' : ''}`}
                style={{ padding: '10px', gap: '8px' }}
                onClick={() => updateDesign({ insulationMaterial: m.name })}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'center' }}>{m.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Windows */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sun size={18} /> Windows
          </h3>
          <div className="pill-group" style={{ justifyContent: 'flex-start' }}>
            {windowSizes.map(w => (
              <button
                key={w}
                className={`pill-btn ${design.windowSize === w ? 'selected' : ''}`}
                onClick={() => updateDesign({ windowSize: w as any })}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Ventilation */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wind size={18} /> Ventilation
          </h3>
          <div className="pill-group" style={{ justifyContent: 'flex-start' }}>
            {levels.map(l => (
              <button
                key={l}
                className={`pill-btn ${design.ventilationLevel === l ? 'selected' : ''}`}
                onClick={() => updateDesign({ ventilationLevel: l as any })}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Thermal Mass */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={18} /> Thermal Mass
          </h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1rem' }}>
            High thermal mass absorbs heat during the day and releases it at night.
          </p>
          <div className="pill-group" style={{ justifyContent: 'flex-start' }}>
            {levels.map(l => (
              <button
                key={l}
                className={`pill-btn ${design.thermalMassLevel === l ? 'selected' : ''}`}
                onClick={() => updateDesign({ thermalMassLevel: l as any })}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="step-actions" style={{ paddingTop: '1rem', marginTop: 'auto' }}>
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext}>
          Analyze Results
        </button>
      </div>
    </div>
  );
}
