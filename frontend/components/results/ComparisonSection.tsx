import React from 'react';
import { CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface ComparisonSectionProps {
  onImprove: () => void;
}

export function ComparisonSection({ onImprove }: ComparisonSectionProps) {
  const { design } = useShelter();

  const comparisons = [
    {
      title: 'Current Design',
      comfort: 'Optimal',
      energy: 'Low',
      weight: 'Medium',
      status: 'best'
    },
    {
      title: 'Better Insulated',
      comfort: 'Too Warm',
      energy: 'Very Low',
      weight: 'Heavy',
      status: 'suboptimal'
    },
    {
      title: 'Alternate Shape',
      comfort: 'Cold',
      energy: 'High',
      weight: 'Light',
      status: 'suboptimal'
    }
  ];

  return (
    <div className="comparison-section animation-fade-in" style={{ animationDelay: '0.5s' }}>
      <h3 className="section-heading">Compared with other designs</h3>
      
      <div className="comparison-grid">
        {comparisons.map((c, idx) => (
          <div key={idx} className={`comparison-card glass-panel ${c.status === 'best' ? 'highlight' : ''}`}>
            <h4>{c.title}</h4>
            <ul className="metrics-list">
              <li>
                <span>Comfort</span>
                <strong>{c.comfort}</strong>
              </li>
              <li>
                <span>Energy</span>
                <strong>{c.energy}</strong>
              </li>
              <li>
                <span>Weight</span>
                <strong>{c.weight}</strong>
              </li>
            </ul>
            <div className="status-indicator">
              {c.status === 'best' ? (
                <span className="status-best"><CheckCircle2 size={16} /> Best fit</span>
              ) : (
                <span className="status-sub"><Minus size={16} /> Less ideal</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="explanation-card glass-panel">
        <h4>Why this design?</h4>
        <p>
          Your {design.shape} shelter performs better because its shape, insulation and orientation are better suited to this location.
        </p>
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={onImprove}>Improve My Design</button>
        <button className="btn-secondary">View Details</button>
      </div>
    </div>
  );
}
