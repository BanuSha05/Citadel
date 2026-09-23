import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getWallMaterialProps, getInsulationMaterialProps, getFrameMaterialProps } from './materials';

interface Opening {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WallProps {
  width: number;
  height: number;
  thickness: number;
  wallMaterial: string;
  frameType: string;
  hasFrame: boolean;
  insulationThickness: number; // in cm
  showStructure: boolean;
  openings?: Opening[];
}

export function Wall({
  width,
  height,
  thickness,
  wallMaterial,
  frameType,
  hasFrame,
  insulationThickness,
  showStructure,
  openings = []
}: WallProps) {
  
  const extMat = getWallMaterialProps(wallMaterial);
  const insMat = getInsulationMaterialProps();
  const frmMat = getFrameMaterialProps(frameType);

  const innerSkinThickness = 0.02;
  const outerSkinThickness = 0.02;
  // insulation thickness is given in cm, convert to meters
  const insulationT = Math.max(0.01, insulationThickness / 100);
  const coreThickness = hasFrame ? Math.max(0.1, insulationT) : insulationT; // If framed, core is at least 10cm for studs

  // Create shapes for extrusion
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Start from bottom left
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.lineTo(-width / 2, 0);

    // Add holes for openings
    openings.forEach((op) => {
      const holePath = new THREE.Path();
      holePath.moveTo(op.x - op.width / 2, op.y);
      holePath.lineTo(op.x + op.width / 2, op.y);
      holePath.lineTo(op.x + op.width / 2, op.y + op.height);
      holePath.lineTo(op.x - op.width / 2, op.y + op.height);
      holePath.lineTo(op.x - op.width / 2, op.y);
      s.holes.push(holePath);
    });

    return s;
  }, [width, height, openings]);

  const extrudeSettings = (depth: number) => ({
    depth,
    bevelEnabled: false,
  });

  const studSpacing = 0.6;
  const studWidth = 0.05;
  const numStuds = Math.max(2, Math.floor(width / studSpacing) + 1);
  const actualSpacing = (width - studWidth) / (numStuds - 1);

  return (
    <group>
      {/* Outer Skin */}
      {!showStructure && (
        <mesh position={[0, 0, coreThickness / 2 + outerSkinThickness / 2]} castShadow receiveShadow>
          <extrudeGeometry args={[shape, extrudeSettings(outerSkinThickness)]} />
          <meshStandardMaterial {...extMat} />
        </mesh>
      )}

      {/* Inner Skin */}
      {!showStructure && (
        <mesh position={[0, 0, -coreThickness / 2 - innerSkinThickness / 2]} receiveShadow>
          <extrudeGeometry args={[shape, extrudeSettings(innerSkinThickness)]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
        </mesh>
      )}

      {/* Insulation Core */}
      {showStructure && insulationThickness > 0 && (
        <mesh position={[0, 0, -insulationT / 2]} receiveShadow>
          <extrudeGeometry args={[shape, extrudeSettings(insulationT)]} />
          <meshStandardMaterial {...insMat} />
        </mesh>
      )}

      {/* Structural Frame (Studs) */}
      {hasFrame && (
        <group>
          {Array.from({ length: numStuds }).map((_, i) => {
            const xPos = -width / 2 + studWidth / 2 + i * actualSpacing;
            
            // Check if stud intersects any opening
            let intersect = false;
            let studBottom = 0;
            let studTop = height;

            // Simplified: If a stud falls in an opening, we cut it.
            // For a perfect frame we'd need cripple studs, etc. This is visually adequate.
            for (const op of openings) {
              const opLeft = op.x - op.width / 2;
              const opRight = op.x + op.width / 2;
              if (xPos > opLeft && xPos < opRight) {
                intersect = true;
                break;
              }
            }

            if (!intersect) {
              return (
                <mesh key={`stud-${i}`} position={[xPos, height / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[studWidth, height, coreThickness]} />
                  <meshStandardMaterial {...frmMat} />
                </mesh>
              );
            }
            return null;
          })}

          {/* Top Plate */}
          <mesh position={[0, height - studWidth / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, studWidth, coreThickness]} />
            <meshStandardMaterial {...frmMat} />
          </mesh>
          {/* Bottom Plate */}
          <mesh position={[0, studWidth / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, studWidth, coreThickness]} />
            <meshStandardMaterial {...frmMat} />
          </mesh>
        </group>
      )}
    </group>
  );
}
