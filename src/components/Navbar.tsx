import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Shield, ChevronDown, LogOut, Wallet } from 'lucide-react'
import { useWallet, DEMO_WALLETS } from '../context/WalletContext'
import WalletConnectModal from './WalletConnectModal'

const NAV_LINKS = [
  { to: '/', label: 'Explore' },
  { to: '/my-vaults', label: 'My Vaults' },
  { to: '/create', label: 'Create' },
]

export default function Navbar() {
  const { walletId, isConnected, connect, disconnect } = useWallet()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-40 glass border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-shadow">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Vault<span className="text-cyan-400">NFT</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {isConnected ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 bg-zinc-800/60 border border-zinc-700/60 rounded-lg text-sm hover:border-zinc-600 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-zinc-300 max-w-[140px] truncate">{walletId}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 glass border border-zinc-700/60 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                  <p className="px-4 py-2.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">Switch Wallet</p>
                  {DEMO_WALLETS.map(w => (
                    <button
                      key={w}
                      onClick={() => { connect(w); setDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-mono transition-all ${
                        w === walletId
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                  <button
                    onClick={() => { disconnect(); setDropdownOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800/60 flex items-center gap-2 border-t border-zinc-800/60"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setConnectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      <WalletConnectModal isOpen={connectModalOpen} onClose={() => setConnectModalOpen(false)} />
    </>
  )
}
