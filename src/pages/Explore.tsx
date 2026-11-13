import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, Lock, DollarSign } from 'lucide-react'
import { fetchCollections, fetchStats } from '../api'
import type { Collection, PlatformStats } from '../../shared/types'
import StatCard from '../components/StatCard'

type SortKey = 'tvl' | 'newest' | 'name'

function CollectionCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="h-2 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-2/3 rounded skeleton" />
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-8 w-1/2 rounded skeleton mt-4" />
      </div>
    </div>
  )
}

export default function Explore() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState<Collection[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [sort, setSort] = useState<SortKey>('tvl')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
      <section className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          NFTs That Own <span className="text-gradient">Treasuries</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Mint NFTs with built-in bank accounts. Deposit funds, earn yield, and transfer
          the entire vault when you sell. Your membership card has a treasury.
        </p>
      </section>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Value Locked" value={`Ⓝ ${stats.total_tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} change={12.4} />
          <StatCard icon={BarChart3} label="Collections" value={String(stats.total_collections)} />
          <StatCard icon={Lock} label="Active Vaults" value={String(stats.total_vaults)} change={8.2} />
          <StatCard icon={DollarSign} label="NEAR Price" value={`$${stats.near_price_usd.toFixed(2)}`} change={3.1} />
        </div>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Collections</h2>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="tvl">Sort by TVL</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CollectionCardSkeleton key={i} />)
            : sorted.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/collection/${c.id}`)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-left card-glow hover:border-zinc-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-600/50"
                >
                  <div className="h-2" style={{ background: c.accent_color }} />
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-zinc-50">{c.name}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">{c.description}</p>
                    <p className="text-2xl font-bold text-zinc-50 pt-2">
                      Ⓝ {c.total_tvl.toFixed(1)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {c.mint_count} vaults</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.holder_count} holders</span>
                      <span>Floor: Ⓝ {c.floor_price.toFixed(2)}</span>
                    </div>
                  </div>
                </button>
              ))
          }
        </div>
      </section>
    </div>
  )
}
