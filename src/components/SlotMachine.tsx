'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import SlotCanvas from './SlotCanvas'
import GameUI from './GameUI'

const SlotMachine = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Entrance animation
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { 
          opacity: 0, 
          scale: 0.9,
          y: 50
        },
        { 
          opacity: 1, 
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.7)"
        }
      )
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Slot Display */}
      <div className="relative bg-gray-700 p-4">
        <div className="aspect-[3/1] bg-black rounded-lg overflow-hidden border-2 border-gray-600">
          <SlotCanvas />
        </div>
      </div>
      
      {/* Game Controls */}
      <GameUI />
    </div>
  )
}

export default SlotMachine 