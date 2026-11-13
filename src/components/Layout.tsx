import type { ReactNode } from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="hero-orb w-[600px] h-[600px] bg-cyan-500 -top-64 -right-32" />
        <div className="hero-orb w-[500px] h-[500px] bg-violet-600 top-1/2 -left-48" style={{ animationDelay: '3s' }} />
        <div className="hero-orb w-[400px] h-[400px] bg-cyan-600 -bottom-32 right-1/4" style={{ animationDelay: '1.5s' }} />
      </div>
      <Navbar />
      <main className="flex-1 relative">{children}</main>
      <footer className="relative border-t border-zinc-800/60 py-8 text-center">
        <div className="flex items-center justify-center gap-3 text-xs text-zinc-500">
          <span className="text-zinc-400 font-medium">VaultNFT</span>
          <span className="text-zinc-700">·</span>
          <span>Built on NEAR Protocol</span>
          <span className="text-zinc-700">·</span>
          <span>Hackathon 2026</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Simulation Mode
          </span>
        </div>
      </footer>
    </div>
  )
}
