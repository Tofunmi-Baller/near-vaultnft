import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DollarSign, Users, Lock, BarChart3, ArrowLeft, ExternalLink } from 'lucide-react'
import { fetchCollection, fetchCollectionVaults } from '../api'
import type { Collection as CollectionType, VaultNFT } from '../../shared/types'
import VaultCard from '../components/VaultCard'
import VaultRulesDisplay from '../components/VaultRulesDisplay'
import AnimatedNumber from '../components/AnimatedNumber'
import { useWallet } from '../context/WalletContext'

const NEAR_PRICE = 6.42

export default function Collection() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { walletId } = useWallet()
  const [collection, setCollection] = useState<CollectionType | null>(null)
  const [vaults, setVaults] = useState<VaultNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([fetchCollection(id), fetchCollectionVaults(id)])
      .then(([c, v]) => { setCollection(c); setVaults(v) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="h-1 w-full rounded skeleton" />
        <div className="h-10 w-1/3 rounded skeleton" />
        <div className="h-5 w-2/3 rounded skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl skeleton" />)}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-xl skeleton" />)}
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

  const isCreator = collection.creator_id === walletId

  return (
    <div className="animate-fade-in">
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${collection.accent_color}, ${collection.accent_color}88, transparent)` }} />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Collections
        </Link>

        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-zinc-950" style={{ background: collection.accent_color, ringColor: collection.accent_color }} />
            <h1 className="text-4xl font-extrabold tracking-tight">{collection.name}</h1>
          </div>
          <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">{collection.description}</p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-lg px-3 py-1.5">
              {collection.near_account}
              <ExternalLink className="w-3 h-3 text-zinc-600" />
            </div>
            {isCreator && (
              <Link
                to={`/revenue/${collection.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
                style={{ background: `${collection.accent_color}18`, color: collection.accent_color }}
              >
                <BarChart3 className="w-4 h-4" /> Revenue Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: DollarSign, label: 'Total TVL', value: collection.total_tvl, prefix: 'Ⓝ ', decimals: 1, sub: `$${(collection.total_tvl * NEAR_PRICE).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD` },
            { icon: DollarSign, label: 'Floor Price', value: collection.floor_price, prefix: 'Ⓝ ', decimals: 2, sub: null },
            { icon: Users, label: 'Holders', value: collection.holder_count, prefix: '', decimals: 0, sub: null },
            { icon: Lock, label: 'Vaults', value: collection.mint_count, prefix: '', decimals: 0, sub: null },
          ].map(({ icon: Icon, label, value, prefix, decimals, sub }, i) => (
            <div key={i} className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-5 space-y-1">
              <Icon className="w-5 h-5 text-zinc-500 mb-2" />
              <p className="text-2xl font-bold">
                <AnimatedNumber value={value} prefix={prefix} decimals={decimals} />
              </p>
              <p className="text-sm text-zinc-400">{label}</p>
              {sub && <p className="text-xs text-zinc-500">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Vault Rules */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Vault Rules</h3>
          <VaultRulesDisplay rules={collection.vault_rules} />
        </div>

        {/* Vault Grid */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold">Collection Vaults <span className="text-zinc-500 font-normal text-base">({vaults.length})</span></h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vaults.map((v, i) => (
              <div key={v.id} className="animate-slide-up" style={{ animationDelay: `${0.05 * i}s` }}>
                <VaultCard vault={v} onClick={() => navigate(`/vault/${v.id}`)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
