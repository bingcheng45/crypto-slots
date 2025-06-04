'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '@/store/gameStore'

interface GameUIProps {
  onSpin: () => void
}

const GameUI = ({ onSpin }: GameUIProps) => {
  const spinButtonRef = useRef<HTMLButtonElement>(null)
  const { balance, isSpinning, currentBet, lastWin, increaseBet, decreaseBet } = useGameStore()

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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-3">
      {/* Compact Info & Controls Combined */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        {/* Top Row: Balance and Last Win */}
        <div className="flex justify-between items-center mb-2 text-xs">
          <div className="text-center">
            <div className="text-gray-400 uppercase tracking-wide">Balance</div>
            <div className="text-green-400 font-mono font-bold">{formatCurrency(balance)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 uppercase tracking-wide">Last Win</div>
            <div className={`font-mono font-bold ${lastWin > 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {formatCurrency(lastWin)}
            </div>
          </div>
        </div>
        
        {/* Bottom Row: Bet Controls */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={decreaseBet}
            disabled={isSpinning || currentBet <= 0.01}
            className={`
              w-8 h-8 rounded-full font-bold text-sm transition-all duration-200
              ${isSpinning || currentBet <= 0.01
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white hover:scale-110 active:scale-95'
              }
            `}
          >
            −
          </button>
          
          <div className="flex-1 text-center">
            <div className="bg-black rounded px-4 py-1 border border-yellow-400">
              <div className="text-yellow-400 font-mono text-lg font-bold">
                {formatCurrency(currentBet)}
              </div>
            </div>
          </div>
          
          <button
            onClick={increaseBet}
            disabled={isSpinning}
            className={`
              w-8 h-8 rounded-full font-bold text-sm transition-all duration-200
              ${isSpinning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white hover:scale-110 active:scale-95'
              }
            `}
          >
            +
          </button>
        </div>
      </div>

      {/* Compact Spin Button */}
      <button
        ref={spinButtonRef}
        onClick={handleSpinClick}
        disabled={isSpinning || balance < currentBet}
        className={`
          w-full py-3 text-lg font-bold rounded-lg transition-all duration-200
          ${isSpinning || balance < currentBet
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isSpinning ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>SPINNING...</span>
          </div>
        ) : (
          'SPIN'
        )}
      </button>

      {/* Compact Warning */}
      {balance < currentBet && (
        <div className="text-center text-red-400 text-xs bg-red-900/20 border border-red-600 rounded p-2">
          Insufficient balance!
        </div>
      )}
    </div>
  )
}

export default GameUI 