import { TrendingUp } from 'lucide-react'
import type { VaultNFT } from '../../shared/types'
import GradientVisual from './GradientVisual'

const NEAR_PRICE = 6.42

interface VaultCardProps {
  vault: VaultNFT
  onClick?: () => void
}

export default function VaultCard({ vault, onClick }: VaultCardProps) {
  const usdValue = (vault.balance * NEAR_PRICE).toFixed(2)
  const holderDate = new Date(vault.holder_since).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-left w-full card-glow transition-all duration-200 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/50"
    >
      <div className="relative">
        <GradientVisual seed={vault.metadata?.gradient_seed ?? parseInt(vault.id, 36)} className="h-40 w-full" />
        <span className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur text-xs font-mono text-zinc-300 px-2 py-1 rounded-full">
          #{vault.token_id}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xl font-bold text-zinc-50">
          Ⓝ {vault.balance.toFixed(2)}
        </p>
        <p className="text-sm text-zinc-400">${usdValue} USD</p>
        {vault.total_yield > 0 && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            +Ⓝ {vault.total_yield.toFixed(3)} yield
          </div>
        )}
        <p className="text-xs text-zinc-500 pt-1">Holder since {holderDate}</p>
      </div>
    </button>
  )
}
