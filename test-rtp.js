// RTP Analysis Script for Black Gold Slot Machine
// Tests all 373,248 possible combinations (72^3)

// Black Gold S62M3X-XX Reel Strips (exact distribution per specification)
// Reel 1: 16×1C, 13×2C, 6×3C, 1×BG, 36×-- (total 72)
const reel1 = [
  ...Array(16).fill('1C'),
  ...Array(13).fill('2C'),
  ...Array(6).fill('3C'),
  'BG',
  ...Array(36).fill('--')
]

// Reel 2: 18×1C, 7×2C, 4×3C, 1×BG, 42×-- (total 72)
const reel2 = [
  ...Array(18).fill('1C'),
  ...Array(7).fill('2C'),
  ...Array(4).fill('3C'),
  'BG',
  ...Array(42).fill('--')
]

// Reel 3: 20×1C, 4×2C, 3×3C, 1×BG, 44×-- (total 72)
const reel3 = [
  ...Array(20).fill('1C'),
  ...Array(4).fill('2C'),
  ...Array(3).fill('3C'),
  'BG',
  ...Array(44).fill('--')
]

// Black Gold S62M3X-XX 1-Coin Paytable (rounded down to whole numbers)
  const payouts = {
    // Premium Combination
    'BG,BG,BG': 2500,     // Jackpot

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

// Check if symbol is a bar (1C, 2C, or 3C)
function isBar(symbol) {
  return ['1C', '2C', '3C'].includes(symbol)
}

// Check if combination is mixed bars (all bars but not all the same)
function isMixedBars(s1, s2, s3) {
  return isBar(s1) && isBar(s2) && isBar(s3) && !(s1 === s2 && s2 === s3)
}

// Calculate payout for a combination
function calculatePayout(symbols, bet = 1.00) {
  const [s1, s2, s3] = symbols
  const key = `${s1},${s2},${s3}`
  
  // Check exact combinations first
  if (payouts[key]) {
    return payouts[key] * bet
  }
  
  // Check mixed bar combinations with BG
  if (isBar(s1) && isBar(s2) && s3 === 'BG' && s1 !== s2) {
    return payouts['MIXED_BARS_BG1'] * bet  // XC XC BG
  }
  if (isBar(s1) && s2 === 'BG' && isBar(s3) && s1 !== s3) {
    return payouts['MIXED_BARS_BG2'] * bet  // XC BG XC
  }
  if (s1 === 'BG' && isBar(s2) && isBar(s3) && s2 !== s3) {
    return payouts['MIXED_BARS_BG3'] * bet  // BG XC XC
  }
  
  // Check pure mixed bars (no BG)
  if (isMixedBars(s1, s2, s3)) {
    return payouts['MIXED_BARS'] * bet
  }
  
  return 0
}

// Format number with commas
function formatNumber(num) {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

// Shuffle array function for Monte Carlo
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Monte Carlo simulation function
function runMonteCarloSimulation() {
  console.log('\n🎲 MONTE CARLO SIMULATION')
  console.log('=' .repeat(50))
  console.log('🎯 Running 1,000,000 random spins...')
  console.log('')
  
  // Shuffle the reels for random simulation
  const shuffledReel1 = shuffleArray(reel1)
  const shuffledReel2 = shuffleArray(reel2)
  const shuffledReel3 = shuffleArray(reel3)
  
  let totalSpins = 0
  let totalCost = 0
  let totalPayout = 0
  let winningSpins = 0
  
  // Track RTP variance
  let lowestRTP = 100
  let highestRTP = 0
  let lowestRTPSpin = 0
  let highestRTPSpin = 0
  
  // Track house losses (when RTP > 100%)
  let maxHouseLoss = 0
  let maxHouseLossSpin = 0
  let maxHouseLossRTP = 0
  
  // Track RTP over time (every 10k spins)
  const rtpHistory = []
  
  // Track session analysis for different sample sizes
  const sessionAnalysis = {
    100: { maxLoss: 0, maxRTP: 0, worstSession: null },
    1000: { maxLoss: 0, maxRTP: 0, worstSession: null },
    10000: { maxLoss: 0, maxRTP: 0, worstSession: null }
  }
  
  // Track biggest wins
  let biggestWin = 0
  let biggestWinSpin = 0
  let biggestWinCombo = ''
  
  // Track win streaks
  let currentWinStreak = 0
  let longestWinStreak = 0
  let currentLossStreak = 0
  let longestLossStreak = 0
  
  // Track session totals for periodic analysis
  let sessionCost100 = 0, sessionPayout100 = 0
  let sessionCost1000 = 0, sessionPayout1000 = 0
  let sessionCost10000 = 0, sessionPayout10000 = 0
  
  const startTime = Date.now()
  
  for (let spin = 1; spin <= 1000000; spin++) {
    // Random reel positions
    const pos1 = Math.floor(Math.random() * 72)
    const pos2 = Math.floor(Math.random() * 72)
    const pos3 = Math.floor(Math.random() * 72)
    
    const symbols = [shuffledReel1[pos1], shuffledReel2[pos2], shuffledReel3[pos3]]
    const payout = calculatePayout(symbols, 1.00)
    
    totalSpins++
    totalCost += 1.00
    totalPayout += payout
    
    // Track session totals
    sessionCost100 += 1.00
    sessionPayout100 += payout
    sessionCost1000 += 1.00
    sessionPayout1000 += payout
    sessionCost10000 += 1.00
    sessionPayout10000 += payout
    
    if (payout > 0) {
      winningSpins++
      currentWinStreak++
      currentLossStreak = 0
      
      if (currentWinStreak > longestWinStreak) {
        longestWinStreak = currentWinStreak
      }
      
      // Track biggest win
      if (payout > biggestWin) {
        biggestWin = payout
        biggestWinSpin = spin
        biggestWinCombo = symbols.join(',')
      }
    } else {
      currentLossStreak++
      currentWinStreak = 0
      
      if (currentLossStreak > longestLossStreak) {
        longestLossStreak = currentLossStreak
      }
    }
    
    // Calculate current RTP
    const currentRTP = (totalPayout / totalCost) * 100
    
    // Track RTP extremes
    if (currentRTP < lowestRTP) {
      lowestRTP = currentRTP
      lowestRTPSpin = spin
    }
    if (currentRTP > highestRTP) {
      highestRTP = currentRTP
      highestRTPSpin = spin
    }
    
    // Track house losses (when RTP > 100%)
    if (currentRTP > 100) {
      const houseLoss = totalPayout - totalCost
      if (houseLoss > maxHouseLoss) {
        maxHouseLoss = houseLoss
        maxHouseLossSpin = spin
        maxHouseLossRTP = currentRTP
      }
    }
    
    // Analyze sessions at specific intervals
    if (spin % 100 === 0) {
      const sessionRTP = (sessionPayout100 / sessionCost100) * 100
      const sessionLoss = sessionPayout100 - sessionCost100
      
      if (sessionLoss > sessionAnalysis[100].maxLoss) {
        sessionAnalysis[100].maxLoss = sessionLoss
        sessionAnalysis[100].maxRTP = sessionRTP
        sessionAnalysis[100].worstSession = {
          startSpin: spin - 99,
          endSpin: spin,
          cost: sessionCost100,
          payout: sessionPayout100,
          loss: sessionLoss,
          rtp: sessionRTP
        }
      }
      
      // Reset 100-spin session
      sessionCost100 = 0
      sessionPayout100 = 0
    }
    
    if (spin % 1000 === 0) {
      const sessionRTP = (sessionPayout1000 / sessionCost1000) * 100
      const sessionLoss = sessionPayout1000 - sessionCost1000
      
      if (sessionLoss > sessionAnalysis[1000].maxLoss) {
        sessionAnalysis[1000].maxLoss = sessionLoss
        sessionAnalysis[1000].maxRTP = sessionRTP
        sessionAnalysis[1000].worstSession = {
          startSpin: spin - 999,
          endSpin: spin,
          cost: sessionCost1000,
          payout: sessionPayout1000,
          loss: sessionLoss,
          rtp: sessionRTP
        }
      }
      
      // Reset 1000-spin session
      sessionCost1000 = 0
      sessionPayout1000 = 0
    }
    
    if (spin % 10000 === 0) {
      const sessionRTP = (sessionPayout10000 / sessionCost10000) * 100
      const sessionLoss = sessionPayout10000 - sessionCost10000
      
      if (sessionLoss > sessionAnalysis[10000].maxLoss) {
        sessionAnalysis[10000].maxLoss = sessionLoss
        sessionAnalysis[10000].maxRTP = sessionRTP
        sessionAnalysis[10000].worstSession = {
          startSpin: spin - 9999,
          endSpin: spin,
          cost: sessionCost10000,
          payout: sessionPayout10000,
          loss: sessionLoss,
          rtp: sessionRTP
        }
      }
      
      // Reset 10000-spin session
      sessionCost10000 = 0
      sessionPayout10000 = 0
    }
    
    // Record RTP every 10k spins
    if (spin % 10000 === 0) {
      rtpHistory.push({
        spin: spin,
        rtp: currentRTP,
        totalWins: winningSpins,
        biggestWin: biggestWin,
        houseLoss: totalPayout - totalCost
      })
      
      // Progress indicator
      process.stdout.write(`\r🎰 Spins: ${formatNumber(spin)} | RTP: ${currentRTP.toFixed(2)}% | Wins: ${winningSpins} | Biggest: $${biggestWin.toFixed(2)}`)
    }
  }
  
  const endTime = Date.now()
  const finalRTP = (totalPayout / totalCost) * 100
  const hitFrequency = (winningSpins / totalSpins) * 100
  const finalHouseLoss = totalPayout - totalCost
  
  console.log('\n\n✅ Monte Carlo Simulation Complete!')
  console.log('')
  
  // Main Results
  console.log('📈 MONTE CARLO RESULTS')
  console.log('=' .repeat(40))
  console.log(`🎯 Total Spins: ${formatNumber(totalSpins)}`)
  console.log(`💰 Total Cost: $${formatNumber(totalCost)}`)
  console.log(`🏆 Total Payout: $${formatNumber(totalPayout)}`)
  console.log(`📊 Final RTP: ${finalRTP.toFixed(4)}%`)
  console.log(`🎲 Hit Frequency: ${hitFrequency.toFixed(4)}%`)
  console.log(`⏱️  Simulation Time: ${(endTime - startTime) / 1000}s`)
  console.log('')
  
  // House Loss Analysis
  console.log('🏛️  HOUSE LOSS ANALYSIS')
  console.log('=' .repeat(45))
  if (finalHouseLoss > 0) {
    console.log(`🔴 Final House Loss: $${formatNumber(finalHouseLoss)}`)
    console.log(`💸 House Edge: -${(100 - finalRTP).toFixed(4)}% (NEGATIVE)`)
  } else {
    console.log(`🟢 Final House Profit: $${formatNumber(Math.abs(finalHouseLoss))}`)
    console.log(`💰 House Edge: ${(100 - finalRTP).toFixed(4)}%`)
  }
  console.log(`🔺 Maximum House Loss: $${formatNumber(maxHouseLoss)} at spin ${formatNumber(maxHouseLossSpin)} (${maxHouseLossRTP.toFixed(2)}% RTP)`)
  console.log('')
  
  // Sample Size Risk Analysis
  console.log('⚠️  SAMPLE SIZE RISK ANALYSIS')
  console.log('=' .repeat(50))
  console.log('📊 Worst-case house losses by session size:')
  console.log('')
  
  // Create table header
  console.log('┌─────────────┬──────────────┬──────────────┬──────────────┬────────────────┐')
  console.log('│ Sample Size │ Max Loss ($) │ Max RTP (%)  │ Session Range│ Risk Level     │')
  console.log('├─────────────┼──────────────┼──────────────┼──────────────┼────────────────┤')
  
  for (const [sampleSize, data] of Object.entries(sessionAnalysis)) {
    const size = parseInt(sampleSize)
    const maxLoss = data.maxLoss.toFixed(2)
    const maxRTP = data.maxRTP.toFixed(2)
    const session = data.worstSession
    const sessionRange = session ? `${formatNumber(session.startSpin)}-${formatNumber(session.endSpin)}` : 'N/A'
    
    let riskLevel = ''
    if (data.maxRTP > 150) riskLevel = '🔴 EXTREME'
    else if (data.maxRTP > 120) riskLevel = '🟠 HIGH'
    else if (data.maxRTP > 105) riskLevel = '🟡 MEDIUM'
    else riskLevel = '🟢 LOW'
    
    console.log(`│ ${size.toString().padEnd(11)} │ ${maxLoss.padStart(12)} │ ${maxRTP.padStart(12)} │ ${sessionRange.padEnd(12)} │ ${riskLevel.padEnd(14)} │`)
  }
  
  console.log('└─────────────┴──────────────┴──────────────┴──────────────┴────────────────┘')
  console.log('')
  
  // Detailed worst session analysis
  console.log('💥 WORST SESSION DETAILS')
  console.log('=' .repeat(40))
  for (const [sampleSize, data] of Object.entries(sessionAnalysis)) {
    const session = data.worstSession
    if (session && session.loss > 0) {
      console.log(`📈 ${sampleSize} Spin Sessions:`)
      console.log(`   🎯 Worst Session: Spins ${formatNumber(session.startSpin)}-${formatNumber(session.endSpin)}`)
      console.log(`   💰 Cost: $${formatNumber(session.cost)} | Payout: $${formatNumber(session.payout)}`)
      console.log(`   🔴 House Loss: $${formatNumber(session.loss)} (${session.rtp.toFixed(2)}% RTP)`)
      console.log(`   📊 Impact: ${(session.loss / session.cost * 100).toFixed(2)}% loss on revenue`)
      console.log('')
    } else if (session) {
      console.log(`📈 ${sampleSize} Spin Sessions:`)
      console.log(`   ✅ Best Session: Spins ${formatNumber(session.startSpin)}-${formatNumber(session.endSpin)}`)
      console.log(`   💰 Cost: $${formatNumber(session.cost)} | Payout: $${formatNumber(session.payout)}`)
      console.log(`   🟢 House Profit: $${formatNumber(Math.abs(session.loss))} (${session.rtp.toFixed(2)}% RTP)`)
      console.log('')
    }
  }
  
  // Session size comparison
  console.log('📊 SESSION SIZE COMPARISON')
  console.log('=' .repeat(40))
  console.log('Risk decreases significantly with larger sample sizes:')
  console.log('')
  for (const [sampleSize, data] of Object.entries(sessionAnalysis)) {
    const session = data.worstSession
    if (session) {
      const riskMultiplier = session.rtp / 100
      console.log(`• ${sampleSize.padEnd(6)} spins: ${riskMultiplier.toFixed(1)}x risk (${session.rtp.toFixed(1)}% max RTP)`)
    }
  }
  console.log('')
  
  // RTP Variance Analysis
  console.log('📉 RTP VARIANCE ANALYSIS')
  console.log('=' .repeat(40))
  console.log(`🔻 Lowest RTP: ${lowestRTP.toFixed(4)}% (at spin ${formatNumber(lowestRTPSpin)})`)
  console.log(`🔺 Highest RTP: ${highestRTP.toFixed(4)}% (at spin ${formatNumber(highestRTPSpin)})`)
  console.log(`📏 RTP Range: ${(highestRTP - lowestRTP).toFixed(4)}%`)
  console.log(`🎯 Final vs Theoretical: ${finalRTP.toFixed(2)}% vs ~99.40%`)
  console.log('')
  
  // Casino Risk Assessment
  console.log('🏛️  CASINO RISK ASSESSMENT')
  console.log('=' .repeat(40))
  console.log(`💡 Key Risk Insights:`)
  console.log(`   • Small sessions (100-1000 spins) have extreme variance`)
  console.log(`   • House can lose ${((sessionAnalysis['100'].maxRTP - 100)).toFixed(0)}%+ of revenue in worst 100-spin sessions`)
  console.log(`   • Risk decreases significantly with larger sample sizes`)
  console.log(`   • Current math model favors players (99.4% RTP too high)`)
  console.log('')
  console.log(`📊 Recommended Actions:`)
  console.log(`   • Consider lowering base payouts by 1-2% to achieve 97-98% RTP`)
  console.log(`   • Implement betting limits for risk management`)
  console.log(`   • Monitor short-term session performance closely`)
  console.log('')
  
  // Win Analysis
  console.log('🏆 WIN ANALYSIS')
  console.log('=' .repeat(30))
  console.log(`💎 Biggest Win: $${biggestWin.toFixed(2)} (${biggestWinCombo}) at spin ${formatNumber(biggestWinSpin)}`)
  console.log(`🔥 Longest Win Streak: ${longestWinStreak} spins`)
  console.log(`❄️  Longest Loss Streak: ${longestLossStreak} spins`)
  console.log(`📊 Average Win: $${(totalPayout / winningSpins).toFixed(2)}`)
  console.log('')
  
  // RTP Timeline (every 100k spins)
  console.log('📈 RTP EVOLUTION (Every 100K Spins)')
  console.log('=' .repeat(45))
  for (let i = 9; i < rtpHistory.length; i += 10) {
    const data = rtpHistory[i]
    const lossStatus = data.houseLoss > 0 ? '🔴' : '🟢'
    console.log(`${formatNumber(data.spin).padStart(9)} spins | RTP: ${data.rtp.toFixed(2)}% | ${lossStatus} Loss: $${formatNumber(Math.abs(data.houseLoss))}`)
  }
  console.log('')
  
  // Statistical Summary
  console.log('📊 STATISTICAL SUMMARY')
  console.log('=' .repeat(35))
  console.log(`Expected Value: $${(finalRTP / 100).toFixed(4)} per $1 bet`)
  console.log(`House Edge: ${(100 - finalRTP).toFixed(4)}%`)
  console.log(`Win Rate: 1 in ${Math.round(100 / hitFrequency)} spins`)
  if (biggestWinCombo === 'BG,BG,BG') {
    console.log(`🎰 Jackpot Hit: YES! Once in ${formatNumber(totalSpins)} spins`)
  } else {
    console.log(`🎰 Jackpot Hit: No jackpots in ${formatNumber(totalSpins)} spins`)
  }
}

// Main analysis function
function analyzeRTP() {
  console.log('🎰 BLACK GOLD SLOT MACHINE - RTP ANALYSIS')
  console.log('=' .repeat(60))
  console.log(`📊 Testing all ${72 * 72 * 72} possible combinations...`)
  console.log('')
  
  let totalSpins = 0
  let totalCost = 0
  let totalPayout = 0
  let winningSpins = 0
  
  // Track winning combinations
  const winCombinations = {}
  const payoutDistribution = {}
  
  const startTime = Date.now()
  
  // Test every possible combination
  for (let r1 = 0; r1 < 72; r1++) {
    for (let r2 = 0; r2 < 72; r2++) {
      for (let r3 = 0; r3 < 72; r3++) {
        const symbols = [reel1[r1], reel2[r2], reel3[r3]]
        const payout = calculatePayout(symbols, 1.00)
        
        totalSpins++
        totalCost += 1.00
        totalPayout += payout
        
        if (payout > 0) {
          winningSpins++
          const combo = symbols.join(',')
          winCombinations[combo] = (winCombinations[combo] || 0) + 1
          
          const payoutKey = `$${payout.toFixed(2)}`
          payoutDistribution[payoutKey] = (payoutDistribution[payoutKey] || 0) + 1
        }
        
        // Progress indicator
        if (totalSpins % 50000 === 0) {
          process.stdout.write(`\r⚡ Processed: ${formatNumber(totalSpins)} combinations...`)
        }
      }
    }
  }
  
  const endTime = Date.now()
  const rtp = (totalPayout / totalCost) * 100
  const hitFrequency = (winningSpins / totalSpins) * 100
  
  console.log('\r✅ Analysis Complete!')
  console.log('')
  
  // Main Results
  console.log('📈 SUMMARY RESULTS')
  console.log('=' .repeat(40))
  console.log(`🎯 Total Combinations Tested: ${formatNumber(totalSpins)}`)
  console.log(`💰 Total Cost (@ $1.00/spin): $${formatNumber(totalCost)}`)
  console.log(`🏆 Total Payout: $${formatNumber(totalPayout)}`)
  console.log(`📊 RTP (Return to Player): ${rtp.toFixed(4)}%`)
  console.log(`🎲 Hit Frequency: ${hitFrequency.toFixed(4)}%`)
  console.log(`⏱️  Processing Time: ${(endTime - startTime) / 1000}s`)
  console.log('')
  
  // Payout Distribution
  console.log('💸 PAYOUT DISTRIBUTION')
  console.log('=' .repeat(40))
  const sortedPayouts = Object.entries(payoutDistribution)
    .sort(([a], [b]) => parseFloat(b.slice(1)) - parseFloat(a.slice(1)))
  
  for (const [payout, count] of sortedPayouts) {
    const percentage = (count / totalSpins * 100).toFixed(4)
    console.log(`${payout.padEnd(12)} | ${formatNumber(count).padStart(8)} times | ${percentage.padStart(8)}%`)
  }
  console.log('')
  
  // Top Winning Combinations
  console.log('🏆 TOP WINNING COMBINATIONS')
  console.log('=' .repeat(50))
  const sortedCombinations = Object.entries(winCombinations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
  
  for (const [combo, count] of sortedCombinations) {
    const symbols = combo.split(',')
    const payout = calculatePayout(symbols, 1.00)
    const percentage = (count / totalSpins * 100).toFixed(4)
    console.log(`${combo.padEnd(15)} | $${payout.toFixed(2).padStart(7)} | ${formatNumber(count).padStart(8)} times | ${percentage.padStart(8)}%`)
  }
  console.log('')
  
  // Theoretical vs Actual
  console.log('🎯 THEORETICAL VS ACTUAL')
  console.log('=' .repeat(30))
  console.log(`Expected RTP: ~97.83%`)
  console.log(`Actual RTP:   ${rtp.toFixed(4)}%`)
  console.log(`Expected Hit Frequency: ~13.82%`)
  console.log(`Actual Hit Frequency:   ${hitFrequency.toFixed(4)}%`)
  console.log('')
  
  // Validation
  if (Math.abs(rtp - 97.83) < 0.01) {
    console.log('✅ RTP matches expected value!')
  } else {
    console.log('⚠️  RTP differs from expected value')
  }
  
  if (Math.abs(hitFrequency - 13.82) < 0.01) {
    console.log('✅ Hit frequency matches expected value!')
  } else {
    console.log('⚠️  Hit frequency differs from expected value')
  }
}

// Run both analyses
console.clear()
console.log('🎰 BLACK GOLD S62M3X-XX COMPREHENSIVE ANALYSIS')
console.log('=' .repeat(60))
console.log('📋 Running mathematical analysis + Monte Carlo simulation...')
console.log('')

// First run complete mathematical analysis
analyzeRTP()

// Then run Monte Carlo simulation
runMonteCarloSimulation()

console.log('\n🎉 ALL ANALYSES COMPLETE!')
console.log('=' .repeat(50))
console.log('💡 Use these results to understand slot variance and player experience.')
console.log('📊 The Monte Carlo simulation shows real-world RTP fluctuations.')
console.log('🎯 Both analyses should converge around the same theoretical RTP.')
console.log('') 