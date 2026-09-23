import type { ShelterDesign } from '../types';
import type { ClimateData } from '../data/climates';
import { PhysicsPredictor } from './predictor';

export interface OptimizationChange {
  feature: string;
  from: string | number;
  to: string | number;
  reason: string;
}

export interface CandidateResult {
  id: string;
  name: string;
  design: ShelterDesign;
  changes: OptimizationChange[];
  comfortScore: number;
  solarGain: number;
  heatLoss: number;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
}

export interface OptimizationResult {
  candidates: CandidateResult[];
  originalScore: number;
  originalAvgTemp: number;
  originalSolarGain: number;
  originalHeatLoss: number;
}

export function optimizeDesign(baseDesign: ShelterDesign, climate: ClimateData): OptimizationResult {
  const predictor = new PhysicsPredictor();
  const baseResult = predictor.predict(baseDesign, climate);
  const locked = baseDesign.lockedFields || [];

  const isLocked = (field: keyof ShelterDesign) => locked.includes(field);

  const candidates: CandidateResult[] = [];

  // Helper to evaluate and add a candidate
  const evaluateCandidate = (name: string, newDesign: ShelterDesign, changes: OptimizationChange[]) => {
    if (changes.length === 0) return; // No changes made
    
    const result = predictor.predict(newDesign, climate);
    
    // Only accept if it actually improves comfort score or is a valid alternative
    if (result.comfortScore > baseResult.comfortScore + 1) {
      candidates.push({
        id: Math.random().toString(36).substr(2, 9),
        name,
        design: newDesign,
        changes,
        comfortScore: result.comfortScore,
        solarGain: result.totalSolarGain,
        heatLoss: result.totalHeatLoss,
        avgTemp: result.avgTemp,
        minTemp: result.minTemp,
        maxTemp: result.maxTemp
      });
    }
  };

  // Strategy 1: Thermal Mass & Insulation (Winter/Cold focus)
  if (climate.avgWinterTemp < 10) {
    const s1Design = { ...baseDesign };
    const s1Changes: OptimizationChange[] = [];
    
    if (!isLocked('insulationThickness') && baseDesign.insulationThickness < 20) {
      s1Design.insulationThickness = 20;
      s1Changes.push({ feature: 'Insulation', from: `${baseDesign.insulationThickness} cm`, to: '20 cm', reason: 'Significantly reduces conductive heat loss in cold climates.' });
    }
    if (!isLocked('thermalMassLevel') && baseDesign.thermalMassLevel !== 'High') {
      s1Design.thermalMassLevel = 'High';
      s1Changes.push({ feature: 'Thermal Mass', from: baseDesign.thermalMassLevel, to: 'High', reason: 'Stores daytime heat to keep the shelter warm at night.' });
    }
    if (!isLocked('windowSize') && baseDesign.windowSize !== 'Small' && baseDesign.windowCount > 2) {
      s1Design.windowSize = 'Small';
      s1Changes.push({ feature: 'Window Size', from: baseDesign.windowSize, to: 'Small', reason: 'Minimizes heat loss through glass.' });
    }
    evaluateCandidate('Maximum Heat Retention', s1Design, s1Changes);
  }

  // Strategy 2: Solar Harvesting (Winter/Cold focus)
  if (climate.avgWinterTemp < 15) {
    const s2Design = { ...baseDesign };
    const s2Changes: OptimizationChange[] = [];
    
    if (!isLocked('windowOrientation') && baseDesign.windowOrientation !== 'South') {
      s2Design.windowOrientation = 'South';
      s2Changes.push({ feature: 'Window Orientation', from: baseDesign.windowOrientation, to: 'South', reason: 'Maximizes solar gain during the day.' });
    }
    if (!isLocked('windowSize') && baseDesign.windowSize !== 'Large') {
      s2Design.windowSize = 'Large';
      s2Changes.push({ feature: 'Window Size', from: baseDesign.windowSize, to: 'Large', reason: 'Increases solar radiation entering the shelter.' });
    }
    evaluateCandidate('Solar Harvester', s2Design, s2Changes);
  }

  // Strategy 3: Maximum Cooling (Summer/Hot focus)
  if (climate.avgSummerTemp > 25) {
    const s3Design = { ...baseDesign };
    const s3Changes: OptimizationChange[] = [];
    
    if (!isLocked('ventilationLevel') && baseDesign.ventilationLevel !== 'High') {
      s3Design.ventilationLevel = 'High';
      s3Changes.push({ feature: 'Ventilation', from: baseDesign.ventilationLevel, to: 'High', reason: 'Rapidly exhausts hot indoor air.' });
    }
    if (!isLocked('windowSize') && baseDesign.windowSize !== 'Small') {
      s3Design.windowSize = 'Small';
      s3Changes.push({ feature: 'Window Size', from: baseDesign.windowSize, to: 'Small', reason: 'Reduces unwanted solar heat gain.' });
    }
    if (!isLocked('insulationThickness') && baseDesign.insulationThickness < 10) {
      s3Design.insulationThickness = 10;
      s3Changes.push({ feature: 'Insulation', from: `${baseDesign.insulationThickness} cm`, to: '10 cm', reason: 'Blocks outdoor heat from penetrating the walls.' });
    }
    evaluateCandidate('Maximum Cooling', s3Design, s3Changes);
  }

  // Strategy 4: Shape Efficiency (All climates)
  if (!isLocked('shape') && baseDesign.shape !== 'Dome') {
    const s4Design = { ...baseDesign };
    const s4Changes: OptimizationChange[] = [];
    s4Design.shape = 'Dome';
    s4Changes.push({ feature: 'Shape', from: baseDesign.shape, to: 'Dome', reason: 'Minimizes surface area to volume ratio, improving overall efficiency.' });
    
    if (!isLocked('insulationThickness') && baseDesign.insulationThickness < 15) {
      s4Design.insulationThickness = 15;
      s4Changes.push({ feature: 'Insulation', from: `${baseDesign.insulationThickness} cm`, to: '15 cm', reason: 'Provides a strong thermal envelope.' });
    }
    evaluateCandidate('Structural Efficiency', s4Design, s4Changes);
  }

  // Sort candidates by highest comfort score
  candidates.sort((a, b) => b.comfortScore - a.comfortScore);
  
  // Deduplicate by name and limit to top 3
  const uniqueCandidates: CandidateResult[] = [];
  const seenNames = new Set<string>();
  
  for (const c of candidates) {
    if (!seenNames.has(c.name)) {
      uniqueCandidates.push(c);
      seenNames.add(c.name);
    }
    if (uniqueCandidates.length >= 3) break;
  }

  return {
    candidates: uniqueCandidates,
    originalScore: baseResult.comfortScore,
    originalAvgTemp: baseResult.avgTemp,
    originalSolarGain: baseResult.totalSolarGain,
    originalHeatLoss: baseResult.totalHeatLoss
  };
}

