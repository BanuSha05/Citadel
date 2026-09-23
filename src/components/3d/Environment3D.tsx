import React, { useMemo } from 'react';
import { Sky, Environment, Line } from '@react-three/drei';
import { calculateSolarPosition } from '../../engine/solar';

export function Environment3D({ 
  timeOfDay, 
  climateType = 'Temperate', 
  latitude = 0, 
  longitude = 0, 
  season = 'Winter' 
}: { 
  timeOfDay: number; 
  climateType?: string;
  latitude?: number;
  longitude?: number;
  season?: string;
}) {
  const { altitude, sunVector } = calculateSolarPosition(latitude, longitude, season, timeOfDay);
  
  // Compute sun path points for the current day
  const sunPathPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let h = 4; h <= 20; h += 0.5) {
      const pos = calculateSolarPosition(latitude, longitude, season, h);
      if (pos.altitude >= -2) { // Only above or slightly below horizon
        points.push(pos.sunVector);
      }
    }
    return points;
  }, [latitude, longitude, season]);

  // Use altitude (0 to ~90 deg) as a proxy for elevation to adjust lighting intensity
  const elevation = Math.max(0, altitude / 90);

  return (
    <>
      <Sky distance={450000} sunPosition={sunVector} inclination={0} azimuth={0.25} />
      <Environment preset={timeOfDay > 17 || timeOfDay < 7 || altitude < 5 ? "sunset" : "city"} />
      
      {sunPathPoints.length > 1 && (
        <Line 
          points={sunPathPoints} 
          color="#fbbf24" 
          lineWidth={1.5}
          dashed={true}
          dashSize={1}
          gapSize={1}
          opacity={0.4}
          transparent={true}
        />
      )}

      <directionalLight
        castShadow
        position={sunVector}
        intensity={Math.max(0.1, elevation * 2)}
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.1, 100]} />
      </directionalLight>

      <ambientLight intensity={Math.max(0.1, elevation * 0.5)} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color={
            (climateType.toLowerCase().includes('cold') || season === 'Winter') ? "#ffffff" :
            climateType.toLowerCase().includes('dry') ? "#e6c287" :
            climateType.toLowerCase().includes('humid') ? "#2d4c1e" :
            "#4a5d23" // Temperate default
          } 
          roughness={
            (climateType.toLowerCase().includes('cold') || season === 'Winter') ? 0.9 : 1
          }
          metalness={0} 
        />
      </mesh>
    </>
  );
}
