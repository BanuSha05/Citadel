import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Step4Props {
  onBack: () => void;
  onFinish: () => void;
}

export function Step4Complete({ onBack, onFinish }: Step4Props) {
  return (
    <div className="onboarding-step animation-fade-in final-step">
      <div className="success-icon-wrapper">
        <CheckCircle2 size={64} className="success-icon" />
      </div>
      <h2 className="step-heading">Great. We have what we need to start building your shelter.</h2>
      
      <div className="step-actions center-actions">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onFinish}>
          Continue to Shelter Design
        </button>
      </div>
    </div>
  );
}
