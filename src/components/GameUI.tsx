'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '@/store/gameStore'

interface GameUIProps {
  onSpin: () => void
}

const GameUI = ({ onSpin }: GameUIProps) => {
  const spinButtonRef = useRef<HTMLButtonElement>(null)
  const { balance, isSpinning, currentBet, setBet } = useGameStore()

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

  const betOptions = [5, 10, 25, 50]

  return (
    <div className="space-y-4">
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