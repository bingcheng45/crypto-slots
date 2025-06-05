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
    <div className="bg-gray-900 text-white p-4 space-y-4">
      {/* Balance, Bet, Win Info */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-400 mb-1">BALANCE</div>
          <div className="text-lg font-bold text-green-400">${balance.toFixed(2)}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-400 mb-1">BET</div>
          <div className="text-lg font-bold text-blue-400">${currentBet.toFixed(2)}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-400 mb-1">WIN</div>
          <div className="text-lg font-bold text-yellow-400 win-amount">${lastWin.toFixed(2)}</div>
        </div>
      </div>

      {/* Winning Combination Display */}
      {/* Bet Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleBetDecrease}
          disabled={isSpinning || currentBet <= 1.00}
          className="bet-button bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          BET -
        </button>
        
        <button
          onClick={handleSpin}
          disabled={isSpinning || balance < currentBet}
          className="spin-button bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 px-8 py-3 rounded-lg font-bold text-xl transition-colors shadow-lg transform-gpu will-change-transform"
        >
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </button>
        
        <button
          onClick={handleBetIncrease}
          disabled={isSpinning}
          className="bet-button bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          BET +
        </button>
      </div>

      {/* Add Credits Button */}
      <div className="text-center">
        <button
          onClick={handleAddCredits}
          className="add-credits-button bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-colors"
        >
          Add $10 Credits
        </button>
      </div>

      {/* Game Info */}
      <div className="bg-gray-800 p-3 rounded-lg text-center text-sm text-gray-400">
        <div className="mb-2">
          <strong>Symbols:</strong> 1 (Single) 2 (Double) 3 (Triple) 7 (Jackpot) · (Blank)
        </div>
        <div>
          <strong>Payline:</strong> Middle row only • <strong>Max Bet:</strong> $10.00
        </div>
      </div>
    </div>
  )
}

export default GameUI 