// Test script for different strategic placement scenarios
console.log('🎯 STRATEGIC JACKPOT PLACEMENT SCENARIOS TEST')
console.log('=' .repeat(60))

// Shuffle array function
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate display reel with specific jackpot and blank counts
const generateDisplayReelWithCounts = (jackpotCount, blankCount) => {
  const reel = new Array(32).fill('')
  
  // Step 1: Place blanks ensuring no adjacency
  const blankPositions = []
  while (blankPositions.length < blankCount) {
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
  
  // Step 3: Strategic jackpot placement - place as many as possible above blanks
  const strategicJackpots = Math.min(validAboveBlanks.length, jackpotCount)
  const strategicPositions = []
  
  for (let i = 0; i < strategicJackpots; i++) {
    reel[validAboveBlanks[i]] = 'BG'
    strategicPositions.push(validAboveBlanks[i])
  }
  
  // Step 4: Get remaining available positions
  const availablePositions = []
  for (let i = 0; i < 32; i++) {
    if (reel[i] === '') {
      availablePositions.push(i)
    }
  }
  
  // Step 5: Place remaining required symbols
  const requiredSymbols = ['1C', '2C', '3C']
  
  // Add remaining BG symbols if needed
  const remainingBG = jackpotCount - strategicJackpots
  for (let i = 0; i < remainingBG; i++) {
    requiredSymbols.push('BG')
  }
  
  // Shuffle available positions and place required symbols
  const tempPositions = [...availablePositions]
  const shuffledPositions = []
  while (tempPositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * tempPositions.length)
    shuffledPositions.push(tempPositions.splice(randomIndex, 1)[0])
  }
  
  for (let i = 0; i < requiredSymbols.length && i < shuffledPositions.length; i++) {
    const position = shuffledPositions[i]
    reel[position] = requiredSymbols[i]
  }
  
  // Step 6: Fill remaining positions with duplicates
  const remainingPositions = []
  for (let i = 0; i < 32; i++) {
    if (reel[i] === '') {
      remainingPositions.push(i)
    }
  }
  
  // Create appropriate duplicate pool
  const duplicateSymbols = []
  const remainingCount = remainingPositions.length
  
  // Calculate proportional distribution
  const proportion1C = Math.ceil(remainingCount * 0.5) // 50% 1C
  const proportion2C = Math.ceil(remainingCount * 0.3) // 30% 2C  
  const proportion3C = Math.ceil(remainingCount * 0.2) // 20% 3C
  
  for (let i = 0; i < proportion1C && duplicateSymbols.length < remainingCount; i++) {
    duplicateSymbols.push('1C')
  }
  for (let i = 0; i < proportion2C && duplicateSymbols.length < remainingCount; i++) {
    duplicateSymbols.push('2C')
  }
  for (let i = 0; i < proportion3C && duplicateSymbols.length < remainingCount; i++) {
    duplicateSymbols.push('3C')
  }
  
  // Fill any remaining slots with 1C
  while (duplicateSymbols.length < remainingCount) {
    duplicateSymbols.push('1C')
  }
  
  // Shuffle and fill remaining positions
  const shuffledDuplicates = shuffleArray(duplicateSymbols)
  
  for (let i = 0; i < remainingPositions.length && i < shuffledDuplicates.length; i++) {
    reel[remainingPositions[i]] = shuffledDuplicates[i]
  }
  
  return reel
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

// Test specific scenarios
const testScenario = (jackpots, blanks, description) => {
  console.log(`\n🎲 SCENARIO: ${description}`)
  console.log('─'.repeat(50))
  console.log(`Jackpots: ${jackpots}, Blanks: ${blanks}`)
  
  const results = {
    perfect: 0,
    good: 0,
    poor: 0,
    efficiencies: []
  }
  
  const testCount = 100
  
  for (let i = 0; i < testCount; i++) {
    const reel = generateDisplayReelWithCounts(jackpots, blanks)
    const strategic = validateStrategicJackpotPlacement(reel)
    
    const efficiency = strategic.strategicPlacements / strategic.blanks.length
    results.efficiencies.push(efficiency)
    
    if (efficiency === 1.0) {
      results.perfect++
    } else if (efficiency >= 0.6) {
      results.good++
    } else {
      results.poor++
    }
  }
  
  const avgEfficiency = (results.efficiencies.reduce((a, b) => a + b, 0) / testCount * 100).toFixed(1)
  const maxEfficiency = (Math.max(...results.efficiencies) * 100).toFixed(1)
  
  console.log(`📊 Results (${testCount} tests):`)
  console.log(`  Perfect (100%): ${results.perfect}/${testCount} (${(results.perfect/testCount*100).toFixed(1)}%)`)
  console.log(`  Good (60%+): ${results.good}/${testCount} (${(results.good/testCount*100).toFixed(1)}%)`)
  console.log(`  Poor (<60%): ${results.poor}/${testCount} (${(results.poor/testCount*100).toFixed(1)}%)`)
  console.log(`  Average Efficiency: ${avgEfficiency}%`)
  console.log(`  Maximum Efficiency: ${maxEfficiency}%`)
  
  // Show a sample reel
  const sampleReel = generateDisplayReelWithCounts(jackpots, blanks)
  const sampleAnalysis = validateStrategicJackpotPlacement(sampleReel)
  
  console.log(`\n📝 Sample Reel Analysis:`)
  console.log(`  Strategic Placements: ${sampleAnalysis.strategicPlacements}/${sampleAnalysis.blanks.length}`)
  sampleAnalysis.analysis.forEach(line => console.log(`    ${line}`))
  
  return results
}

// Run the requested scenarios
console.log('Testing user-requested scenarios:\n')

// Scenario 1: 2 jackpots, 2 blanks - should be 100% efficiency
testScenario(2, 2, '2 Jackpots + 2 Blanks (Each blank should have jackpot above)')

// Scenario 2: 3 jackpots, 2 blanks - should be 100% efficiency 
testScenario(3, 2, '3 Jackpots + 2 Blanks (Each blank should have jackpot above, 1 extra random)')

// Scenario 3: 1 jackpot, 2 blanks - only one blank gets jackpot above
testScenario(1, 2, '1 Jackpot + 2 Blanks (Only one blank gets jackpot above)')

// Additional scenarios for completeness
testScenario(4, 3, '4 Jackpots + 3 Blanks (Should maximize strategic placement)')
testScenario(2, 5, '2 Jackpots + 5 Blanks (Limited jackpots, many blanks)')

console.log('\n🎯 STRATEGIC PLACEMENT SUMMARY')
console.log('=' .repeat(60))
console.log('The algorithm prioritizes placing jackpots above blanks when possible.')
console.log('Success depends on the ratio of jackpots to blanks and positioning constraints.')
console.log('For optimal near-miss effects, consider adjusting jackpot/blank ratios per scenario.') 