import { Compass, Sun, Smartphone } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

export function CompassOverlay() {
  const { design, updateDesign } = useShelter();

  const handleDeviceOrientation = async () => {
    // If the device supports DeviceOrientationEvent
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', (event: any) => {
            if (event.webkitCompassHeading) {
              // Apple devices
              updateDesign({ heading: event.webkitCompassHeading });
            } else if (event.alpha !== null) {
              // Android devices - Note: alpha is not absolute heading without absolute: true
              updateDesign({ heading: 360 - event.alpha });
            }
          });
        } else {
          alert('Device orientation permission denied.');
        }
      } catch (error) {
        alert('Device orientation is not supported on this device.');
      }
    } else {
      // Non-iOS 13+ devices
      window.addEventListener('deviceorientationabsolute', (event: any) => {
        if (event.alpha !== null) {
          updateDesign({ heading: 360 - event.alpha });
        }
      }, true);
      
      // Fallback
      window.addEventListener('deviceorientation', (event) => {
        if ((event as any).webkitCompassHeading) {
          updateDesign({ heading: (event as any).webkitCompassHeading });
        } else if (event.alpha !== null) {
          updateDesign({ heading: 360 - event.alpha });
        }
      });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDesign({ timeOfDay: parseInt(e.target.value, 10) });
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="preview-overlays" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
      <div className="overlay-top glass-panel" style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', pointerEvents: 'auto' }}>
        <Sun size={20} className="text-gradient" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
            <span>Time of Day</span>
            <span>{formatTime(design.timeOfDay)}</span>
          </div>
          <input 
            type="range" 
            min="6" max="18" step="1" 
            value={design.timeOfDay} 
            onChange={handleTimeChange} 
            style={{ width: '150px' }}
          />
        </div>
      </div>

      <div className="overlay-bottom glass-panel" style={{ alignSelf: 'flex-end', padding: '0.75rem 1rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <Compass size={24} style={{ transform: `rotate(${-design.heading}deg)`, transition: 'transform 0.1s ease-out' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{Math.round(design.heading)}°</span>
        </div>
        <button className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={handleDeviceOrientation}>
          <Smartphone size={14} className="icon-left" /> Align with Device
        </button>
      </div>
    </div>
  );
}
