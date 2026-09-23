import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { ShelterDesign, SavedDesign } from '../types';
import { defaultShelterDesign } from '../types';

interface ShelterContextType {
  design: ShelterDesign;
  updateDesign: (updates: Partial<ShelterDesign>) => void;
  resetDesign: () => void;
  myDesigns: SavedDesign[];
  saveDesign: (recommendationExplanation?: string) => void;
}

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);

export function ShelterProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<ShelterDesign>(() => {
    const saved = localStorage.getItem('citadel_current_design');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultShelterDesign;
  });
  
  const [myDesigns, setMyDesigns] = useState<SavedDesign[]>(() => {
    const saved = localStorage.getItem('citadel_my_designs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('citadel_current_design', JSON.stringify(design));
  }, [design]);

  React.useEffect(() => {
    localStorage.setItem('citadel_my_designs', JSON.stringify(myDesigns));
  }, [myDesigns]);

  const updateDesign = (updates: Partial<ShelterDesign>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  };

  const resetDesign = () => {
    setDesign(defaultShelterDesign);
  };

  const saveDesign = (recommendationExplanation?: string) => {
    const newDesign: SavedDesign = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${design.shape} in ${design.climateProfile}`,
      date: new Date().toLocaleDateString(),
      design: { ...design },
      recommendationExplanation
    };
    setMyDesigns(prev => [...prev, newDesign]);
  };

  return (
    <ShelterContext.Provider value={{ design, updateDesign, resetDesign, myDesigns, saveDesign }}>
      {children}
    </ShelterContext.Provider>
  );
}

export function useShelter() {
  const context = useContext(ShelterContext);
  if (context === undefined) {
    throw new Error('useShelter must be used within a ShelterProvider');
  }
  return context;
}
