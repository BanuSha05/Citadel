export interface MaterialData {
  id: string;
  name: string;
  category: 'wall' | 'roof' | 'floor' | 'insulation';
  description: string;
  thermalResistance: number; // R-value approx
  weight: 'Light' | 'Medium' | 'Heavy';
}

export const MATERIALS: MaterialData[] = [
  // Walls
  {
    id: 'local_stone',
    name: 'Local Stone',
    category: 'wall',
    description: 'High thermal mass, excellent for stabilizing temperatures.',
    thermalResistance: 1.5,
    weight: 'Heavy'
  },
  {
    id: 'insulated_panels',
    name: 'Insulated Panels',
    category: 'wall',
    description: 'Lightweight with extremely high insulation properties.',
    thermalResistance: 6.0,
    weight: 'Light'
  },
  {
    id: 'wood_planks',
    name: 'Wood',
    category: 'wall',
    description: 'Natural material with moderate insulation and weight.',
    thermalResistance: 2.5,
    weight: 'Medium'
  },
  
  // Roofs
  {
    id: 'metal_sheet',
    name: 'Corrugated Metal',
    category: 'roof',
    description: 'Durable and sheds snow easily, but poor insulation.',
    thermalResistance: 0.5,
    weight: 'Medium'
  },
  {
    id: 'canvas',
    name: 'Heavy Canvas',
    category: 'roof',
    description: 'Extremely lightweight and portable.',
    thermalResistance: 1.0,
    weight: 'Light'
  },

  // Insulation
  {
    id: 'foam_board',
    name: 'Rigid Foam',
    category: 'insulation',
    description: 'Standard modern insulation with high performance.',
    thermalResistance: 5.0,
    weight: 'Light'
  },
  {
    id: 'wool',
    name: 'Natural Wool',
    category: 'insulation',
    description: 'Breathable natural insulation.',
    thermalResistance: 3.5,
    weight: 'Light'
  }
];
