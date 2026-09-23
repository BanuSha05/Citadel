import React from 'react';
import { useShelter } from '../../context/ShelterContext';

export function SectionDimensions() {
  const { design, updateDesign } = useShelter();

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.1s' }}>
      <h3 className="designer-section-title">2. How much space do you need?</h3>
      <div className="flex flex-column" style={{ gap: '1.5rem' }}>
        
        <div className="slider-container glass-panel" style={{ padding: '1rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Width</span>
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

        <div className="slider-container glass-panel" style={{ padding: '1rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Length</span>
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

        <div className="slider-container glass-panel" style={{ padding: '1rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Height</span>
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

        <div className="result-badge glass-panel" style={{ textAlign: 'center', padding: '1rem', borderRadius: '1rem' }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total Area: </span>
          <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {Math.round(design.width * design.length)} m²
          </span>
        </div>

      </div>
    </div>
  );
}
