import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Sparkles, Clock, Percent, Calendar } from 'lucide-react'
import { createCollection } from '../api'
import type { VaultRules } from '../../shared/types'
import { useWallet } from '../context/WalletContext'
import GradientVisual from '../components/GradientVisual'
import BlockchainConfirm from '../components/BlockchainConfirm'
import WalletConnectModal from '../components/WalletConnectModal'

const PRESET_COLORS = ['#06b6d4', '#a78bfa', '#f59e0b', '#10b981', '#ef4444', '#ec4899']

const SCHEDULE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  manual: 'Manual',
}

export default function CreateCollection() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [accentColor, setAccentColor] = useState(PRESET_COLORS[0])
  const [mintCount, setMintCount] = useState(10)
  const [rules, setRules] = useState<VaultRules>({
    min_hold_days: 7,
    max_withdrawal_pct: 50,
    revenue_schedule: 'monthly',
  })
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showConnect, setShowConnect] = useState(false)
  const createdIdRef = useRef<string | null>(null)

  const previewSeed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 42

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isConnected) { setShowConnect(true); return }
    setError('')
    try {
      const col = await createCollection({
        name,
        description,
        accent_color: accentColor,
        mint_count: mintCount,
        vault_rules: rules,
      })
      createdIdRef.current = col.id
      setShowConfirm(true)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <WalletConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
      <BlockchainConfirm
        isOpen={showConfirm}
        type="mint"
        amount={`${mintCount} vaults`}
        onComplete={() => {
          setShowConfirm(false)
          if (createdIdRef.current) navigate(`/collection/${createdIdRef.current}`)
        }}
      />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Collection</h1>
        <p className="text-zinc-400 mt-2">Mint VaultNFTs — each one gets its own NEAR sub-account treasury.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-7">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Collection Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="CyberVaults Genesis"
              className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="A collection of vault-backed NFTs with…"
              className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] rounded-xl px-4 py-3.5 text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-zinc-300">Accent Color</label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 ${
                    accentColor === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-9 h-9 rounded-full cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>

          {/* Vault Count */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-zinc-300">Number of Vaults to Mint</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMintCount(Math.max(1, mintCount - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-bold">{mintCount}</span>
                <span className="text-sm text-zinc-500 ml-2">vaults</span>
              </div>
              <button
                type="button"
                onClick={() => setMintCount(Math.min(100, mintCount + 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <input
              type="range"
              value={mintCount}
              onChange={e => setMintCount(+e.target.value)}
              min={1}
              max={100}
              className="w-full accent-cyan-500 mt-1"
            />
          </div>

          {/* Vault Rules */}
          <div className="space-y-5 pt-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Vault Rules</h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                  <Clock className="w-4 h-4 text-zinc-500" /> Min Hold Period
                </div>
                <input
                  type="number"
                  value={rules.min_hold_days}
                  onChange={e => setRules({ ...rules, min_hold_days: Math.max(0, +e.target.value) })}
                  min={0}
                  className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                />
                <p className="text-xs text-zinc-600">{rules.min_hold_days === 0 ? 'No hold requirement' : `${rules.min_hold_days} day${rules.min_hold_days !== 1 ? 's' : ''} before withdrawal`}</p>
              </div>

              <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                  <Calendar className="w-4 h-4 text-zinc-500" /> Revenue Schedule
                </div>
                <select
                  value={rules.revenue_schedule}
                  onChange={e => setRules({ ...rules, revenue_schedule: e.target.value as VaultRules['revenue_schedule'] })}
                  className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                >
                  {Object.entries(SCHEDULE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-600">{rules.revenue_schedule === 'manual' ? 'Distribute manually' : `Auto-distribute ${rules.revenue_schedule}`}</p>
              </div>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                  <Percent className="w-4 h-4 text-zinc-500" /> Max Withdrawal per TX
                </div>
                <span className="text-lg font-bold" style={{ color: accentColor }}>{rules.max_withdrawal_pct}%</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${rules.max_withdrawal_pct}%`, background: accentColor }}
                  />
                </div>
                <input
                  type="range"
                  value={rules.max_withdrawal_pct}
                  onChange={e => setRules({ ...rules, max_withdrawal_pct: +e.target.value })}
                  min={10}
                  max={100}
                  step={5}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-600">
                <span>10% (conservative)</span>
                <span>100% (unrestricted)</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!name || !description}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-semibold rounded-xl px-6 py-4 transition-all hover:shadow-lg hover:shadow-cyan-500/20 text-base"
          >
            <Sparkles className="w-5 h-5" />
            Mint {mintCount} VaultNFTs
          </button>
        </form>

        {/* Preview */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Live Preview</p>
          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden sticky top-24 transition-all duration-300">
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88, transparent)` }} />
            <GradientVisual seed={previewSeed} className="h-44 w-full" />
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold">{name || 'Collection Name'}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{description || 'Your collection description will appear here…'}</p>

              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
                  {mintCount} vaults
                </div>
                <div className="text-xs text-zinc-500">·</div>
                <div className="text-xs text-zinc-500">{SCHEDULE_LABELS[rules.revenue_schedule]} revenue</div>
                <div className="text-xs text-zinc-500">·</div>
                <div className="text-xs text-zinc-500">{rules.max_withdrawal_pct}% max w/d</div>
              </div>

              <div className="text-xs text-zinc-600 font-mono pt-1">
                {name ? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.vaultnft.testnet` : 'collection-name.vaultnft.testnet'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
