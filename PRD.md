# Product Requirements Document (PRD) - Crypto Slots

## Project Overview

**Product Name**: Crypto Slots  
**Version**: 2.0.0  
**Last Updated**: Realistic Slot Machine Logic Implemented with Black Gold Configuration  
**Status**: Core Logic Complete - Realistic Slot Machine Ready for Testing

## Vision

A realistic slot machine game based on authentic casino mechanics, specifically implementing the **Black Gold S62M3X-XX** configuration with 95.13% RTP. The game focuses on authentic slot machine behavior with proper reel strips, weighted symbols, and realistic payout structures that mirror real casino slot machines.

**Core Philosophy**: Authenticity over flashiness - realistic slot machine mechanics with proper mathematical models and genuine casino-style gameplay.

## Game Configuration - Black Gold S62M3X-XX

### Machine Specifications
- **Model**: S62M3X-XX  
- **Expected RTP**: 95.13%  
- **Maximum Coins**: 2  
- **Total Combinations**: 373,248  
- **Hit Frequency**: 11.45%  
- **Paylines**: Center line only  

### Symbol System
- **1**: Single Bar (═)  
- **2**: Double Bar (══)  
- **3**: Triple Bar (═══)  
- **J**: Black Gold/Jackpot (★)  
- **B**: Blank (·)  

### Reel Strip Configuration (72 positions each)
**Reel 1**: 16×Single Bar, 13×Double Bar, 6×Triple Bar, 1×Jackpot, 36×Blank  
**Reel 2**: 18×Single Bar, 7×Double Bar, 4×Triple Bar, 1×Jackpot, 42×Blank  
**Reel 3**: 20×Single Bar, 4×Double Bar, 3×Triple Bar, 1×Jackpot, 44×Blank  

### Payout Table (2-coin base bet)
- **J J J**: 8000 coins (JACKPOT)
- **3 3 3**: 229 coins  
- **3 J J / J 3 J / J J 3**: 240 coins  
- **3 3 J / 3 J 3 / J 3 3**: 234 coins  
- **2 2 2**: 200 coins  
- **2 J J / J 2 J / J J 2**: 210 coins  
- **2 2 J / 2 J 2 / J 2 2**: 204 coins  
- **1 1 1**: 40 coins  
- **1 J J / J 1 J / J J 1**: 50 coins  
- **1 1 J / 1 J 1 / J 1 1**: 44 coins  
- **Any Bar × 3**: 10 coins  
- **Any Bar × 2 + J**: 14 coins  
- **J J B / B J J / J B J**: 10 coins  
- **J B B / B B J / B J B**: 4 coins  

## Core Features

### Phase 1 - Realistic Game Logic ✅ COMPLETE
- **Authentic Slot Machine**: Based on real Black Gold S62M3X-XX configuration
- **Proper Reel Strips**: 72-position strips with accurate symbol distributions
- **Mathematical Accuracy**: True 95.13% RTP with proper weighted outcomes
- **Static Display**: Clean, functional interface without distracting animations
- **Betting System**: $0.01 to $2.00 with proper payout scaling

### Phase 2 - Enhanced Features
- **User Authentication**: Sign up/login system using NextAuth
- **User Profiles**: Track wins, losses, session statistics
- **Responsive Design**: Mobile-first optimization
- **Sound Effects**: Authentic casino audio feedback
- **Simple Animations**: Subtle, realistic slot machine effects

### Phase 3 - Advanced Features
- **Multiple Machines**: Different authentic slot configurations
- **Progressive Features**: Bonus rounds and special features
- **Analytics**: Detailed gameplay statistics and RTP verification
- **Social Features**: Leaderboards and achievements

## Technical Requirements

### Stack
- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **State Management**: Zustand for game logic
- **Animation**: GSAP (currently disabled for core logic focus)
- **Canvas Rendering**: HTML5 Canvas for slot display
- **Backend**: Next.js API routes (future), MongoDB with Mongoose

### Key Technical Decisions
- **Authenticity First**: All game mechanics based on real slot machine mathematics
- **Mathematical Accuracy**: Proper RNG and weighted symbol selection
- **TypeScript**: Full type safety for complex game logic
- **Canvas-based Rendering**: Efficient symbol display and future animation support
- **Modular Architecture**: Easy to extend with multiple machine configurations

## Current Implementation

### Game Store Architecture
```typescript
// Proper reel strips with exact symbol distributions
const REEL_STRIPS = {
  reel1: [16×'1', 13×'2', 6×'3', 1×'J', 36×'B'], // 72 total
  reel2: [18×'1', 7×'2', 4×'3', 1×'J', 42×'B'],  // 72 total  
  reel3: [20×'1', 4×'2', 3×'3', 1×'J', 44×'B']   // 72 total
}

// Authentic payout logic with exact combinations
const PAYOUT_TABLE = [
  // 30+ authentic winning combinations with proper payouts
]
```

### Visual Implementation
- **Canvas-based Display**: Smooth symbol rendering with distinct colors
- **Symbol Styling**: 
  - Single Bar: Green (═)
  - Double Bar: Yellow (══)  
  - Triple Bar: Orange (═══)
  - Jackpot: Gold (★)
  - Blank: Gray (·)
- **Win Highlighting**: Gold background for winning center line
- **Combination Display**: Shows winning combination name and payout

## Current Progress

### Completed ✅
- [x] **REALISTIC SLOT MACHINE CORE COMPLETE**
  - [x] Black Gold S62M3X-XX configuration implemented
  - [x] Authentic 72-position reel strips with proper distributions
  - [x] Complete payout table with 30+ winning combinations
  - [x] Proper RNG using authentic reel strip selection
  - [x] Mathematical accuracy: True 95.13% RTP potential
  - [x] Betting system: $0.01 to $2.00 with proper scaling
  - [x] Static canvas display with clean symbol visualization
  - [x] Win detection and payout calculation
  - [x] Game state management with Zustand
  - [x] TypeScript implementation for type safety

### Currently Testing 🧪
- [x] Mathematical accuracy verification
- [x] Payout calculation testing across all combinations
- [x] RNG distribution validation
- [x] Cross-browser compatibility
- [x] Mobile responsiveness

### Next Steps - Phase 2 Enhancement
- [ ] **Add subtle, realistic animations**
  - [ ] Simple reel spinning with authentic timing
  - [ ] Basic symbol highlighting for wins
  - [ ] Smooth button press feedback
- [ ] **Sound integration**
  - [ ] Authentic casino sound effects
  - [ ] Audio feedback for wins and button presses
- [ ] **User authentication** (NextAuth integration)
- [ ] **Session statistics** and win/loss tracking
- [ ] **Responsive design** optimization

## Development Phases

### Phase 1 (Core Logic) ✅ COMPLETE
- [x] Authentic slot machine mathematical model
- [x] Proper reel strip implementation  
- [x] Complete payout system
- [x] Game state management
- [x] Static visual display

### Phase 2 (User Experience) - Week 1-2
- [ ] Subtle animation implementation
- [ ] Sound effects integration
- [ ] User authentication system
- [ ] Responsive design polish
- [ ] Session tracking

### Phase 3 (Features) - Week 3-4  
- [ ] Multiple machine configurations
- [ ] User profiles and statistics
- [ ] Advanced features and bonus rounds
- [ ] Performance optimization

## Success Metrics

### Mathematical Accuracy KPIs
- **RTP Verification**: Simulated play should approach 95.13% over large samples
- **Hit Frequency**: ~11.45% of spins should result in wins
- **Payout Distribution**: Matches authentic Black Gold machine behavior
- **Symbol Distribution**: Reel strips produce expected symbol frequencies

### Technical KPIs
- **Mathematical Precision**: 100% accurate payout calculations
- **Performance**: <100ms spin resolution time
- **Reliability**: 99.9% uptime with no calculation errors
- **Compatibility**: Works across all modern browsers and devices

### User Experience KPIs (Future)
- **Session Length**: Realistic casino-style engagement
- **User Retention**: Players returning for authentic slot experience
- **Feature Usage**: Engagement with statistics and tracking features

## Risk Assessment

### Technical Risks
- **Mathematical Accuracy**: Risk of RNG bias or payout calculation errors
  - *Mitigation*: Extensive testing and mathematical verification
- **Performance**: Complex payout logic affecting response time
  - *Mitigation*: Optimized algorithms and caching strategies
- **Compliance**: Ensuring authentic casino mathematics for potential real-money use
  - *Mitigation*: Based on documented real machine configuration

### Business Risks
- **Legal Compliance**: Gambling regulations in different jurisdictions
  - *Mitigation*: Current implementation uses play money only
- **User Expectations**: Players expecting flashy effects over authenticity
  - *Mitigation*: Focus on users who appreciate realistic casino experience

## File Structure

```
src/
├── store/
│   └── gameStore.ts          # Complete game logic with authentic mechanics
├── components/
│   ├── SlotMachine.tsx       # Main slot machine container
│   ├── SlotCanvas.tsx        # Canvas-based symbol display (no animations)
│   └── GameUI.tsx            # Betting controls and win display
```

## Dependencies

### Core Libraries
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety for complex game logic
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Styling and responsive design
- **GSAP**: Animation library (currently disabled)

### Mathematical Implementation
- **Proper RNG**: JavaScript Math.random() with weighted selection
- **Exact Symbol Distributions**: Array-based reel strips with shuffling
- **Payout Engine**: Pattern matching with exact Black Gold payouts
- **Bet Scaling**: Proportional payouts from 2-coin base table

## Future Enhancements

### Authentic Casino Features
- **Multiple Machines**: Implement other real slot configurations
- **Bonus Features**: Authentic casino bonus rounds and special features
- **Progressive Jackpots**: Network-style progressive systems
- **Statistics Tracking**: RTP verification and session analytics

### Technical Improvements
- **RNG Verification**: Cryptographic RNG for enhanced fairness
- **Mathematical Testing**: Automated testing of RTP and distribution
- **Performance Optimization**: Faster payout calculation and display
- **Animation System**: Realistic slot machine motion and timing 