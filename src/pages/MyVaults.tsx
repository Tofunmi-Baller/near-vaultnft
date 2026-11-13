import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Lock, TrendingUp, DollarSign } from 'lucide-react'
import { fetchUserVaults } from '../api'
import type { UserPortfolio } from '../../shared/types'
import VaultCard from '../components/VaultCard'
import StatCard from '../components/StatCard'
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

  useEffect(() => {
    if (!walletId) { setLoading(false); return }
    fetchUserVaults(walletId)
      .then(setPortfolio)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [walletId])

  const chartData = useMemo(
    () => mockChartData(portfolio?.total_balance ?? 0),
    [portfolio?.total_balance]
  )

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-zinc-400">Select a demo wallet from the navbar to view your vaults.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="h-10 w-1/3 rounded skeleton" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl skeleton" />)}
        </div>
        <div className="h-64 rounded-xl skeleton" />
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
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Vaults Yet</h2>
        <p className="text-zinc-400 mb-6">Explore collections to find your first VaultNFT.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
        >
          Explore Collections
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold">My Vaults</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Total Value" value={`Ⓝ ${portfolio.total_balance.toFixed(2)}`} change={5.3} />
        <StatCard icon={TrendingUp} label="Total Yield" value={`Ⓝ ${portfolio.total_yield.toFixed(3)}`} />
        <StatCard icon={Lock} label="Vaults Held" value={String(portfolio.vault_count)} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm text-zinc-400 mb-4">Portfolio Value (30d)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="vaultGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `Ⓝ${v}`} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 13 }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(v: number) => [`Ⓝ ${v.toFixed(2)}`, 'Value']}
            />
            <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#vaultGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {portfolio.vaults.map(v => (
          <VaultCard key={v.id} vault={v} onClick={() => navigate(`/vault/${v.id}`)} />
        ))}
      </div>
    </div>
  )
}
