'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Context for background effects
const BackgroundContext = createContext<{
  backgroundEffect: string | null
  setBackgroundEffect: (effect: string | null) => void
}>({
  backgroundEffect: null,
  setBackgroundEffect: () => {}
})

export const useBackgroundEffect = () => useContext(BackgroundContext)

interface BackgroundProviderProps {
  children: ReactNode
}

export const BackgroundProvider = ({ children }: BackgroundProviderProps) => {
  const [backgroundEffect, setBackgroundEffect] = useState<string | null>(null)
  
  return (
    <BackgroundContext.Provider value={{ backgroundEffect, setBackgroundEffect }}>
      {children}
    </BackgroundContext.Provider>
  )
} 