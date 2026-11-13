import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export const DEMO_WALLETS = [
  'alice.testnet',
  'bob.testnet',
  'charlie.testnet',
  'demo-creator.testnet',
  'investor.testnet',
]

interface WalletContextValue {
  walletId: string | null
  isConnected: boolean
  connect: (walletId: string) => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue>({
  walletId: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletId, setWalletId] = useState<string | null>('demo-creator.testnet')

  const connect = useCallback((id: string) => setWalletId(id), [])
  const disconnect = useCallback(() => setWalletId(null), [])

  return (
    <WalletContext.Provider value={{ walletId, isConnected: !!walletId, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
