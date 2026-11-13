import { TrendingUp } from 'lucide-react'
import type { VaultNFT } from '../../shared/types'
import GradientVisual from './GradientVisual'

const NEAR_PRICE = 6.42

interface Props {
  vault: VaultNFT
  onClick?: () => void
  style?: React.CSSProperties
}

export default function VaultCard({ vault, onClick, style }: Props) {
  const usdValue = (vault.balance * NEAR_PRICE).toFixed(2)
  const holderDate = new Date(vault.holder_since).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      style={style}
      className="bg-zinc-900/70 backdrop-blur border border-zinc-800/80 rounded-xl overflow-hidden text-left w-full card-glow transition-all duration-300 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/50 group animate-slide-up"
    >
      <div className="relative">
        <GradientVisual seed={vault.metadata?.gradient_seed ?? parseInt(vault.id, 36)} className="h-44 w-full" />
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-xs font-mono text-zinc-200 px-2.5 py-1 rounded-full border border-white/10">
          #{vault.token_id}
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-900/90 to-transparent" />
      </div>
      <div className="p-4 space-y-2.5">
        <div>
          <p className="text-2xl font-extrabold text-zinc-50 group-hover:text-cyan-400 transition-colors">
            Ⓝ {vault.balance.toFixed(2)}
          </p>
          <p className="text-sm text-zinc-500">${usdValue} USD</p>
        </div>
        {vault.total_yield > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            +Ⓝ {vault.total_yield.toFixed(3)} yield
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
          <p className="text-xs text-zinc-500">Holder since {holderDate}</p>
          <p className="text-xs text-zinc-600 font-mono">{vault.owner_id.split('.')[0]}</p>
        </div>
      </div>
    </button>
  )
}
