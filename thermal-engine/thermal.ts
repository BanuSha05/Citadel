import type { ShelterDesign } from '@app-types';
import type { ClimateData } from '@data/climates';
import { calculateSolarPosition } from './solar';

export interface HourlyData {
  hour: number;
  outdoorTemp: number;
  indoorTemp: number;
  solarGain: number; // Watts
  occupantGain: number; // Watts
  wallLoss: number; // Watts
  roofLoss: number; // Watts
  windowLoss: number; // Watts
  ventilationLoss: number; // Watts
  netHeatFlow: number; // Watts
  roofSolarGain: number; // Watts
  wallSolarGain: number; // Watts
  windowSolarGain: number; // Watts
}

export interface ThermalSimulationResult {
  hourly: HourlyData[];
  comfortScore: number;
  comfortLabel: 'Comfortable' | 'Needs Improvement' | 'Very Cold' | 'Very Warm';
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  totalSolarGain: number; // Wh per day
  totalHeatLoss: number; // Wh per day
  estimatedWeight: number; // kg
}

// Simple material U-values (W/m2K) (Heat transfer coefficient)
const U_VALUES: Record<string, number> = {
  'Wood': 2.0,
  'Insulated Panels': 0.5,
  'Local stone': 3.5,
  'Composite panels': 1.2,
  'Other': 2.0,
  'Pitched': 1.5,
  'Flat': 1.8,
  'Metal': 4.0
};

export function simulateThermalPerformance(design: ShelterDesign, climate: ClimateData): ThermalSimulationResult {
  const result: HourlyData[] = [];
  
  // 1. Calculate Geometry
  const width = design.width || 4;
  const length = design.length || 5;
  const height = design.height || 3;
  
  // Approximate volume and surface area based on shape
  let volume = width * length * height;
  let surfaceAreaRoof = width * length; // Baseline flat roof
  let surfaceAreaWalls = (width * 2 + length * 2) * height;

  if (design.shape === 'A-Frame') {
    volume = (width * height / 2) * length;
    surfaceAreaRoof = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height, 2)) * 2 * length;
    surfaceAreaWalls = width * height; // Just the two triangular ends
  } else if (design.shape === 'Dome') {
    const radius = Math.max(width, length) / 2;
    volume = (2/3) * Math.PI * Math.pow(radius, 3);
    surfaceAreaRoof = 2 * Math.PI * Math.pow(radius, 2);
    surfaceAreaWalls = 0; // It's all roof
  }

  const floorArea = width * length;
  const totalArea = surfaceAreaRoof + surfaceAreaWalls;

  // Weight Estimation (very rough approximations)
  // Assuming density in kg/m2:
  // Wood: ~15, Insulated Panels: ~10, Tarpaulin: ~1, Corrugated Metal: ~8
  let wallDensity = 10;
  if (design.wallMaterial === 'Wood' || design.wallMaterial === 'Plywood') wallDensity = 15;
  if (design.wallMaterial === 'Canvas' || design.wallMaterial === 'Fabric') wallDensity = 2;
  if (design.wallMaterial === 'Adobe' || design.wallMaterial === 'Local stone') wallDensity = 100;
  
  let roofDensity = 5;
  if (design.roofMaterial === 'Metal' || design.roofMaterial === 'Corrugated Metal') roofDensity = 8;
  if (design.roofMaterial === 'Tarpaulin') roofDensity = 1;
  
  const estimatedWeight = (surfaceAreaWalls * wallDensity) + (surfaceAreaRoof * roofDensity) + (floorArea * 15); // Add floor


  // 2. Calculate Thermal Properties
  const baseWallU = U_VALUES[design.wallMaterial] || 2.0;
  const baseRoofU = U_VALUES[design.roofMaterial] || 2.0;
  
  // Insulation thicknes converts to R-value (approx 0.04 m2K/W per mm, or 0.4 per cm)
  const insulationR = (design.insulationThickness || 0) * 0.4;
  const wallU = 1 / ((1 / baseWallU) + insulationR);
  const roofU = 1 / ((1 / baseRoofU) + insulationR);
  
  // Overall UA (W/K) (Opaque surfaces)
  const opaqueUA = (surfaceAreaWalls * wallU) + (surfaceAreaRoof * roofU) + (floorArea * 1.0 /* floor U */);
  
  // Windows
  const windowMultiplier = design.windowCount * (design.windowSize === 'Large' ? 1.5 : design.windowSize === 'Small' ? 0.5 : 1.0);
  const windowArea = windowMultiplier * 1.0; // 1 sqm base per medium window
  const windowU = 2.8; // double glazing
  const windowUA = windowArea * windowU;

  const UA = opaqueUA + windowUA;

  // Thermal Mass (Capacitance, Joules/K)
  // Air is ~1200 J/m3K. Add mass of the structure.
  let massMultiplier = 1;
  if (design.thermalMassLevel === 'Medium') massMultiplier = 5;
  if (design.thermalMassLevel === 'High') massMultiplier = 15;
  if (design.wallMaterial === 'Local stone') massMultiplier += 10;
  
  const thermalCapacitance = volume * 1200 + (totalArea * 10000 * massMultiplier);

  // Ventilation (Air Changes Per Hour -> m3/s)
  let ach = 1.0;
  if (design.ventilationLevel === 'Low') ach = 0.5;
  if (design.ventilationLevel === 'High') ach = 3.0;
  
  const ventConductance = (ach * volume / 3600) * 1200; // W/K

  // Total heat loss coefficient
  const H_total = UA + ventConductance;

  // 3. Setup Climate
  const baseTemp = design.selectedSeason === 'Winter' ? climate.avgWinterTemp : climate.avgSummerTemp;
  // Simple diurnal swing (e.g. +/- 8 degrees)
  const tempSwing = 8;

  // Occupants (100W per person sensible heat)
  const occupantGain = (design.occupants || 1) * 100;

  // Pre-calculate surface dimensions for solar gain
  const heading = design.heading || 0;
  // Wall Azimuths
  const wallAzimuths = [
    heading,                   // Front
    (heading + 90) % 360,      // Right
    (heading + 180) % 360,     // Back
    (heading + 270) % 360      // Left
  ];
  
  // Apportion window area based on windowOrientation
  const windowAreas = [0, 0, 0, 0]; // Front, Right, Back, Left
  
  if (design.windowOrientation === 'Balanced') {
    windowAreas.fill(windowArea / 4);
  } else {
    let targetAzimuth = 0; // North
    if (design.windowOrientation === 'East') targetAzimuth = 90;
    if (design.windowOrientation === 'South') targetAzimuth = 180;
    if (design.windowOrientation === 'West') targetAzimuth = 270;
    
    // Find the wall closest to the target azimuth
    let bestIndex = 0;
    let minDiff = 360;
    for (let i = 0; i < 4; i++) {
      let diff = Math.abs(wallAzimuths[i] - targetAzimuth);
      if (diff > 180) diff = 360 - diff; // Circular difference
      if (diff < minDiff) {
        minDiff = diff;
        bestIndex = i;
      }
    }
    windowAreas[bestIndex] = windowArea;
  }
  
  // Distribute opaque wall areas (rough approximation: 4 equal walls)
  const opaqueWallArea = surfaceAreaWalls / 4;

  // Initial condition
  let T_in = baseTemp + 5; 

  // Euler integration loop (run multiple days to reach pseudo steady state)
  const DAYS_TO_SIMULATE = 3;
  const dt = 3600; // 1 hour steps
  
  let finalHourlyData: HourlyData[] = [];

  for (let day = 0; day < DAYS_TO_SIMULATE; day++) {
    const dailyData: HourlyData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      // Diurnal outdoor temperature curve (min at 4am, max at 4pm)
      // shift hour by -4 so that min is at 0 (hour 4)
      const hourOffset = (hour - 4 + 24) % 24;
      // Cosine wave from -1 to 1
      const normalizedSwing = -Math.cos((hourOffset / 24) * 2 * Math.PI);
      const T_out = baseTemp + (normalizedSwing * tempSwing);

      // Calculate exact solar position and solar gain
      const { altitude, azimuth } = calculateSolarPosition(design.latitude || 0, design.longitude || 0, design.selectedSeason || 'Winter', hour);
      
      let solarGain = 0;
      let roofSolarGain = 0;
      let wallSolarGain = 0;
      let windowSolarGain = 0;
      
      if (altitude > 0) {
        // Simple atmospheric attenuation: intensity scales with altitude
        const solarIntensity = climate.solarRadiation * (altitude / 90);
        
        // 1. Roof Gain
        // Assuming flat or gently pitched roof, incidence is roughly sin(altitude)
        const roofIncidence = Math.max(0, Math.sin(altitude * (Math.PI / 180)));
        // absorption ~0.2 for opaque insulated roof
        roofSolarGain = solarIntensity * surfaceAreaRoof * roofIncidence * 0.2;
        solarGain += roofSolarGain;
        
        // 2. Wall & Window Gain
        for (let i = 0; i < 4; i++) {
          const wAzimuth = wallAzimuths[i];
          const azDiff = (azimuth - wAzimuth) * (Math.PI / 180);
          
          // Incidence on a vertical wall: cos(altitude) * cos(azimuth_diff)
          const wallIncidence = Math.max(0, Math.cos(altitude * (Math.PI / 180)) * Math.cos(azDiff));
          
          // Opaque Wall Gain (absorption ~0.2)
          wallSolarGain += solarIntensity * opaqueWallArea * wallIncidence * 0.2;
          
          // Window Gain (SHGC ~0.7)
          windowSolarGain += solarIntensity * windowAreas[i] * wallIncidence * 0.7;
        }
        solarGain += wallSolarGain + windowSolarGain;
      }

      // Net Heat Flow (Watts)
      // Positive = entering the shelter
      
      const dT_current = T_out - T_in;
      const wallLoss = ((surfaceAreaWalls * wallU) + (floorArea * 1.0)) * dT_current;
      const roofLoss = (surfaceAreaRoof * roofU) * dT_current;
      const windowLoss = windowUA * dT_current;
      const ventilationLoss = ventConductance * dT_current;
      
      const Q_conduction = wallLoss + roofLoss + windowLoss + ventilationLoss;
      const Q_net = Q_conduction + solarGain + occupantGain;

      // Update Indoor Temp
      const dT = (Q_net * dt) / thermalCapacitance;
      T_in += dT;

      dailyData.push({
        hour,
        outdoorTemp: Math.round(T_out * 10) / 10,
        indoorTemp: Math.round(T_in * 10) / 10,
        solarGain: Math.round(solarGain),
        occupantGain: Math.round(occupantGain),
        wallLoss: Math.round(wallLoss),
        roofLoss: Math.round(roofLoss),
        windowLoss: Math.round(windowLoss),
        ventilationLoss: Math.round(ventilationLoss),
        netHeatFlow: Math.round(Q_net),
        roofSolarGain: Math.round(roofSolarGain),
        wallSolarGain: Math.round(wallSolarGain),
        windowSolarGain: Math.round(windowSolarGain)
      });
    }
    finalHourlyData = dailyData;
  }

  // 4. Analyze Results
  let totalT = 0;
  let maxT = -999;
  let minT = 999;
  let totalSolarGain = 0;
  let totalHeatLoss = 0;

  for (const data of finalHourlyData) {
    totalT += data.indoorTemp;
    if (data.indoorTemp > maxT) maxT = data.indoorTemp;
    if (data.indoorTemp < minT) minT = data.indoorTemp;
    
    totalSolarGain += data.solarGain;
    totalHeatLoss += (data.wallLoss + data.roofLoss + data.windowLoss + data.ventilationLoss);
  }

  const avgT = totalT / 24;
  
  // Comfort heuristic (Ideal is 21C)
  // Distance from 21C
  const comfortDist = Math.abs(avgT - 21);
  let comfortScore = 100 - (comfortDist * 5);
  if (comfortScore < 0) comfortScore = 0;

  let comfortLabel: 'Comfortable' | 'Needs Improvement' | 'Very Cold' | 'Very Warm' = 'Comfortable';
  if (avgT < 15) comfortLabel = 'Very Cold';
  else if (avgT > 27) comfortLabel = 'Very Warm';
  else if (comfortScore < 70) comfortLabel = 'Needs Improvement';

  return {
    hourly: finalHourlyData,
    comfortScore,
    comfortLabel,
    maxTemp: Math.round(maxT),
    minTemp: Math.round(minT),
    avgTemp: Math.round(avgT * 10) / 10,
    totalSolarGain: Math.round(totalSolarGain),
    totalHeatLoss: Math.abs(Math.round(totalHeatLoss)),
    estimatedWeight: Math.round(estimatedWeight)
  };
}
