import React from 'react';
import { Layers, ArrowDown } from 'lucide-react';

interface StructureToggleProps {
  showStructure: boolean;
  setShowStructure: (show: boolean) => void;
}

export function StructureToggle({ showStructure, setShowStructure }: StructureToggleProps) {
  return (
    <div className="structure-toggle relative md:absolute md:bottom-6 md:right-6 z-10 flex flex-col items-center md:items-end w-full md:w-auto gap-2">
      <button
        onClick={() => setShowStructure(!showStructure)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '9999px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#333'
        }}
      >
        <Layers size={16} color="#3b82f6" />
        {showStructure ? 'Show Finished' : 'Show Structure'}
      </button>

      {showStructure && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#555',
          minWidth: '140px'
        }}>
          <div style={{ color: '#888', fontWeight: 600, letterSpacing: '0.05em' }}>OUTSIDE</div>
          <ArrowDown size={14} color="#aaa" />
          <div style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', width: '100%', textAlign: 'center' }}>Exterior layer</div>
          <ArrowDown size={14} color="#aaa" />
          <div style={{ backgroundColor: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', width: '100%', textAlign: 'center', color: '#0369a1' }}>Insulation</div>
          <ArrowDown size={14} color="#aaa" />
          <div style={{ backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', width: '100%', textAlign: 'center' }}>Interior layer</div>
          <ArrowDown size={14} color="#aaa" />
          <div style={{ color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>INDOOR AIR</div>
        </div>
      )}
    </div>
  );
}
