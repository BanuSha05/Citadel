import React from 'react';
import { Sun } from 'lucide-react';
import { calculateSolarPosition } from '../../engine/solar';
import type { ShelterDesign } from '../../types';

interface SolarInfoPanelProps {
  design: ShelterDesign;
  updateDesign: (design: Partial<ShelterDesign>) => void;
}

export function SolarInfoPanel({ design, updateDesign }: SolarInfoPanelProps) {
  const { altitude, azimuth } = calculateSolarPosition(
    design.latitude, 
    design.longitude, 
    design.selectedSeason, 
    design.timeOfDay
  );
  
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Calculate incidence (0 to 1) for various surfaces
  const altR = altitude * (Math.PI / 180);
  const azR = azimuth * (Math.PI / 180);

  const calcWallExposure = (wallAzimuth: number) => {
    if (altitude < 0) return 0;
    const wAzR = wallAzimuth * (Math.PI / 180);
    const azDiff = azR - wAzR;
    return Math.max(0, Math.cos(altR) * Math.cos(azDiff));
  };

  const exposure = {
    roof: altitude > 0 ? Math.max(0, Math.sin(altR)) : 0,
    north: calcWallExposure(0),
    east: calcWallExposure(90),
    south: calcWallExposure(180),
    west: calcWallExposure(270),
    windows: 0
  };

  // Window exposure
  if (altitude > 0) {
    if (design.windowOrientation === 'Balanced') {
      exposure.windows = (exposure.north + exposure.east + exposure.south + exposure.west) / 4;
    } else {
      let targetAzimuth = 0; // North
      if (design.windowOrientation === 'East') targetAzimuth = 90;
      if (design.windowOrientation === 'South') targetAzimuth = 180;
      if (design.windowOrientation === 'West') targetAzimuth = 270;
      exposure.windows = calcWallExposure(targetAzimuth);
    }
  }

  const ExposureBar = ({ label, value }: { label: string, value: number }) => (
    <div style={{ marginBottom: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${value * 100}%`, 
          backgroundColor: value > 0.5 ? '#f59e0b' : '#fbbf24',
          transition: 'width 0.3s ease-out'
        }} />
      </div>
    </div>
  );

  return (
    <div className="solar-info-panel glass-panel md:absolute md:top-6 md:left-6 z-10 w-full md:w-56" style={{ 
      padding: '1rem', 
      borderRadius: '1rem', 
      pointerEvents: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
        <Sun size={18} className="text-gradient" />
        <span>Sun Position</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Altitude:</span>
          <span>{Math.max(0, altitude).toFixed(1)}°</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Azimuth:</span>
          <span>{azimuth.toFixed(1)}°</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Time:</span>
          <span style={{ fontWeight: 'bold' }}>{formatTime(design.timeOfDay)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Season:</span>
          <span>{design.selectedSeason}</span>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="range" 
          min="0" max="23.99" step="0.1" 
          value={design.timeOfDay} 
          onChange={(e) => updateDesign({ timeOfDay: parseFloat(e.target.value) })}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          <span>Midnight</span>
          <span>Noon</span>
          <span>Midnight</span>
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', color: '#64748b' }}>
        Solar Exposure
      </div>
      
      <ExposureBar label="Roof" value={exposure.roof} />
      <ExposureBar label="South Wall" value={exposure.south} />
      <ExposureBar label="North Wall" value={exposure.north} />
      <ExposureBar label="East Wall" value={exposure.east} />
      <ExposureBar label="West Wall" value={exposure.west} />
      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <ExposureBar label="Windows" value={exposure.windows} />
      </div>
    </div>
  );
}
