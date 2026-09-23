import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { HourlyData } from '../../engine/thermal';
import type { ShelterDesign } from '../../types';

interface HeatFlowParticlesProps {
  data: HourlyData;
  design: ShelterDesign;
}

const PARTICLE_COUNT = 300;

export function HeatFlowParticles({ data, design }: HeatFlowParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create arrow geometry
  const arrowGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0, 0.1, 0.4, 4);
    geo.translate(0, 0.2, 0);
    // Rotate to point along Z axis
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const arrowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize particle states
  const [particles] = useState<any[]>(() => {
    const p = [];
    const w = design.width;
    const l = design.length;
    const h = design.height;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 6 categories, 50 particles each
      // 0: Solar, 1: Occupant, 2: Wall, 3: Roof, 4: Window, 5: Vent
      let type = Math.floor(i / 50);

      p.push({
        type,
        progress: Math.random(),
        speed: 0.5 + Math.random() * 0.5,
        offset: new THREE.Vector3((Math.random() - 0.5) * w * 1.5, Math.random() * h, (Math.random() - 0.5) * l * 1.5),
        seed: Math.random() * Math.PI * 2,
        subIndex: i % 50 // Used to split logic (e.g. for bidirectional vent)
      });
    }
    return p;
  });

  const colorSolar = new THREE.Color('#fbbf24'); // Yellow
  const colorHeat = new THREE.Color('#ef4444'); // Red
  const colorCool = new THREE.Color('#06b6d4'); // Cyan

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Intensity multipliers (scale based on Watts)
    const maxVal = 2000;
    const solarInt = Math.min(Math.abs(data.solarGain) / maxVal, 1.0);
    const occInt = Math.min(Math.abs(data.occupantGain) / maxVal, 1.0);
    const wallInt = Math.min(Math.abs(data.wallLoss) / maxVal, 1.0);
    const roofInt = Math.min(Math.abs(data.roofLoss) / maxVal, 1.0);
    const windowInt = Math.min(Math.abs(data.windowLoss) / maxVal, 1.0);
    const ventInt = Math.min(Math.abs(data.ventilationLoss) / maxVal, 1.0);

    const w = design.width;
    const l = design.length;
    const h = design.height;

    particles.forEach((p, i) => {
      let speedMult = 0;
      let active = false;
      let startPos = new THREE.Vector3();
      let endPos = new THREE.Vector3();
      let color = colorSolar;

      if (p.type === 0 && data.solarGain > 10) {
        // Solar Gain: Sun -> roof/windows -> shelter (Heat entering)
        speedMult = solarInt * 2;
        active = true;
        color = colorSolar;
        startPos.set(p.offset.x + 2, h + 3, p.offset.z + 2);
        endPos.set(p.offset.x * 0.5, h * 0.5, p.offset.z * 0.5);
      } 
      else if (p.type === 1 && data.occupantGain > 10) {
        // Internal Heat: Occupants -> indoor air
        speedMult = occInt * 1.5;
        active = true;
        color = colorHeat;
        startPos.set(p.offset.x * 0.5, 0.2, p.offset.z * 0.5);
        endPos.set(p.offset.x * 0.8, h * 0.8, p.offset.z * 0.8);
      }
      else if (p.type === 2 && Math.abs(data.wallLoss) > 10) {
        // Wall Heat Loss/Gain
        speedMult = wallInt * 2;
        active = true;
        const isLoss = data.wallLoss < 0; // Heat leaving
        color = colorHeat; // Transferring heat is always 'heat' color
        
        const dir = p.offset.clone().setY(0).normalize();
        const startRad = isLoss ? 0 : Math.max(w, l) * 1.2;
        const endRad = isLoss ? Math.max(w, l) * 1.2 : 0;
        
        startPos.set(dir.x * startRad, p.offset.y, dir.z * startRad);
        endPos.set(dir.x * endRad, p.offset.y, dir.z * endRad);
      }
      else if (p.type === 3 && Math.abs(data.roofLoss) > 10) {
        // Roof Heat Loss/Gain
        speedMult = roofInt * 2;
        active = true;
        const isLoss = data.roofLoss < 0;
        color = colorHeat;
        
        startPos.set(p.offset.x, isLoss ? h * 0.5 : h + 2, p.offset.z);
        endPos.set(p.offset.x, isLoss ? h + 2 : h * 0.5, p.offset.z);
      }
      else if (p.type === 4 && Math.abs(data.windowLoss) > 10) {
        // Window Heat Loss/Gain
        speedMult = windowInt * 2;
        active = true;
        const isLoss = data.windowLoss < 0;
        color = colorHeat; 
        
        const dir = p.offset.clone().setY(0).normalize();
        const startRad = isLoss ? w * 0.2 : Math.max(w, l) * 1.2;
        const endRad = isLoss ? Math.max(w, l) * 1.2 : w * 0.2;
        
        startPos.set(dir.x * startRad, h * 0.5, dir.z * startRad);
        endPos.set(dir.x * endRad, h * 0.5, dir.z * endRad);
      }
      else if (p.type === 5 && Math.abs(data.ventilationLoss) > 10) {
        // Ventilation: Cool air entering, Warm air leaving
        speedMult = ventInt * 2;
        active = true;
        const isLoss = data.ventilationLoss < 0; // Cold outside, losing heat
        
        const isInwardStream = p.subIndex % 2 === 0;

        // If losing heat: cool air enters, warm air leaves
        // If gaining heat: warm air enters, cool air leaves
        if (isLoss) {
          if (isInwardStream) {
            color = colorCool; // Cool outdoor air -> inside
            startPos.set(p.offset.x, h + 1, p.offset.z);
            endPos.set(p.offset.x * 0.5, h * 0.2, p.offset.z * 0.5);
          } else {
            color = colorHeat; // Warm indoor air -> outside
            startPos.set(p.offset.x * 0.5, h * 0.8, p.offset.z * 0.5);
            endPos.set(p.offset.x, h + 2, p.offset.z);
          }
        } else {
          if (isInwardStream) {
            color = colorHeat; // Warm outdoor air -> inside
            startPos.set(p.offset.x, h + 1, p.offset.z);
            endPos.set(p.offset.x * 0.5, h * 0.8, p.offset.z * 0.5);
          } else {
            color = colorCool; // Cool indoor air -> outside
            startPos.set(p.offset.x * 0.5, h * 0.2, p.offset.z * 0.5);
            endPos.set(p.offset.x, h + 2, p.offset.z);
          }
        }
      }

      if (active) {
        p.progress += delta * p.speed * speedMult;
        if (p.progress > 1) p.progress = 0;

        dummy.position.lerpVectors(startPos, endPos, p.progress);
        dummy.lookAt(endPos);
        
        const scale = Math.sin(p.progress * Math.PI) * (0.5 + speedMult * 0.5);
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, color);
      } else {
        dummy.scale.set(0,0,0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[arrowGeo, arrowMat, PARTICLE_COUNT]} />
  );
}
