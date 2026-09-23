export interface ShelterDesign {
  // Location & Climate
  location: string;
  latitude: number;
  longitude: number;
  heading: number; // 0-360
  climateProfile: string;

  // Occupants
  occupants: number;
  activityLevel: 'Resting' | 'Light' | 'Active';
  occupancyDuration: 'Hours' | 'Days' | 'Weeks' | 'Months';
  usage: string;

  // Form & Architecture
  shape: 'A-Frame' | 'Dome' | 'Box' | 'Gable Roof';
  width: number; // meters
  length: number; // meters
  height: number; // meters
  roofType: string;

  // Materials & Insulation
  wallMaterial: string;
  roofMaterial: string;
  floorMaterial: string;
  insulationMaterial: string;
  insulationThickness: number; // cm

  // Openings & Ventilation
  windowCount: number;
  windowSize: 'Small' | 'Medium' | 'Large';
  windowOrientation: 'North' | 'South' | 'East' | 'West' | 'Balanced';
  doorCount: number;
  ventilationLevel: 'Low' | 'Medium' | 'High';

  // Structure
  thermalMassLevel: 'Low' | 'Medium' | 'High';
  foundationType: string;
  hasStructuralFrame: boolean;
  frameType: 'Timber' | 'Steel' | 'Lightweight';
  openingConfiguration: string;

  // Environmental context for analysis
  selectedSeason: 'Winter' | 'Summer' | 'Shoulder';
  timeOfDay: number; // 6 to 18
  selectedHour: number; // 0-23
  orientation: string; // User's simple orientation choice

  // Optimization
  priorities: string[];
  lockedFields: (keyof ShelterDesign)[];
}

export const defaultShelterDesign: ShelterDesign = {
  location: 'Unknown',
  latitude: 0,
  longitude: 0,
  heading: 180, // South
  climateProfile: 'Temperate',
  occupants: 1,
  activityLevel: 'Light',
  occupancyDuration: 'Days',
  usage: 'Temporary',
  shape: 'A-Frame',
  width: 4,
  length: 5,
  height: 3,
  roofType: 'Pitched',
  wallMaterial: 'Wood',
  roofMaterial: 'Metal',
  floorMaterial: 'Wood',
  insulationMaterial: 'Foam',
  insulationThickness: 10,
  windowCount: 2,
  windowSize: 'Medium',
  windowOrientation: 'Balanced',
  doorCount: 1,
  ventilationLevel: 'Medium',
  thermalMassLevel: 'Low',
  foundationType: 'Ground',
  hasStructuralFrame: true,
  frameType: 'Timber',
  openingConfiguration: 'Standard',
  selectedSeason: 'Winter',
  timeOfDay: 12,
  selectedHour: 12,
  orientation: 'South',
  priorities: [],
  lockedFields: []
};

export interface SavedDesign {
  id: string;
  name: string;
  date: string;
  design: ShelterDesign;
  recommendationExplanation?: string;
}
