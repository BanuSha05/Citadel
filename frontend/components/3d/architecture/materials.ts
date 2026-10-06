import * as THREE from 'three';

export const getWallMaterialProps = (materialName: string) => {
  switch (materialName) {
    case 'Wood':
      return { color: '#8b5a2b', roughness: 0.9, metalness: 0.05 };
    case 'Insulated Panels':
      return { color: '#f8f9fa', roughness: 0.5, metalness: 0.2 };
    case 'Local Stone':
      return { color: '#6c757d', roughness: 0.95, metalness: 0.0 };
    case 'Composite Panels':
      return { color: '#adb5bd', roughness: 0.6, metalness: 0.3 };
    default:
      return { color: '#e9ecef', roughness: 0.8, metalness: 0.1 };
  }
};

export const getRoofMaterialProps = (materialName: string) => {
  switch (materialName) {
    case 'Metal':
      return { color: '#495057', roughness: 0.4, metalness: 0.7 };
    case 'Wood':
      return { color: '#5c4033', roughness: 0.9, metalness: 0.0 };
    case 'Composite':
      return { color: '#343a40', roughness: 0.7, metalness: 0.2 };
    default:
      return { color: '#495057', roughness: 0.6, metalness: 0.3 };
  }
};

export const getFrameMaterialProps = (frameType: string) => {
  switch (frameType) {
    case 'Steel':
      return { color: '#6c757d', roughness: 0.4, metalness: 0.8 };
    case 'Timber':
    default:
      return { color: '#a0522d', roughness: 0.85, metalness: 0.0 };
    case 'Lightweight':
      return { color: '#d3d3d3', roughness: 0.5, metalness: 0.6 };
  }
};

export const getInsulationMaterialProps = () => {
  return { color: '#fdfd96', roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.9 }; // Yellowish foam look
};

export const getGlassMaterialProps = () => {
  // Simple transparent material for glass
  return { color: '#87ceeb', roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.4 };
};
