const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

let blockHeight = 180_000_000 + Math.floor(Math.random() * 1_000_000)

export function generateSubAccount(collectionSlug: string, tokenIndex: number): string {
  const padded = String(tokenIndex).padStart(3, '0')
  return `vault-${padded}.${collectionSlug}.vaultnft.testnet`
}

export function generateTxHash(): string {
  let hash = ''
  for (let i = 0; i < 44; i++) {
    hash += BASE58_CHARS[Math.floor(Math.random() * BASE58_CHARS.length)]
  }
  return hash
}

export function generateBlockHeight(): number {
  blockHeight += Math.floor(Math.random() * 100) + 1
  return blockHeight
}

export function getNearPrice(): number {
  return 6.42
}

export function simulateDeposit(amount: number) {
  return {
    tx_hash: generateTxHash(),
    block_height: generateBlockHeight(),
    timestamp: new Date().toISOString(),
    amount,
  }
}

export function simulateWithdraw(amount: number) {
  return {
    tx_hash: generateTxHash(),
    block_height: generateBlockHeight(),
    timestamp: new Date().toISOString(),
    amount,
  }
}

export function simulateTransfer(from: string, to: string) {
  return {
    tx_hash: generateTxHash(),
    block_height: generateBlockHeight(),
    timestamp: new Date().toISOString(),
    from,
    to,
  }
}

export function formatNear(amount: number): string {
  return `${amount.toFixed(4)} Ⓝ`
}
