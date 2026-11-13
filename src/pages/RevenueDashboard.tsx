import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Coins } from 'lucide-react'
import { fetchCollection, fetchCollectionVaults, fetchDistributions, distributeRevenue } from '../api'
import type { Collection, VaultNFT, RevenueDistribution } from '../../shared/types'

const NEAR_PRICE = 6.42

function mockTvlData(tvl: number) {
  const now = Date.now()
  const day = 86400000
  return Array.from({ length: 30 }, (_, i) => {
    const base = tvl * 0.5 + (tvl * 0.5 * i) / 29
    const noise = Math.sin(i * 0.5) * tvl * 0.05
    return {
      date: new Date(now - (29 - i) * day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tvl: Math.max(0, +(base + noise).toFixed(2)),
    }
  })
}

export default function RevenueDashboard() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [vaults, setVaults] = useState<VaultNFT[]>([])
  const [distributions, setDistributions] = useState<RevenueDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [distributing, setDistributing] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!collectionId) return
    Promise.all([
      fetchCollection(collectionId),
      fetchCollectionVaults(collectionId),
      fetchDistributions(collectionId),
    ])
      .then(([c, v, d]) => { setCollection(c); setVaults(v); setDistributions(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [collectionId])

  const chartData = useMemo(() => mockTvlData(collection?.total_tvl ?? 0), [collection?.total_tvl])

  const perVault = amount ? parseFloat(amount) / Math.max(vaults.length, 1) : 0

  async function handleDistribute() {
    if (!collectionId || !amount) return
    setDistributing(true)
    try {
      const dist = await distributeRevenue(collectionId, { total_amount: parseFloat(amount) })
      setDistributions(prev => [dist, ...prev])
      setToast(`Distributed Ⓝ ${amount} to ${vaults.length} vaults`)
      setAmount('')
      const [c, v] = await Promise.all([fetchCollection(collectionId), fetchCollectionVaults(collectionId)])
      setCollection(c)
      setVaults(v)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDistributing(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-8 w-1/3 rounded skeleton mb-6" />
        <div className="h-64 rounded-xl skeleton" />
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-red-400">{error || 'Collection not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-slide-up z-50">
          {toast}
        </div>
      )}

      <div>
        <Link to={`/collection/${collection.id}`} className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to collection
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ background: collection.accent_color }} />
          <h1 className="text-3xl font-extrabold">{collection.name}</h1>
        </div>
        <p className="text-zinc-400 mt-1">Revenue Dashboard</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-400 mb-4">Total Value Locked (30d)</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={collection.accent_color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={collection.accent_color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `Ⓝ${v}`} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(v: number) => [`Ⓝ ${v.toFixed(2)}`, 'TVL']}
              />
              <Area type="monotone" dataKey="tvl" stroke={collection.accent_color} fill="url(#tvlGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Distribute Revenue</h3>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold">Ⓝ {collection.total_tvl.toFixed(2)}</p>
            <p className="text-sm text-zinc-400">${(collection.total_tvl * NEAR_PRICE).toFixed(2)} TVL</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Amount to distribute (NEAR)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            />
            {perVault > 0 && (
              <p className="text-xs text-zinc-500">
                Ⓝ {perVault.toFixed(4)} per vault × {vaults.length} vaults
              </p>
            )}
          </div>
          <button
            onClick={handleDistribute}
            disabled={distributing || !amount || parseFloat(amount) <= 0}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
          >
            <Coins className="w-4 h-4" />
            {distributing ? 'Distributing…' : 'Distribute'}
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-bold mb-4">Distribution History</h3>
        {distributions.length === 0 ? (
          <p className="text-sm text-zinc-500">No distributions yet.</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Per Vault</th>
                  <th className="text-left px-4 py-3 font-medium">Vaults</th>
                  <th className="text-left px-4 py-3 font-medium">TX Hash</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map(d => (
                  <tr key={d.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-300">
                      {new Date(d.distributed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-violet-400">Ⓝ {d.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-300">Ⓝ {d.per_vault_amount.toFixed(4)}</td>
                    <td className="px-4 py-3 text-zinc-400">{d.vault_count}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-zinc-500">
                        {d.tx_hash.slice(0, 8)}…{d.tx_hash.slice(-6)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
