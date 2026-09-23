import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ShelterDesign } from '../../../../types';
import { Floor } from '../Floor';
import { Wall } from '../Wall';
import { getRoofMaterialProps, getWallMaterialProps, getInsulationMaterialProps, getFrameMaterialProps, getGlassMaterialProps } from '../materials';

interface GableProps {
  design: ShelterDesign;
  showStructure: boolean;
}

export function Gable({ design, showStructure }: GableProps) {
  const w = design.width;
  const l = design.length;
  const h = design.height;
  
  // Roof is pitched. Let's make wall height 60% of total height, pitch 40%.
  const wallH = h * 0.6;
  const roofH = h * 0.4;
  
  const roofLength = Math.sqrt((w / 2) ** 2 + roofH ** 2);
  const roofAngle = Math.atan2(roofH, w / 2);

  const windowCount = design.windowCount;
  const winW = design.windowSize === 'Large' ? 1.5 : design.windowSize === 'Medium' ? 1.0 : 0.6;
  const winH = design.windowSize === 'Large' ? 1.5 : design.windowSize === 'Medium' ? 1.0 : 0.6;
  const winY = 1.0;

  const frontOpenings: { x: number, y: number, width: number, height: number }[] = [];
  const backOpenings: { x: number, y: number, width: number, height: number }[] = [];

  for (let i = 0; i < windowCount; i++) {
    const wallArr = i % 2 === 0 ? frontOpenings : backOpenings;
    const countOnWall = Math.floor(i / 2) + 1;
    const xPos = countOnWall === 1 ? 0 : (countOnWall % 2 === 0 ? -1 : 1) * 1.5;
    wallArr.push({ x: xPos, y: winY, width: winW, height: winH });
  }

  if (design.doorCount > 0) {
    frontOpenings.push({ x: -w/2 + 0.8, y: 0, width: 0.9, height: 2.1 });
  }

  const extMat = getWallMaterialProps(design.wallMaterial);
  const insMat = getInsulationMaterialProps();
  const frmMat = getFrameMaterialProps(design.frameType);
  const glassMat = getGlassMaterialProps();
  
  const roofMat = getRoofMaterialProps(design.roofMaterial);
  const roofThickness = 0.15;
  const insulationT = Math.max(0.01, design.insulationThickness / 100);
  const thickness = design.hasStructuralFrame ? Math.max(0.1, insulationT) : insulationT;

  const renderWindows = (openings: { x: number, y: number, width: number, height: number }[], zPos: number) => {
    return openings.map((op, i) => {
      if (op.y === 0 && op.height > 2) return null; // Door
      return (
        <mesh key={i} position={[op.x, op.y + op.height/2, zPos]}>
          <boxGeometry args={[op.width, op.height, 0.05]} />
          <meshPhysicalMaterial {...glassMat} />
        </mesh>
      );
    });
  };

  // The Gable ends (triangles on top of the front/back walls)
  const gableTriangle = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, roofH);
    s.lineTo(-w / 2, 0);
    return s;
  }, [w, roofH]);

  const extrudeSettings = { depth: 0.2, bevelEnabled: false };
  const studSpacing = 0.6;
  const beamThickness = 0.1;
  const numRafters = Math.max(2, Math.floor(l / studSpacing) + 1);
  const actualSpacing = l / (numRafters - 1);

  const renderGableStuds = (zPos: number) => {
    const numStuds = Math.max(2, Math.floor(w / studSpacing) + 1);
    const studWidth = 0.05;
    const actualStudSpacing = (w - studWidth) / (numStuds - 1);
    
    return Array.from({ length: numStuds }).map((_, i) => {
      const xPos = -w / 2 + studWidth / 2 + i * actualStudSpacing;
      const distFromCenter = Math.abs(xPos);
      const studH = roofH * (1 - (distFromCenter / (w / 2)));
      
      if (studH <= 0.1) return null;
      
      return (
        <mesh key={`gstud-${i}`} position={[xPos, studH / 2, zPos]} castShadow receiveShadow>
          <boxGeometry args={[studWidth, studH, thickness]} />
          <meshStandardMaterial {...frmMat} />
        </mesh>
      );
    });
  };

  return (
    <group>
      <Floor design={design} showStructure={showStructure} />

      {/* Front Wall Base */}
      <group position={[0, 0.1, l/2]} rotation={[0, 0, 0]}>
        <Wall
          width={w}
          height={wallH}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={frontOpenings}
        />
        {!showStructure && renderWindows(frontOpenings, 0)}
        
        {/* Front Gable Triangle */}
        <group position={[0, wallH, -0.1]}>
            {!showStructure && (
            <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
                <extrudeGeometry args={[gableTriangle, extrudeSettings]} />
                <meshStandardMaterial {...extMat} />
            </mesh>
            )}
            {showStructure && design.insulationThickness > 0 && (
            <mesh position={[0, 0, 0.1]} receiveShadow>
                <extrudeGeometry args={[gableTriangle, { depth: insulationT, bevelEnabled: false }]} />
                <meshStandardMaterial {...insMat} />
            </mesh>
            )}
            {showStructure && design.hasStructuralFrame && (
            <group position={[0, 0, 0.1]}>
                {renderGableStuds(0)}
            </group>
            )}
        </group>
      </group>

      {/* Back Wall Base */}
      <group position={[0, 0.1, -l/2]} rotation={[0, Math.PI, 0]}>
        <Wall
          width={w}
          height={wallH}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={backOpenings}
        />
        {!showStructure && renderWindows(backOpenings, 0)}

        {/* Back Gable Triangle */}
        <group position={[0, wallH, -0.1]}>
            {!showStructure && (
            <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
                <extrudeGeometry args={[gableTriangle, extrudeSettings]} />
                <meshStandardMaterial {...extMat} />
            </mesh>
            )}
            {showStructure && design.insulationThickness > 0 && (
            <mesh position={[0, 0, 0.1]} receiveShadow>
                <extrudeGeometry args={[gableTriangle, { depth: insulationT, bevelEnabled: false }]} />
                <meshStandardMaterial {...insMat} />
            </mesh>
            )}
            {showStructure && design.hasStructuralFrame && (
            <group position={[0, 0, 0.1]}>
                {renderGableStuds(0)}
            </group>
            )}
        </group>
      </group>

      {/* Left Wall */}
      <group position={[-w/2, 0.1, 0]} rotation={[0, -Math.PI/2, 0]}>
        <Wall
          width={l}
          height={wallH}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={[]}
        />
      </group>

      {/* Right Wall */}
      <group position={[w/2, 0.1, 0]} rotation={[0, Math.PI/2, 0]}>
        <Wall
          width={l}
          height={wallH}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={[]}
        />
      </group>

      {/* Left Roof Plane */}
      <group position={[-w / 4, wallH + roofH / 2 + 0.1, 0]} rotation={[0, 0, -roofAngle]}>
        {!showStructure && (
          <mesh position={[0, roofThickness / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[roofThickness, roofLength, l + 0.4]} />
            <meshStandardMaterial {...roofMat} />
          </mesh>
        )}
        {showStructure && design.insulationThickness > 0 && (
          <mesh position={[0, insulationT / 2, 0]} receiveShadow>
            <boxGeometry args={[insulationT, roofLength - 0.1, l]} />
            <meshStandardMaterial {...insMat} />
          </mesh>
        )}
        {showStructure && design.hasStructuralFrame && (
          <group position={[0, roofThickness / 2, 0]}>
            {Array.from({ length: numRafters }).map((_, i) => (
              <mesh key={`rafter-l-${i}`} position={[0, 0, -l/2 + i * actualSpacing]} castShadow receiveShadow>
                 <boxGeometry args={[beamThickness, roofLength, beamThickness]} />
                 <meshStandardMaterial {...frmMat} />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* Right Roof Plane */}
      <group position={[w / 4, wallH + roofH / 2 + 0.1, 0]} rotation={[0, 0, roofAngle]}>
        {!showStructure && (
          <mesh position={[0, roofThickness / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[roofThickness, roofLength, l + 0.4]} />
            <meshStandardMaterial {...roofMat} />
          </mesh>
        )}
        {showStructure && design.insulationThickness > 0 && (
          <mesh position={[0, insulationT / 2, 0]} receiveShadow>
            <boxGeometry args={[insulationT, roofLength - 0.1, l]} />
            <meshStandardMaterial {...insMat} />
          </mesh>
        )}
        {showStructure && design.hasStructuralFrame && (
          <group position={[0, roofThickness / 2, 0]}>
            {Array.from({ length: numRafters }).map((_, i) => (
              <mesh key={`rafter-r-${i}`} position={[0, 0, -l/2 + i * actualSpacing]} castShadow receiveShadow>
                 <boxGeometry args={[beamThickness, roofLength, beamThickness]} />
                 <meshStandardMaterial {...frmMat} />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* Ridge Beam */}
      {showStructure && design.hasStructuralFrame && (
        <mesh position={[0, h + 0.1 - beamThickness/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[beamThickness, beamThickness, l]} />
          <meshStandardMaterial {...frmMat} />
        </mesh>
      )}
    </group>
  );
}
