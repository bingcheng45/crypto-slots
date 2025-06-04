'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '@/store/gameStore'

const SlotCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { reels, isSpinning, lastWin, winningLines } = useGameStore()
  const animationRef = useRef<gsap.core.Timeline | null>(null)

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
      const symbolHeight = height / 3
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, width, height)

      // Draw winning line highlights BEFORE symbols
      if (lastWin > 0 && winningLines.length > 0) {
        const lineColors = [
          'rgba(255, 215, 0, 0.3)',   // Gold - Top horizontal
          'rgba(255, 255, 0, 0.3)',   // Yellow - Middle horizontal  
          'rgba(255, 165, 0, 0.3)',   // Orange - Bottom horizontal
          'rgba(0, 255, 255, 0.3)',   // Cyan - Diagonal \
          'rgba(255, 0, 255, 0.3)'    // Magenta - Diagonal /
        ]

        winningLines.forEach((lineIndex) => {
          ctx.fillStyle = lineColors[lineIndex]
          
          if (lineIndex === 0) {
            // Top horizontal line
            ctx.fillRect(5, 5, width - 10, symbolHeight - 10)
          } else if (lineIndex === 1) {
            // Middle horizontal line
            ctx.fillRect(5, symbolHeight + 5, width - 10, symbolHeight - 10)
          } else if (lineIndex === 2) {
            // Bottom horizontal line
            ctx.fillRect(5, symbolHeight * 2 + 5, width - 10, symbolHeight - 10)
          } else if (lineIndex === 3) {
            // Diagonal \ line - draw individual squares
            for (let i = 0; i < 3; i++) {
              ctx.fillRect(
                i * reelWidth + 5, 
                i * symbolHeight + 5, 
                reelWidth - 10, 
                symbolHeight - 10
              )
            }
          } else if (lineIndex === 4) {
            // Diagonal / line - draw individual squares
            for (let i = 0; i < 3; i++) {
              ctx.fillRect(
                i * reelWidth + 5, 
                (2 - i) * symbolHeight + 5, 
                reelWidth - 10, 
                symbolHeight - 10
              )
            }
          }
        })
      }
      
      // Draw reel separators
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2
      
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(i * reelWidth, 0)
        ctx.lineTo(i * reelWidth, height)
        ctx.stroke()
      }

      // Draw horizontal separators
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * symbolHeight)
        ctx.lineTo(width, i * symbolHeight)
        ctx.stroke()
      }
      
      // Draw symbols
      ctx.font = `${Math.min(width / 6, height / 4)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      reels.forEach((reel, reelIndex) => {
        reel.forEach((symbol, symbolIndex) => {
          const x = (reelIndex + 0.5) * reelWidth
          const y = (symbolIndex + 0.5) * symbolHeight
          
          // Draw symbol with white color (or black if on highlighted background)
          const isOnWinningLine = winningLines.some(lineIndex => {
            if (lineIndex === 0) return symbolIndex === 0 // Top row
            if (lineIndex === 1) return symbolIndex === 1 // Middle row
            if (lineIndex === 2) return symbolIndex === 2 // Bottom row
            if (lineIndex === 3) return reelIndex === symbolIndex // Diagonal \
            if (lineIndex === 4) return reelIndex === (2 - symbolIndex) // Diagonal /
            return false
          })
          
          ctx.fillStyle = (lastWin > 0 && isOnWinningLine) ? '#000' : '#fff'
          ctx.fillText(symbol, x, y)
        })
      })
    }

    // Spinning animation
    const animateReel = (reelIndex: number, delay: number = 0) => {
      const tl = gsap.timeline({ delay })
      
      // Fast spinning phase
      tl.to({}, {
        duration: 1.5,
        ease: "none",
        onUpdate: () => {
          if (ctx && canvas) {
            // Simulate spinning by rapidly changing symbols
            const time = Date.now()
            const spinSpeed = 50
            if (time % spinSpeed < 25) {
              // Redraw with motion blur effect
              draw()
            }
          }
        }
      })
      
      // Slow down phase
      tl.to({}, {
        duration: 0.5,
        ease: "power2.out",
        onUpdate: draw,
        onComplete: () => {
          draw() // Final draw
          
          // Win celebration animation
          if (lastWin > 0 && reelIndex === 2) {
            gsap.to(canvas, {
              scale: 1.05,
              duration: 0.3,
              yoyo: true,
              repeat: 3,
              ease: "power2.inOut"
            })
          }
        }
      })
      
      return tl
    }

    // Handle spinning state
    if (isSpinning) {
      // Create master timeline for all reels
      const masterTL = gsap.timeline()
      
      // Animate each reel with staggered timing
      masterTL.add(animateReel(0, 0))
      masterTL.add(animateReel(1, 0.2), 0)
      masterTL.add(animateReel(2, 0.4), 0)
      
      animationRef.current = masterTL
    } else {
      // Static draw when not spinning
      draw()
    }

    // Initial setup
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [reels, isSpinning, lastWin, winningLines])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ 
        display: 'block',
        touchAction: 'none' // Prevent scrolling on mobile
      }}
    />
  )
}

export default SlotCanvas 