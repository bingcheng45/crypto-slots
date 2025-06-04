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
    <div className="space-y-4">
      {/* Game Info Container */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Balance */}
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Balance
            </div>
            <div className="text-green-400 font-mono text-lg font-bold">
              {formatCurrency(balance)}
            </div>
          </div>
          
          {/* Current Bet */}
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Current Bet
            </div>
            <div className="text-yellow-400 font-mono text-lg font-bold">
              {formatCurrency(currentBet)}
            </div>
          </div>
          
          {/* Last Win */}
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Last Win
            </div>
            <div className={`font-mono text-lg font-bold ${lastWin > 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {formatCurrency(lastWin)}
            </div>
          </div>
        </div>
      </div>

      {/* Bet Controls */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 text-center">
          Bet Amount
        </div>
        <div className="flex items-center justify-center space-x-4">
          {/* Decrease Bet Button */}
          <button
            onClick={decreaseBet}
            disabled={isSpinning || currentBet <= 0.01}
            className={`
              w-12 h-12 rounded-full font-bold text-xl transition-all duration-200
              ${isSpinning || currentBet <= 0.01
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white hover:scale-110 active:scale-95'
              }
            `}
          >
            −
          </button>
          
          {/* Current Bet Display */}
          <div className="flex-1 text-center">
            <div className="bg-black rounded-lg py-3 px-6 border border-yellow-400">
              <div className="text-yellow-400 font-mono text-2xl font-bold">
                {formatCurrency(currentBet)}
              </div>
            </div>
          </div>
          
          {/* Increase Bet Button */}
          <button
            onClick={increaseBet}
            disabled={isSpinning}
            className={`
              w-12 h-12 rounded-full font-bold text-xl transition-all duration-200
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
        <div className="text-center text-red-400 text-sm bg-red-900/20 border border-red-600 rounded-lg p-2">
          Insufficient balance! Reduce bet or add more funds.
        </div>
      )}
    </div>
  )
}

export default GameUI 