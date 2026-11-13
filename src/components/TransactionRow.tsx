import { ArrowDownLeft, ArrowUpRight, Repeat, Coins, Sparkles } from 'lucide-react'
import type { Transaction } from '../../shared/types'

const TX_CONFIG: Record<string, { icon: typeof ArrowDownLeft; color: string; prefix: string }> = {
  deposit:  { icon: ArrowDownLeft, color: 'text-emerald-400', prefix: '+' },
  withdraw: { icon: ArrowUpRight,  color: 'text-red-400',     prefix: '-' },
  transfer: { icon: Repeat,        color: 'text-cyan-400',    prefix: '' },
  revenue:  { icon: Coins,         color: 'text-violet-400',  prefix: '+' },
  mint:     { icon: Sparkles,      color: 'text-amber-400',   prefix: '' },
}

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.deposit
  const Icon = cfg.icon
  const time = new Date(tx.timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <div className={`p-2 rounded-lg bg-zinc-800/60 ${cfg.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 capitalize">{tx.type}</p>
        <p className="text-xs text-zinc-500">{time}</p>
      </div>
      <div className="text-right">
        {tx.amount > 0 && (
          <p className={`text-sm font-semibold ${cfg.color}`}>
            {cfg.prefix}Ⓝ {tx.amount.toFixed(3)}
          </p>
        )}
        <a
          href={`https://testnet.nearblocks.io/txns/${tx.tx_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors"
        >
          {tx.tx_hash.slice(0, 8)}…{tx.tx_hash.slice(-6)}
        </a>
      </div>
    </div>
  )
}
