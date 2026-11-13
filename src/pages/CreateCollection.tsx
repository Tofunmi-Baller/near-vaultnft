import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCollection } from '../api'
import type { VaultRules } from '../../shared/types'
import { useWallet } from '../context/WalletContext'
import GradientVisual from '../components/GradientVisual'

const PRESET_COLORS = ['#06b6d4', '#a78bfa', '#f59e0b', '#10b981', '#ef4444', '#ec4899']

export default function CreateCollection() {
  const navigate = useNavigate()
  const { walletId, isConnected } = useWallet()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [accentColor, setAccentColor] = useState(PRESET_COLORS[0])
  const [mintCount, setMintCount] = useState(10)
  const [rules, setRules] = useState<VaultRules>({
    min_hold_days: 7,
    max_withdrawal_pct: 50,
    revenue_schedule: 'monthly',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isConnected) { setError('Connect a wallet first'); return }
    setSubmitting(true)
    setError('')
    try {
      const col = await createCollection({
        name,
        description,
        accent_color: accentColor,
        mint_count: mintCount,
        vault_rules: rules,
      })
      navigate(`/collection/${col.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const previewSeed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-8">Create Collection</h1>

      <div className="grid lg:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Collection Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="CyberVaults Genesis"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="A collection of vault-backed NFTs with…"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Accent Color</label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Number of Vaults</label>
            <input
              type="number"
              value={mintCount}
              onChange={e => setMintCount(Math.min(100, Math.max(1, +e.target.value)))}
              min={1}
              max={100}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Vault Rules</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Min Hold Period (days)</label>
                <input
                  type="number"
                  value={rules.min_hold_days}
                  onChange={e => setRules({ ...rules, min_hold_days: +e.target.value })}
                  min={0}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Revenue Schedule</label>
                <select
                  value={rules.revenue_schedule}
                  onChange={e => setRules({ ...rules, revenue_schedule: e.target.value as VaultRules['revenue_schedule'] })}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Max Withdrawal per TX: {rules.max_withdrawal_pct}%</label>
              <input
                type="range"
                value={rules.max_withdrawal_pct}
                onChange={e => setRules({ ...rules, max_withdrawal_pct: +e.target.value })}
                min={10}
                max={100}
                step={5}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>10%</span><span>100%</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !name || !description}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-semibold rounded-lg px-6 py-3.5 transition-colors text-base"
          >
            {submitting ? 'Creating…' : 'Create Collection'}
          </button>
        </form>

        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Preview</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden sticky top-24">
            <div className="h-2" style={{ background: accentColor }} />
            <GradientVisual seed={previewSeed || 42} className="h-40 w-full" />
            <div className="p-5 space-y-2">
              <h3 className="text-lg font-bold">{name || 'Collection Name'}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{description || 'Your collection description…'}</p>
              <p className="text-xs text-zinc-500 pt-2">{mintCount} vaults · {rules.revenue_schedule} revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
