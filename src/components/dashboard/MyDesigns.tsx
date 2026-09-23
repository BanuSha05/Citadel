import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface MyDesignsProps {
  onBack: () => void;
}

export function MyDesigns({ onBack }: MyDesignsProps) {
  const { myDesigns } = useShelter();

  return (
    <div className="my-designs-layout animation-fade-in">
      <div className="dashboard-header">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} className="icon-left" /> Back to Home
        </button>
        <h2 className="text-gradient">My Designs</h2>
      </div>

      {myDesigns.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>You haven't saved any designs yet.</p>
          <button className="btn-primary" onClick={onBack}>Start a new design</button>
        </div>
      ) : (
        <div className="designs-grid">
          {myDesigns.map((saved, idx) => (
            <div key={saved.id || idx} className="saved-design-card glass-panel">
              <img src="/shelter_preview.jpg" alt="Saved Shelter" className="saved-thumbnail" />
              <div className="saved-details">
                <h4>{saved.name || saved.design.location}</h4>
                <p>{saved.design.shape} • {saved.design.wallMaterial}</p>
                <span className="saved-date">{saved.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
