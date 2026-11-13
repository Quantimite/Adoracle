'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewMode } from '@/types';

interface ModeContextType {
  mode: ViewMode;
  toggleMode: () => void;
  setMode: (mode: ViewMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ViewMode>('plain');

  useEffect(() => {
    const saved = localStorage.getItem('adoracle_view_mode') as ViewMode | null;
    if (saved === 'plain' || saved === 'expert') {
      setModeState(saved);
    }
  }, []);

  const setMode = (newMode: ViewMode) => {
    setModeState(newMode);
    localStorage.setItem('adoracle_view_mode', newMode);
  };

  const toggleMode = () => {
    const next = mode === 'plain' ? 'expert' : 'plain';
    setMode(next);
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

