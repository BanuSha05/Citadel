import React from 'react';
import { useShelter } from '../../context/ShelterContext';

export function SectionStructure() {
  const { design, updateDesign } = useShelter();

  const frameTypes = ['Timber', 'Steel', 'Lightweight'];

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.3s' }}>
      <h3 className="designer-section-title">4. Structure & Insulation</h3>
      
      <div className="flex flex-column" style={{ gap: '1.5rem' }}>
        
        {/* Structural Frame */}
        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Structural Frame</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={design.hasStructuralFrame}
                onChange={(e) => updateDesign({ hasStructuralFrame: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {design.hasStructuralFrame && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {frameTypes.map(type => (
                <button
                  key={type}
                  className={`btn-secondary ${design.frameType === type ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
                  onClick={() => updateDesign({ frameType: type as any })}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Insulation Thickness */}
        <div className="slider-container glass-panel" style={{ padding: '1rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Insulation Thickness</span>
            <span className="text-gradient" style={{ fontWeight: 600 }}>{design.insulationThickness} cm</span>
          </div>
          <input 
            type="range" 
            min="0" max="30" step="1" 
            value={design.insulationThickness} 
            onChange={(e) => updateDesign({ insulationThickness: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

      </div>
    </div>
  );
}
