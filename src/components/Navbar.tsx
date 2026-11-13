import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Shield, ChevronDown, LogOut } from 'lucide-react'
import { useWallet, DEMO_WALLETS } from '../context/WalletContext'

const NAV_LINKS = [
  { to: '/', label: 'Explore' },
  { to: '/my-vaults', label: 'My Vaults' },
  { to: '/create', label: 'Create' },
]

export default function Navbar() {
  const { walletId, isConnected, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-cyan-500" />
          <span className="text-lg font-bold tracking-tight">VaultNFT</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-400/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:border-zinc-600 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            <span className="font-mono text-zinc-300 max-w-[140px] truncate">
              {walletId ?? 'Connect'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
              <p className="px-4 py-2 text-xs text-zinc-500 uppercase tracking-wider">Demo Wallets</p>
              {DEMO_WALLETS.map(w => (
                <button
                  key={w}
                  onClick={() => { connect(w); setOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-mono transition-colors ${
                    w === walletId
                      ? 'bg-cyan-600/10 text-cyan-400'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {w}
                </button>
              ))}
              {isConnected && (
                <button
                  onClick={() => { disconnect(); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-800"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
