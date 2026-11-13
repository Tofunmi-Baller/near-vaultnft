import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  change?: number
  icon?: LucideIcon
  className?: string
}

export default function StatCard({ label, value, change, icon: Icon, className = '' }: Props) {
  return (
    <div className={`bg-zinc-900/70 backdrop-blur border border-zinc-800/60 rounded-xl p-5 transition-all duration-200 hover:border-zinc-700/60 ${className}`}>
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-zinc-800/60 flex items-center justify-center mb-3">
          <Icon className="w-4.5 h-4.5 text-zinc-400" />
        </div>
      )}
      <p className="text-2xl font-bold text-zinc-50">{value}</p>
      <p className="text-sm text-zinc-400 mt-1">{label}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
