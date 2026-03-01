'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SocialIconsContextValue {
  useBrandColors: boolean;
  setUseBrandColors: (v: boolean) => void;
}

const SocialIconsContext = createContext<SocialIconsContextValue | null>(null);

export function SocialIconsProvider({ children }: { children: React.ReactNode }) {
  const [useBrandColors, setUseBrandColors] = useState(true);
  const setter = useCallback((v: boolean) => setUseBrandColors(v), []);
  return (
    <SocialIconsContext.Provider value={{ useBrandColors, setUseBrandColors: setter }}>
      {children}
    </SocialIconsContext.Provider>
  );
}

export function useSocialIcons() {
  const ctx = useContext(SocialIconsContext);
  return ctx ?? { useBrandColors: true, setUseBrandColors: () => {} };
}
