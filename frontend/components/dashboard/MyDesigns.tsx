import React from 'react';
import { ArrowLeft, Trash2, FolderOpen, Activity } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import type { SavedDesign } from '../../types';
import { PhysicsPredictor } from '@ml/predictor';
import { CLIMATE_PROFILES } from '@data/climates';

interface MyDesignsProps {
  onBack: () => void;
  onLoadDesign: () => void;
  onCompare: () => void;
}

export function MyDesigns({ onBack, onLoadDesign, onCompare }: MyDesignsProps) {
  const { myDesigns, loadDesign, deleteDesign, reloadPersistentData } = useShelter();

  React.useEffect(() => {
    reloadPersistentData();
  }, [reloadPersistentData]);

  const handleLoad = (saved: SavedDesign) => {
    loadDesign(saved);
    onLoadDesign();
  };

  return (
    <div className="my-designs-layout animation-fade-in">
      <div className="dashboard-header">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} className="icon-left" /> Back to Home
        </button>
        <h2 className="text-gradient">My Designs</h2>
      </div>

      {myDesigns.length >= 2 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="btn-primary" onClick={onCompare} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Compare All Designs
          </button>
        </div>
      )}

      {myDesigns.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>You haven't saved any designs yet.</p>
          <button className="btn-primary" onClick={onBack}>Start a new design</button>
        </div>
      ) : (
        <div className="designs-grid">
          {myDesigns.map((saved, idx) => {
            const climate = CLIMATE_PROFILES.find(c => c.type === saved.design.climateProfile) || CLIMATE_PROFILES[0];
            const sim = new PhysicsPredictor().predict(saved.design, climate);
            
            return (
            <div 
              key={saved.id || idx} 
              className="saved-design-card glass-panel" 
            >
              <img src="/shelter_preview.jpg" alt="Saved Shelter" className="saved-thumbnail" onClick={() => handleLoad(saved)} style={{ cursor: 'pointer' }} />
              <div className="saved-details">
                <h4 onClick={() => handleLoad(saved)} style={{ cursor: 'pointer' }}>{saved.name || saved.design.location}</h4>
                <p>{saved.design.shape} • {saved.design.wallMaterial}</p>
                <span className="saved-date">Saved on: {saved.date}</span>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Status:</strong> Completed<br/>
                  <strong>Thermal Score:</strong> {sim.comfortScore.toFixed(0)}/100 ({sim.comfortLabel})<br/>
                  <strong>Avg Temp:</strong> {sim.avgTemp.toFixed(1)}°C
                </div>
                {saved.recommendationExplanation && (
                  <p className="text-xs text-amber-500 mt-1 italic">{saved.recommendationExplanation}</p>
                )}
                
                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn-primary flex-1 text-sm py-1.5 flex items-center justify-center gap-1" 
                    onClick={(e) => { e.stopPropagation(); handleLoad(saved); }}
                  >
                    <FolderOpen size={14} /> Review Design
                  </button>
                  <button 
                    className="btn-secondary flex-1 text-sm py-1.5 flex items-center justify-center gap-1" 
                    onClick={(e) => { e.stopPropagation(); handleLoad(saved); }}
                  >
                    View Report
                  </button>
                  <button 
                    className="btn-ghost flex-none text-sm py-1.5 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Delete this design?')) deleteDesign(saved.id); }}
                    title="Delete Design"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
