import React from 'react';
import { Compass } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

export function SectionOrientation() {
  const { design, updateDesign } = useShelter();

  const directions = ['North', 'South', 'East', 'West'];

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.4s' }}>
      <h3 className="designer-section-title">5. Orientation</h3>
      <p className="section-help-text">Orientation affects how much sunlight your shelter receives.</p>
      
      <div className="orientation-container">
        <Compass size={48} className="compass-icon" />
        <div className="pill-group">
          {directions.map((dir) => (
            <button
              key={dir}
              className={`pill-btn ${design.orientation === dir ? 'selected' : ''}`}
              onClick={() => updateDesign({ orientation: dir })}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
