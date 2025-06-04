'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '@/store/gameStore'

interface GameUIProps {
  onSpin: () => void
}

const GameUI = ({ onSpin }: GameUIProps) => {
  const spinButtonRef = useRef<HTMLButtonElement>(null)
  const { balance, isSpinning, lastWin, currentBet, setBet, winningLines } = useGameStore()

  useEffect(() => {
    // Initialize button with hover animations
    const button = spinButtonRef.current
    if (!button) return

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      })
    }

    const handleMouseDown = () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out"
      })
    }

    const handleMouseUp = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out"
      })
    }

    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)
    button.addEventListener('mousedown', handleMouseDown)
    button.addEventListener('mouseup', handleMouseUp)

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter)
      button.removeEventListener('mouseleave', handleMouseLeave)
      button.removeEventListener('mousedown', handleMouseDown)
      button.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Win celebration animation
  useEffect(() => {
    if (lastWin > 0) {
      gsap.fromTo('.win-display', 
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          ease: "back.out(1.7)",
          delay: 0.2
        }
      )
    }
  }, [lastWin])

  const handleSpinClick = () => {
    if (!isSpinning && balance >= currentBet) {
      // Button press animation
      gsap.to(spinButtonRef.current, {
        scale: 0.9,
        duration: 0.05,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      })
      
      onSpin()
    }
  }

  const betOptions = [5, 10, 25, 50]

  // Generate win message based on number of lines
  const getWinMessage = () => {
    if (lastWin === 0) return ''
    
    const lineCount = winningLines.length
    if (lineCount === 1) {
      return `🎉 WIN ${lastWin}! 🎉`
    } else if (lineCount === 2) {
      return `🎉🎉 ${lineCount} LINES - WIN $${lastWin}! 🎉🎉`
    } else if (lineCount >= 3) {
      return `🚨🎉 ${lineCount} LINES - BIG WIN $${lastWin}! 🎉🚨`
    }
    return `🎉 WIN $${lastWin}! 🎉`
  }

  return (
    <div className="space-y-4">
      {/* Win Display */}
      {lastWin > 0 && (
        <div className="win-display text-center">
          <div className={`px-4 py-2 rounded-lg font-bold text-lg md:text-xl ${
            winningLines.length >= 3 
              ? 'bg-gradient-to-r from-red-400 via-yellow-400 to-orange-500 text-black animate-pulse' 
              : winningLines.length === 2
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-black'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
          }`}>
            {getWinMessage()}
          </div>
          {winningLines.length > 1 && (
            <div className="text-xs text-gray-400 mt-1">
              Lines: {winningLines.map(i => i + 1).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Bet Selection */}
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {betOptions.map((amount) => (
            <button
              key={amount}
              onClick={() => setBet(amount)}
              disabled={isSpinning || balance < amount}
              className={`
                px-3 py-2 text-sm font-medium rounded transition-all duration-200
                ${currentBet === amount 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
                }
                ${(isSpinning || balance < amount) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
                }
              `}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <button
        ref={spinButtonRef}
        onClick={handleSpinClick}
        disabled={isSpinning || balance < currentBet}
        className={`
          w-full py-4 text-xl font-bold rounded-lg transition-all duration-200
          ${isSpinning || balance < currentBet
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isSpinning ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span>SPINNING...</span>
          </div>
        ) : (
          'SPIN'
        )}
      </button>

      {/* Insufficient Balance Warning */}
      {balance < currentBet && (
        <div className="text-center text-red-400 text-sm">
          Insufficient balance! Current: ${balance}
        </div>
      )}
    </div>
  )
}

export default GameUI 