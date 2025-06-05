'use client'

import { useGameStore } from '@/store/gameStore'
import { useEffect } from 'react'
import { gsap } from 'gsap'

const GameUI = () => {
  const { 
    balance, 
    currentBet, 
    lastWin, 
    isSpinning, 
    spin, 
    increaseBet, 
    decreaseBet, 
    addBalance 
  } = useGameStore()

  useEffect(() => {
    // Animate balance changes
    if (lastWin > 0) {
      gsap.fromTo('.win-amount', 
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      )
    }
  }, [lastWin])

  const handleSpin = () => {
    if (!isSpinning && balance >= currentBet) {
      // Button press animation (completely isolated)
      gsap.set('.spin-button', { transformOrigin: "center center" })
      gsap.to('.spin-button', {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        force3D: true
      })
      spin()
    }
  }

  const handleBetIncrease = () => {
    if (!isSpinning) {
      gsap.to('.bet-button', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      })
      increaseBet()
    }
  }

  const handleBetDecrease = () => {
    if (!isSpinning) {
      gsap.to('.bet-button', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      })
      decreaseBet()
    }
  }

  const handleAddCredits = () => {
    gsap.to('.add-credits-button', {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    })
    addBalance(10.00)
  }

  return (
    <div className="p-4 space-y-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
      {/* Balance, Bet, Win Display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg backdrop-blur-sm border" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderColor: 'rgba(255, 255, 255, 0.1)' 
        }}>
          <div className="text-xs text-white/70 mb-1">BALANCE</div>
          <div className="text-lg font-bold" style={{ color: '#10b981' }}>${balance.toFixed(2)}</div>
        </div>
        <div className="text-center p-3 rounded-lg backdrop-blur-sm border" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderColor: 'rgba(255, 255, 255, 0.1)' 
        }}>
          <div className="text-xs text-white/70 mb-1">BET</div>
          <div className="text-lg font-bold" style={{ color: '#3b82f6' }}>${currentBet.toFixed(2)}</div>
        </div>
        <div className="text-center p-3 rounded-lg backdrop-blur-sm border" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderColor: 'rgba(255, 255, 255, 0.1)' 
        }}>
          <div className="text-xs text-white/70 mb-1">WIN</div>
          <div className="text-lg font-bold" style={{ color: '#fbbf24' }}>${lastWin.toFixed(2)}</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleBetDecrease}
          disabled={isSpinning || currentBet <= 1.00}
          className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 backdrop-blur-sm border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff'
          }}
        >
          BET -
        </button>
        
        <button
          onClick={handleSpin}
          disabled={isSpinning || balance < currentBet}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 transform-gpu will-change-transform disabled:opacity-50 backdrop-blur-sm border ${
            isSpinning ? 'animate-pulse' : 'hover:scale-105 active:scale-95'
          }`}
          style={{
            backgroundColor: isSpinning ? 'rgba(251, 191, 36, 0.3)' : '#3b82f6',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
        >
          SPIN
        </button>
        
        <button
          onClick={handleBetIncrease}
          disabled={isSpinning}
          className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 backdrop-blur-sm border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff'
          }}
        >
          BET +
        </button>
      </div>

      {/* Add Credits Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAddCredits}
          disabled={isSpinning}
          className="px-6 py-2 rounded-lg font-semibold disabled:opacity-50 backdrop-blur-sm border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgba(16, 185, 129, 0.4)',
            color: '#10b981'
          }}
        >
          Add $10 Credits
        </button>
      </div>

      {/* Game Info */}
      <div className="text-xs text-white/50 text-center space-y-1 mt-4">
        <div>Symbols: 1 (Single) 2 (Double) 3 (Triple) 7 (Jackpot) ■ (Blank)</div>
        <div>Payline: Middle row only • Max Bet: $10.00</div>
      </div>
    </div>
  )
}

export default GameUI 