import { create } from 'zustand'

export interface GameState {
  balance: number
  isSpinning: boolean
  lastWin: number
  reels: string[][]
  currentBet: number
  winningLines: number[] // Track which lines won
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

// Enhanced win logic: 5 winning lines
const checkWin = (reels: string[][]): { totalWin: number; winningLines: number[] } => {
  const payouts = {
    '₿': 100,   // Bitcoin - highest payout
    'Ξ': 80,    // Ethereum
    '◈': 60,    // Diamond
    '🪙': 40,   // Coin
    '💎': 30,   // Gem
    '⚡': 20,   // Lightning
    '🌟': 15    // Star
  }

  const lines = [
    // Line 0: Top horizontal [0,0] [1,0] [2,0]
    [reels[0][0], reels[1][0], reels[2][0]],
    // Line 1: Middle horizontal [0,1] [1,1] [2,1]
    [reels[0][1], reels[1][1], reels[2][1]],
    // Line 2: Bottom horizontal [0,2] [1,2] [2,2]
    [reels[0][2], reels[1][2], reels[2][2]],
    // Line 3: Diagonal \ [0,0] [1,1] [2,2]
    [reels[0][0], reels[1][1], reels[2][2]],
    // Line 4: Diagonal / [0,2] [1,1] [2,0]
    [reels[0][2], reels[1][1], reels[2][0]]
  ]

  let totalWin = 0
  const winningLines: number[] = []

  lines.forEach((line, lineIndex) => {
    if (line[0] === line[1] && line[1] === line[2]) {
      // All three symbols match
      const symbol = line[0]
      const payout = payouts[symbol as keyof typeof payouts] || 10
      totalWin += payout
      winningLines.push(lineIndex)
    }
  })

  return { totalWin, winningLines }
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
  winningLines: [],

  // Actions
  spin: () => {
    const state = get()
    if (state.isSpinning || state.balance < state.currentBet) return

    // Deduct bet amount
    set({ 
      balance: state.balance - state.currentBet,
      isSpinning: true,
      lastWin: 0,
      winningLines: []
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

      const { totalWin, winningLines } = checkWin(newReels)
      const currentState = get()

      set({
        reels: newReels,
        isSpinning: false,
        lastWin: totalWin,
        winningLines,
        balance: currentState.balance + totalWin
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