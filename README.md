# Crypto Slots

A modern crypto-themed slot machine game built with Next.js and the ShipFast boilerplate.

## Features

- 🎰 Interactive slot machine gameplay
- 💰 Crypto-themed symbols and rewards
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔐 User authentication with NextAuth
- 📊 MongoDB for data persistence
- ⚡ Optimized performance with Next.js App Router

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel-ready

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (copy `.env.example` to `.env.local`)
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
crypto_slots2/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── lib/             # Utilities and configurations
├── models/          # MongoDB/Mongoose models
└── public/          # Static assets
```

## Development

This project follows the ShipFast boilerplate conventions:
- Server-first approach with React Server Components
- Responsive design with mobile-first Tailwind CSS
- TypeScript for type safety
- ESLint and Prettier for code quality

## License

MIT License 