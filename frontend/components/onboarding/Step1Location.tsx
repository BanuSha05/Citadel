import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Globe, AlertTriangle } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import { CLIMATE_PROFILES, getOfflineClimateProfile } from '@data/climates';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface Step1Props {
  onNext: () => void;
}

export function Step1Location({ onNext }: Step1Props) {
  const { design, updateDesign } = useShelter();
  
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error' | 'manual' | 'region'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');
  
  const [compassStatus, setCompassStatus] = useState<'idle' | 'detecting' | 'success' | 'unavailable'>('idle');
  const [heading, setHeading] = useState<number>(0);
  
  const [activeClimateId, setActiveClimateId] = useState<string | null>(null);

  // If already set previously in context, pre-fill fields.
  // We only automatically restore "success" status if it was confirmed THIS session.
  useEffect(() => {
    if (design.latitude !== 0 && design.longitude !== 0 && design.location !== 'Unknown') {
      setLat(design.latitude.toString());
      setLon(design.longitude.toString());
      
      const isConfirmed = sessionStorage.getItem('locationConfirmed') === 'true';
      if (isConfirmed) {
        if (design.location.includes('Manual')) {
          setLocationStatus('manual');
        } else if (design.location.includes('Region')) {
          setLocationStatus('region');
        } else {
          setLocationStatus('success');
        }
        const climate = CLIMATE_PROFILES.find(c => c.type === design.climateProfile);
        if (climate) setActiveClimateId(climate.id);
        if (design.heading !== 0) {
          setHeading(design.heading);
          setCompassStatus('success');
        }
      }
    }
  }, [design]);

  const startCompass = () => {
    setCompassStatus('detecting');
    if (typeof window !== 'undefined' && 'ondeviceorientationabsolute' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        let alpha = event.alpha;
        let webkitCompassHeading = (event as any).webkitCompassHeading;
        let h = 0;
        if (webkitCompassHeading !== undefined) {
          h = webkitCompassHeading;
        } else if (alpha !== null) {
          h = 360 - alpha;
        }
        setHeading(Math.round(h));
        setCompassStatus('success');
        updateDesign({ heading: Math.round(h) });
      };
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      // fallback timeout if no events fire
      setTimeout(() => {
        if (compassStatus !== 'success') setCompassStatus('unavailable');
      }, 3000);
      return () => window.removeEventListener('deviceorientationabsolute', handleOrientation);
    } else {
      setCompassStatus('unavailable');
    }
  };

  const handleDeviceGPS = async () => {
    setLocationStatus('detecting');
    
    try {
      if (Capacitor.isNativePlatform()) {
        const check = await Geolocation.checkPermissions();
        if (check.location !== 'granted' && check.location !== 'prompt') {
          // If denied, we can still try to request, but it might just return denied immediately
        }
        if (check.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            setLocationStatus('error');
            setErrorMessage('Location permission denied. Please enter manually.');
            return;
          }
        }
      }

      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const latNum = position.coords.latitude;
      const lonNum = position.coords.longitude;
      
      const climate = getOfflineClimateProfile(latNum, lonNum);
      
      setActiveClimateId(climate.id);
      setLat(latNum.toString());
      setLon(lonNum.toString());
      updateDesign({
        location: `Device GPS`,
        climateProfile: climate.type,
        latitude: latNum,
        longitude: lonNum
      });
      setLocationStatus('success');
      startCompass();
      sessionStorage.setItem('locationConfirmed', 'true');
    } catch (error: any) {
      setLocationStatus('error');
      setErrorMessage(`Device location unavailable: ${error.message}`);
    }
  };

  const handleManualCoordinates = () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      alert("Please enter valid latitude and longitude numbers.");
      return;
    }
    
    const climate = getOfflineClimateProfile(latNum, lonNum);
    setActiveClimateId(climate.id);
    updateDesign({
      location: `Manual Coordinates`,
      climateProfile: climate.type,
      latitude: latNum,
      longitude: lonNum
    });
    setLocationStatus('manual');
    sessionStorage.setItem('locationConfirmed', 'true');
  };

  const handleSelectRegion = (climateId: string) => {
    const climate = CLIMATE_PROFILES.find(c => c.id === climateId) || CLIMATE_PROFILES[0];
    setActiveClimateId(climateId);
    updateDesign({
      location: `Region: ${climate.name}`,
      climateProfile: climate.type,
      latitude: climate.latitude,
      longitude: climate.longitude
    });
    setLocationStatus('region');
    sessionStorage.setItem('locationConfirmed', 'true');
  };

  const activeClimate = CLIMATE_PROFILES.find(c => c.id === activeClimateId);

  const getDirectionText = (h: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(h / 45) % 8];
  };

  const isComplete = (locationStatus === 'success' || locationStatus === 'manual' || locationStatus === 'region') && activeClimate;

  return (
    <div className="onboarding-step animation-fade-in">
      <h2 className="step-heading">Let's understand your environment.</h2>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', borderLeft: '3px solid #3b82f6', fontSize: '0.875rem' }}>
        <strong>Your location tells CITADEL where you are.</strong><br/>
        The offline climate profile provides representative conditions for that region.
      </div>

      {locationStatus === 'idle' || locationStatus === 'detecting' || locationStatus === 'error' ? (
        <div className="location-selection">
          {locationStatus === 'error' && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              {errorMessage}
            </div>
          )}

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }} 
            onClick={handleDeviceGPS}
            disabled={locationStatus === 'detecting'}
          >
            <Navigation size={20} />
            {locationStatus === 'detecting' ? 'Detecting Location...' : 'Use Device Location'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', width: '100%' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ marginBottom: '1rem' }}>Enter coordinates manually</h4>
              <input 
                type="number" 
                placeholder="Latitude" 
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '0.5rem' }}
              />
              <input 
                type="number" 
                placeholder="Longitude" 
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '1rem' }}
              />
              <button className="btn-secondary" style={{ width: '100%' }} onClick={handleManualCoordinates}>
                Apply
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ marginBottom: '1rem' }}>Choose offline climate region</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {CLIMATE_PROFILES.map((climate) => (
                  <button
                    key={climate.id}
                    onClick={() => handleSelectRegion(climate.id)}
                    style={{ padding: '0.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.25rem', color: 'white', cursor: 'pointer' }}
                  >
                    {climate.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="location-card glass-panel animation-slide-up" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981' }}>Offline Mode Active</span>
            </div>
            <button className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setLocationStatus('idle')}>
              Change
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* LOCATION SECTION */}
            <div>
              <h4 style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> LOCATION DETECTED</h4>
              {locationStatus === 'region' ? (
                <>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{design.location.replace('Region: ', '')}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Location source: ● Offline Region Selection</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Latitude: {parseFloat(lat).toFixed(4)}°</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Longitude: {parseFloat(lon).toFixed(4)}°</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>
                    Location source: ● {locationStatus === 'manual' ? 'Manual entry' : 'Device location'}
                  </div>
                </>
              )}
            </div>

            {/* COMPASS SECTION */}
            {locationStatus === 'success' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Compass size={14} /> FIND YOUR ORIENTATION</h4>
                {compassStatus === 'detecting' ? (
                  <div style={{ opacity: 0.8 }}>Detecting compass...</div>
                ) : compassStatus === 'unavailable' ? (
                  <div style={{ opacity: 0.8 }}>Device compass unavailable. Defaults to North.</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                      transform: `rotate(${-heading}deg)`, transition: 'transform 0.1s ease-out'
                    }}>
                      <div style={{ position: 'absolute', top: '-4px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
                      <Navigation size={24} style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Heading: {heading}°</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Direction: {getDirectionText(heading)}</div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>Source: ● Device compass</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CLIMATE SECTION */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={14} /> CLIMATE DATA</h4>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{activeClimate?.region} ({activeClimate?.name})</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>Source: Offline representative climate profile</div>
            </div>

            {/* ENVIRONMENT SECTION */}
            {activeClimate && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Representative offline conditions</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Temperature</div>
                    <div style={{ fontWeight: 600 }}>{activeClimate.avgWinterTemp}°C to {activeClimate.avgSummerTemp}°C</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Humidity</div>
                    <div style={{ fontWeight: 600 }}>{activeClimate.humidity}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Solar radiation</div>
                    <div style={{ fontWeight: 600 }}>{activeClimate.solarRadiation} W/m²</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Wind</div>
                    <div style={{ fontWeight: 600 }}>{activeClimate.windSpeed} m/s</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Altitude</div>
                    <div style={{ fontWeight: 600 }}>{activeClimate.altitude}m</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="step-actions" style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn-secondary" style={{ flex: '1', minWidth: '120px' }} disabled>Back</button>
        <button className="btn-primary" style={{ flex: '1', minWidth: '120px' }} onClick={() => {
          sessionStorage.setItem('locationConfirmed', 'true');
          onNext();
        }} disabled={!isComplete}>
          Continue
        </button>
      </div>
    </div>
  );
}
