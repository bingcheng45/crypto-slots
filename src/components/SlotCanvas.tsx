'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

const SlotCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { reels } = useGameStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        draw()
      }
    }

    const draw = () => {
      if (!ctx || !canvas) return
      
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const reelWidth = width / 3
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#2a2a2a')
      gradient.addColorStop(1, '#1a1a1a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw reel backgrounds (individual reel windows)
      for (let i = 0; i < 3; i++) {
        const x = i * reelWidth + 8
        const y = 8
        const w = reelWidth - 16
        const h = height - 16
        
        // Reel window background
        ctx.fillStyle = '#f8f9fa'
        ctx.roundRect(x, y, w, h, 8)
        ctx.fill()
        
        // Inner shadow effect
        ctx.strokeStyle = '#dee2e6'
        ctx.lineWidth = 2
        ctx.roundRect(x, y, w, h, 8)
        ctx.stroke()
      }
      
      // Draw symbols (only middle row from each reel)
      ctx.font = `bold ${Math.min(width / 6, height / 2)}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      reels.forEach((reel, reelIndex) => {
        // Only show the middle symbol (index 1) from each reel
        const symbol = reel[1]
        const x = (reelIndex + 0.5) * reelWidth
        const y = height / 2
        
        // Different styling for symbols
        let symbolText = symbol
        let color = '#1a1a1a'
        
        switch(symbol) {
          case '1':
            symbolText = '1'  // Single bar
            color = '#28a745' // Green
            break
          case '2':
            symbolText = '2' // Double bar
            color = '#ffc107' // Yellow
            break
          case '3':
            symbolText = '3' // Triple bar
            color = '#fd7e14' // Orange
            break
          case 'J':
            symbolText = '★' // Jackpot
            color = '#dc3545' // Red
            break
          case 'B':
            symbolText = '·' // Blank
            color = '#6c757d' // Gray
            break
        }
        
        ctx.fillStyle = color
        ctx.fillText(symbolText, x, y)
      })
    }

    // Initial setup and draw
    resizeCanvas()
    draw()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [reels])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ 
        display: 'block',
        touchAction: 'none'
      }}
    />
  )
}

export default SlotCanvas 