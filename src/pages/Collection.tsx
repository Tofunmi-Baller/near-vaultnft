import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DollarSign, Users, Lock, BarChart3 } from 'lucide-react'
import { fetchCollection, fetchCollectionVaults } from '../api'
import type { Collection as CollectionType, VaultNFT } from '../../shared/types'
import StatCard from '../components/StatCard'
import VaultCard from '../components/VaultCard'
import VaultRulesDisplay from '../components/VaultRulesDisplay'
import { useWallet } from '../context/WalletContext'

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
        <div className="h-8 w-1/3 rounded skeleton" />
        <div className="h-4 w-2/3 rounded skeleton" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl skeleton" />)}
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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-full" style={{ background: collection.accent_color }} />
          <h1 className="text-3xl font-extrabold">{collection.name}</h1>
        </div>
        <p className="text-zinc-400 max-w-2xl">{collection.description}</p>
        <p className="text-xs text-zinc-500 mt-2 font-mono">{collection.near_account}</p>
        {isCreator && (
          <Link
            to={`/revenue/${collection.id}`}
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> Revenue Dashboard
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total TVL" value={`Ⓝ ${collection.total_tvl.toFixed(1)}`} />
        <StatCard icon={DollarSign} label="Floor Price" value={`Ⓝ ${collection.floor_price.toFixed(2)}`} />
        <StatCard icon={Users} label="Holders" value={String(collection.holder_count)} />
        <StatCard icon={Lock} label="Vaults" value={String(collection.mint_count)} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Vault Rules</h3>
        <VaultRulesDisplay rules={collection.vault_rules} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Vaults</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vaults.map(v => (
            <VaultCard key={v.id} vault={v} onClick={() => navigate(`/vault/${v.id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}
