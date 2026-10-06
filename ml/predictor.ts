import type { ShelterDesign } from '@app-types';
import type { ClimateData } from '@data/climates';
import { simulateThermalPerformance, type ThermalSimulationResult } from '@thermal/thermal';

export interface ThermalPredictor {
  predict(design: ShelterDesign, climate: ClimateData): ThermalSimulationResult;
}

export class PhysicsPredictor implements ThermalPredictor {
  predict(design: ShelterDesign, climate: ClimateData): ThermalSimulationResult {
    return simulateThermalPerformance(design, climate);
  }
}

// In the future, we can add:
// export class MLPredictor implements ThermalPredictor { ... }
