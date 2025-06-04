'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SlotCanvas from './SlotCanvas'
import GameUI from './GameUI'
import { useGameStore } from '@/store/gameStore'

const SlotMachine = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { balance, isSpinning, spin } = useGameStore()

  useEffect(() => {
    // Initialize the slot machine with a smooth fade-in
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      )
      setIsLoaded(true)
    }
  }, [])

  const handleSpin = () => {
    if (!isSpinning && balance >= 10) {
      spin()
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto"
      style={{ opacity: 0 }} // Initial state for GSAP animation
    >
      {/* Slot Machine Container */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
        
        {/* Display Screen */}
        <div className="bg-black rounded-lg p-4 mb-6 border-2 border-yellow-400 shadow-inner">
          {/* Canvas Container - Responsive */}
          <div className="relative w-full aspect-[4/3] bg-gray-900 rounded border border-gray-600 overflow-hidden">
            {isLoaded && <SlotCanvas />}
          </div>
        </div>

        {/* Game Controls */}
        <GameUI onSpin={handleSpin} />
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl -z-10"></div>
    </div>
  )
}

export default SlotMachine 