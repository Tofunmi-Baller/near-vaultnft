import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Coins, Users, Lock, ExternalLink } from 'lucide-react'
import { fetchCollection, fetchCollectionVaults, fetchDistributions, distributeRevenue } from '../api'
import type { Collection, VaultNFT, RevenueDistribution } from '../../shared/types'
import AnimatedNumber from '../components/AnimatedNumber'
import BlockchainConfirm from '../components/BlockchainConfirm'

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
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState('')
  const txHashRef = useRef('')

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
    try {
      const dist = await distributeRevenue(collectionId, { total_amount: parseFloat(amount) })
      txHashRef.current = dist.tx_hash
      setDistributions(prev => [dist, ...prev])
      setShowConfirm(true)
      setAmount('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleConfirmComplete() {
    setShowConfirm(false)
    setToast(`Revenue distributed to ${vaults.length} vaults`)
    if (collectionId) {
      const [c, v] = await Promise.all([fetchCollection(collectionId), fetchCollectionVaults(collectionId)])
      setCollection(c)
      setVaults(v)
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="h-1 w-full skeleton" />
        <div className="h-10 w-1/3 rounded skeleton" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-xl skeleton" />
          <div className="h-80 rounded-xl skeleton" />
        </div>
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
    <div className="animate-fade-in">
      <BlockchainConfirm
        isOpen={showConfirm}
        type="distribute"
        amount={amount || distributions[0]?.total_amount?.toFixed(2)}
        onComplete={handleConfirmComplete}
        txHash={txHashRef.current}
      />

      {toast && (
        <div className="fixed top-20 right-6 bg-emerald-600/90 backdrop-blur text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-down z-50">
          {toast}
        </div>
      )}

      {/* Accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${collection.accent_color}, ${collection.accent_color}88, transparent)` }} />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <Link to={`/collection/${collection.id}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to collection
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full" style={{ background: collection.accent_color }} />
            <h1 className="text-3xl font-extrabold tracking-tight">{collection.name}</h1>
          </div>
          <p className="text-zinc-400 mt-1 text-lg">Revenue Dashboard</p>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up">
          {[
            { icon: Coins, label: 'Total TVL', value: `Ⓝ ${collection.total_tvl.toFixed(1)}` },
            { icon: Users, label: 'Holders', value: String(collection.holder_count) },
            { icon: Lock, label: 'Vaults', value: String(vaults.length) },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Distribute */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* TVL Chart */}
          <div className="lg:col-span-2 bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm text-zinc-400 mb-4">Total Value Locked (30d)</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={collection.accent_color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={collection.accent_color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `Ⓝ${v}`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, fontSize: 13 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v: number) => [`Ⓝ ${v.toFixed(2)}`, 'TVL']}
                />
                <Area type="monotone" dataKey="tvl" stroke={collection.accent_color} fill="url(#tvlGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribute Card */}
          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-6 space-y-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Distribute Revenue</h3>

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current TVL</p>
              <p className="text-3xl font-extrabold">
                Ⓝ <AnimatedNumber value={collection.total_tvl} decimals={2} />
              </p>
              <p className="text-sm text-zinc-400 mt-0.5">${(collection.total_tvl * NEAR_PRICE).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</p>
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
                className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
              {perVault > 0 && (
                <div className="bg-zinc-800/50 rounded-lg px-3 py-2 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-200">Ⓝ {perVault.toFixed(4)}</span> per vault × {vaults.length} vaults
                </div>
              )}
            </div>

            <button
              onClick={handleDistribute}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-semibold rounded-xl px-4 py-3.5 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <Coins className="w-5 h-5" />
              Distribute Revenue
            </button>
          </div>
        </div>

        {/* Distribution History */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-bold mb-4">Distribution History <span className="text-zinc-500 font-normal text-base">({distributions.length})</span></h3>
          {distributions.length === 0 ? (
            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-8 text-center">
              <Coins className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No distributions yet. Use the form above to distribute revenue.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Per Vault</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vaults</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">TX</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((d, i) => (
                    <tr key={d.id} className={`border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 transition-colors ${i === 0 ? 'animate-slide-down' : ''}`}>
                      <td className="px-5 py-3.5 text-zinc-300">
                        {new Date(d.distributed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-violet-400">Ⓝ {d.total_amount.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-zinc-300">Ⓝ {d.per_vault_amount.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-zinc-400">{d.vault_count}</td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`https://testnet.nearblocks.io/txns/${d.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-zinc-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                        >
                          {d.tx_hash.slice(0, 8)}…{d.tx_hash.slice(-6)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
