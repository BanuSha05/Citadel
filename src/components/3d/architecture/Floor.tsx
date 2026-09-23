import React from 'react';
import type { ShelterDesign } from '../../../types';
import { getFrameMaterialProps } from './materials';

interface FloorProps {
  design: ShelterDesign;
  showStructure: boolean;
}

export function Floor({ design, showStructure }: FloorProps) {
  const w = design.width;
  const l = design.length;
  
  const frameMat = getFrameMaterialProps(design.frameType);
  const deckThickness = 0.05;
  const joistDepth = 0.2;
  const joistWidth = 0.05;
  const joistSpacing = 0.6; // 600mm typical spacing

  const numJoists = Math.floor(l / joistSpacing) + 1;
  const actualSpacing = l / (numJoists > 1 ? numJoists - 1 : 1);

  return (
    <group position={[0, joistDepth / 2, 0]}>
      {/* Floor Decking (hidden when showStructure is true) */}
      {!showStructure && (
        <mesh position={[0, joistDepth / 2 + deckThickness / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[w, deckThickness, l]} />
          <meshStandardMaterial color="#d4a373" roughness={0.8} />
        </mesh>
      )}

      {/* Floor Joists (always visible, or part of structure) */}
      {design.hasStructuralFrame && Array.from({ length: numJoists }).map((_, i) => {
        const zPos = -l / 2 + i * actualSpacing;
        return (
          <mesh key={`joist-${i}`} position={[0, 0, zPos]} receiveShadow castShadow>
            <boxGeometry args={[w, joistDepth, joistWidth]} />
            <meshStandardMaterial {...frameMat} />
          </mesh>
        );
      })}
      
      {/* Rim Joists */}
      {design.hasStructuralFrame && (
        <>
          <mesh position={[-w / 2 + joistWidth / 2, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[joistWidth, joistDepth, l]} />
            <meshStandardMaterial {...frameMat} />
          </mesh>
          <mesh position={[w / 2 - joistWidth / 2, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[joistWidth, joistDepth, l]} />
            <meshStandardMaterial {...frameMat} />
          </mesh>
        </>
      )}
    </group>
  );
}
