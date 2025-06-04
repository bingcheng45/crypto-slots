import { create } from 'zustand'

export interface GameState {
  balance: number
  isSpinning: boolean
  lastWin: number
  reels: string[][]
  currentBet: number
}

export interface GameActions {
  spin: () => void
  setBet: (amount: number) => void
  addBalance: (amount: number) => void
  setSpinning: (spinning: boolean) => void
}

export interface GameStore extends GameState, GameActions {}

// Crypto symbols for the slot machine
const SYMBOLS = ['₿', 'Ξ', '◈', '🪙', '💎', '⚡', '🌟']

// Simple win logic: 3 matching symbols
const checkWin = (reels: string[][]): number => {
  const line = [reels[0][1], reels[1][1], reels[2][1]] // Middle row
  
  if (line[0] === line[1] && line[1] === line[2]) {
    // All three match - payout based on symbol
    const symbol = line[0]
    const payouts = {
      '₿': 100,   // Bitcoin - highest payout
      'Ξ': 80,    // Ethereum
      '◈': 60,    // Diamond
      '🪙': 40,   // Coin
      '💎': 30,   // Gem
      '⚡': 20,   // Lightning
      '🌟': 15    // Star
    }
    return payouts[symbol as keyof typeof payouts] || 10
  }
  
  return 0 // No win
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  balance: 1000,
  isSpinning: false,
  lastWin: 0,
  reels: [
    ['🌟', '₿', '⚡'],
    ['💎', 'Ξ', '🪙'],
    ['◈', '🌟', '₿']
  ],
  currentBet: 10,

  // Actions
  spin: () => {
    const state = get()
    if (state.isSpinning || state.balance < state.currentBet) return

    // Deduct bet amount
    set({ 
      balance: state.balance - state.currentBet,
      isSpinning: true,
      lastWin: 0
    })

    // Simulate spinning delay
    setTimeout(() => {
      // Generate new random reels
      const newReels = [
        [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ],
        [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ],
        [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ]
      ]

      const winAmount = checkWin(newReels)
      const currentState = get()

      set({
        reels: newReels,
        isSpinning: false,
        lastWin: winAmount,
        balance: currentState.balance + winAmount
      })
    }, 2000) // 2 second spin duration
  },

  setBet: (amount: number) => {
    const state = get()
    if (!state.isSpinning && amount > 0 && amount <= state.balance) {
      set({ currentBet: amount })
    }
  },

  addBalance: (amount: number) => {
    const state = get()
    set({ balance: state.balance + amount })
  },

  setSpinning: (spinning: boolean) => {
    set({ isSpinning: spinning })
  }
})) 