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

// Black Gold Slot Machine symbols
const SYMBOLS = {
  SINGLE_BAR: '1C',    // Single Bar
  DOUBLE_BAR: '2C',    // Double Bar  
  TRIPLE_BAR: '3C',    // Triple Bar
  BLACK_GOLD: 'BG',    // Black Gold (Wild)
  CHERRY: 'CH',        // Cherry (Scatter)
  BLANK: '--'          // Blank
}

// Bet levels - from $0.01 to $100.00 (modified from original specs for better UX)
const BET_LEVELS = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00, 10.00, 25.00, 50.00, 75.00, 100.00]

// Reel strips - 72 positions each with exact distributions per specs
const REEL_STRIPS = {
  reel1: [
    // 16 Single Bars
    ...Array(16).fill(SYMBOLS.SINGLE_BAR),
    // 13 Double Bars  
    ...Array(13).fill(SYMBOLS.DOUBLE_BAR),
    // 6 Triple Bars
    ...Array(6).fill(SYMBOLS.TRIPLE_BAR),
    // 1 Black Gold
    SYMBOLS.BLACK_GOLD,
    // 1 Cherry
    SYMBOLS.CHERRY,
    // 35 Blanks
    ...Array(35).fill(SYMBOLS.BLANK)
  ],
  reel2: [
    // 18 Single Bars
    ...Array(18).fill(SYMBOLS.SINGLE_BAR),
    // 7 Double Bars
    ...Array(7).fill(SYMBOLS.DOUBLE_BAR),
    // 4 Triple Bars
    ...Array(4).fill(SYMBOLS.TRIPLE_BAR),
    // 1 Black Gold
    SYMBOLS.BLACK_GOLD,
    // 1 Cherry
    SYMBOLS.CHERRY,
    // 41 Blanks
    ...Array(41).fill(SYMBOLS.BLANK)
  ],
  reel3: [
    // 20 Single Bars
    ...Array(20).fill(SYMBOLS.SINGLE_BAR),
    // 4 Double Bars
    ...Array(4).fill(SYMBOLS.DOUBLE_BAR),
    // 3 Triple Bars
    ...Array(3).fill(SYMBOLS.TRIPLE_BAR),
    // 1 Black Gold
    SYMBOLS.BLACK_GOLD,
    // 1 Cherry
    SYMBOLS.CHERRY,
    // 43 Blanks
    ...Array(43).fill(SYMBOLS.BLANK)
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

// Complete Black Gold 1-Coin Payout Table (exact from specifications)
const PAYOUT_TABLE = [
  // Premium Combination
  { pattern: ['BG', 'BG', 'BG'], payout: 4000, name: 'BLACK GOLD JACKPOT' },
  
  // Triple Bar Combinations
  { pattern: ['3C', '3C', '3C'], payout: 1148.5, name: 'THREE TRIPLE BARS' },
  { pattern: ['3C', 'BG', 'BG'], payout: 120, name: 'TRIPLE BAR + 2 BLACK GOLD' },
  { pattern: ['BG', '3C', 'BG'], payout: 120, name: 'BLACK GOLD + TRIPLE BAR + BLACK GOLD' },
  { pattern: ['BG', 'BG', '3C'], payout: 120, name: '2 BLACK GOLD + TRIPLE BAR' },
  { pattern: ['3C', '3C', 'BG'], payout: 117, name: 'TWO TRIPLE BARS + BLACK GOLD' },
  { pattern: ['3C', 'BG', '3C'], payout: 117, name: 'TRIPLE BAR + BLACK GOLD + TRIPLE BAR' },
  { pattern: ['BG', '3C', '3C'], payout: 117, name: 'BLACK GOLD + TWO TRIPLE BARS' },
  
  // Double Bar Combinations
  { pattern: ['2C', '2C', '2C'], payout: 100, name: 'THREE DOUBLE BARS' },
  { pattern: ['2C', 'BG', 'BG'], payout: 105, name: 'DOUBLE BAR + 2 BLACK GOLD' },
  { pattern: ['BG', '2C', 'BG'], payout: 105, name: 'BLACK GOLD + DOUBLE BAR + BLACK GOLD' },
  { pattern: ['BG', 'BG', '2C'], payout: 105, name: '2 BLACK GOLD + DOUBLE BAR' },
  { pattern: ['2C', '2C', 'BG'], payout: 102, name: 'TWO DOUBLE BARS + BLACK GOLD' },
  { pattern: ['2C', 'BG', '2C'], payout: 102, name: 'DOUBLE BAR + BLACK GOLD + DOUBLE BAR' },
  { pattern: ['BG', '2C', '2C'], payout: 102, name: 'BLACK GOLD + TWO DOUBLE BARS' },
  
  // Single Bar Combinations
  { pattern: ['1C', '1C', '1C'], payout: 202.5, name: 'THREE SINGLE BARS' },
  { pattern: ['1C', 'BG', 'BG'], payout: 25, name: 'SINGLE BAR + 2 BLACK GOLD' },
  { pattern: ['BG', '1C', 'BG'], payout: 25, name: 'BLACK GOLD + SINGLE BAR + BLACK GOLD' },
  { pattern: ['BG', 'BG', '1C'], payout: 25, name: '2 BLACK GOLD + SINGLE BAR' },
  { pattern: ['1C', '1C', 'BG'], payout: 22, name: 'TWO SINGLE BARS + BLACK GOLD' },
  { pattern: ['1C', 'BG', '1C'], payout: 22, name: 'SINGLE BAR + BLACK GOLD + SINGLE BAR' },
  { pattern: ['BG', '1C', '1C'], payout: 22, name: 'BLACK GOLD + TWO SINGLE BARS' },
  
  // Mixed Bar Combinations (XC = any bar symbol)
  { pattern: ['mixed_bars_three'], payout: 51, name: 'THREE MIXED BARS' },
  { pattern: ['mixed_bar', 'mixed_bar', 'BG'], payout: 70.5, name: 'TWO MIXED BARS + BLACK GOLD' },
  { pattern: ['mixed_bar', 'BG', 'mixed_bar'], payout: 74.5, name: 'MIXED BAR + BLACK GOLD + MIXED BAR' },
  { pattern: ['BG', 'mixed_bar', 'mixed_bar'], payout: 73.5, name: 'BLACK GOLD + TWO MIXED BARS' },
  
  // Black Gold Scatter Pays
  { pattern: ['BG', 'BG', '--'], payout: 52, name: '2 BLACK GOLD + BLANK' },
  { pattern: ['--', 'BG', 'BG'], payout: 51.5, name: 'BLANK + 2 BLACK GOLD' },
  { pattern: ['BG', '--', 'BG'], payout: 52, name: 'BLACK GOLD + BLANK + BLACK GOLD' },
  { pattern: ['BG', '--', '--'], payout: 20.5, name: 'BLACK GOLD + 2 BLANKS' },
  { pattern: ['--', '--', 'BG'], payout: 20.75, name: '2 BLANKS + BLACK GOLD' },
  { pattern: ['--', 'BG', '--'], payout: 20.5, name: 'BLANK + BLACK GOLD + BLANK' }
]

// Check if symbol is a bar (1C, 2C, or 3C)
const isBar = (symbol: string) => ['1C', '2C', '3C'].includes(symbol)

// Check if three symbols are mixed bars (all bars but not all the same)
const isMixedBars = (symbol1: string, symbol2: string, symbol3: string) => {
  return isBar(symbol1) && isBar(symbol2) && isBar(symbol3) && 
         !(symbol1 === symbol2 && symbol2 === symbol3)
}

// Count cherries anywhere on the reels (scatter pay)
const countCherries = (reels: string[][]) => {
  let cherryCount = 0
  reels.forEach(reel => {
    reel.forEach(symbol => {
      if (symbol === 'CH') cherryCount++
    })
  })
  return cherryCount
}

// Enhanced win logic with exact payout table
const checkWin = (reels: string[][]): { totalWin: number; winningCombination: string | null } => {
  const line = [reels[0][1], reels[1][1], reels[2][1]] // Middle line only
  let totalWin = 0
  let winningCombination = null
  
  // First check for Cherry scatter pays (pays regardless of line)
  const cherryCount = countCherries(reels)
  if (cherryCount > 0) {
    const cherryPay = cherryCount // 1 cherry = 1, 2 cherries = 2, 3 cherries = 3
    totalWin += cherryPay
    winningCombination = `${cherryCount} CHERR${cherryCount > 1 ? 'IES' : 'Y'}`
  }
  
  // Then check line combinations (highest priority wins)
  for (const combo of PAYOUT_TABLE) {
    if (combo.pattern[0] === 'mixed_bars_three') {
      // Handle mixed bars (XC XC XC) - any combination of different bars
      if (isMixedBars(line[0], line[1], line[2])) {
        if (combo.payout > totalWin) {
          totalWin = combo.payout
          winningCombination = combo.name
        }
      }
    } else if (combo.pattern.includes('mixed_bar')) {
      // Handle mixed bar + Black Gold combinations
      const isMatch = combo.pattern.every((expected, index) => {
        if (expected === 'mixed_bar') {
          return isBar(line[index])
        } else if (expected === 'BG') {
          return line[index] === 'BG'
        } else if (expected === '--') {
          return line[index] === '--'
        }
        return line[index] === expected
      })
      
      // Additional check: ensure bars are not all the same for mixed_bar patterns
      if (isMatch) {
        const barPositions = combo.pattern.map((p, i) => p === 'mixed_bar' ? i : -1).filter(i => i >= 0)
        if (barPositions.length >= 2) {
          const barSymbols = barPositions.map(i => line[i])
          const allSame = barSymbols.every(symbol => symbol === barSymbols[0])
          if (allSame) continue // Skip if all bars are same
        }
        if (combo.payout > totalWin) {
          totalWin = combo.payout
          winningCombination = combo.name
        }
      }
    } else {
      // Handle exact pattern matches
      const isMatch = combo.pattern.every((expected, index) => line[index] === expected)
      
      if (isMatch) {
        if (combo.payout > totalWin) {
          totalWin = combo.payout
          winningCombination = combo.name
        }
      }
    }
  }
  
  return { totalWin, winningCombination }
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
    ['--', '1C', '--'],  // Keep 3 symbols for animation but only show middle
    ['--', '2C', '--'],  // Keep 3 symbols for animation but only show middle
    ['--', '3C', '--']   // Keep 3 symbols for animation but only show middle
  ],
  currentBet: 1.00, // Default to $1 bet
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

    // Simulate spinning delay
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
    }, 1000)
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