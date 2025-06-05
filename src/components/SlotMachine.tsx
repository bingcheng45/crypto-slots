'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SlotCanvas from './SlotCanvas'
import GameUI from './GameUI'
import WinEffectTester from './WinEffectTester'

const SlotMachine = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showTester, setShowTester] = useState(false)

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
      className="max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden contain-layout backdrop-blur-md border border-white/10"
      style={{ 
        contain: 'layout style',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Slot Display */}
      <div className="relative p-4 flex justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <div 
          className="rounded-lg overflow-hidden border w-full max-w-sm backdrop-blur-sm"
          style={{ 
            height: '128px',
            aspectRatio: '3/1',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          <SlotCanvas />
        </div>
      </div>
      
      {/* Game Controls */}
      <GameUI />
      
      {/* Tester Panel Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setShowTester(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
        >
          🎨 Test Win Background Effects
        </button>
      </div>
      
      {/* Win Effect Tester Modal */}
      <WinEffectTester 
        isVisible={showTester}
        onClose={() => setShowTester(false)}
      />
    </div>
  )
}

export default SlotMachine 