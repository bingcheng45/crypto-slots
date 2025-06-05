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

// Bet levels - from $0.01 to $100.00
const BET_LEVELS = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00, 10.00, 25.00, 50.00, 75.00, 100.00]

// Black Gold S62M3X-XX Reel Strips (exact distribution per specification)
const ORIGINAL_REELS = {
  // Reel 1: 16×1C, 13×2C, 6×3C, 1×BG, 36×-- (total 72)
  reel1: [
    ...Array(16).fill('1C'),
    ...Array(13).fill('2C'),
    ...Array(6).fill('3C'),
    'BG',
    ...Array(36).fill('--')
  ],
  // Reel 2: 18×1C, 7×2C, 4×3C, 1×BG, 42×-- (total 72)
  reel2: [
    ...Array(18).fill('1C'),
    ...Array(7).fill('2C'),
    ...Array(4).fill('3C'),
    'BG',
    ...Array(42).fill('--')
  ],
  // Reel 3: 20×1C, 4×2C, 3×3C, 1×BG, 44×-- (total 72)
  reel3: [
    ...Array(20).fill('1C'),
    ...Array(4).fill('2C'),
    ...Array(3).fill('3C'),
    'BG',
    ...Array(44).fill('--')
  ]
}

// Black Gold S62M3X-XX 1-Coin Paytable (final tuning for 97.83% RTP)
const PAYOUT_TABLE: { [key: string]: number } = {
  // Premium Combination
  'BG,BG,BG': 2500,    // Jackpot

  // Triple Bar Combinations
  '3C,3C,3C': 159,     // 159.6 rounded down
  '3C,BG,BG': 16,      // 16.8 rounded down
  'BG,3C,BG': 16,      // 16.8 rounded down
  'BG,BG,3C': 16,      // 16.8 rounded down
  '3C,3C,BG': 16,      // 16.38 rounded down
  '3C,BG,3C': 16,      // 16.38 rounded down
  'BG,3C,3C': 16,      // 16.38 rounded down

  // Double Bar Combinations
  '2C,2C,2C': 14,      // Already whole number
  '2C,BG,BG': 14,      // 14.7 rounded down
  'BG,2C,BG': 14,      // 14.7 rounded down
  'BG,BG,2C': 14,      // 14.7 rounded down
  '2C,2C,BG': 14,      // 14.28 rounded down
  '2C,BG,2C': 14,      // 14.28 rounded down
  'BG,2C,2C': 14,      // 14.28 rounded down

  // Single Bar Combinations
  '1C,1C,1C': 28,      // 28.56 rounded down
  '1C,BG,BG': 3,       // 3.5 rounded down
  'BG,1C,BG': 3,       // 3.5 rounded down
  'BG,BG,1C': 3,       // 3.5 rounded down
  '1C,1C,BG': 3,       // 3.08 rounded down
  '1C,BG,1C': 3,       // 3.08 rounded down
  'BG,1C,1C': 3,       // 3.08 rounded down

  // Mixed Bar Combinations (any bars not all the same)
  'MIXED_BARS': 7,          // 7.14 rounded down
  'MIXED_BARS_BG1': 9,      // 9.94 rounded down
  'MIXED_BARS_BG2': 10,     // 10.36 rounded down
  'MIXED_BARS_BG3': 10,     // 10.22 rounded down

  // Black Gold Scatter Pays
  'BG,BG,--': 7,       // 7.14 rounded down
  '--,BG,BG': 7,       // 7.14 rounded down
  'BG,--,BG': 7,       // 7.14 rounded down
  'BG,--,--': 3,       // 3.36 rounded down
  '--,--,BG': 3,       // 3.36 rounded down
  '--,BG,--': 3        // 3.36 rounded down
}

// Shuffle the reels for randomness
const shuffleArray = (array: string[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const SHUFFLED_REELS = {
  reel1: shuffleArray(ORIGINAL_REELS.reel1),
  reel2: shuffleArray(ORIGINAL_REELS.reel2),
  reel3: shuffleArray(ORIGINAL_REELS.reel3)
}

// Check if symbol is a bar (1C, 2C, or 3C)
const isBar = (symbol: string) => ['1C', '2C', '3C'].includes(symbol)

// Check if combination is mixed bars (all bars but not all the same)
const isMixedBars = (s1: string, s2: string, s3: string) => {
  return isBar(s1) && isBar(s2) && isBar(s3) && !(s1 === s2 && s2 === s3)
}

// Calculate payout for a combination (matches test script logic)
const calculatePayout = (symbols: string[], bet: number = 1.00): number => {
  const [s1, s2, s3] = symbols
  const key = `${s1},${s2},${s3}`
  
  // Check exact combinations first
  if (PAYOUT_TABLE[key]) {
    return PAYOUT_TABLE[key] * bet
  }
  
  // Check mixed bar combinations with BG
  if (isBar(s1) && isBar(s2) && s3 === 'BG' && s1 !== s2) {
    return PAYOUT_TABLE['MIXED_BARS_BG1'] * bet  // XC XC BG
  }
  if (isBar(s1) && s2 === 'BG' && isBar(s3) && s1 !== s3) {
    return PAYOUT_TABLE['MIXED_BARS_BG2'] * bet  // XC BG XC
  }
  if (s1 === 'BG' && isBar(s2) && isBar(s3) && s2 !== s3) {
    return PAYOUT_TABLE['MIXED_BARS_BG3'] * bet  // BG XC XC
  }
  
  // Check pure mixed bars (no BG)
  if (isMixedBars(s1, s2, s3)) {
    return PAYOUT_TABLE['MIXED_BARS'] * bet
  }
  
  return 0
}

// Enhanced win logic with complete Black Gold rules
const checkWin = (reels: string[][]): { totalWin: number; winningCombination: string | null } => {
  const line = [reels[0][1], reels[1][1], reels[2][1]] // Middle line only
  
  const totalWin = calculatePayout(line, 1.00) // Always calculate for $1 base, multiply by actual bet later
  let winningCombination = null
  
  if (totalWin > 0) {
    const [s1, s2, s3] = line
    const key = `${s1},${s2},${s3}`
    
    if (s1 === 'BG' && s2 === 'BG' && s3 === 'BG') {
      winningCombination = 'BLACK GOLD JACKPOT! 💰'
    } else if (PAYOUT_TABLE[key]) {
      // Use a more descriptive name based on the combination
      if (key.includes('3C') && !key.includes('BG')) winningCombination = 'TRIPLE BARS'
      else if (key.includes('2C') && !key.includes('BG')) winningCombination = 'DOUBLE BARS'
      else if (key.includes('1C') && !key.includes('BG')) winningCombination = 'SINGLE BARS'
      else if (key.includes('BG')) winningCombination = 'BLACK GOLD COMBO'
      else winningCombination = 'WINNING COMBINATION'
    } else if (isMixedBars(s1, s2, s3)) {
      winningCombination = 'MIXED BARS'
    } else if ((isBar(s1) && isBar(s2) && s3 === 'BG') || 
               (isBar(s1) && s2 === 'BG' && isBar(s3)) || 
               (s1 === 'BG' && isBar(s2) && isBar(s3))) {
      winningCombination = 'MIXED BARS + BLACK GOLD'
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