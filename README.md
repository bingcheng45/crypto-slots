# Crypto Slots

A modern crypto-themed slot machine game built with Next.js 14, featuring buttery-smooth GSAP animations and responsive design. Experience the smoothest slot machine animations on the web!

## ✨ Features

- 🎰 **Smooth 60fps Animations** - Canvas + GSAP powered slot machine
- 💰 **Crypto-themed Symbols** - Bitcoin, Ethereum, and crypto coins
- 📱 **Fully Responsive** - Works perfectly on PC, tablet, and mobile
- ⚡ **Instant Feedback** - <16ms button response time
- 🎨 **Beautiful UI** - Modern crypto/neon aesthetic with gradients
- 🎵 **Audio Ready** - Prepared for immersive sound integration

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router & TypeScript
- **Animations**: GSAP (GreenSock) for professional slot mechanics
- **Rendering**: HTML5 Canvas for 60fps reel animations
- **State**: Zustand for game state management
- **Styling**: Tailwind CSS for responsive design
- **Audio**: Howler.js (ready for integration)

## 🎮 MVP Features

- ✅ Single responsive slot machine
- ✅ 3-reel crypto-themed gameplay
- ✅ Smooth GSAP-powered animations
- ✅ Virtual currency system
- ✅ Win detection and celebration
- ✅ Responsive betting controls
- ✅ Mobile-optimized touch interactions

## 🛠 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto_slots2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Responsive Design

- **Desktop** (1024px+): Large centered slot machine
- **Tablet** (768px-1023px): Medium slot machine with touch controls
- **Mobile** (320px-767px): Full-width optimized for thumb interaction

## 🎯 Performance Goals

- **60fps** during all gameplay animations
- **<16ms** input lag for button interactions
- **<2 seconds** initial load time
- **Smooth operation** on mobile devices

## 🎰 Game Mechanics

### Symbols & Payouts
- **₿ Bitcoin**: 100x bet (highest)
- **Ξ Ethereum**: 80x bet
- **◈ Diamond**: 60x bet
- **🪙 Coin**: 40x bet
- **💎 Gem**: 30x bet
- **⚡ Lightning**: 20x bet
- **🌟 Star**: 15x bet

### Betting
- **Minimum Bet**: $5
- **Maximum Bet**: $50
- **Starting Balance**: $1,000
- **Win Condition**: 3 matching symbols on center line

## 🏗 Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Main game page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── SlotMachine.tsx  # Main slot machine container
│   ├── SlotCanvas.tsx   # Canvas rendering + GSAP
│   └── GameUI.tsx       # Controls and interface
├── store/               # State management
│   └── gameStore.ts     # Zustand game store
└── styles/              # Global styles
```

## 🎨 Animation Philosophy

This project prioritizes **smooth user experience** above all else:

- **GSAP Timeline Control**: Precise reel timing and easing
- **Canvas Optimization**: Hardware-accelerated rendering
- **Responsive Animations**: Adapt to screen size and device capabilities
- **Immediate Feedback**: Every interaction feels instant and satisfying

## 🔮 Roadmap

### Phase 2 - Enhanced Features
- [ ] User authentication (NextAuth)
- [ ] User profiles and statistics
- [ ] Multiple slot machine themes
- [ ] Sound effects and background music
- [ ] Particle effects for wins

### Phase 3 - Advanced Features
- [ ] Progressive jackpots
- [ ] Social features and leaderboards
- [ ] Real crypto integration (legal compliance)
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎲 Play Responsibly

This is a demo application for educational purposes. Please gamble responsibly if you choose to implement real money features.

---

**Built with ❤️ using the smoothest web animations possible**
