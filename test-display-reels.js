// Test script for display reel generation
console.log('🎰 DISPLAY REEL GENERATION TEST')
console.log('=' .repeat(50))

// Shuffle array function
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate display reel (32 symbols) for smooth animation
const generateDisplayReel = () => {
  const reel = new Array(32).fill('')
  
  // Step 1: Place 5 blank symbols ensuring no adjacency
  const blankPositions = []
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
  
  // Step 2: Get all non-blank positions (27 positions remaining)
  const availablePositions = []
  for (let i = 0; i < 32; i++) {
    if (reel[i] === '') {
      availablePositions.push(i)
    }
  }
  
  // Step 3: Place exactly 1 of each required symbol first (guaranteed)
  const requiredSymbols = ['1C', '2C', '3C', 'BG']
  
  // Shuffle positions for random placement
  const shuffledPositions = []
  const tempPositions = [...availablePositions]
  while (tempPositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * tempPositions.length)
    shuffledPositions.push(tempPositions.splice(randomIndex, 1)[0])
  }
  
  requiredSymbols.forEach((symbol, index) => {
    const position = shuffledPositions[index]
    reel[position] = symbol
  })
  
  // Step 4: Fill remaining 23 positions with duplicates using weighted distribution
  const remainingPositions = shuffledPositions.slice(4) // Skip the 4 positions we just filled
  const duplicateSymbols = [
    ...Array(10).fill('1C'), // Most common - total will be 11
    ...Array(7).fill('2C'),  // Medium - total will be 8
    ...Array(4).fill('3C'),  // Less common - total will be 5  
    ...Array(2).fill('BG'),  // Rare - total will be 3
  ] // Total: 23 symbols
  
  // Shuffle the duplicate symbols
  const shuffledDuplicates = shuffleArray(duplicateSymbols)
  
  // Place duplicates in remaining positions
  remainingPositions.forEach((position, index) => {
    reel[position] = shuffledDuplicates[index]
  })
  
  return reel
}

// Test function
const testDisplayReels = () => {
  console.log('🔧 Testing display reel generation...\n')
  
  // Generate 3 test reels
  for (let reelNum = 1; reelNum <= 3; reelNum++) {
    console.log(`📊 REEL ${reelNum}:`)
    console.log('-' .repeat(30))
    
    const reel = generateDisplayReel()
    
    // Verify length
    console.log(`Length: ${reel.length} symbols`)
    
    // Count symbol types
    const counts = {}
    reel.forEach(symbol => {
      counts[symbol] = (counts[symbol] || 0) + 1
    })
    
    console.log('Symbol Distribution:')
    Object.entries(counts).forEach(([symbol, count]) => {
      const percentage = (count / 32 * 100).toFixed(1)
      console.log(`  ${symbol}: ${count} symbols (${percentage}%)`)
    })
    
    // Check blank adjacency
    let adjacentBlanks = 0
    for (let i = 0; i < reel.length; i++) {
      const current = reel[i]
      const next = reel[(i + 1) % reel.length]
      if (current === '--' && next === '--') {
        adjacentBlanks++
      }
    }
    
    console.log(`Adjacent blanks: ${adjacentBlanks} (should be 0)`)
    
    // Strategic jackpot placement analysis
    const strategicAnalysis = validateStrategicJackpotPlacement(reel)
    console.log(`Strategic placements: ${strategicAnalysis.strategicPlacements}/${strategicAnalysis.blanks.length} blanks have jackpots above`)
    console.log(`Efficiency: ${((strategicAnalysis.strategicPlacements / strategicAnalysis.blanks.length) * 100).toFixed(1)}%`)
    
    if (strategicAnalysis.analysis.length > 0) {
      console.log('Strategic Analysis:')
      strategicAnalysis.analysis.forEach(line => console.log(`  ${line}`))
    }
    
    // Display reel visually
    console.log('Visual representation:')
    console.log(reel.map((symbol, i) => `${i.toString().padStart(2)}:${symbol}`).join(' '))
    
    console.log('')
  }
}

// Validation function
const validateDisplayReel = (reel) => {
  const issues = []
  
  // Check length
  if (reel.length !== 32) {
    issues.push(`Wrong length: ${reel.length} (expected 32)`)
  }
  
  // Check minimum symbol requirements
  const symbols = ['1C', '2C', '3C', 'BG']
  symbols.forEach(symbol => {
    if (!reel.includes(symbol)) {
      issues.push(`Missing required symbol: ${symbol}`)
    }
  })
  
  // Check blank count
  const blankCount = reel.filter(symbol => symbol === '--').length
  if (blankCount !== 5) {
    issues.push(`Wrong blank count: ${blankCount} (expected 5)`)
  }
  
  // Check blank adjacency
  for (let i = 0; i < reel.length; i++) {
    const current = reel[i]
    const next = reel[(i + 1) % reel.length]
    if (current === '--' && next === '--') {
      issues.push(`Adjacent blanks found at positions ${i} and ${(i + 1) % reel.length}`)
    }
  }
  
  return issues
}

// Strategic jackpot placement validation
const validateStrategicJackpotPlacement = (reel) => {
  const results = {
    blanks: [],
    jackpots: [],
    strategicPlacements: 0,
    missedOpportunities: 0,
    analysis: []
  }
  
  // Find all blank positions
  for (let i = 0; i < reel.length; i++) {
    if (reel[i] === '--') {
      results.blanks.push(i)
    } else if (reel[i] === 'BG') {
      results.jackpots.push(i)
    }
  }
  
  // Check each blank for jackpot above it
  results.blanks.forEach(blankPos => {
    const abovePos = (blankPos - 1 + 32) % 32
    const symbolAbove = reel[abovePos]
    
    if (symbolAbove === 'BG') {
      results.strategicPlacements++
      results.analysis.push(`✅ Blank at pos ${blankPos} has jackpot above at pos ${abovePos}`)
    } else {
      results.missedOpportunities++
      results.analysis.push(`❌ Blank at pos ${blankPos} has ${symbolAbove} above at pos ${abovePos}`)
    }
  })
  
  return results
}

// Run comprehensive test
const runComprehensiveTest = () => {
  console.log('🧪 COMPREHENSIVE VALIDATION TEST')
  console.log('=' .repeat(50))
  
  let totalTests = 100
  let passedTests = 0
  
  for (let i = 0; i < totalTests; i++) {
    const reel = generateDisplayReel()
    const issues = validateDisplayReel(reel)
    
    if (issues.length === 0) {
      passedTests++
    } else {
      console.log(`❌ Test ${i + 1} failed:`)
      issues.forEach(issue => console.log(`   - ${issue}`))
    }
  }
  
  console.log(`\n📈 TEST RESULTS:`)
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(1)}%)`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Display reel generation is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the algorithm.')
  }
}

// Strategic placement comprehensive test
const runStrategicPlacementTest = () => {
  console.log('🎯 STRATEGIC JACKPOT PLACEMENT TEST')
  console.log('=' .repeat(50))
  
  const testResults = {
    totalTests: 1000,
    perfectPlacements: 0,
    goodPlacements: 0,
    poorPlacements: 0,
    placementStats: []
  }
  
  for (let i = 0; i < testResults.totalTests; i++) {
    const reel = generateDisplayReel()
    const strategic = validateStrategicJackpotPlacement(reel)
    
    const efficiency = strategic.strategicPlacements / strategic.blanks.length
    testResults.placementStats.push({
      blanks: strategic.blanks.length,
      jackpots: strategic.jackpots.length,
      placements: strategic.strategicPlacements,
      efficiency: efficiency
    })
    
    if (efficiency === 1.0) {
      testResults.perfectPlacements++
    } else if (efficiency >= 0.6) {
      testResults.goodPlacements++
    } else {
      testResults.poorPlacements++
    }
  }
  
  // Analyze scenarios
  const scenarios = {}
  testResults.placementStats.forEach(stat => {
    const key = `${stat.jackpots}J${stat.blanks}B`
    if (!scenarios[key]) {
      scenarios[key] = { count: 0, totalEfficiency: 0, maxPlacements: 0 }
    }
    scenarios[key].count++
    scenarios[key].totalEfficiency += stat.efficiency
    scenarios[key].maxPlacements = Math.max(scenarios[key].maxPlacements, stat.placements)
  })
  
  console.log('📊 SCENARIO ANALYSIS:')
  Object.entries(scenarios).forEach(([scenario, data]) => {
    const avgEfficiency = (data.totalEfficiency / data.count * 100).toFixed(1)
    console.log(`${scenario}: ${data.count} tests, ${avgEfficiency}% avg efficiency, max ${data.maxPlacements} placements`)
  })
  
  console.log('\n📈 OVERALL RESULTS:')
  console.log(`Perfect Placements (100%): ${testResults.perfectPlacements}/${testResults.totalTests} (${(testResults.perfectPlacements/testResults.totalTests*100).toFixed(1)}%)`)
  console.log(`Good Placements (60%+): ${testResults.goodPlacements}/${testResults.totalTests} (${(testResults.goodPlacements/testResults.totalTests*100).toFixed(1)}%)`)
  console.log(`Poor Placements (<60%): ${testResults.poorPlacements}/${testResults.totalTests} (${(testResults.poorPlacements/testResults.totalTests*100).toFixed(1)}%)`)
  
  // Test specific scenarios as requested
  console.log('\n🔍 SCENARIO-SPECIFIC TESTS:')
  
  // Current implementation always has 3 jackpots and 5 blanks
  // We should be able to place jackpots above at least 2-3 blanks consistently
  
  // Test scenario: 3 jackpots, 2 blanks - should be 100% efficiency  
  console.log('Testing scenario: 3 jackpots, 5 blanks (current implementation)')
  let perfectCount = 0
  let goodCount = 0
  for (let i = 0; i < 100; i++) {
    const reel = generateDisplayReel()
    const strategic = validateStrategicJackpotPlacement(reel)
    const efficiency = strategic.strategicPlacements / strategic.blanks.length
    if (efficiency === 1.0) perfectCount++
    else if (efficiency >= 0.4) goodCount++ // 2/5 blanks
  }
  console.log(`3J5B Results: ${perfectCount}% perfect, ${goodCount}% good (≥40%)`)
  
  if (testResults.perfectPlacements >= testResults.totalTests * 0.6) {
    console.log('\n🎉 Strategic placement is working well!')
  } else {
    console.log('\n⚠️  Strategic placement needs improvement.')
  }
}

// Run tests
testDisplayReels()
runComprehensiveTest()
runStrategicPlacementTest() 