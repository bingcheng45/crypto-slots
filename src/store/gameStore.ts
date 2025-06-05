import { create } from 'zustand'

export interface GameState {
  balance: number
  isSpinning: boolean
  lastWin: number
  reels: string[][]  // Backend reels (72 symbols each) - for math calculations
  displayReels: string[][]  // Frontend reels (32 symbols each) - for visual display
  currentBet: number
  winningCombination: string | null
  animationState: {
    isReelSpinning: boolean[]  // [reel1, reel2, reel3]
    currentPositions: number[] // Current display positions for animation
    targetPositions: number[]  // Where each reel should stop
    spinSpeeds: number[]       // Animation speeds for each reel
  }
}

export interface GameActions {
  spin: () => void
  increaseBet: () => void
  decreaseBet: () => void
  addBalance: (amount: number) => void
  setSpinning: (spinning: boolean) => void
  findTargetPosition: (backendSymbol: string, displayReel: string[]) => number
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

// Generate display reel (32 symbols) for smooth animation
const generateDisplayReel = (): string[] => {
  // Start fresh with completely new approach
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    attempts++
    const reel: string[] = new Array(32).fill('')
    
    // Step 1: Place 5 blank symbols ensuring no adjacency
    const blankPositions: number[] = []
    while (blankPositions.length < 5) {
      const pos = Math.floor(Math.random() * 32)
      // Check if position is valid (not adjacent to existing blanks)
      const isValid = blankPositions.every(existingPos => 
        Math.abs(pos - existingPos) > 1 && Math.abs(pos - existingPos) !== 31 // Handle wrap-around
      )
      if (isValid && !blankPositions.includes(pos)) {
        blankPositions.push(pos)
      }
    }
    
    // Place blanks in reel
    blankPositions.forEach(pos => {
      reel[pos] = '--'
    })
    
    // Step 2: Find positions above blanks for strategic placement
    const positionsAboveBlanks = blankPositions.map(blankPos => (blankPos - 1 + 32) % 32)
    
    // Remove duplicates and positions that are already blanks
    const validAboveBlanks = [...new Set(positionsAboveBlanks)].filter(pos => reel[pos] === '')
    
    // Step 3: Strategic jackpot placement - prioritize positions above blanks
    const strategicJackpots = Math.min(validAboveBlanks.length, 2) // Try to place up to 2
    const strategicPositions: number[] = []
    
    for (let i = 0; i < strategicJackpots; i++) {
      reel[validAboveBlanks[i]] = 'BG'
      strategicPositions.push(validAboveBlanks[i])
    }
    
    // Step 4: Get all remaining available positions
    const availablePositions: number[] = []
    for (let i = 0; i < 32; i++) {
      if (reel[i] === '') {
        availablePositions.push(i)
      }
    }
    
    // Step 5: Place remaining required symbols
    const requiredSymbols = ['1C', '2C', '3C']
    
    // Add remaining BG symbols if needed
    const totalBGNeeded = 3
    const remainingBG = totalBGNeeded - strategicJackpots
    for (let i = 0; i < remainingBG; i++) {
      requiredSymbols.push('BG')
    }
    
         // Shuffle available positions and place required symbols
     const tempPositions = [...availablePositions]
     const shuffledPositions: number[] = []
     while (tempPositions.length > 0) {
       const randomIndex = Math.floor(Math.random() * tempPositions.length)
       shuffledPositions.push(tempPositions.splice(randomIndex, 1)[0])
     }
     
     for (let i = 0; i < requiredSymbols.length && i < shuffledPositions.length; i++) {
       const position = shuffledPositions[i]
       reel[position] = requiredSymbols[i]
     }
    
    // Step 6: Fill remaining positions with duplicates
    const remainingPositions: number[] = []
    for (let i = 0; i < 32; i++) {
      if (reel[i] === '') {
        remainingPositions.push(i)
      }
    }
    
    // Create duplicate pool
    const duplicateSymbols = [
      ...Array(10).fill('1C'), // Most common
      ...Array(7).fill('2C'),  // Medium
      ...Array(4).fill('3C'),  // Less common
    ]
    
    // Adjust for any remaining BG slots
    const currentBGCount = reel.filter(symbol => symbol === 'BG').length
    if (currentBGCount < 3) {
      for (let i = currentBGCount; i < 3; i++) {
        duplicateSymbols.push('BG')
      }
    }
    
    // Shuffle and fill remaining positions
    const shuffledDuplicates = shuffleArray(duplicateSymbols)
    
    for (let i = 0; i < remainingPositions.length && i < shuffledDuplicates.length; i++) {
      reel[remainingPositions[i]] = shuffledDuplicates[i]
    }
    
    // Validate the reel has all required symbols
    const requiredTypes = ['1C', '2C', '3C', 'BG']
    const hasAllRequired = requiredTypes.every(symbol => reel.includes(symbol))
    
    if (hasAllRequired) {
      return reel
    }
  }
  
  // Fallback: if we couldn't create a good strategic reel, return a basic valid one
  return generateBasicReel()
}

// Fallback function for basic reel generation
const generateBasicReel = (): string[] => {
  const reel: string[] = new Array(32).fill('')
  
  // Place blanks
  const blankPositions = [0, 5, 10, 15, 20] // Simple non-adjacent positions
  blankPositions.forEach(pos => {
    reel[pos] = '--'
  })
  
  // Place required symbols
  reel[1] = '1C'
  reel[2] = '2C' 
  reel[3] = '3C'
  reel[4] = 'BG'
  
  // Fill remaining with duplicates
  const remaining = []
  for (let i = 0; i < 32; i++) {
    if (reel[i] === '') remaining.push(i)
  }
  
  const duplicates = [
    ...Array(10).fill('1C'),
    ...Array(7).fill('2C'),
    ...Array(4).fill('3C'),
    ...Array(2).fill('BG')
  ]
  
  const shuffled = shuffleArray(duplicates)
  remaining.forEach((pos, i) => {
    if (i < shuffled.length) reel[pos] = shuffled[i]
  })
  
  return reel
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

// Generate display reels once at game start
const DISPLAY_REELS = [
  generateDisplayReel(),
  generateDisplayReel(),
  generateDisplayReel()
]

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  balance: 100.00,
  isSpinning: false,
  lastWin: 0,
  reels: [
    ['--', '1C', '--'],  // Backend reels (will be updated with actual logic)
    ['--', '2C', '--'],  
    ['--', '3C', '--']   
  ],
  displayReels: DISPLAY_REELS, // 32-symbol reels for animation
  currentBet: 1.00, // Default to $1 bet
  winningCombination: null,
  animationState: {
    isReelSpinning: [false, false, false],
    currentPositions: [0, 0, 0],
    targetPositions: [0, 0, 0],
    spinSpeeds: [0, 0, 0]
  },

  // Helper function to find target position in display reel for smooth animation
  findTargetPosition: (backendSymbol: string, displayReel: string[]): number => {
    // Find all occurrences of the symbol in display reel
    const positions: number[] = []
    displayReel.forEach((symbol, index) => {
      if (symbol === backendSymbol) {
        positions.push(index)
      }
    })
    
    if (positions.length === 0) {
      console.warn(`Symbol ${backendSymbol} not found in display reel, using position 0`)
      return 0
    }
    
    // For smooth animation, we want to pick a position that allows for good visual continuity
    // If multiple positions exist, prefer one that's not too close to current position to allow for spinning effect
    const currentAnimationState = get().animationState
    const currentPosition = currentAnimationState.currentPositions[displayReel === get().displayReels[0] ? 0 : displayReel === get().displayReels[1] ? 1 : 2] || 0
    
    // Find the position that gives us the most spinning distance (but not too much)
    let bestPosition = positions[0]
    let bestDistance = Math.abs(positions[0] - currentPosition)
    
    for (const pos of positions) {
      const distance = Math.abs(pos - currentPosition)
      // Prefer positions that are 8-20 symbols away for good spinning effect
      if (distance >= 8 && distance <= 20 && distance > bestDistance) {
        bestPosition = pos
        bestDistance = distance
      }
    }
    
    return bestPosition
  },

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

    // Generate backend result (for math/RTP calculations)
    const backendReels = generateReelResult()
    const { totalWin, winningCombination } = checkWin(backendReels)
    
    // Calculate actual payout (multiply by bet)
    const actualWin = Math.round((totalWin * state.currentBet) * 100) / 100

    // Calculate target positions on display reels to match backend result
    const middleSymbols = backendReels.map(reel => reel[1]) // Get middle symbols from backend
    const targetPositions = middleSymbols.map((symbol, index) => 
      get().findTargetPosition(symbol, state.displayReels[index])
    )

    // Start animation sequence - all reels spinning initially
    set({
      reels: backendReels, // Store backend result for math
      animationState: {
        isReelSpinning: [true, true, true],
        currentPositions: state.animationState.currentPositions,
        targetPositions,
        spinSpeeds: [20, 20, 20] // High speed initially
      }
    })

    // Staggered reel stopping sequence: LEFT → MIDDLE → RIGHT
    setTimeout(() => {
      // Stop reel 1 (LEFT) first - classic slot machine behavior
      set(state => ({
        animationState: {
          ...state.animationState,
          isReelSpinning: [false, true, true],
          spinSpeeds: [0, 20, 20],
          currentPositions: [targetPositions[0], state.animationState.currentPositions[1], state.animationState.currentPositions[2]]
        }
      }))
    }, 1800) // Slightly longer spin time for drama

    setTimeout(() => {
      // Stop reel 2 (MIDDLE) second
      set(state => ({
        animationState: {
          ...state.animationState,
          isReelSpinning: [false, false, true],
          spinSpeeds: [0, 0, 20],
          currentPositions: [targetPositions[0], targetPositions[1], state.animationState.currentPositions[2]]
        }
      }))
    }, 3000) // More dramatic pause between stops

    setTimeout(() => {
      // Stop reel 3 (RIGHT) last and finalize game
      set(state => ({
        lastWin: actualWin,
        balance: Math.round((state.balance + actualWin) * 100) / 100,
        isSpinning: false,
        winningCombination,
        animationState: {
          ...state.animationState,
          isReelSpinning: [false, false, false],
          spinSpeeds: [0, 0, 0],
          currentPositions: targetPositions
        }
      }))
    }, 4200) // Final dramatic pause
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