import React from 'react';
import { SectionShape } from './SectionShape';
import { SectionDimensions } from './SectionDimensions';
import { SectionMaterials } from './SectionMaterials';
import { SectionStructure } from './SectionStructure';
import { SectionOpenings } from './SectionOpenings';
import { SectionOrientation } from './SectionOrientation';
import { SummaryCard } from './SummaryCard';
import { ShelterPreview3D } from '../3d/ShelterPreview3D';
import { ThermalAnalysisPanel } from './ThermalAnalysisPanel';

interface ShelterDesignerProps {
  onChangeRequirements: () => void;
  onCheckShelter: () => void;
}

export function ShelterDesigner({ onChangeRequirements, onCheckShelter }: ShelterDesignerProps) {
  return (
    <div className="designer-layout">
      {/* Left: 3D Preview (Visual Centerpiece) & Thermal Analysis */}
      <div className="preview-pane" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '1rem' }}>
        <div style={{ flexShrink: 0 }}>
          <ShelterPreview3D />
        </div>
        <div style={{ padding: '0 1rem' }}>
          <ThermalAnalysisPanel />
        </div>
      </div>

      {/* Right: Configuration Panel */}
      <div className="config-pane">
        <div className="config-scroll-area">
          <h2 className="config-header text-gradient">Design Your Shelter</h2>
          <p className="config-subheader">Customize your structure based on your needs.</p>
          
          <SectionShape />
          <div className="divider"></div>
          <SectionDimensions />
          <div className="divider"></div>
          <SectionMaterials />
          <div className="divider"></div>
          <SectionStructure />
          <div className="divider"></div>
          <SectionOpenings />
          <div className="divider"></div>
          <SectionOrientation />
          
          <SummaryCard onChangeRequirements={onChangeRequirements} onCheckShelter={onCheckShelter} />
        </div>
      </div>
    </div>
  );
}
