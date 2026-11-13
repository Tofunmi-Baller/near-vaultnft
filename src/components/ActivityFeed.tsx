import { useEffect, useState, useRef } from 'react'
import { ArrowDownLeft, ArrowUpRight, Repeat, Coins, Sparkles } from 'lucide-react'

interface FeedItem {
  id: string
  type: string
  wallet: string
  amount: number
  collection: string
  timestamp: number
}

const ICONS: Record<string, typeof ArrowDownLeft> = {
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  transfer: Repeat,
  revenue: Coins,
  mint: Sparkles,
}

const COLORS: Record<string, string> = {
  deposit: 'text-emerald-400 bg-emerald-400/10',
  withdraw: 'text-red-400 bg-red-400/10',
  transfer: 'text-cyan-400 bg-cyan-400/10',
  revenue: 'text-violet-400 bg-violet-400/10',
  mint: 'text-amber-400 bg-amber-400/10',
}

const LABELS: Record<string, string> = {
  deposit: 'deposited',
  withdraw: 'withdrew',
  transfer: 'transferred',
  revenue: 'received revenue',
  mint: 'minted',
}

const WALLETS = ['alice.testnet', 'bob.testnet', 'charlie.testnet', 'investor.testnet', 'whale.testnet', 'defi-chad.testnet']
const COLLECTIONS = ['CyberVault Genesis', 'Creator Collective', 'Investment DAO Alpha']
const TYPES = ['deposit', 'deposit', 'deposit', 'withdraw', 'transfer', 'revenue', 'mint']

function generateItem(): FeedItem {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)]
  return {
    id: Math.random().toString(36).slice(2),
    type,
    wallet: WALLETS[Math.floor(Math.random() * WALLETS.length)],
    amount: type === 'transfer' ? 0 : +(Math.random() * 20 + 0.5).toFixed(2),
    collection: COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)],
    timestamp: Date.now(),
  }
}

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>(() =>
    Array.from({ length: 5 }, generateItem)
  )
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setItems(prev => [generateItem(), ...prev.slice(0, 7)])
    }, 3500)
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="space-y-2 overflow-hidden">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        Live Activity
      </h3>
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const Icon = ICONS[item.type] || Sparkles
          const color = COLORS[item.type] || COLORS.mint
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg bg-zinc-900/50 text-sm ${i === 0 ? 'animate-slide-down' : ''}`}
            >
              <div className={`p-1.5 rounded-md ${color}`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="text-zinc-400 truncate flex-1">
                <span className="text-zinc-200 font-medium">{item.wallet.split('.')[0]}</span>
                {' '}{LABELS[item.type]}{' '}
                {item.amount > 0 && <span className="text-zinc-200">Ⓝ {item.amount}</span>}
                {item.type === 'transfer' && <span className="text-zinc-200">a vault</span>}
                {' '}in <span className="text-zinc-300">{item.collection}</span>
              </span>
              <span className="text-xs text-zinc-600 flex-shrink-0">just now</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
