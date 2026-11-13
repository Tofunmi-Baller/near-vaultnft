import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Sparkles, ArrowDownLeft, TrendingUp, Repeat, Lock, Users, BarChart3, DollarSign, ArrowRight } from 'lucide-react'
import { fetchCollections, fetchStats } from '../api'
import type { Collection, PlatformStats } from '../../shared/types'
import AnimatedNumber from '../components/AnimatedNumber'
import ActivityFeed from '../components/ActivityFeed'
import WalletConnectModal from '../components/WalletConnectModal'
import { useWallet } from '../context/WalletContext'

type SortKey = 'tvl' | 'newest' | 'name'

const STEPS = [
  { num: '01', title: 'Mint Collection', icon: Sparkles, desc: 'Creator mints VaultNFTs, each with its own NEAR sub-account' },
  { num: '02', title: 'Fund Vaults', icon: ArrowDownLeft, desc: 'Deposit any token via NEAR Intents — it routes to the vault' },
  { num: '03', title: 'Earn & Manage', icon: TrendingUp, desc: 'Track yield, withdraw funds, manage your vault portfolio' },
  { num: '04', title: 'Trade Value', icon: Repeat, desc: 'Transfer or sell the NFT — the vault balance goes with it' },
]

function CollectionCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="h-1 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-2/3 rounded skeleton" />
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-10 w-1/2 rounded skeleton mt-4" />
      </div>
    </div>
  )
}

export default function Explore() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const [collections, setCollections] = useState<Collection[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [sort, setSort] = useState<SortKey>('tvl')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWallet, setShowWallet] = useState(false)

  useEffect(() => {
    Promise.all([fetchCollections(), fetchStats()])
      .then(([c, s]) => { setCollections(c); setStats(s) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...collections].sort((a, b) => {
    if (sort === 'tvl') return b.total_tvl - a.total_tvl
    if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="animate-fade-in">
      <WalletConnectModal isOpen={showWallet} onClose={() => setShowWallet(false)} />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Floating orbs */}
        <div className="hero-orb w-[500px] h-[500px] bg-cyan-500 -top-40 -left-40" style={{ animationDelay: '0s' }} />
        <div className="hero-orb w-[400px] h-[400px] bg-violet-500 top-20 -right-32" style={{ animationDelay: '3s' }} />
        <div className="hero-orb w-[300px] h-[300px] bg-cyan-400 bottom-0 left-1/3" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-800/60 backdrop-blur border border-zinc-700/50 rounded-full px-4 py-1.5 text-sm text-zinc-300 mb-8 animate-slide-up">
            <Shield className="w-4 h-4 text-cyan-400" />
            Built on NEAR Protocol
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-slide-up delay-100">
            Your NFT Has a<br />
            <span className="text-gradient">Bank Account</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto animate-slide-up delay-200">
            Mint NFTs with built-in treasuries. Deposit funds, earn yield, and when you
            sell the NFT — the buyer gets the vault too. The value travels with the token.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10 animate-slide-up delay-300">
            <a
              href="#collections"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl px-7 py-3.5 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >
              Explore Vaults <ArrowRight className="w-4 h-4" />
            </a>
            {isConnected ? (
              <Link
                to="/my-vaults"
                className="inline-flex items-center gap-2 border border-zinc-600 hover:border-zinc-400 text-zinc-200 font-semibold rounded-xl px-7 py-3.5 transition-all duration-200"
              >
                My Vaults
              </Link>
            ) : (
              <button
                onClick={() => setShowWallet(true)}
                className="inline-flex items-center gap-2 border border-zinc-600 hover:border-zinc-400 text-zinc-200 font-semibold rounded-xl px-7 py-3.5 transition-all duration-200"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-16 animate-slide-up delay-500">
              {[
                { label: 'Total Value Locked', value: stats.total_tvl, prefix: 'Ⓝ ', decimals: 0, icon: DollarSign },
                { label: 'Active Vaults', value: stats.total_vaults, prefix: '', decimals: 0, icon: Lock },
                { label: 'Collections', value: stats.total_collections, prefix: '', decimals: 0, icon: BarChart3 },
                { label: 'NEAR Price', value: stats.near_price_usd, prefix: '$', decimals: 2, icon: DollarSign },
              ].map((s, i) => (
                <div key={i} className="bg-zinc-900/50 backdrop-blur border border-zinc-800/60 rounded-xl p-4 sm:p-5 text-left">
                  <s.icon className="w-4 h-4 text-zinc-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold text-zinc-50">
                    <AnimatedNumber value={s.value} prefix={s.prefix} decimals={s.decimals} />
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-14 animate-slide-up">
            How <span className="text-gradient">VaultNFT</span> Works
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Dotted connector line — desktop only */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-zinc-800" />

            {STEPS.map((step, i) => {
              const Icon = step.icon
              const delays = ['', 'delay-100', 'delay-200', 'delay-300']
              return (
                <div key={i} className={`relative text-center animate-slide-up ${delays[i]}`}>
                  <div className="relative inline-block mb-5">
                    <span className="absolute -top-3 -left-3 text-4xl font-extrabold text-zinc-800 select-none">{step.num}</span>
                    <div className="relative z-10 w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── COLLECTIONS + ACTIVITY ─── */}
      <section id="collections" className="py-16 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Collections — left */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Featured Collections</h2>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortKey)}
                  className="bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="tvl">Sort by TVL</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="grid sm:grid-cols-2 gap-5">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <CollectionCardSkeleton key={i} />)
                  : sorted.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/collection/${c.id}`)}
                        className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-left card-glow hover:border-zinc-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-600/50 animate-slide-up`}
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="h-1" style={{ background: c.accent_color }} />
                        <div className="p-5 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.accent_color }} />
                            <h3 className="text-base font-bold text-zinc-50 truncate">{c.name}</h3>
                          </div>
                          <p className="text-sm text-zinc-500 line-clamp-2">{c.description}</p>
                          <p className="text-2xl font-bold text-zinc-50 pt-1">
                            <AnimatedNumber value={c.total_tvl} prefix="Ⓝ " decimals={1} duration={800} />
                          </p>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {c.mint_count} vaults</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.holder_count} holders</span>
                          </div>
                        </div>
                      </button>
                    ))
                }
              </div>
            </div>

            {/* Activity Feed — right */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <ActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600/20 via-violet-600/20 to-cyan-600/20 border border-zinc-700/50 p-10 sm:p-14 text-center">
            <div className="hero-orb w-[300px] h-[300px] bg-cyan-500 -top-20 -right-20" style={{ animationDelay: '0s' }} />
            <div className="hero-orb w-[200px] h-[200px] bg-violet-500 -bottom-16 -left-16" style={{ animationDelay: '2s' }} />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Ready to create your first VaultNFT collection?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Mint NFTs with built-in treasuries, set vault rules, and start distributing revenue to your holders.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl px-8 py-4 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 text-lg"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
