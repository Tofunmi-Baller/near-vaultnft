import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ArrowDownLeft, ArrowUpRight, Repeat, TrendingUp, User, Calendar, Link2 } from 'lucide-react'
import { fetchVault, fetchVaultTransactions, depositToVault, withdrawFromVault, transferVault } from '../api'
import type { Transaction, VaultRules } from '../../shared/types'
import GradientVisual from '../components/GradientVisual'
import AnimatedNumber from '../components/AnimatedNumber'
import BlockchainConfirm from '../components/BlockchainConfirm'
import VaultRulesDisplay from '../components/VaultRulesDisplay'
import TransactionRow from '../components/TransactionRow'
import { useWallet } from '../context/WalletContext'

const NEAR_PRICE = 6.42

interface ExtendedVault {
  id: string
  token_id: string
  collection_id: string
  collection_name: string
  collection_slug: string
  owner_id: string
  vault_address: string
  balance: number
  total_deposited: number
  total_withdrawn: number
  total_yield: number
  minted_at: string
  holder_since: string
  metadata: { name: string; description: string; gradient_seed: number }
  collection_vault_rules: VaultRules
  accent_color: string
}

type ModalType = 'deposit' | 'withdraw' | 'transfer' | null

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>()
  const { walletId } = useWallet()
  const [vault, setVault] = useState<ExtendedVault | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modal, setModal] = useState<ModalType>(null)
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmType, setConfirmType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit')
  const [confirmAmount, setConfirmAmount] = useState('')
  const [confirmAddress, setConfirmAddress] = useState('')
  const [confirmTxHash, setConfirmTxHash] = useState('')

  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [v, t] = await Promise.all([
        fetchVault(id) as Promise<ExtendedVault>,
        fetchVaultTransactions(id),
      ])
      setVault(v)
      setTxs(t)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleSubmit() {
    if (!id || !vault || !walletId) return
    setSubmitting(true)
    try {
      let txHash = ''

      if (modal === 'deposit') {
        const res: any = await depositToVault(id, { amount: parseFloat(amount), from_address: walletId })
        txHash = res.transaction?.tx_hash || ''
      } else if (modal === 'withdraw') {
        const res: any = await withdrawFromVault(id, { amount: parseFloat(amount), to_address: walletId })
        txHash = res.transaction?.tx_hash || ''
      } else if (modal === 'transfer') {
        const res: any = await transferVault(id, { to_address: address })
        txHash = res.transaction?.tx_hash || ''
      }

      setConfirmType(modal!)
      setConfirmAmount(amount)
      setConfirmAddress(modal === 'transfer' ? address : '')
      setConfirmTxHash(txHash)

      setModal(null)
      setAmount('')
      setAddress('')
      setSubmitting(false)

      setShowConfirm(true)
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  function handleConfirmComplete() {
    setShowConfirm(false)
    setToast(
      confirmType === 'deposit' ? `Deposited Ⓝ ${confirmAmount}` :
      confirmType === 'withdraw' ? `Withdrew Ⓝ ${confirmAmount}` :
      `Transferred to ${confirmAddress}`
    )
    load()
  }

  function copyAddress(text: string) {
    navigator.clipboard.writeText(text)
    setToast('Copied!')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="h-72 rounded-xl skeleton" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-32 rounded-xl skeleton" />
            <div className="h-24 rounded-xl skeleton" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 rounded-xl skeleton" />
          </div>
        </div>
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
  const rules = vault.collection_vault_rules
  const maxWithdraw = rules ? vault.balance * (rules.max_withdrawal_pct / 100) : vault.balance

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 bg-emerald-600/90 backdrop-blur text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-up z-50 border border-emerald-500/30">
          {toast}
        </div>
      )}

      {/* Blockchain Confirmation Overlay */}
      <BlockchainConfirm
        isOpen={showConfirm}
        type={confirmType}
        amount={confirmAmount}
        address={confirmAddress}
        txHash={confirmTxHash}
        onComplete={handleConfirmComplete}
      />

      {/* Hero — gradient visual with overlay info */}
      <div className="relative rounded-2xl overflow-hidden">
        <GradientVisual
          seed={vault.metadata?.gradient_seed ?? parseInt(vault.id, 36)}
          className="h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-1 drop-shadow-lg">
              {vault.metadata?.name || `Vault #${vault.token_id}`}
            </h1>
            <Link
              to={`/collection/${vault.collection_id}`}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {vault.collection_name}
            </Link>
          </div>
          <span className="bg-zinc-900/80 backdrop-blur text-xs font-mono text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-700/50">
            #{vault.token_id}
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Balance card */}
          <div className="glass border border-zinc-800/80 rounded-2xl p-7 space-y-5 animate-slide-up delay-100" style={{ animationFillMode: 'both' }}>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Vault Balance</p>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-400 text-3xl font-bold">Ⓝ</span>
                <AnimatedNumber
                  value={vault.balance}
                  decimals={3}
                  className="text-5xl font-extrabold tracking-tight"
                />
              </div>
              <p className="text-lg text-zinc-500 mt-1">
                $<AnimatedNumber value={vault.balance * NEAR_PRICE} decimals={2} className="" /> USD
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <TrendingUp className="w-4 h-4" />
              +Ⓝ {vault.total_yield.toFixed(3)} yield earned
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-800/60">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Deposited</p>
                <p className="text-sm font-bold">Ⓝ {vault.total_deposited.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Withdrawn</p>
                <p className="text-sm font-bold">Ⓝ {vault.total_withdrawn.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Net Flow</p>
                <p className={`text-sm font-bold ${vault.total_deposited - vault.total_withdrawn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {vault.total_deposited - vault.total_withdrawn >= 0 ? '+' : ''}Ⓝ {(vault.total_deposited - vault.total_withdrawn).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Vault Info */}
          <div className="glass border border-zinc-800/80 rounded-2xl p-6 space-y-4 animate-slide-up delay-200" style={{ animationFillMode: 'both' }}>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Vault Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Link2 className="w-4 h-4" />
                  Vault Address
                </div>
                <button
                  onClick={() => copyAddress(vault.vault_address)}
                  className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {vault.vault_address.length > 36
                    ? vault.vault_address.slice(0, 18) + '…' + vault.vault_address.slice(-14)
                    : vault.vault_address}
                  <Copy className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <User className="w-4 h-4" />
                  Owner
                </div>
                <span className="text-xs font-mono text-zinc-300">{vault.owner_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  Holder Since
                </div>
                <span className="text-sm text-zinc-300">
                  {new Date(vault.holder_since).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Vault Rules */}
          {rules && (
            <div className="animate-slide-up delay-300" style={{ animationFillMode: 'both' }}>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Vault Rules</h3>
              <VaultRulesDisplay rules={rules} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions */}
          <div className="glass border border-zinc-800/80 rounded-2xl p-6 space-y-4 animate-slide-up delay-100" style={{ animationFillMode: 'both' }}>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Actions</h3>
            {isOwner ? (
              <div className="space-y-3">
                <button
                  onClick={() => setModal('deposit')}
                  className="w-full flex items-center justify-center gap-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl px-4 py-3.5 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <ArrowDownLeft className="w-5 h-5" /> Deposit Funds
                </button>
                <button
                  onClick={() => setModal('withdraw')}
                  className="w-full flex items-center justify-center gap-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-semibold rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-zinc-800/50"
                >
                  <ArrowUpRight className="w-5 h-5" /> Withdraw
                </button>
                <button
                  onClick={() => setModal('transfer')}
                  className="w-full flex items-center justify-center gap-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-semibold rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-zinc-800/50"
                >
                  <Repeat className="w-5 h-5" /> Transfer NFT
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-zinc-500 mb-1">You don't own this vault</p>
                <p className="text-xs text-zinc-600 font-mono">Owner: {vault.owner_id}</p>
                {walletId && (
                  <p className="text-xs text-zinc-600 mt-2">
                    Connect as <span className="text-cyan-400 font-mono">{vault.owner_id}</span> to manage
                  </p>
                )}
                {!walletId && (
                  <p className="text-xs text-cyan-400 mt-2">Connect a wallet to interact</p>
                )}
              </div>
            )}
          </div>

          {/* Transaction history */}
          <div className="animate-slide-up delay-200" style={{ animationFillMode: 'both' }}>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Recent Activity</h3>
            {txs.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="glass border border-zinc-800/80 rounded-2xl p-3 max-h-[420px] overflow-y-auto">
                {txs.slice(0, 15).map(tx => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => { setModal(null); setAmount(''); setAddress('') }}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-7 w-full max-w-md space-y-5 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                modal === 'deposit' ? 'bg-cyan-500/10 text-cyan-400' :
                modal === 'withdraw' ? 'bg-red-400/10 text-red-400' :
                'bg-violet-400/10 text-violet-400'
              }`}>
                {modal === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> :
                 modal === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> :
                 <Repeat className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold capitalize">{modal}</h3>
                <p className="text-xs text-zinc-500">
                  {modal === 'deposit' ? 'Add funds to this vault' :
                   modal === 'withdraw' ? 'Remove funds from this vault' :
                   'Transfer this VaultNFT to another wallet'}
                </p>
              </div>
            </div>

            {modal === 'transfer' ? (
              <div className="space-y-2">
                <label className="text-sm text-zinc-400 font-medium">Recipient Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="recipient.testnet"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors font-mono"
                  autoFocus
                />
                <p className="text-xs text-amber-400/70">
                  The vault balance (Ⓝ {vault.balance.toFixed(3)}) transfers with the NFT
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-400 font-medium">Amount (NEAR)</label>
                  {modal === 'withdraw' && (
                    <button
                      onClick={() => setAmount(maxWithdraw.toFixed(4))}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Max: Ⓝ {maxWithdraw.toFixed(3)}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">Ⓝ</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    max={modal === 'withdraw' ? maxWithdraw : undefined}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3.5 text-lg font-semibold outline-none transition-colors"
                    autoFocus
                  />
                </div>
                {amount && (
                  <p className="text-xs text-zinc-500">
                    ≈ ${(parseFloat(amount || '0') * NEAR_PRICE).toFixed(2)} USD
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setModal(null); setAmount(''); setAddress('') }}
                className="flex-1 border border-zinc-700 hover:border-zinc-500 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || (modal === 'transfer' ? !address : !amount || parseFloat(amount) <= 0)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-40 ${
                  modal === 'deposit'
                    ? 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20'
                    : modal === 'withdraw'
                    ? 'bg-red-500/80 hover:bg-red-500'
                    : 'bg-violet-600 hover:bg-violet-500'
                }`}
              >
                {submitting ? 'Submitting…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
