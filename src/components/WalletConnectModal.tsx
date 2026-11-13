import { useState } from 'react'
import { Shield, Wallet, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { DEMO_WALLETS, useWallet } from '../context/WalletContext'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function WalletConnectModal({ isOpen, onClose }: Props) {
  const { connect } = useWallet()
  const [selected, setSelected] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  if (!isOpen) return null

  async function handleConnect(wallet: string) {
    setSelected(wallet)
    setConnecting(true)

    await new Promise(r => setTimeout(r, 1500))
    setConnecting(false)
    setConnected(true)

    await new Promise(r => setTimeout(r, 800))
    connect(wallet)
    onClose()

    setSelected(null)
    setConnected(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-2xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">Connect to VaultNFT</h2>
          <p className="text-sm text-zinc-400 mt-1">Select a NEAR wallet to continue</p>
        </div>

        <div className="space-y-2">
          {DEMO_WALLETS.map(wallet => {
            const isSelected = selected === wallet
            const isConnectedWallet = isSelected && connected

            return (
              <button
                key={wallet}
                onClick={() => !connecting && handleConnect(wallet)}
                disabled={connecting && !isSelected}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-500/10 border border-cyan-500/40'
                    : 'bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
                } ${connecting && !isSelected ? 'opacity-40' : ''}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-cyan-500/20' : 'bg-zinc-700/50'
                }`}>
                  <Wallet className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{wallet.split('.')[0]}</p>
                  <p className="text-xs text-zinc-500 font-mono">{wallet}</p>
                </div>
                {isConnectedWallet ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 animate-scale-in" />
                ) : isSelected && connecting ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                )}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-zinc-600 text-center mt-5">
          Demo mode · Simulated NEAR testnet wallets
        </p>
      </div>
    </div>
  )
}
