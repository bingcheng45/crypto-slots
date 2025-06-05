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
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background with dark glass effect
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw reel backgrounds (individual reel windows) - perfectly centered
      const totalPadding = 24 // Total padding to distribute
      const reelSpacing = 4   // Space between reels
      const availableWidth = width - totalPadding - (reelSpacing * 2)
      const actualReelWidth = availableWidth / 3
      
      for (let i = 0; i < 3; i++) {
        const x = totalPadding / 2 + i * (actualReelWidth + reelSpacing)
        const y = 8
        const w = actualReelWidth
        const h = height - 16
        
        // Reel window background (refined cylindrical reel)
        const reelGradient = ctx.createLinearGradient(x, y, x, y + h)
        reelGradient.addColorStop(0, '#525252')      // Starting lighter
        reelGradient.addColorStop(0.02, '#575757')   // 2% interval
        reelGradient.addColorStop(0.04, '#5d5d5d')   // 2% interval
        reelGradient.addColorStop(0.06, '#646464')   // 2% interval
        reelGradient.addColorStop(0.08, '#6c6c6c')   // 2% interval
        reelGradient.addColorStop(0.1, '#757575')    // 2% interval
        reelGradient.addColorStop(0.12, '#808080')   // 2% interval
        reelGradient.addColorStop(0.14, '#8c8c8c')   // 2% interval
        reelGradient.addColorStop(0.16, '#9a9a9a')   // 2% interval
        reelGradient.addColorStop(0.18, '#a9a9a9')   // 2% interval
        reelGradient.addColorStop(0.2, '#b9b9b9')    // 2% interval
        reelGradient.addColorStop(0.22, '#cacaca')   // 2% interval
        reelGradient.addColorStop(0.24, '#dcdcdc')   // 2% interval
        reelGradient.addColorStop(0.26, '#eeeeee')   // 2% interval
        reelGradient.addColorStop(0.28, '#f5f5f5')   // 2% interval
        reelGradient.addColorStop(0.3, '#fafafa')    // 2% interval
        reelGradient.addColorStop(0.32, '#fdfdfd')   // 2% interval
        reelGradient.addColorStop(0.34, '#fefefe')   // 2% interval
        reelGradient.addColorStop(0.36, '#fefefe')   // 2% interval
        reelGradient.addColorStop(0.38, '#ffffff')   // 2% interval
        reelGradient.addColorStop(0.4, '#ffffff')    // Bright area starts
        reelGradient.addColorStop(0.6, '#ffffff')    // Bright area ends (mirror of 0.4)
        reelGradient.addColorStop(0.62, '#ffffff')   // Mirror of 0.38
        reelGradient.addColorStop(0.64, '#fefefe')   // Mirror of 0.36
        reelGradient.addColorStop(0.66, '#fefefe')   // Mirror of 0.34
        reelGradient.addColorStop(0.68, '#fdfdfd')   // Mirror of 0.32
        reelGradient.addColorStop(0.7, '#fafafa')    // Mirror of 0.3
        reelGradient.addColorStop(0.72, '#f5f5f5')   // Mirror of 0.28
        reelGradient.addColorStop(0.74, '#eeeeee')   // Mirror of 0.26
        reelGradient.addColorStop(0.76, '#dcdcdc')   // Mirror of 0.24
        reelGradient.addColorStop(0.78, '#cacaca')   // Mirror of 0.22
        reelGradient.addColorStop(0.8, '#b9b9b9')    // Mirror of 0.2
        reelGradient.addColorStop(0.82, '#a9a9a9')   // Mirror of 0.18
        reelGradient.addColorStop(0.84, '#9a9a9a')   // Mirror of 0.16
        reelGradient.addColorStop(0.86, '#8c8c8c')   // Mirror of 0.14
        reelGradient.addColorStop(0.88, '#808080')   // Mirror of 0.12
        reelGradient.addColorStop(0.9, '#757575')    // Mirror of 0.1
        reelGradient.addColorStop(0.92, '#6c6c6c')   // Mirror of 0.08
        reelGradient.addColorStop(0.94, '#646464')   // Mirror of 0.06
        reelGradient.addColorStop(0.96, '#5d5d5d')   // Mirror of 0.04
        reelGradient.addColorStop(0.98, '#575757')   // Mirror of 0.02
        reelGradient.addColorStop(1, '#525252')      // Mirror of 0 (ending lighter)
        
        ctx.fillStyle = reelGradient
        ctx.roundRect(x, y, w, h, 8)
        ctx.fill()
        
        // Glass border effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.roundRect(x, y, w, h, 8)
        ctx.stroke()
        
        // Inner glass highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 0.5
        ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 7)
        ctx.stroke()
      }
      
      // Draw symbols (only middle row from each reel)
      const fontSize = Math.min(width / 8, height / 3)
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      reels.forEach((reel, reelIndex) => {
        // Only show the middle symbol (index 1) from each reel
        const symbol = reel[1]
        const x = totalPadding / 2 + reelIndex * (actualReelWidth + reelSpacing) + actualReelWidth / 2
        const y = height / 2
        
        // Different styling for Black Gold symbols
        let symbolText = symbol
        let color = '#1a1a1a'
        let shadowColor = '#666'
        
        switch(symbol) {
          case '1C':
            symbolText = '1'  // Single bar
            color = '#228B22' // Forest Green
            shadowColor = '#006400'
            break
          case '2C':
            symbolText = '2' // Double bar  
            color = '#4169E1' // Royal Blue
            shadowColor = '#0000CD'
            break
          case '3C':
            symbolText = '3' // Triple bar
            color = '#FF6347' // Tomato Red
            shadowColor = '#DC143C'
            break
          case 'BG':
            symbolText = '7' // Jackpot (7)
            color = '#DC143C' // Red
            shadowColor = '#8B0000'
            break

          case '--':
            symbolText = '■' // Small square dot
            color = '#000000' // Black
            shadowColor = '#333333'
            break
          default:
            symbolText = symbol
            break
        }
        
        // Draw text shadow
        ctx.fillStyle = shadowColor
        ctx.fillText(symbolText, x + 2, y + 2)
        
        // Draw main symbol
        ctx.fillStyle = color
        ctx.fillText(symbolText, x, y)
        
        // Reset shadow for next symbol
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
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