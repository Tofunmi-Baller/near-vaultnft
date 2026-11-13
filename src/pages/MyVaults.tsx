import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Shield, TrendingUp, Lock, Wallet } from 'lucide-react'
import { fetchUserVaults } from '../api'
import type { UserPortfolio } from '../../shared/types'
import VaultCard from '../components/VaultCard'
import AnimatedNumber from '../components/AnimatedNumber'
import WalletConnectModal from '../components/WalletConnectModal'
import { useWallet } from '../context/WalletContext'

const NEAR_PRICE = 6.42

function mockChartData(totalBalance: number) {
  const now = Date.now()
  const day = 86400000
  return Array.from({ length: 30 }, (_, i) => {
    const noise = Math.sin(i * 0.6) * totalBalance * 0.08
    const trend = totalBalance * 0.7 + (totalBalance * 0.3 * i) / 29
    return {
      date: new Date(now - (29 - i) * day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(0, +(trend + noise).toFixed(2)),
    }
  })
}

export default function MyVaults() {
  const navigate = useNavigate()
  const { walletId, isConnected } = useWallet()
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConnect, setShowConnect] = useState(false)

  useEffect(() => {
    if (!walletId) { setLoading(false); return }
    setLoading(true)
    fetchUserVaults(walletId)
      .then(setPortfolio)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [walletId])

  const chartData = useMemo(
    () => mockChartData(portfolio?.total_balance ?? 0),
    [portfolio?.total_balance],
  )

  if (!isConnected) {
    return (
      <>
        <WalletConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
        <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center animate-fade-in">
          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-12 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-zinc-400 mb-8">Connect a NEAR wallet to view your VaultNFT portfolio and manage your vaults.</p>
            <button
              onClick={() => setShowConnect(true)}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg px-8 py-3.5 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <Wallet className="w-5 h-5" /> Connect Wallet
            </button>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="h-10 w-1/3 rounded skeleton" />
        <div className="h-36 rounded-xl skeleton" />
        <div className="h-64 rounded-xl skeleton" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-xl skeleton" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!portfolio || portfolio.vaults.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center animate-fade-in">
        <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-zinc-800 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Vaults Yet</h2>
          <p className="text-zinc-400 mb-2">
            Connected as <span className="font-mono text-cyan-400">{walletId}</span>
          </p>
          <p className="text-zinc-500 text-sm mb-8">Explore collections to find your first VaultNFT.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg px-8 py-3.5 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
          >
            Explore Collections
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">My Vaults</h1>
        <span className="text-sm text-zinc-500 font-mono">{walletId}</span>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-8 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Portfolio Value</p>
            <p className="text-5xl font-extrabold tracking-tight">
              Ⓝ <AnimatedNumber value={portfolio.total_balance} decimals={2} duration={1500} className="" />
            </p>
            <p className="text-lg text-zinc-400 mt-1">
              $<AnimatedNumber value={portfolio.total_balance * NEAR_PRICE} decimals={2} duration={1500} className="" /> USD
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Yield</p>
              <p className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Ⓝ <AnimatedNumber value={portfolio.total_yield} decimals={3} className="" />
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Vaults Held</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <Lock className="w-4 h-4 text-zinc-500" />
                {portfolio.vault_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <p className="text-sm text-zinc-400 mb-4">Portfolio Value (30d)</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `Ⓝ${v}`} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, fontSize: 13 }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(v: number) => [`Ⓝ ${v.toFixed(2)} ($${(v * NEAR_PRICE).toFixed(2)})`, 'Value']}
            />
            <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#portfolioGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Vault Grid */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-lg font-bold mb-5">Your Vaults <span className="text-zinc-500 font-normal text-base">({portfolio.vault_count})</span></h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {portfolio.vaults.map((v, i) => (
            <div key={v.id} className="animate-slide-up" style={{ animationDelay: `${0.05 * i}s` }}>
              <VaultCard vault={v} onClick={() => navigate(`/vault/${v.id}`)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
