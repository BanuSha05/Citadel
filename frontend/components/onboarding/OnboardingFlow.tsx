import React, { useState } from 'react';
import { Step1Location } from './Step1Location';
import { Step2People } from './Step2People';
import { Step3Shelter } from './Step3Shelter';
import { Step4Materials } from './Step4Materials';
import { Step5Results } from './Step5Results';
import { ShelterPreview3D } from '../3d/ShelterPreview3D';

interface OnboardingFlowProps {
  onCancel: () => void;
  onFinish: () => void;
}

export function OnboardingFlow({ onCancel, onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);

  const steps = [
    { num: 1, label: 'Location' },
    { num: 2, label: 'People' },
    { num: 3, label: 'Shelter' },
    { num: 4, label: 'Materials' },
    { num: 5, label: 'Results' }
  ];

  const renderProgress = () => (
    <div className="progress-indicator">
      {steps.map((s) => (
        <React.Fragment key={s.num}>
          <div className={`progress-step ${step >= s.num ? 'active' : ''}`}>
            <div className="progress-dot"></div>
            <span>{s.label}</span>
          </div>
          {s.num < steps.length && <div className={`progress-line ${step > s.num ? 'active' : ''}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  if (step >= 3) {
    return (
      <div className="designer-layout">
        <div className="preview-pane" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
           <div style={{ flex: 1, minHeight: '500px' }}>
             <ShelterPreview3D />
           </div>
        </div>
        
        <div className="config-pane">
          <div className="config-scroll-area">
             <button className="btn-close" style={{position: 'relative', top: '-10px', right: '-10px', float: 'right'}} onClick={onCancel}>✕</button>
             {renderProgress()}
             <div className="step-wrapper">
               {step === 3 && <Step3Shelter onNext={() => setStep(4)} onBack={() => setStep(2)} />}
               {step === 4 && <Step4Materials onNext={() => setStep(5)} onBack={() => setStep(3)} />}
               {step === 5 && <Step5Results onBack={() => setStep(4)} onFinish={onFinish} />}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      {/* Background retains subtle snow mountain feel */}
      <img src="/citadel_hero_bg.jpg" alt="background" className="onboarding-bg" />
      <div className="onboarding-overlay"></div>

      <div className="onboarding-content">
        <button className="btn-close" onClick={onCancel}>✕</button>

        {renderProgress()}

        <div className="step-wrapper">
          {step === 1 && <Step1Location onNext={() => setStep(2)} />}
          {step === 2 && <Step2People onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        </div>
      </div>
    </div>
  );
}
