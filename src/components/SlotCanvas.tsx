'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

const SlotCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>(0)
  const { displayReels, animationState } = useGameStore()

  // Symbol display mapping
  const getSymbolDisplay = (symbol: string) => {
    switch(symbol) {
      case '1C': return { text: '1', color: '#228B22', shadow: '#006400' }  // Single bar - Green
      case '2C': return { text: '2', color: '#4169E1', shadow: '#0000CD' }  // Double bar - Blue
      case '3C': return { text: '3', color: '#FF6347', shadow: '#DC143C' }  // Triple bar - Red
      case 'BG': return { text: '7', color: '#FFD700', shadow: '#B8860B' }  // Black Gold - Gold
      case '--': return { text: '■', color: '#404040', shadow: '#202020' }  // Blank - Dark
      default: return { text: symbol, color: '#1a1a1a', shadow: '#666' }
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw background with dark glass effect
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Calculate reel dimensions
    const totalPadding = 24
    const reelSpacing = 4
    const availableWidth = width - totalPadding - (reelSpacing * 2)
    const reelWidth = availableWidth / 3
    const reelHeight = height - 16

    // Draw each reel
    for (let reelIndex = 0; reelIndex < 3; reelIndex++) {
      const x = totalPadding / 2 + reelIndex * (reelWidth + reelSpacing)
      const y = 8
      
      // Draw reel background
      drawReelBackground(ctx, x, y, reelWidth, reelHeight)
      
      // Draw symbols for this reel
      if (displayReels[reelIndex]) {
        drawReelSymbols(ctx, displayReels[reelIndex], reelIndex, x, y, reelWidth, reelHeight)
      }
    }
  }

  const drawReelBackground = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Reel window background (cylindrical reel effect)
    const reelGradient = ctx.createLinearGradient(x, y, x, y + h)
    reelGradient.addColorStop(0, '#525252')
    reelGradient.addColorStop(0.3, '#fafafa')
    reelGradient.addColorStop(0.4, '#ffffff')
    reelGradient.addColorStop(0.6, '#ffffff')
    reelGradient.addColorStop(0.7, '#fafafa')
    reelGradient.addColorStop(1, '#525252')
    
    ctx.fillStyle = reelGradient
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.fill()
    
    // Glass border effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.stroke()
    
    // Inner glass highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 7)
    ctx.stroke()
  }

  const drawReelSymbols = (
    ctx: CanvasRenderingContext2D, 
    reel: string[], 
    reelIndex: number, 
    x: number, 
    y: number, 
    w: number, 
    h: number
  ) => {
    const symbolHeight = h / 3 // Show 3 symbols at once
    const fontSize = Math.min(w / 4, symbolHeight / 2)
    const centerX = x + w / 2
    
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Calculate current animation offset
    let animationOffset = 0
    if (animationState.isReelSpinning[reelIndex]) {
      // If spinning, create continuous movement effect
      const speed = animationState.spinSpeeds[reelIndex]
      animationOffset = (Date.now() * speed * 0.01) % symbolHeight
    } else {
      // If stopped, snap to target position
      const targetPosition = animationState.targetPositions[reelIndex]
      animationOffset = -(targetPosition * symbolHeight) % (reel.length * symbolHeight)
    }

    // Draw visible symbols (with wrapping)
    for (let i = -1; i <= 4; i++) { // Draw extra symbols for smooth scrolling
      const symbolIndex = (Math.floor(-animationOffset / symbolHeight) + i + reel.length) % reel.length
      const symbol = reel[symbolIndex]
      const symbolY = y + symbolHeight * 1.5 + (i * symbolHeight) + (animationOffset % symbolHeight)
      
      // Only draw if symbol is within visible area
      if (symbolY > y - symbolHeight && symbolY < y + h + symbolHeight) {
        const { text, color, shadow } = getSymbolDisplay(symbol)
        
        // Add blur effect for spinning reels
        if (animationState.isReelSpinning[reelIndex] && animationState.spinSpeeds[reelIndex] > 10) {
          ctx.filter = 'blur(2px)'
        } else {
          ctx.filter = 'none'
        }
        
        // Draw shadow
        ctx.fillStyle = shadow
        ctx.fillText(text, centerX + 1, symbolY + 1)
        
        // Draw main symbol
        ctx.fillStyle = color
        ctx.fillText(text, centerX, symbolY)
      }
    }
    
    // Reset filter
    ctx.filter = 'none'
  }

  // Animation loop
  useEffect(() => {
    const animate = () => {
      draw()
      
      // Continue animation if any reel is spinning
      if (animationState.isReelSpinning.some(spinning => spinning)) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation loop
    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [displayReels, animationState])

  // Canvas resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }
        
        draw()
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ 
        display: 'block',
        imageRendering: 'pixelated'
      }}
    />
  )
}

export default SlotCanvas 