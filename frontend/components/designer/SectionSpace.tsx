import React from 'react';
import { useShelter } from '../../context/ShelterContext';

export function SectionSpace() {
  const { design, updateDesign } = useShelter();

  // Width is 4 by default, length is 5. So m2 is width * length. 
  // Let's control length with the slider to simplify things.
  // Area = width (4) * length. Min area 10, max area 40.
  // min length = 2.5, max length = 10.
  // We map 0-100 to 2.5-10
  
  const handleSpaceChange = (val: number) => {
    const newLength = 2.5 + (val / 100) * 7.5;
    updateDesign({ length: newLength });
  };

  const sliderValue = ((design.length - 2.5) / 7.5) * 100;
  const m2 = Math.round(design.width * design.length);

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.1s' }}>
      <h3 className="designer-section-title">2. How much space do you need?</h3>
      
      <div className="slider-container">
        <div className="slider-labels">
          <span>Compact</span>
          <span>Spacious</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderValue} 
          onChange={(e) => handleSpaceChange(Number(e.target.value))}
          className="space-slider"
        />
        <div className="slider-result">
          Recommended space: <span className="highlight-text">{m2} m²</span>
        </div>
      </div>
    </div>
  );
}
