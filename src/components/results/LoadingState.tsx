import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export function LoadingState() {
  const [stage, setStage] = useState(0);

  const stages = [
    'Understanding your location',
    'Checking the climate',
    'Testing your shelter',
    'Comparing possible improvements'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev < stages.length ? prev + 1 : prev));
    }, 1200); // Progress every 1.2s
    
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="loading-container animation-fade-in">
      <div className="spinner"></div>
      <h2 className="loading-heading">Checking your shelter...</h2>
      
      <div className="loading-stages">
        {stages.map((text, idx) => (
          <div key={text} className={`loading-stage ${idx <= stage ? 'active' : ''}`}>
            {idx < stage ? (
              <CheckCircle2 className="stage-icon complete" size={24} />
            ) : (
              <Circle className="stage-icon pending" size={24} />
            )}
            <span className="stage-text">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
