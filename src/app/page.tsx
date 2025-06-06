import SlotMachine from '@/components/SlotMachine'
import WinBackgroundEffect from '@/components/WinBackgroundEffect'
import { BackgroundProvider } from '@/contexts/BackgroundContext'

export default function Home() {
  return (
    <BackgroundProvider>
      <main className="min-h-screen p-8 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
        {/* Dynamic Background Layer */}
        <div id="background-effects" className="fixed inset-0 z-0" />
        
        {/* Main Content */}
        <div className="relative z-10">
          <SlotMachine />
        </div>
        
        {/* Win Background Effects - Auto-triggers on wins */}
        <WinBackgroundEffect />
      </main>
    </BackgroundProvider>
  )
}
