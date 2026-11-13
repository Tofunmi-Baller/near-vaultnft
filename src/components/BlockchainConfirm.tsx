import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, ExternalLink } from 'lucide-react'

interface Props {
  isOpen: boolean
  type: 'deposit' | 'withdraw' | 'transfer' | 'distribute' | 'mint'
  amount?: string
  address?: string
  onComplete: () => void
  txHash?: string
}

const STEPS = {
  deposit: ['Preparing transaction', 'Routing via NEAR Intents', 'Confirming on-chain', 'Updating vault balance'],
  withdraw: ['Validating vault rules', 'Preparing withdrawal', 'Confirming on-chain', 'Funds sent to wallet'],
  transfer: ['Verifying ownership', 'Transferring NEP-171 token', 'Updating vault controller', 'Transfer complete'],
  distribute: ['Calculating shares', 'Creating batch transaction', 'Distributing to vaults', 'Revenue distributed'],
  mint: ['Creating sub-accounts', 'Minting NEP-171 tokens', 'Initializing vaults', 'Collection ready'],
}

const TYPE_LABELS = {
  deposit: 'Depositing Funds',
  withdraw: 'Withdrawing Funds',
  transfer: 'Transferring VaultNFT',
  distribute: 'Distributing Revenue',
  mint: 'Minting Collection',
}

export default function BlockchainConfirm({ isOpen, type, amount, address, onComplete, txHash }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const steps = STEPS[type]

  useEffect(() => {
    if (!isOpen) { setCurrentStep(0); setDone(false); return }

    const timers: NodeJS.Timeout[] = []
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrentStep(i + 1), (i + 1) * 800))
    })
    timers.push(setTimeout(() => setDone(true), steps.length * 800 + 400))
    timers.push(setTimeout(onComplete, steps.length * 800 + 2000))

    return () => timers.forEach(clearTimeout)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          {!done ? (
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          )}
          <h3 className="text-lg font-bold">{done ? 'Success!' : TYPE_LABELS[type]}</h3>
          {amount && <p className="text-sm text-zinc-400 mt-1">Ⓝ {amount}</p>}
          {address && <p className="text-xs text-zinc-500 font-mono mt-1">{address}</p>}
        </div>

        <div className="space-y-3">
          {steps.map((label, i) => {
            const isActive = currentStep === i + 1 && !done
            const isComplete = currentStep > i + 1 || done

            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isComplete ? 'bg-emerald-500/20' :
                  isActive ? 'bg-cyan-500/20' :
                  'bg-zinc-800'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 bg-zinc-600 rounded-full" />
                  )}
                </div>
                <span className={`text-sm transition-colors duration-300 ${
                  isComplete ? 'text-zinc-300' :
                  isActive ? 'text-cyan-400 font-medium' :
                  'text-zinc-600'
                }`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {done && txHash && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Transaction Hash</span>
              <a
                href={`https://testnet.nearblocks.io/txns/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {txHash.slice(0, 10)}…{txHash.slice(-6)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-600 mt-1">Simulated · NEAR Testnet</p>
          </div>
        )}
      </div>
    </div>
  )
}
