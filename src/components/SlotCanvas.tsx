'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

const SlotCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTimeRef = useRef<number>(0)
  const reelStatesRef = useRef<{
    position: number
    velocity: number
    isDecelerating: boolean
    targetPosition: number
    hasReachedTarget: boolean
    decelerationStartTime?: number
    decelerationEndTime?: number
    initialDecelerationPosition?: number
    requiredDeceleration?: number
  }[]>([
    { position: 0, velocity: 0, isDecelerating: false, targetPosition: 0, hasReachedTarget: true },
    { position: 0, velocity: 0, isDecelerating: false, targetPosition: 0, hasReachedTarget: true },
    { position: 0, velocity: 0, isDecelerating: false, targetPosition: 0, hasReachedTarget: true }
  ])

  const { displayReels, animationState } = useGameStore()
  const spinStartTimeRef = useRef<number>(0)

  // Animation physics constants
  const PHYSICS = {
    MAX_SPIN_VELOCITY: 40,     // Maximum spinning speed
    MIN_SPIN_VELOCITY: 25,     // Minimum spinning speed  
    ACCELERATION: 120,         // How fast reels accelerate
    SYMBOL_HEIGHT_RATIO: 0.3,  // Height of each symbol relative to reel height
    // Precise timing for reel stops (in milliseconds from spin start)
    REEL_STOP_TIMES: [1800, 3000, 4200]
  }

  // Helper function to calculate precise deceleration for exact timing
  const calculatePreciseDeceleration = (
    currentPosition: number,
    targetPosition: number, 
    currentVelocity: number,
    timeRemaining: number
  ) => {
    if (timeRemaining <= 0) return { requiredVelocity: 0, requiredDeceleration: currentVelocity * 100 }

    // Calculate distance to travel (with wraparound)
    let distance = targetPosition - currentPosition
    if (distance < 0) distance += 32 // DISPLAY_REEL_SIZE is 32

    // Ensure minimum distance for smooth animation
    if (distance < 8) distance += 32

    // For smooth stop with physics: distance = v₀·t - ½·a·t²
    // With final velocity = 0: v₀ = a·t
    // Substituting: distance = a·t² - ½·a·t² = ½·a·t²
    // So: a = 2·distance / t²
    // And: v₀ = a·t = 2·distance / t
    
    const timeInSeconds = timeRemaining / 1000
    const requiredInitialVelocity = (2 * distance) / timeInSeconds
    const requiredDeceleration = requiredInitialVelocity / timeInSeconds
    
    return {
      requiredVelocity: Math.max(requiredInitialVelocity, 5), // Minimum speed for visual smoothness
      requiredDeceleration: requiredDeceleration
    }
  }

  // Symbol display mapping with enhanced visual effects
  const getSymbolDisplay = (symbol: string) => {
    switch(symbol) {
      case '1C': return { text: '1', color: '#22C55E', shadow: '#15803D', glow: '#86EFAC' }  // Enhanced Green
      case '2C': return { text: '2', color: '#3B82F6', shadow: '#1E40AF', glow: '#93C5FD' }  // Enhanced Blue
      case '3C': return { text: '3', color: '#EF4444', shadow: '#DC2626', glow: '#FCA5A5' }  // Enhanced Red
      case 'BG': return { text: '7', color: '#F59E0B', shadow: '#D97706', glow: '#FDE68A' }  // Enhanced Gold
      case '--': return { text: '■', color: '#6B7280', shadow: '#374151', glow: '#9CA3AF' }  // Enhanced Gray
      default: return { text: symbol, color: '#1F2937', shadow: '#111827', glow: '#6B7280' }
    }
  }

  const initializeReelStates = () => {
    for (let i = 0; i < 3; i++) {
      const currentState = reelStatesRef.current[i]
      const shouldBeSpinning = animationState.isReelSpinning[i]
      
      if (shouldBeSpinning && currentState.hasReachedTarget) {
        // Start spinning this reel and record spin start time
        console.log(`🎰 Starting reel ${i + 1} spin`)
        if (spinStartTimeRef.current === 0) {
          spinStartTimeRef.current = Date.now()
        }
        reelStatesRef.current[i] = {
          position: currentState.position,
          velocity: PHYSICS.MIN_SPIN_VELOCITY,
          isDecelerating: false,
          targetPosition: animationState.targetPositions[i],
          hasReachedTarget: false
        }
      } else if (!shouldBeSpinning && !currentState.hasReachedTarget && !currentState.isDecelerating) {
        // Start deceleration for this reel
        console.log(`🛑 Starting reel ${i + 1} deceleration to position ${animationState.targetPositions[i]}`)
        reelStatesRef.current[i] = {
          ...currentState,
          isDecelerating: true,
          targetPosition: animationState.targetPositions[i]
        }
      }
    }
  }

    const updateReelPhysics = (deltaTime: number) => {
    const dt = deltaTime / 1000 // Convert to seconds
    const currentTime = Date.now()
    const spinStartTime = spinStartTimeRef.current
    const elapsedTime = currentTime - spinStartTime
    
    for (let i = 0; i < 3; i++) {
      const state = reelStatesRef.current[i]
      
      if (state.hasReachedTarget) continue

      // Check if this reel should start decelerating based on precise timing
      const shouldStartDeceleration = elapsedTime >= PHYSICS.REEL_STOP_TIMES[i] - 200 // Start 200ms before stop time
      
      if (!state.isDecelerating && !shouldStartDeceleration) {
        // Acceleration/spinning phase - ramp up to max speed
        state.velocity = Math.min(state.velocity + PHYSICS.ACCELERATION * dt, PHYSICS.MAX_SPIN_VELOCITY)
      } else if (!state.isDecelerating && shouldStartDeceleration) {
        // Start precision deceleration
        console.log(`🎯 Reel ${i + 1} starting precision deceleration at ${elapsedTime}ms`)
        
        state.isDecelerating = true
        state.decelerationStartTime = currentTime
        state.decelerationEndTime = spinStartTime + PHYSICS.REEL_STOP_TIMES[i]
        state.initialDecelerationPosition = state.position
        
        // Calculate exact deceleration needed
        const timeRemaining = state.decelerationEndTime - currentTime
        const precision = calculatePreciseDeceleration(
          state.position,
          state.targetPosition,
          state.velocity,
          timeRemaining
        )
        
        state.velocity = precision.requiredVelocity
        state.requiredDeceleration = precision.requiredDeceleration
        
        console.log(`🔥 Reel ${i + 1}: velocity=${state.velocity.toFixed(1)}, decel=${state.requiredDeceleration.toFixed(1)}, time=${timeRemaining}ms`)
      } else if (state.isDecelerating) {
        // Precision deceleration phase
        const timeRemaining = Math.max(0, (state.decelerationEndTime ?? 0) - currentTime)
        
        if (timeRemaining <= 0) {
          // Time's up - snap to exact target
          console.log(`✅ Reel ${i + 1} reached target at exact time ${elapsedTime}ms`)
          state.position = state.targetPosition
          state.velocity = 0
          state.hasReachedTarget = true
        } else {
          // Apply calculated deceleration for smooth timing
          state.velocity = Math.max(0, state.velocity - (state.requiredDeceleration || 0) * dt)
        }
      }

      // Update position based on velocity
      state.position += state.velocity * dt
      
      // Wrap position to prevent overflow
      if (displayReels[i]) {
        const reelLength = displayReels[i].length
        state.position = state.position % reelLength
      }
    }
    
    // Reset spin timing when all reels have stopped
    const allReelsStopped = reelStatesRef.current.every(state => state.hasReachedTarget)
    if (allReelsStopped && spinStartTimeRef.current !== 0) {
      console.log(`🏁 All reels stopped, resetting spin timer`)
      spinStartTimeRef.current = 0
    }
  }

  const draw = (currentTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    
    // Calculate deltaTime
    const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 16
    lastTimeRef.current = currentTime
    
    // Update physics
    initializeReelStates()
    updateReelPhysics(deltaTime)
    
    // Clear canvas with anti-aliasing
    ctx.clearRect(0, 0, width, height)
    
    // Draw background with casino-style gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)')
    bgGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)')
    bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Calculate reel dimensions
    const padding = 20
    const reelSpacing = 8
    const availableWidth = width - padding * 2 - reelSpacing * 2
    const reelWidth = availableWidth / 3
    const reelHeight = height - padding

    // Draw each reel with enhanced visual effects
    for (let reelIndex = 0; reelIndex < 3; reelIndex++) {
      const x = padding + reelIndex * (reelWidth + reelSpacing)
      const y = padding / 2
      
      // Draw reel frame and background
      drawReelFrame(ctx, x, y, reelWidth, reelHeight, reelIndex)
      
      // Draw symbols for this reel
      if (displayReels[reelIndex]) {
        drawCylinderSymbols(ctx, displayReels[reelIndex], reelIndex, x, y, reelWidth, reelHeight)
      }
      
      // Draw reel glass overlay effect
      drawReelGlass(ctx, x, y, reelWidth, reelHeight)
    }
  }

  const drawReelFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, reelIndex: number) => {
    // Dark glass outer frame
    const frameGradient = ctx.createLinearGradient(x, y, x + w, y + h)
    frameGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)')   // Dark slate
    frameGradient.addColorStop(0.3, 'rgba(30, 41, 59, 0.95)') // Medium slate
    frameGradient.addColorStop(0.7, 'rgba(51, 65, 85, 0.9)')  // Light slate
    frameGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)')   // Dark slate
    
    ctx.fillStyle = frameGradient
    ctx.beginPath()
    ctx.roundRect(x - 3, y - 3, w + 6, h + 6, 12)
    ctx.fill()
    
    // Glass reflection effect - top highlight
    const glassHighlight = ctx.createLinearGradient(x - 3, y - 3, x - 3, y + h/3)
    glassHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
    glassHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = glassHighlight
    ctx.beginPath()
    ctx.roundRect(x - 3, y - 3, w + 6, h + 6, 12)
    ctx.fill()
    
    // Dark glass inner frame with subtle border
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 10)
    ctx.stroke()
    
    // Inner reel background with dark glass theme
    const reelBg = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, Math.max(w, h))
    reelBg.addColorStop(0, 'rgba(248, 250, 252, 0.95)')  // Almost white center
    reelBg.addColorStop(0.7, 'rgba(226, 232, 240, 0.9)') // Light gray
    reelBg.addColorStop(0.9, 'rgba(203, 213, 225, 0.85)') // Medium gray
    reelBg.addColorStop(1, 'rgba(148, 163, 184, 0.8)')    // Dark edge
    
    ctx.fillStyle = reelBg
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.fill()
    
    // Add spinning glow effect for active reels with cyan/blue theme
    const state = reelStatesRef.current[reelIndex]
    const isSpinning = animationState.isReelSpinning[reelIndex] || (!state.hasReachedTarget && state.velocity > 5)
    
    if (isSpinning) {
      // Outer cyan glow
      ctx.shadowColor = '#06B6D4'
      ctx.shadowBlur = 12
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(x - 1, y - 1, w + 2, h + 2, 9)
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // Inner blue glow for depth
      ctx.shadowColor = '#3B82F6'
      ctx.shadowBlur = 6
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 7)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }

  const drawCylinderSymbols = (
    ctx: CanvasRenderingContext2D,
    reel: string[],
    reelIndex: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const state = reelStatesRef.current[reelIndex]
    const symbolHeight = h * PHYSICS.SYMBOL_HEIGHT_RATIO
    const centerX = x + w / 2
    const centerY = y + h / 2
    
    // Calculate font size based on symbol height
    const fontSize = Math.min(symbolHeight * 0.6, w * 0.25)
    ctx.font = `bold ${fontSize}px 'Arial Black', Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Save the current canvas state
    ctx.save()
    
    // Create clipping path to contain symbols within the reel background
    ctx.beginPath()
    ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 6) // Slightly inset from reel background
    ctx.clip()

    // Calculate how many symbols to draw (only what's needed for the visible area)
    const visibleSymbols = Math.ceil(h / symbolHeight) + 2 // Just enough for smooth animation
    const startSymbol = Math.floor(state.position) - 1
    
    for (let i = 0; i < visibleSymbols; i++) {
      const symbolIndex = (startSymbol + i + reel.length) % reel.length
      const symbol = reel[symbolIndex]
      
      // Calculate symbol position with smooth fractional positioning
      const exactRelativePos = (startSymbol + i) - state.position
      const symbolY = centerY + exactRelativePos * symbolHeight
      
      // Draw all symbols within the extended range (clipping will handle visibility)
      if (symbolY > y - symbolHeight && symbolY < y + h + symbolHeight) {
        // Calculate opacity for smooth fading at edges (only at the very edges)
        let opacity = 1
        if (symbolY < y + symbolHeight * 0.2) {
          opacity = Math.max(0.1, (symbolY - y + symbolHeight) / (symbolHeight * 1.2))
        } else if (symbolY > y + h - symbolHeight * 0.2) {
          opacity = Math.max(0.1, (y + h + symbolHeight - symbolY) / (symbolHeight * 1.2))
        }
        
        drawSymbolWithEffects(ctx, symbol, centerX, symbolY, fontSize, state, opacity)
      }
    }
    
    // Restore the canvas state (removes clipping)
    ctx.restore()
  }

  const drawSymbolWithEffects = (
    ctx: CanvasRenderingContext2D,
    symbol: string,
    x: number,
    y: number,
    fontSize: number,
    state: { velocity: number; hasReachedTarget: boolean },
    opacity: number = 1
  ) => {
    const { text, color, shadow, glow } = getSymbolDisplay(symbol)
    
    // Calculate motion blur and effects based on velocity
    const velocity = state.velocity
    const isSpinning = !state.hasReachedTarget
    
    if (isSpinning && velocity > 15) {
      // High-speed motion blur
      ctx.filter = `blur(${Math.min(velocity * 0.15, 4)}px)`
      ctx.globalAlpha = 0.8 * opacity
    } else if (isSpinning && velocity > 5) {
      // Light motion blur for slower speeds
      ctx.filter = `blur(${velocity * 0.05}px)`
      ctx.globalAlpha = 0.9 * opacity
    } else {
      // Clear and sharp when stopped or slow
      ctx.filter = 'none'
      ctx.globalAlpha = 1 * opacity
    }
    
    // Add glow effect for jackpot symbols
    if (symbol === 'BG' && (!isSpinning || velocity < 10)) {
      ctx.shadowColor = glow
      ctx.shadowBlur = 8
    }
    
    // Draw shadow for depth
    ctx.fillStyle = shadow
    ctx.fillText(text, x + 2, y + 2)
    
    // Draw main symbol
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    
    // Reset effects
    ctx.filter = 'none'
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  const drawReelGlass = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Glass reflection effect
    const glassGradient = ctx.createLinearGradient(x, y, x + w, y + h)
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    glassGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)')
    glassGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)')
    glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)')
    
    ctx.fillStyle = glassGradient
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.fill()
    
    // Highlight reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 7)
    ctx.stroke()
  }

  // Enhanced animation loop with proper timing
  useEffect(() => {
    let animationId: number

    const animate = (currentTime: number) => {
      draw(currentTime)
      
      // Continue animation if any reel is spinning or needs updates
      const hasActiveAnimation = reelStatesRef.current.some(state => !state.hasReachedTarget)
      
      if (hasActiveAnimation || animationState.isReelSpinning.some(spinning => spinning)) {
        animationId = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [displayReels, animationState])

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setupCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(dpr, dpr)
          // Enable anti-aliasing for smoother visuals
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
        }
      }
    }

    setupCanvas()
    window.addEventListener('resize', setupCanvas)

    return () => {
      window.removeEventListener('resize', setupCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ 
        display: 'block',
        background: 'transparent'
      }}
    />
  )
}

export default SlotCanvas 