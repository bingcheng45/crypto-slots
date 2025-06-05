import SlotMachine from '@/components/SlotMachine'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <SlotMachine />
        </div>
      </main>
  )
}
