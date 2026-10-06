import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment3D } from './Environment3D';
import { OrbitControls, Bounds } from '@react-three/drei';
import { useShelter } from '../../context/ShelterContext';
import { CompassOverlay } from './CompassOverlay';
import * as THREE from 'three';
import type { ShelterDesign } from '../../types';
import { PhysicsPredictor } from '@ml/predictor';
import { CLIMATE_PROFILES } from '@data/climates';
import { HeatFlowParticles } from './HeatFlowParticles';
import { HeatBalancePanel } from './HeatBalancePanel';
import { StructureToggle } from './architecture/StructureToggle';
import { Box } from './architecture/shapes/Box';
import { AFrame } from './architecture/shapes/AFrame';
import { Gable } from './architecture/shapes/Gable';
import { Dome } from './architecture/shapes/Dome';
import { SolarInfoPanel } from './SolarInfoPanel';
import { Focus, RefreshCcw } from 'lucide-react';
import { useThree } from '@react-three/fiber';

function CameraResetter({ resetCamKey }: { resetCamKey: number }) {
  const { camera, controls } = useThree();
  React.useEffect(() => {
    if (resetCamKey > 0) {
      camera.position.set(18, 12, 18);
      camera.lookAt(0, 0, 0);
      if (controls) {
        (controls as any).target.set(0, 0, 0);
        (controls as any).update();
      }
    }
  }, [resetCamKey, camera, controls]);
  return null;
}
function ShelterGeometry({ design, showStructure }: { design: ShelterDesign, showStructure: boolean }) {
  let ShapeComponent = Box;
  if (design.shape === 'A-Frame') {
    ShapeComponent = AFrame;
  } else if (design.shape === 'Gable Roof') {
    ShapeComponent = Gable;
  } else if (design.shape === 'Dome') {
    ShapeComponent = Dome;
  }

  
  return (
    <group rotation={[0, THREE.MathUtils.degToRad(-design.heading), 0]}>
      <ShapeComponent design={design} showStructure={showStructure} />
    </group>
  );
}

interface ShelterPreview3DProps {
  design?: ShelterDesign;
  hideCompass?: boolean;
}

export function ShelterPreview3D({ design: propDesign, hideCompass }: ShelterPreview3DProps) {
  const { design: contextDesign, updateDesign } = useShelter();
  const design = propDesign || contextDesign;
  
  const [showStructure, setShowStructure] = useState(false);
  const [showHeatFlow, setShowHeatFlow] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [resetCamKey, setResetCamKey] = useState(0);

  // Run physics prediction to get live heat flow data
  const hourlyData = React.useMemo(() => {
    const predictor = new PhysicsPredictor();
    const climate = CLIMATE_PROFILES.find(c => c.name === design.climateProfile) || CLIMATE_PROFILES[0];
    const result = predictor.predict(design, climate);
    
    // Get the data for the selected hour (or default to 12 if not set)
    const hour = design.selectedHour ?? 12;
    return result.hourly[hour] || result.hourly[12];
  }, [design]);

  return (
    <div className="shelter-preview-wrapper flex flex-col md:block relative w-full h-full min-h-[500px] md:min-h-[600px] bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200">
      
      {/* 3D Canvas Container */}
      <div className="shelter-canvas-container relative w-full h-[45vh] md:h-full md:absolute md:inset-0 border-b border-slate-200 md:border-none">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-600 shadow-sm z-10 pointer-events-none whitespace-nowrap">
          Representative Environment
        </div>
        
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setResetCamKey(k => k + 1)}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-sm cursor-pointer text-sm font-medium text-slate-800 hover:bg-slate-50"
            title="Reset Camera to Default"
          >
            <RefreshCcw size={16} className="text-slate-500" />
            <span className="reset-cam-text">Reset</span>
          </button>
          <button
            onClick={() => setResetKey(k => k + 1)}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-sm cursor-pointer text-sm font-medium text-slate-800 hover:bg-slate-50"
            title="Refit camera to shelter"
          >
            <Focus size={16} className="text-slate-500" />
            <span className="reset-cam-text">Fit</span>
          </button>
        </div>

        <Canvas shadows camera={{ position: [18, 12, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <CameraResetter resetCamKey={resetCamKey} />
            <Environment3D 
              timeOfDay={design.timeOfDay} 
              climateType={design.climateProfile} 
              latitude={design.latitude}
              longitude={design.longitude}
              season={design.selectedSeason}
            />
            <OrbitControls 
              makeDefault
              enablePan={true}
              enableZoom={true} 
              enableDamping={true}
              minDistance={2} 
              maxDistance={80}
              maxPolarAngle={Math.PI / 2 - 0.05}
            />
            <Bounds key={`${resetKey}-${design.shape}-${design.width}-${design.length}-${design.height}`} fit clip margin={1.2}>
              <ShelterGeometry design={design} showStructure={showStructure} />
            </Bounds>
            {showHeatFlow && <HeatFlowParticles data={hourlyData} design={design} />}
          </Suspense>
        </Canvas>
        
        {!hideCompass && <CompassOverlay />}
      </div>

      {/* UI Controls Container */}
      <div className="shelter-controls-container flex flex-col gap-4 p-4 overflow-y-auto md:absolute md:inset-0 md:p-0 md:pointer-events-none">
        <div className="md:pointer-events-auto">
          <SolarInfoPanel design={design} updateDesign={updateDesign} />
        </div>
        <div className="md:pointer-events-auto">
          <HeatBalancePanel data={hourlyData} showHeatFlow={showHeatFlow} setShowHeatFlow={setShowHeatFlow} />
        </div>
        <div className="md:pointer-events-auto">
          <StructureToggle showStructure={showStructure} setShowStructure={setShowStructure} />
        </div>
      </div>
    </div>
  );
}
