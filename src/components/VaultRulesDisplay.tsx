import { Clock, Percent, Calendar } from 'lucide-react'
import type { VaultRules } from '../../shared/types'

export default function VaultRulesDisplay({ rules }: { rules: VaultRules }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 font-medium">Hold Period</span>
        </div>
        <p className="text-sm font-semibold text-zinc-200">
          {rules.min_hold_days === 0 ? 'None' : `${rules.min_hold_days} days`}
        </p>
      </div>
      <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Percent className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 font-medium">Max Withdraw</span>
        </div>
        <p className="text-sm font-semibold text-zinc-200">{rules.max_withdrawal_pct}%</p>
      </div>
      <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 font-medium">Revenue</span>
        </div>
        <p className="text-sm font-semibold text-zinc-200 capitalize">{rules.revenue_schedule}</p>
      </div>
    </div>
  )
}
