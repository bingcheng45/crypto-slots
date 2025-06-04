import SlotMachine from '@/components/SlotMachine'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-cyan-400 mb-8 text-center">
          CRYPTO SLOTS
        </h1>
        
        <SlotMachine />
        
        <p className="text-gray-400 text-center mt-6 text-sm md:text-base">
          Experience the smoothest slot machine animations on the web
        </p>
      </div>
    </main>
  )
}
