import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, ArrowDownLeft, ArrowUpRight, Repeat } from 'lucide-react'
import { fetchVault, fetchVaultTransactions, fetchCollection, depositToVault, withdrawFromVault, transferVault } from '../api'
import type { VaultNFT, Transaction, Collection } from '../../shared/types'
import GradientVisual from '../components/GradientVisual'
import VaultRulesDisplay from '../components/VaultRulesDisplay'
import TransactionRow from '../components/TransactionRow'
import { useWallet } from '../context/WalletContext'

const NEAR_PRICE = 6.42

type ModalType = 'deposit' | 'withdraw' | 'transfer' | null

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>()
  const { walletId } = useWallet()
  const [vault, setVault] = useState<VaultNFT | null>(null)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [v, t] = await Promise.all([fetchVault(id), fetchVaultTransactions(id)])
      setVault(v)
      setTxs(t)
      const c = await fetchCollection(v.collection_id)
      setCollection(c)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSubmit() {
    if (!id || !vault || !walletId) return
    setSubmitting(true)
    try {
      if (modal === 'deposit') {
        await depositToVault(id, { amount: parseFloat(amount), from_address: walletId })
        setToast(`Deposited Ⓝ ${amount}`)
      } else if (modal === 'withdraw') {
        await withdrawFromVault(id, { amount: parseFloat(amount), to_address: walletId })
        setToast(`Withdrew Ⓝ ${amount}`)
      } else if (modal === 'transfer') {
        await transferVault(id, { to_address: address })
        setToast(`Transferred to ${address}`)
      }
      setModal(null)
      setAmount('')
      setAddress('')
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-64 rounded-xl skeleton" />
      </div>
    )
  }

  if (error || !vault) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-red-400">{error || 'Vault not found'}</p>
      </div>
    )
  }

  const isOwner = vault.owner_id === walletId
  const maxWithdraw = collection ? vault.balance * (collection.vault_rules.max_withdrawal_pct / 100) : vault.balance

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-slide-up z-50">
          {toast}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <GradientVisual seed={vault.metadata?.gradient_seed ?? parseInt(vault.id, 36)} className="h-72 rounded-xl" />
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">{vault.metadata?.name || `Vault #${vault.token_id}`}</h1>
            {collection && (
              <Link to={`/collection/${collection.id}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                {collection.name}
              </Link>
            )}
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-zinc-500">{vault.vault_address}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(vault.vault_address); setToast('Copied!') }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Holder since {new Date(vault.holder_since).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {collection && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Vault Rules</h3>
              <VaultRulesDisplay rules={collection.vault_rules} />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Vault Balance</p>
            <p className="text-4xl font-extrabold">Ⓝ {vault.balance.toFixed(3)}</p>
            <p className="text-lg text-zinc-400">${(vault.balance * NEAR_PRICE).toFixed(2)} USD</p>
            <div className="flex items-center gap-1 text-sm text-emerald-400 font-medium">
              +Ⓝ {vault.total_yield.toFixed(3)} yield earned
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
              <div>
                <p className="text-zinc-500">Deposited</p>
                <p className="font-semibold">Ⓝ {vault.total_deposited.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Withdrawn</p>
                <p className="font-semibold">Ⓝ {vault.total_withdrawn.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="space-y-3">
              <button
                onClick={() => setModal('deposit')}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </button>
              <button
                onClick={() => setModal('withdraw')}
                className="w-full flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
              <button
                onClick={() => setModal('transfer')}
                className="w-full flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                <Repeat className="w-4 h-4" /> Transfer NFT
              </button>
            </div>
          )}
          {!isOwner && walletId && (
            <p className="text-xs text-zinc-500 text-center">You do not own this vault. Connect as <span className="font-mono text-zinc-400">{vault.owner_id}</span> to manage it.</p>
          )}
        </div>
      </div>

      <section>
        <h3 className="text-lg font-bold mb-4">Transaction History</h3>
        {txs.length === 0 ? (
          <p className="text-sm text-zinc-500">No transactions yet.</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 divide-y divide-zinc-800/60">
            {txs.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
          </div>
        )}
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setModal(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold capitalize">{modal}</h3>
            {modal === 'transfer' ? (
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Recipient Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="recipient.testnet"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Amount (NEAR)
                  {modal === 'withdraw' && <span className="text-zinc-500 ml-2">Max: Ⓝ {maxWithdraw.toFixed(3)}</span>}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  max={modal === 'withdraw' ? maxWithdraw : undefined}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 border border-zinc-700 hover:border-zinc-500 rounded-lg py-2.5 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || (modal === 'transfer' ? !address : !amount)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 rounded-lg py-2.5 text-sm font-semibold transition-colors"
              >
                {submitting ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
