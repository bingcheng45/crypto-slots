'use client'

import { createContext, useContext, useState } from 'react'
import SlotMachine from '@/components/SlotMachine'

// Context for background effects
const BackgroundContext = createContext<{
  backgroundEffect: string | null
  setBackgroundEffect: (effect: string | null) => void
}>({
  backgroundEffect: null,
  setBackgroundEffect: () => {}
})

export const useBackgroundEffect = () => useContext(BackgroundContext)

export default function Home() {
  const [backgroundEffect, setBackgroundEffect] = useState<string | null>(null)
  
  return (
    <BackgroundContext.Provider value={{ backgroundEffect, setBackgroundEffect }}>
      <main className="min-h-screen p-8 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
        {/* Dynamic Background Layer */}
        <div id="background-effects" className="fixed inset-0 z-0" />
        
        {/* Main Content */}
        <div className="relative z-10">
          <SlotMachine />
        </div>
      </main>
    </BackgroundContext.Provider>
  )
}
