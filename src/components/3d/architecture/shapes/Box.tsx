import React, { useMemo } from 'react';
import type { ShelterDesign } from '../../../../types';
import { Floor } from '../Floor';
import { Wall } from '../Wall';
import { getRoofMaterialProps, getGlassMaterialProps, getFrameMaterialProps, getInsulationMaterialProps } from '../materials';

interface BoxProps {
  design: ShelterDesign;
  showStructure: boolean;
}

export function Box({ design, showStructure }: BoxProps) {
  const w = design.width;
  const l = design.length;
  const h = design.height;

  // Calculate windows. We'll place them symmetrically on the long walls (front and back) for now.
  const windowCount = design.windowCount;
  const winW = design.windowSize === 'Large' ? 1.5 : design.windowSize === 'Medium' ? 1.0 : 0.6;
  const winH = design.windowSize === 'Large' ? 1.5 : design.windowSize === 'Medium' ? 1.0 : 0.6;
  const winY = 1.0; // 1m off the ground

  const frontOpenings: { x: number, y: number, width: number, height: number }[] = [];
  const backOpenings: { x: number, y: number, width: number, height: number }[] = [];

  // Simple distribution: alternate between front and back wall
  for (let i = 0; i < windowCount; i++) {
    const wallArr = i % 2 === 0 ? frontOpenings : backOpenings;
    const countOnWall = Math.floor(i / 2) + 1;
    // We will space them out. For now just place one in the middle, or offset
    const xPos = countOnWall === 1 ? 0 : (countOnWall % 2 === 0 ? -1 : 1) * 1.5;
    wallArr.push({ x: xPos, y: winY, width: winW, height: winH });
  }

  // Add one door to the front wall
  if (design.doorCount > 0) {
    frontOpenings.push({ x: -w/2 + 0.8, y: 0, width: 0.9, height: 2.1 });
  }

  const roofMat = getRoofMaterialProps(design.roofMaterial);
  const glassMat = getGlassMaterialProps();
  const frmMat = getFrameMaterialProps(design.frameType);
  const insMat = getInsulationMaterialProps();
  
  const insulationT = Math.max(0.01, design.insulationThickness / 100);
  const beamThickness = 0.1;
  const joistSpacing = 0.6;
  const numJoists = Math.max(2, Math.floor(l / joistSpacing) + 1);
  const actualJoistSpacing = l / (numJoists - 1);

  const renderWindows = (openings: { x: number, y: number, width: number, height: number }[], zPos: number) => {
    return openings.map((op, i) => {
      // Don't render glass for door (height 2.1, y 0)
      if (op.y === 0 && op.height > 2) return null;
      
      return (
        <mesh key={i} position={[op.x, op.y + op.height/2, zPos]}>
          <boxGeometry args={[op.width, op.height, 0.05]} />
          <meshPhysicalMaterial {...glassMat} />
        </mesh>
      );
    });
  };

  return (
    <group>
      <Floor design={design} showStructure={showStructure} />

      {/* Front Wall */}
      <group position={[0, 0.1, l/2]} rotation={[0, 0, 0]}>
        <Wall
          width={w}
          height={h}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={frontOpenings}
        />
        {!showStructure && renderWindows(frontOpenings, 0)}
      </group>

      {/* Back Wall */}
      <group position={[0, 0.1, -l/2]} rotation={[0, Math.PI, 0]}>
        <Wall
          width={w}
          height={h}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={backOpenings}
        />
        {!showStructure && renderWindows(backOpenings, 0)}
      </group>

      {/* Left Wall */}
      <group position={[-w/2, 0.1, 0]} rotation={[0, -Math.PI/2, 0]}>
        <Wall
          width={l}
          height={h}
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
          height={h}
          thickness={0.2}
          wallMaterial={design.wallMaterial}
          frameType={design.frameType}
          hasFrame={design.hasStructuralFrame}
          insulationThickness={design.insulationThickness}
          showStructure={showStructure}
          openings={[]}
        />
      </group>

      {/* Roof */}
      <group position={[0, h + 0.1, 0]}>
        {!showStructure && (
          <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[w + 0.4, 0.1, l + 0.4]} />
            <meshStandardMaterial {...roofMat} />
          </mesh>
        )}
        {showStructure && design.insulationThickness > 0 && (
          <mesh position={[0, insulationT/2, 0]} receiveShadow>
            <boxGeometry args={[w, insulationT, l]} />
            <meshStandardMaterial {...insMat} />
          </mesh>
        )}
        {showStructure && design.hasStructuralFrame && (
          <group position={[0, 0.05, 0]}>
             {/* Rim joists */}
             <mesh position={[0, 0, l/2 - beamThickness/2]} castShadow receiveShadow>
                <boxGeometry args={[w, beamThickness, beamThickness]} />
                <meshStandardMaterial {...frmMat} />
             </mesh>
             <mesh position={[0, 0, -l/2 + beamThickness/2]} castShadow receiveShadow>
                <boxGeometry args={[w, beamThickness, beamThickness]} />
                <meshStandardMaterial {...frmMat} />
             </mesh>
             {/* Internal joists */}
             {Array.from({ length: numJoists - 2 }).map((_, i) => (
                <mesh key={`joist-${i}`} position={[0, 0, -l/2 + (i + 1) * actualJoistSpacing]} castShadow receiveShadow>
                   <boxGeometry args={[w, beamThickness, beamThickness]} />
                   <meshStandardMaterial {...frmMat} />
                </mesh>
             ))}
          </group>
        )}
      </group>

    </group>
  );
}
