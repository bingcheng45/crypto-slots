import { create } from 'zustand'

export interface GameState {
  balance: number
  isSpinning: boolean
  lastWin: number
  reels: string[][]
  currentBet: number
  winningCombination: string | null
}

export interface GameActions {
  spin: () => void
  increaseBet: () => void
  decreaseBet: () => void
  addBalance: (amount: number) => void
  setSpinning: (spinning: boolean) => void
}

export interface GameStore extends GameState, GameActions {}

// Slot machine symbols
const SYMBOLS = {
  SINGLE_BAR: '1',
  DOUBLE_BAR: '2', 
  TRIPLE_BAR: '3',
  JACKPOT: 'J',     // Black Gold
  BLANK: 'B'
}

// Bet increment levels (min $1, max $10)
const BET_LEVELS = [1.00, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00]

// Reel strips - 72 positions each with exact distributions
const REEL_STRIPS = {
  reel1: [
    // 16 Single Bars
    ...Array(16).fill(SYMBOLS.SINGLE_BAR),
    // 13 Double Bars  
    ...Array(13).fill(SYMBOLS.DOUBLE_BAR),
    // 6 Triple Bars
    ...Array(6).fill(SYMBOLS.TRIPLE_BAR),
    // 1 Jackpot
    SYMBOLS.JACKPOT,
    // 36 Blanks
    ...Array(36).fill(SYMBOLS.BLANK)
  ],
  reel2: [
    // 18 Single Bars
    ...Array(18).fill(SYMBOLS.SINGLE_BAR),
    // 7 Double Bars
    ...Array(7).fill(SYMBOLS.DOUBLE_BAR),
    // 4 Triple Bars
    ...Array(4).fill(SYMBOLS.TRIPLE_BAR),
    // 1 Jackpot
    SYMBOLS.JACKPOT,
    // 42 Blanks
    ...Array(42).fill(SYMBOLS.BLANK)
  ],
  reel3: [
    // 20 Single Bars
    ...Array(20).fill(SYMBOLS.SINGLE_BAR),
    // 4 Double Bars
    ...Array(4).fill(SYMBOLS.DOUBLE_BAR),
    // 3 Triple Bars
    ...Array(3).fill(SYMBOLS.TRIPLE_BAR),
    // 1 Jackpot
    SYMBOLS.JACKPOT,
    // 44 Blanks
    ...Array(44).fill(SYMBOLS.BLANK)
  ]
}

// Shuffle each reel strip to randomize positions
const shuffleArray = (array: string[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Initialize shuffled reel strips
const SHUFFLED_REELS = {
  reel1: shuffleArray(REEL_STRIPS.reel1),
  reel2: shuffleArray(REEL_STRIPS.reel2), 
  reel3: shuffleArray(REEL_STRIPS.reel3)
}

// Payout table for 1-coin bets (multiplied by actual bet amount)
const PAYOUT_TABLE = [
  // Jackpot combinations
  { pattern: ['J', 'J', 'J'], payout: 4000, name: 'JACKPOT' },
  
  // Triple Bar combinations
  { pattern: ['3', '3', '3'], payout: 114.5, name: 'THREE TRIPLE BARS' },
  { pattern: ['3', 'J', 'J'], payout: 120, name: 'TRIPLE BAR + 2 JACKPOTS' },
  { pattern: ['J', '3', 'J'], payout: 120, name: 'JACKPOT + TRIPLE BAR + JACKPOT' },
  { pattern: ['J', 'J', '3'], payout: 120, name: '2 JACKPOTS + TRIPLE BAR' },
  { pattern: ['3', '3', 'J'], payout: 117, name: 'TWO TRIPLE BARS + JACKPOT' },
  { pattern: ['3', 'J', '3'], payout: 117, name: 'TRIPLE BAR + JACKPOT + TRIPLE BAR' },
  { pattern: ['J', '3', '3'], payout: 117, name: 'JACKPOT + TWO TRIPLE BARS' },
  
  // Double Bar combinations
  { pattern: ['2', '2', '2'], payout: 100, name: 'THREE DOUBLE BARS' },
  { pattern: ['2', 'J', 'J'], payout: 105, name: 'DOUBLE BAR + 2 JACKPOTS' },
  { pattern: ['J', '2', 'J'], payout: 105, name: 'JACKPOT + DOUBLE BAR + JACKPOT' },
  { pattern: ['J', 'J', '2'], payout: 105, name: '2 JACKPOTS + DOUBLE BAR' },
  { pattern: ['2', '2', 'J'], payout: 102, name: 'TWO DOUBLE BARS + JACKPOT' },
  { pattern: ['2', 'J', '2'], payout: 102, name: 'DOUBLE BAR + JACKPOT + DOUBLE BAR' },
  { pattern: ['J', '2', '2'], payout: 102, name: 'JACKPOT + TWO DOUBLE BARS' },
  
  // Single Bar combinations
  { pattern: ['1', '1', '1'], payout: 20, name: 'THREE SINGLE BARS' },
  { pattern: ['1', 'J', 'J'], payout: 25, name: 'SINGLE BAR + 2 JACKPOTS' },
  { pattern: ['J', '1', 'J'], payout: 25, name: 'JACKPOT + SINGLE BAR + JACKPOT' },
  { pattern: ['J', 'J', '1'], payout: 25, name: '2 JACKPOTS + SINGLE BAR' },
  { pattern: ['1', '1', 'J'], payout: 22, name: 'TWO SINGLE BARS + JACKPOT' },
  { pattern: ['1', 'J', '1'], payout: 22, name: 'SINGLE BAR + JACKPOT + SINGLE BAR' },
  { pattern: ['J', '1', '1'], payout: 22, name: 'JACKPOT + TWO SINGLE BARS' },
  
  // Mixed bars (XC XC XC) - any combination of different bars
  { pattern: ['mixed_bars'], payout: 5, name: 'THREE MIXED BARS' },
  { pattern: ['mixed_bar', 'mixed_bar', 'J'], payout: 7, name: 'TWO MIXED BARS + JACKPOT' },
  { pattern: ['mixed_bar', 'J', 'mixed_bar'], payout: 7, name: 'MIXED BAR + JACKPOT + MIXED BAR' },
  { pattern: ['J', 'mixed_bar', 'mixed_bar'], payout: 7, name: 'JACKPOT + TWO MIXED BARS' },
  
  // Jackpot + Blank combinations
  { pattern: ['J', 'J', 'B'], payout: 5, name: '2 JACKPOTS + BLANK' },
  { pattern: ['B', 'J', 'J'], payout: 5, name: 'BLANK + 2 JACKPOTS' },
  { pattern: ['J', 'B', 'J'], payout: 5, name: 'JACKPOT + BLANK + JACKPOT' },
  
  // Single Jackpot + Blanks
  { pattern: ['J', 'B', 'B'], payout: 2, name: 'JACKPOT + 2 BLANKS' },
  { pattern: ['B', 'B', 'J'], payout: 2, name: '2 BLANKS + JACKPOT' },
  { pattern: ['B', 'J', 'B'], payout: 2, name: 'BLANK + JACKPOT + BLANK' }
]

// Check if symbol is a bar (1, 2, or 3)
const isBar = (symbol: string) => ['1', '2', '3'].includes(symbol)

// Check if three symbols are mixed bars (all bars but not all the same)
const isMixedBars = (symbol1: string, symbol2: string, symbol3: string) => {
  return isBar(symbol1) && isBar(symbol2) && isBar(symbol3) && 
         !(symbol1 === symbol2 && symbol2 === symbol3)
}

// Enhanced win logic with exact payout table
const checkWin = (reels: string[][]): { totalWin: number; winningCombination: string | null } => {
  const line = [reels[0][1], reels[1][1], reels[2][1]] // Middle line only
  
  // Check exact pattern matches first (highest priority)
  for (const combo of PAYOUT_TABLE) {
    if (combo.pattern[0] === 'mixed_bars') {
      // Handle mixed bars (XC XC XC) - any combination of different bars
      if (isMixedBars(line[0], line[1], line[2])) {
        return { totalWin: combo.payout, winningCombination: combo.name }
      }
    } else if (combo.pattern.includes('mixed_bar')) {
      // Handle mixed bar + jackpot combinations
      const isMatch = combo.pattern.every((expected, index) => {
        if (expected === 'mixed_bar') {
          return isBar(line[index])
        } else if (expected === 'J') {
          return line[index] === 'J'
        } else if (expected === 'B') {
          return line[index] === 'B'
        }
        return line[index] === expected
      })
      
      // Additional check: ensure bars are not all the same for mixed_bar patterns
      if (isMatch) {
        const barPositions = combo.pattern.map((p, i) => p === 'mixed_bar' ? i : -1).filter(i => i >= 0)
        if (barPositions.length >= 2) {
          const barSymbols = barPositions.map(i => line[i])
          const allSame = barSymbols.every(symbol => symbol === barSymbols[0])
          if (allSame) return { totalWin: 0, winningCombination: null } // Skip if all bars are same
        }
        return { totalWin: combo.payout, winningCombination: combo.name }
      }
    } else {
      // Handle exact pattern matches
      const isMatch = combo.pattern.every((expected, index) => line[index] === expected)
      
      if (isMatch) {
        return { totalWin: combo.payout, winningCombination: combo.name }
      }
    }
  }
  
  return { totalWin: 0, winningCombination: null }
}

// Generate random reel result
const generateReelResult = () => {
  const reel1Position = Math.floor(Math.random() * 72)
  const reel2Position = Math.floor(Math.random() * 72)
  const reel3Position = Math.floor(Math.random() * 72)
  
  // Get 3 consecutive symbols from each reel (with wraparound)
  const getThreeSymbols = (reelStrip: string[], position: number) => [
    reelStrip[position],
    reelStrip[(position + 1) % 72],
    reelStrip[(position + 2) % 72]
  ]
  
  return [
    getThreeSymbols(SHUFFLED_REELS.reel1, reel1Position),
    getThreeSymbols(SHUFFLED_REELS.reel2, reel2Position),
    getThreeSymbols(SHUFFLED_REELS.reel3, reel3Position)
  ]
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  balance: 100.00,
  isSpinning: false,
  lastWin: 0,
  reels: [
    ['B', '1', 'B'],  // Keep 3 symbols for animation but only show middle
    ['B', '2', 'B'],  // Keep 3 symbols for animation but only show middle
    ['B', '3', 'B']   // Keep 3 symbols for animation but only show middle
  ],
  currentBet: 1.00, // Default to $1 bet (minimum bet)
  winningCombination: null,

  // Actions
  spin: () => {
    const state = get()
    if (state.isSpinning || state.balance < state.currentBet) return

    // Deduct bet amount
    set({ 
      balance: Math.round((state.balance - state.currentBet) * 100) / 100,
      isSpinning: true,
      lastWin: 0,
      winningCombination: null
    })

    // Simulate spinning delay (no animation for now)
    setTimeout(() => {
      // Generate new random reels using proper reel strips
      const newReels = generateReelResult()
      
      const { totalWin, winningCombination } = checkWin(newReels)
      const currentState = get()
      
      // Calculate actual win amount based on bet (payout table is for 1-coin bets = $1.00)
      const actualWin = Math.round((totalWin * currentState.currentBet) * 100) / 100

      set({
        reels: newReels,
        isSpinning: false,
        lastWin: actualWin,
        winningCombination,
        balance: Math.round((currentState.balance + actualWin) * 100) / 100
      })
    }, 1000) // Shortened to 1 second since no animation
  },

  increaseBet: () => {
    const state = get()
    if (state.isSpinning) return
    
    const currentIndex = BET_LEVELS.findIndex(level => level === state.currentBet)
    const nextIndex = Math.min(currentIndex + 1, BET_LEVELS.length - 1)
    const newBet = BET_LEVELS[nextIndex]
    
    // Only increase if player has enough balance
    if (newBet <= state.balance) {
      set({ currentBet: newBet })
    }
  },

  decreaseBet: () => {
    const state = get()
    if (state.isSpinning) return
    
    const currentIndex = BET_LEVELS.findIndex(level => level === state.currentBet)
    const prevIndex = Math.max(currentIndex - 1, 0)
    
    set({ currentBet: BET_LEVELS[prevIndex] })
  },

  addBalance: (amount: number) => {
    const state = get()
    set({ balance: Math.round((state.balance + amount) * 100) / 100 })
  },

  setSpinning: (spinning: boolean) => {
    set({ isSpinning: spinning })
  }
})) 