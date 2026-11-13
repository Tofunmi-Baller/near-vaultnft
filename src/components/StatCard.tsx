import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon?: LucideIcon
}

export default function StatCard({ label, value, change, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      {Icon && <Icon className="w-5 h-5 text-zinc-400 mb-2" />}
      <p className="text-2xl font-bold text-zinc-50">{value}</p>
      <p className="text-sm text-zinc-400 mt-1">{label}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
