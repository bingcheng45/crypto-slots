'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useGameStore } from '@/store/gameStore'

const WinBackgroundEffect = () => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [backgroundContainer, setBackgroundContainer] = useState<HTMLElement | null>(null)
  const { lastWin, isSpinning, winningCombination } = useGameStore()
  const prevWinRef = useRef<number>(0)
  const prevSpinningRef = useRef<boolean>(false)
  const winProcessedRef = useRef<string | null>(null)

  // Get background container on mount
  useEffect(() => {
    const container = document.getElementById('background-effects')
    setBackgroundContainer(container)
  }, [])

  // Watch for spinning state changes to detect when game finishes
  useEffect(() => {
    console.log(`🔍 Spin state: wasSpinning=${prevSpinningRef.current}, isSpinning=${isSpinning}, lastWin=${lastWin}, combination=${winningCombination}`)
    
    // Detect when spinning just stopped (transition from true to false)
    if (prevSpinningRef.current === true && isSpinning === false) {
      console.log(`🎲 Spin finished! Checking for wins...`)
      
      // Check if there's a win
      if (lastWin > 0 || winningCombination) {
        const winKey = `${winningCombination}-${lastWin}-${Date.now()}`
        
        // Only trigger if we haven't processed this exact win already
        if (winProcessedRef.current !== winKey) {
          console.log(`🎉 WIN CONFIRMED: $${lastWin} with combination: ${winningCombination}`)
          
          // Small delay to ensure all state updates are processed
          setTimeout(() => {
            const effects = ['gradient-sweep', 'ripple', 'spiral-vortex', 'aurora', 'prismatic']
            const randomEffect = effects[Math.floor(Math.random() * effects.length)]
            
            console.log(`🎨 Triggering effect: ${randomEffect}`)
            
            setActiveEffect(randomEffect)
            setAnimationKey(prev => prev + 1)
            
            // Auto-stop effect after duration
            setTimeout(() => {
              setActiveEffect(null)
            }, randomEffect === 'ripple' ? 4000 : 3000)
          }, 200)
          
          winProcessedRef.current = winKey
        } else {
          console.log(`⚠️ Win already processed: ${winKey}`)
        }
      } else {
        console.log(`💸 No win this spin`)
      }
    }
    
    // Update previous spinning state
    prevSpinningRef.current = isSpinning
  }, [isSpinning, lastWin, winningCombination])

  // Alternative: Listen for win combination changes as backup  
  const prevCombinationRef = useRef<string | null>(null)
  
  useEffect(() => {
    // Backup trigger: if we get a new winning combination and we're not spinning
    if (winningCombination && winningCombination !== prevCombinationRef.current && !isSpinning && lastWin > 0) {
      console.log(`🔄 Backup win trigger: ${winningCombination}`)
      
      // Only trigger if we haven't already triggered for this win
      if (lastWin !== prevWinRef.current) {
        console.log(`🎊 Backup triggering effect for win: $${lastWin}`)
        
        const effects = ['gradient-sweep', 'ripple', 'spiral-vortex', 'aurora', 'prismatic']
        const randomEffect = effects[Math.floor(Math.random() * effects.length)]
        
        setActiveEffect(randomEffect)
        setAnimationKey(prev => prev + 1)
        
        setTimeout(() => {
          setActiveEffect(null)
        }, randomEffect === 'ripple' ? 4000 : 3000)
        
        prevWinRef.current = lastWin
      }
      
      prevCombinationRef.current = winningCombination
    }
  }, [winningCombination, isSpinning, lastWin])

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
            width: '120%',
            height: '120%',
            top: '-10%',
            left: '-10%'
          }}
          initial={{ x: '-120%', skewX: -15 }}
          animate={{ x: '120%', skewX: 15 }}
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

  // Only render if there's an active effect and background container exists
  if (!activeEffect || !backgroundContainer) return null

  return createPortal(backgroundEffects, backgroundContainer)
}

export default WinBackgroundEffect 