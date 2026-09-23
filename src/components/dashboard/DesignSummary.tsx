import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface DesignSummaryProps {
  onBack: () => void;
}

export function DesignSummary({ onBack }: DesignSummaryProps) {
  const { design, myDesigns } = useShelter();
  const latestSaved = myDesigns.length > 0 ? myDesigns[myDesigns.length - 1] : null;
  const displayDesign = latestSaved ? latestSaved.design : design;
  const explanation = latestSaved?.recommendationExplanation || "Your design is well-optimized for this climate.";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="summary-print-layout animation-fade-in">
      <div className="no-print dashboard-header">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} className="icon-left" /> Back to Recommendation
        </button>
        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={16} className="icon-left" /> Print / Save PDF
        </button>
      </div>

      <div className="printable-report glass-panel">
        <div className="report-header">
          <h2>CITADEL Design Summary</h2>
          <p>Generated for {displayDesign.location}</p>
        </div>

        <div className="report-section">
          <h3>User Requirements</h3>
          <ul>
            <li><strong>Location:</strong> {displayDesign.location} ({displayDesign.climateProfile})</li>
            <li><strong>Capacity:</strong> {displayDesign.occupants} People</li>
            <li><strong>Priority:</strong> {displayDesign.priorities.join(' + ') || 'Comfort'}</li>
          </ul>
        </div>

        <div className="report-section">
          <h3>Selected Configuration</h3>
          <ul>
            <li><strong>Shape:</strong> {displayDesign.shape}</li>
            <li><strong>Materials:</strong> {displayDesign.wallMaterial}</li>
            <li><strong>Orientation:</strong> {displayDesign.orientation}-facing</li>
          </ul>
        </div>

        <div className="report-section">
          <h3>Performance Analysis</h3>
          <div className="report-charts">
            <div className="report-metric">
              <h4>Indoor Temperature</h4>
              <p>Estimated to remain within 18°C - 22°C during winter months without external heating.</p>
            </div>
            <div className="report-metric">
              <h4>Solar & Heat Flow</h4>
              <p>{explanation}</p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Recommendation & Assumptions</h3>
          <p>
            <strong>Recommendation:</strong> The {displayDesign.shape} with {displayDesign.wallMaterial} is the optimal choice for this climate and capacity. It balances structural integrity against snow loads with superior thermal performance.
          </p>
          <p className="text-small">
            <em>Assumptions:</em> Analysis assumes standard site conditions without severe topographic shading. Thermal performance estimates are based on average historical weather data for {displayDesign.location}.
          </p>
        </div>
      </div>
    </div>
  );
}
