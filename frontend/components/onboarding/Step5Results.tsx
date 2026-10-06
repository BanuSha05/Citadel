import React, { useMemo, useState } from 'react';
import { Activity, Thermometer, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';
import { PhysicsPredictor } from '@ml/predictor';
import { CLIMATE_PROFILES } from '@data/climates';

interface Step5Props {
  onBack: () => void;
  onFinish: () => void;
}

export function Step5Results({ onBack, onFinish }: Step5Props) {
  const { design } = useShelter();
  const [showTechnical, setShowTechnical] = useState(false);

  const simulationResult = useMemo(() => {
    const climate = CLIMATE_PROFILES.find(c => c.type === design.climateProfile) || CLIMATE_PROFILES[0];
    const predictor = new PhysicsPredictor();
    return predictor.predict(design, climate);
  }, [design]);

  const currentHourData = simulationResult.hourly[design.selectedHour ?? 12];
  const totalSolarGain = Math.round(simulationResult.hourly.reduce((acc, curr) => acc + curr.solarGain, 0));

  const explanations = useMemo(() => {
    const exp: string[] = [];
    if ((design.insulationThickness || 0) > 50) {
      exp.push("Higher insulation reduced conductive heat loss.");
    } else {
      exp.push("Lower insulation allows more rapid heat exchange with the outside.");
    }
    
    if (design.windowCount > 0) {
      if (design.windowSize === 'Large' || design.windowCount > 2) {
        exp.push("Larger/more windows increased daytime solar gain and potential nighttime loss.");
      } else {
        exp.push("Smaller/fewer windows minimized unwanted heat loss/gain.");
      }
    }
    
    if (design.ventilationLevel === 'High') {
      exp.push("Higher ventilation increased heat exchange with outside air.");
    }
    
    if (design.thermalMassLevel === 'High' || design.wallMaterial === 'Local stone') {
      exp.push("Higher thermal mass slowed temperature changes, keeping things stable.");
    }
    
    if (design.shape === 'Dome') {
      exp.push("The dome shape reduced overall surface area, improving thermal efficiency.");
    }

    return exp;
  }, [design]);

  return (
    <div className="onboarding-step animation-fade-in" style={{ paddingRight: '1rem', display: 'flex', flexDirection: 'column' }}>
      <h2 className="step-heading" style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '0.5rem' }}>Your Shelter Results</h2>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>We've analyzed your design against the local climate conditions.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Thermometer size={16} /> Avg Indoor Temp
          </div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>
            {simulationResult.avgTemp}°C
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Activity size={16} /> Thermal Comfort
          </div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>
            {simulationResult.comfortLabel}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Optimization Insights</h3>
        <ul style={{ paddingLeft: '1.5rem', opacity: 0.9, lineHeight: 1.6 }}>
          {explanations.map((exp, i) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
      </div>

      {/* Technical Details Toggle */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowTechnical(!showTechnical)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', fontWeight: 600 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} /> Technical details
          </span>
          {showTechnical ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showTechnical && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ opacity: 0.7, display: 'block' }}>Heat entering (Solar)</span>
                <strong>+{currentHourData.solarGain} W</strong>
              </div>
              <div>
                <span style={{ opacity: 0.7, display: 'block' }}>Heat entering (Occupants)</span>
                <strong>+{currentHourData.occupantGain} W</strong>
              </div>
              <div>
                <span style={{ opacity: 0.7, display: 'block' }}>Heat leaving (Walls/Roof)</span>
                <strong>{currentHourData.wallLoss + currentHourData.roofLoss} W</strong>
              </div>
              <div>
                <span style={{ opacity: 0.7, display: 'block' }}>Heat leaving (Ventilation)</span>
                <strong>{currentHourData.ventilationLoss} W</strong>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Total Daily Solar Exposure</strong>
              {totalSolarGain} W over 24h
            </div>
          </div>
        )}
      </div>

      <div className="step-actions" style={{ paddingTop: '1rem', marginTop: 'auto' }}>
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onFinish}>
          Finish & Save
        </button>
      </div>
    </div>
  );
}
