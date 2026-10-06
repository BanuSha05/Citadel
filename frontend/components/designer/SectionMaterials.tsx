import React from 'react';
import { MountainSnow, ShieldCheck, TreePine, Layers, Box } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

export function SectionMaterials() {
  const { design, updateDesign } = useShelter();

  const materials = [
    { label: 'Local stone', icon: MountainSnow, desc: 'Locally available' },
    { label: 'Insulated panels', icon: ShieldCheck, desc: 'Good insulation' },
    { label: 'Wood', icon: TreePine, desc: 'Natural & warm' },
    { label: 'Composite panels', icon: Layers, desc: 'Lightweight' },
    { label: 'Other', icon: Box, desc: 'Custom choice' }
  ];

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.2s' }}>
      <h3 className="designer-section-title">3. Choose your materials</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Wall Material</h4>
        <div className="materials-grid">
          {materials.map((m) => (
            <button
              key={m.label}
              className={`material-card glass-panel ${design.wallMaterial === m.label ? 'selected' : ''}`}
              onClick={() => updateDesign({ wallMaterial: m.label })}
            >
              <m.icon size={28} className="card-icon" />
              <div className="material-info">
                <h4>{m.label}</h4>
                <span className="material-desc">{m.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Roof Material</h4>
        <div className="materials-grid">
          {materials.map((m) => (
            <button
              key={m.label}
              className={`material-card glass-panel ${design.roofMaterial === m.label ? 'selected' : ''}`}
              onClick={() => updateDesign({ roofMaterial: m.label })}
            >
              <m.icon size={28} className="card-icon" />
              <div className="material-info">
                <h4>{m.label}</h4>
                <span className="material-desc">{m.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
