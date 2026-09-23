import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ShelterDesign } from '../../../../types';
import { Floor } from '../Floor';
import { getWallMaterialProps, getInsulationMaterialProps, getFrameMaterialProps, getGlassMaterialProps } from '../materials';

interface AFrameProps {
  design: ShelterDesign;
  showStructure: boolean;
}

export function AFrame({ design, showStructure }: AFrameProps) {
  const w = design.width;
  const l = design.length;
  const h = design.height;
  
  const roofLength = Math.sqrt((w / 2) ** 2 + h ** 2);
  const roofAngle = Math.atan2(h, w / 2);

  const extMat = getWallMaterialProps(design.wallMaterial);
  const insMat = getInsulationMaterialProps();
  const frmMat = getFrameMaterialProps(design.frameType);
  const glassMat = getGlassMaterialProps();

  const insulationT = Math.max(0.01, design.insulationThickness / 100);
  const thickness = design.hasStructuralFrame ? Math.max(0.1, insulationT) : insulationT;
  
  const roofThickness = 0.2;

  // Front triangular wall shape
  const frontShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, h);
    s.lineTo(-w / 2, 0);

    // Door
    if (design.doorCount > 0) {
      const hole = new THREE.Path();
      hole.moveTo(-0.45, 0);
      hole.lineTo(0.45, 0);
      hole.lineTo(0.45, 2.1);
      hole.lineTo(-0.45, 2.1);
      hole.lineTo(-0.45, 0);
      s.holes.push(hole);
    }
    
    // Window
    if (design.windowCount > 0) {
      const hole = new THREE.Path();
      const wy = h * 0.4;
      hole.moveTo(-0.5, wy);
      hole.lineTo(0.5, wy);
      hole.lineTo(0.5, wy + 1);
      hole.lineTo(-0.5, wy + 1);
      hole.lineTo(-0.5, wy);
      s.holes.push(hole);
    }

    return s;
  }, [w, h, design.doorCount, design.windowCount]);

  const extrudeSettings = { depth: thickness, bevelEnabled: false };
  const studSpacing = 0.6;
  const beamThickness = 0.1;

  // Generate A-Frame rafters along the length
  const numRafters = Math.max(2, Math.floor(l / studSpacing) + 1);
  const actualSpacing = l / (numRafters - 1);

  // Function to generate wall studs for the triangular front/back walls
  const renderGableStuds = (zPos: number) => {
    const numStuds = Math.max(2, Math.floor(w / studSpacing) + 1);
    const studWidth = 0.05;
    const actualStudSpacing = (w - studWidth) / (numStuds - 1);
    
    return Array.from({ length: numStuds }).map((_, i) => {
      const xPos = -w / 2 + studWidth / 2 + i * actualStudSpacing;
      // Calculate max height of stud at this xPos (triangle: h at center, 0 at edges)
      const distFromCenter = Math.abs(xPos);
      const studH = h * (1 - (distFromCenter / (w / 2)));
      
      if (studH <= 0.1) return null;
      
      return (
        <mesh key={`stud-${i}`} position={[xPos, studH / 2, zPos]} castShadow receiveShadow>
          <boxGeometry args={[studWidth, studH, thickness]} />
          <meshStandardMaterial {...frmMat} />
        </mesh>
      );
    });
  };

  return (
    <group>
      <Floor design={design} showStructure={showStructure} />

      {/* Front Triangle Wall */}
      <group position={[0, 0.1, l / 2]} rotation={[0, 0, 0]}>
        {!showStructure && (
          <mesh position={[0, 0, thickness / 2]} castShadow receiveShadow>
            <extrudeGeometry args={[frontShape, extrudeSettings]} />
            <meshStandardMaterial {...extMat} />
          </mesh>
        )}
        {showStructure && design.insulationThickness > 0 && (
          <mesh position={[0, 0, 0]} receiveShadow>
            <extrudeGeometry args={[frontShape, { depth: insulationT, bevelEnabled: false }]} />
            <meshStandardMaterial {...insMat} />
          </mesh>
        )}
        {showStructure && design.hasStructuralFrame && (
          <group position={[0, 0, -thickness/2]}>
            {renderGableStuds(0)}
          </group>
        )}
        {/* Glass for window */}
        {!showStructure && design.windowCount > 0 && (
          <mesh position={[0, h * 0.4 + 0.5, 0]}>
            <boxGeometry args={[1, 1, thickness + 0.05]} />
            <meshPhysicalMaterial {...glassMat} />
          </mesh>
        )}
      </group>

      {/* Back Triangle Wall */}
      <group position={[0, 0.1, -l / 2 - thickness]} rotation={[0, 0, 0]}>
        {!showStructure && (
          <mesh position={[0, 0, thickness / 2]} castShadow receiveShadow>
            <extrudeGeometry args={[frontShape, extrudeSettings]} />
            <meshStandardMaterial {...extMat} />
          </mesh>
        )}
        {showStructure && design.hasStructuralFrame && (
          <group position={[0, 0, thickness/2]}>
             {renderGableStuds(0)}
          </group>
        )}
      </group>

      {/* Left Roof Plane */}
      <group position={[-w / 4, h / 2 + 0.1, 0]} rotation={[0, 0, -roofAngle]}>
        {!showStructure && (
          <mesh position={[0, roofThickness / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[roofThickness, roofLength, l + 0.4]} />
            <meshStandardMaterial {...getWallMaterialProps(design.roofMaterial || design.wallMaterial)} />
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
      <group position={[w / 4, h / 2 + 0.1, 0]} rotation={[0, 0, roofAngle]}>
        {!showStructure && (
          <mesh position={[0, roofThickness / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[roofThickness, roofLength, l + 0.4]} />
            <meshStandardMaterial {...getWallMaterialProps(design.roofMaterial || design.wallMaterial)} />
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
