import React, { useState, useEffect } from 'react';
import { Compass, Smartphone } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

export function SectionOrientation() {
  const { design, updateDesign } = useShelter();
  const [heading, setHeading] = useState<number | null>(null);
  const [useSensors, setUseSensors] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const directions = ['North', 'South', 'East', 'West'];

  const getDirectionText = (degree: number) => {
    if (degree >= 337.5 || degree < 22.5) return 'North';
    if (degree >= 22.5 && degree < 67.5) return 'NE';
    if (degree >= 67.5 && degree < 112.5) return 'East';
    if (degree >= 112.5 && degree < 157.5) return 'SE';
    if (degree >= 157.5 && degree < 202.5) return 'South';
    if (degree >= 202.5 && degree < 247.5) return 'SW';
    if (degree >= 247.5 && degree < 292.5) return 'West';
    if (degree >= 292.5 && degree < 337.5) return 'NW';
    return 'North';
  };

  const getSimpleDirection = (degree: number) => {
    if (degree >= 315 || degree < 45) return 'North';
    if (degree >= 45 && degree < 135) return 'East';
    if (degree >= 135 && degree < 225) return 'South';
    if (degree >= 225 && degree < 315) return 'West';
    return 'North';
  };

  useEffect(() => {
    let handleOrientation = (event: any) => {
      let currentHeading = null;
      if (event.webkitCompassHeading) {
        currentHeading = event.webkitCompassHeading;
      } else if (event.absolute && event.alpha !== null) {
        currentHeading = 360 - event.alpha;
      }

      if (currentHeading !== null) {
        setHeading(currentHeading);
      }
    };

    if (useSensors) {
      const requestAccess = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          try {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission === 'granted') {
              setPermissionGranted(true);
              window.addEventListener('deviceorientation', handleOrientation, true);
            } else {
              setPermissionGranted(false);
              setUseSensors(false);
            }
          } catch (error) {
            console.error('Permission error:', error);
            setUseSensors(false);
          }
        } else {
          setPermissionGranted(true);
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        }
      };
      requestAccess();
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [useSensors]);

  // When heading updates and we are using sensors, update the design context orientation
  useEffect(() => {
    if (useSensors && heading !== null) {
      const dir = getSimpleDirection(heading);
      if (design.orientation !== dir) {
        updateDesign({ orientation: dir });
      }
    }
  }, [heading, useSensors]);

  return (
    <div className="designer-section animation-fade-in" style={{ animationDelay: '0.4s' }}>
      <h3 className="designer-section-title">5. Orientation</h3>
      <p className="section-help-text">Orientation affects how much sunlight your shelter receives.</p>
      
      <div className="orientation-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Compass 
              size={64} 
              className="compass-icon" 
              style={{ 
                transform: heading !== null ? `rotate(${-heading}deg)` : 'rotate(0deg)',
                transition: useSensors ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
                color: useSensors ? '#00e5ff' : 'rgba(255,255,255,0.7)'
              }} 
            />
            {heading !== null && useSensors && (
              <div style={{ position: 'absolute', fontWeight: 'bold', fontSize: '0.85rem', color: '#00e5ff', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
                {Math.round(heading)}°
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
            {useSensors ? (
              <>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00e5ff' }}>
                  {heading !== null ? getDirectionText(heading) : 'Calibrating...'}
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} 
                  onClick={() => setUseSensors(false)}
                >
                  Enter Manually
                </button>
              </>
            ) : (
              <button 
                className="btn-primary" 
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
                onClick={() => setUseSensors(true)}
              >
                <Smartphone size={16} /> Use Device Sensor
              </button>
            )}
          </div>
        </div>

        {(!useSensors) && (
          <div className="pill-group" style={{ marginTop: '0.5rem' }}>
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
        )}
      </div>
    </div>
  );
}
