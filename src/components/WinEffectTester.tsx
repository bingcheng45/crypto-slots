'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface WinEffectTesterProps {
  isVisible: boolean
  onClose: () => void
}

const WinEffectTester = ({ isVisible, onClose }: WinEffectTesterProps) => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [backgroundContainer, setBackgroundContainer] = useState<HTMLElement | null>(null)

  // Get background container on mount
  useEffect(() => {
    const container = document.getElementById('background-effects')
    setBackgroundContainer(container)
  }, [])

  // Random color generators
  const getRandomColors = () => {
    const colors = [
      ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      ['#96CEB4', '#FFEAA7', '#DDA0DD'],
      ['#74B9FF', '#FD79A8', '#FDCB6E'],
      ['#6C5CE7', '#A29BFE', '#FD79A8'],
      ['#00B894', '#00CEC9', '#74B9FF'],
      ['#E84393', '#FD79A8', '#FDCB6E'],
      ['#FF7675', '#74B9FF', '#55A3FF']
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const triggerEffect = (effectName: string) => {
    setActiveEffect(effectName)
    setAnimationKey(prev => prev + 1)
    
    // Auto-stop effect after duration
    setTimeout(() => {
      setActiveEffect(null)
    }, effectName === 'ripple' ? 4000 : 3000)
  }

  // Canvas Ripple Effect
  useEffect(() => {
    if (activeEffect === 'ripple' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const colors = getRandomColors()
      let frame = 0
      const waves: Array<{x: number, y: number, radius: number, maxRadius: number, alpha: number, color: string}> = []
      
      // Create multiple waves
      for (let i = 0; i < 5; i++) {
        waves.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          radius: 0,
          maxRadius: Math.max(canvas.width, canvas.height) * 0.8,
          alpha: 0.6 - i * 0.1,
          color: colors[i % colors.length]
        })
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        waves.forEach((wave, index) => {
          wave.radius += 8 + index * 2
          wave.alpha = Math.max(0, 0.6 - (wave.radius / wave.maxRadius) * 0.6)
          
          if (wave.radius < wave.maxRadius) {
            const gradient = ctx.createRadialGradient(wave.x, wave.y, 0, wave.x, wave.y, wave.radius)
            gradient.addColorStop(0, `${wave.color}00`)
            gradient.addColorStop(0.7, `${wave.color}${Math.floor(wave.alpha * 255).toString(16).padStart(2, '0')}`)
            gradient.addColorStop(1, `${wave.color}00`)
            
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
            ctx.fill()
          }
        })
        
        frame++
        if (frame < 240 && activeEffect === 'ripple') { // 4 seconds at 60fps
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }
  }, [activeEffect, animationKey])

  // Spiral animation for vortex effect
  const spiralVariants = {
    initial: { scale: 0, rotate: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.5, 1],
      rotate: [0, 360, 720],
      opacity: [0, 0.8, 0],
      transition: { duration: 3, ease: "easeOut" }
    }
  }

  const colors = getRandomColors()

  // Background effects to be rendered in the page background
  const backgroundEffects = activeEffect && (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Effect 1: Animated Gradient Sweep */}
      {activeEffect === 'gradient-sweep' && (
        <motion.div
          key={`gradient-sweep-${animationKey}`}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
            width: '120%', // Make it wider to account for skew
            height: '120%', // Make it taller to account for skew
            top: '-10%',    // Offset to center the larger element
            left: '-10%'    // Offset to center the larger element
          }}
          initial={{ x: '-120%', skewX: -15 }} // Start completely off-screen left
          animate={{ x: '120%', skewX: 15 }}   // End completely off-screen right
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      )}

      {/* Effect 2: Ripple Wave (Canvas) */}
      {activeEffect === 'ripple' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'rgba(0,0,0,0.1)' }}
        />
      )}

      {/* Effect 3: Spiral Vortex */}
      {activeEffect === 'spiral-vortex' && (
        <div className="absolute inset-0">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={`spiral-${animationKey}-${index}`}
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from ${index * 120}deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
                mixBlendMode: 'screen'
              }}
              variants={spiralVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.2 }}
            />
          ))}
        </div>
      )}

      {/* Effect 4: Aurora/Northern Lights */}
      {activeEffect === 'aurora' && (
        <div className="absolute inset-0">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={`aurora-${animationKey}-${index}`}
              className="absolute w-full h-full"
              style={{
                background: `radial-gradient(ellipse at ${20 + index * 20}% ${30 + index * 15}%, ${colors[index % colors.length]}40, transparent)`,
                filter: 'blur(20px)'
              }}
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -50, 100, 0],
                scale: [1, 1.2, 0.8, 1],
                opacity: [0, 0.7, 0.5, 0]
              }}
              transition={{
                duration: 3,
                delay: index * 0.3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Effect 5: Prismatic Color Explosion */}
      {activeEffect === 'prismatic' && (
        <div className="absolute inset-0">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={`prismatic-${animationKey}-${index}`}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${colors[index % colors.length]}, transparent)`,
                mixBlendMode: index % 2 === 0 ? 'multiply' : 'screen'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 1.5, 0],
                opacity: [0, 0.8, 0.6, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                delay: index * 0.1,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Render background effects to page background using portal */}
      {backgroundContainer && backgroundEffects && createPortal(backgroundEffects, backgroundContainer)}
      
      {/* Tester Panel Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">🎨 Win Background Effects Tester</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => triggerEffect('gradient-sweep')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                  disabled={activeEffect !== null}
                >
                  🌈 Gradient Sweep
                </button>

                <button
                  onClick={() => triggerEffect('ripple')}
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                  disabled={activeEffect !== null}
                >
                  🌊 Ripple Waves
                </button>

                <button
                  onClick={() => triggerEffect('spiral-vortex')}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  🌀 Spiral Vortex
                </button>

                <button
                  onClick={() => triggerEffect('aurora')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                  disabled={activeEffect !== null}
                >
                  🌌 Aurora Lights
                </button>

                <button
                  onClick={() => triggerEffect('prismatic')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 md:col-span-2"
                  disabled={activeEffect !== null}
                >
                  💎 Prismatic Explosion
                </button>
              </div>

              {activeEffect && (
                <div className="mt-4 text-center">
                  <div className="text-yellow-400 text-sm">
                    🎭 Currently playing: <strong>{activeEffect.replace('-', ' ').toUpperCase()}</strong>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Effect will auto-stop in {activeEffect === 'ripple' ? '4' : '3'} seconds
                  </div>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-400 text-center">
                Each effect uses random colors and will play automatically.<br/>
                Click any button to test the effect! 🚀
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default WinEffectTester 