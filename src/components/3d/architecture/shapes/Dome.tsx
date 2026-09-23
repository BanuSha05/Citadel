import React from 'react';
import * as THREE from 'three';
import type { ShelterDesign } from '../../../../types';
import { Floor } from '../Floor';
import { getWallMaterialProps, getFrameMaterialProps, getGlassMaterialProps, getInsulationMaterialProps } from '../materials';

interface DomeProps {
  design: ShelterDesign;
  showStructure: boolean;
}

export function Dome({ design, showStructure }: DomeProps) {
  const w = design.width;
  const l = design.length;
  const h = design.height;
  
  const radius = Math.max(w, l) / 2;

  const extMat = getWallMaterialProps(design.wallMaterial);
  const frmMat = getFrameMaterialProps(design.frameType);
  const glassMat = getGlassMaterialProps();
  const insMat = getInsulationMaterialProps();
  const strutThickness = 0.05;

  return (
    <group>
      <Floor design={design} showStructure={showStructure} />

      {/* Outer Skin */}
      {!showStructure && (
        <mesh position={[0, h / 2 + 0.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...extMat} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Insulation Layer */}
      {showStructure && design.insulationThickness > 0 && (
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <sphereGeometry args={[radius - strutThickness * 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...insMat} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Structural Frame (Ribbed Arches) */}
      {showStructure && design.hasStructuralFrame && (
        <group position={[0, 0.1, 0]}>
          {/* Vertical Ribs */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI;
            return (
              <mesh key={`v-rib-${i}`} rotation={[0, angle, 0]} castShadow receiveShadow>
                <torusGeometry args={[radius - strutThickness, strutThickness, 8, 32, Math.PI]} />
                <meshStandardMaterial {...frmMat} />
              </mesh>
            );
          })}
          {/* Horizontal Rings */}
          {Array.from({ length: 3 }).map((_, i) => {
            const latAngle = ((i + 1) / 4) * (Math.PI / 2);
            const ringRadius = (radius - strutThickness) * Math.sin(latAngle);
            const ringY = (radius - strutThickness) * Math.cos(latAngle);
            return (
              <mesh key={`h-rib-${i}`} position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <torusGeometry args={[ringRadius, strutThickness, 8, 32]} />
                <meshStandardMaterial {...frmMat} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Windows (simple flat panels around the equator if any) */}
      {!showStructure && design.windowCount > 0 && (
        <group position={[0, h * 0.4, 0]}>
          {Array.from({ length: design.windowCount }).map((_, i) => {
            const angle = (i / design.windowCount) * Math.PI * 2;
            const x = Math.sin(angle) * (radius + 0.05);
            const z = Math.cos(angle) * (radius + 0.05);
            return (
              <mesh key={`win-${i}`} position={[x, 0, z]} rotation={[0, angle, 0]}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshPhysicalMaterial {...glassMat} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Door */}
      {!showStructure && design.doorCount > 0 && (
        <mesh position={[0, 1.05, radius + 0.05]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.9, 2.1, 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
    </group>
  );
}
