import type { ReactNode } from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        VaultNFT — Built on NEAR Protocol · Hackathon 2026
        <span className="mx-2">·</span>
        <span className="text-zinc-600">Simulation Mode</span>
      </footer>
    </div>
  )
}
