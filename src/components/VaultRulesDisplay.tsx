import { Clock, Percent, Calendar } from 'lucide-react'
import type { VaultRules } from '../../shared/types'

export default function VaultRulesDisplay({ rules }: { rules: VaultRules }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2.5">
        <Clock className="w-4 h-4 text-zinc-400 mb-1" />
        <p className="text-sm font-semibold text-zinc-200">{rules.min_hold_days}d</p>
        <p className="text-xs text-zinc-500">Min hold</p>
      </div>
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2.5">
        <Percent className="w-4 h-4 text-zinc-400 mb-1" />
        <p className="text-sm font-semibold text-zinc-200">{rules.max_withdrawal_pct}%</p>
        <p className="text-xs text-zinc-500">Max withdraw</p>
      </div>
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2.5">
        <Calendar className="w-4 h-4 text-zinc-400 mb-1" />
        <p className="text-sm font-semibold text-zinc-200 capitalize">{rules.revenue_schedule}</p>
        <p className="text-xs text-zinc-500">Rev. schedule</p>
      </div>
    </div>
  )
}
