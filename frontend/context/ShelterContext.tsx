import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { ShelterDesign, SavedDesign } from '../types';
import { defaultShelterDesign } from '../types';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

interface ShelterContextType {
  design: ShelterDesign;
  currentDesignId: string | null;
  updateDesign: (updates: Partial<ShelterDesign>) => void;
  resetDesign: () => void;
  myDesigns: SavedDesign[];
  saveDesign: (recommendationExplanation?: string, specificDesign?: ShelterDesign, reportFilename?: string) => void;
  loadDesign: (saved: SavedDesign) => void;
  deleteDesign: (id: string) => void;
  reloadPersistentData: () => Promise<void>;
}

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);
const STORAGE_FILE = 'citadel_persistent_storage.json';

export function ShelterProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [design, setDesign] = useState<ShelterDesign>(() => {
    const saved = localStorage.getItem('citadel_current_design');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultShelterDesign;
  });
  
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(() => {
    return localStorage.getItem('citadel_current_design_id') || null;
  });

  const [myDesigns, setMyDesigns] = useState<SavedDesign[]>(() => {
    const saved = localStorage.getItem('citadel_my_designs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  useEffect(() => {
    const loadPersistentData = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const result = await Filesystem.readFile({
            path: STORAGE_FILE,
            directory: Directory.Data,
            encoding: Encoding.UTF8
          });
          const data = JSON.parse(result.data as string);
          if (data.design) setDesign(data.design);
          if (data.currentDesignId !== undefined) setCurrentDesignId(data.currentDesignId);
          if (data.myDesigns) setMyDesigns(data.myDesigns);
          console.log(`Loaded ${data.myDesigns?.length || 0} saved designs from filesystem`);
        }
      } catch (e) {
        console.log('No existing native persistent storage found or error reading', e);
      }
      setIsLoaded(true);
    };
    loadPersistentData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Always sync web localStorage
    localStorage.setItem('citadel_current_design', JSON.stringify(design));
    localStorage.setItem('citadel_my_designs', JSON.stringify(myDesigns));
    if (currentDesignId) {
      localStorage.setItem('citadel_current_design_id', currentDesignId);
    } else {
      localStorage.removeItem('citadel_current_design_id');
    }

    // Persist reliably on Android via Filesystem
    if (Capacitor.isNativePlatform()) {
      const dataToSave = { design, currentDesignId, myDesigns };
      Filesystem.writeFile({
        path: STORAGE_FILE,
        data: JSON.stringify(dataToSave),
        directory: Directory.Data,
        encoding: Encoding.UTF8
      }).then(() => {
        console.log(`Design inserted successfully. Saved ${myDesigns.length} records.`);
      }).catch(e => {
        console.error("Database save exception:", e);
      });
    }
  }, [design, currentDesignId, myDesigns, isLoaded]);

  const updateDesign = (updates: Partial<ShelterDesign>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  };

  const reloadPersistentData = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Filesystem.readFile({
          path: STORAGE_FILE,
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
        if (result.data) {
          const data = JSON.parse(result.data as string);
          if (data.myDesigns) {
            console.log(`Loaded ${data.myDesigns.length} designs from database`);
            setMyDesigns(data.myDesigns);
          }
          if (data.design) setDesign(data.design);
          if (data.currentDesignId) setCurrentDesignId(data.currentDesignId);
        }
      } catch (e) {
        console.error('Error reloading native persistent storage:', e);
      }
    }
  };

  const resetDesign = () => {
    setDesign(defaultShelterDesign);
    setCurrentDesignId(null);
  };

  const loadDesign = (saved: SavedDesign) => {
    console.log(`Opening saved design: ${saved.id}`);
    setDesign(saved.design);
    setCurrentDesignId(saved.id);
  };

  const deleteDesign = (id: string) => {
    setMyDesigns(prev => prev.filter(d => d.id !== id));
    if (currentDesignId === id) {
      setCurrentDesignId(null);
    }
  };

  const saveDesign = (recommendationExplanation?: string, specificDesign?: ShelterDesign, reportFilename?: string) => {
    const designToSave = specificDesign || design;
    const isCurrent = !specificDesign;
    let newIdToSet: string | null = null;
    
    setMyDesigns(prev => {
      if (isCurrent && currentDesignId && prev.some(d => d.id === currentDesignId)) {
        // Update existing
        const updated = prev.map(d => {
          if (d.id === currentDesignId) {
            console.log(`Saving design (update): ${d.id}`);
            return {
              ...d,
              design: { ...designToSave },
              recommendationExplanation: recommendationExplanation || d.recommendationExplanation,
              reportFilename: reportFilename || d.reportFilename,
              date: new Date().toLocaleString(),
              name: `${designToSave.shape} in ${designToSave.climateProfile}`
            };
          }
          return d;
        });
        return updated;
      } else {
        // Create new
        const newId = Math.random().toString(36).substring(2, 9);
        console.log(`Saving design (new): ${newId}`);
        const newDesign: SavedDesign = {
          id: newId,
          name: `${designToSave.shape} in ${designToSave.climateProfile}`,
          date: new Date().toLocaleString(),
          design: { ...designToSave },
          recommendationExplanation,
          reportFilename
        };
        
        if (isCurrent) {
          newIdToSet = newId;
        }
        
        return [...prev, newDesign];
      }
    });

    if (newIdToSet) {
      setCurrentDesignId(newIdToSet);
    }
  };

  if (!isLoaded && Capacitor.isNativePlatform()) {
    // Wait for native storage to load before rendering to prevent overwrite
    return <div className="flex h-screen items-center justify-center text-white">Loading database...</div>;
  }

  return (
    <ShelterContext.Provider value={{ design, currentDesignId, updateDesign, resetDesign, myDesigns, saveDesign, loadDesign, deleteDesign, reloadPersistentData }}>
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
