/**
 * VaultNFT Demo Script
 * Runs the full lifecycle: create → deposit → view → withdraw → transfer → revenue
 * Usage: npm run demo
 */

const API = 'http://localhost:3001/api'
const NEAR_SYMBOL = 'Ⓝ'

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(`API ${res.status}: ${err.error || res.statusText}`)
  }
  const json = await res.json()
  return json.data
}

function log(emoji: string, msg: string) {
  console.log(`\n  ${emoji}  ${msg}`)
}

function divider(title: string) {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('═'.repeat(60))
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗              ║
║   ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝              ║
║   ██║   ██║███████║██║   ██║██║     ██║                  ║
║   ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║                  ║
║    ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   NFT            ║
║     ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝                ║
║                                                          ║
║   NFTs That Own Treasuries — Full Lifecycle Demo         ║
║   Built on NEAR Protocol                                 ║
╚══════════════════════════════════════════════════════════╝
`)

  await sleep(500)

  // ─── Step 1: Platform Stats ───
  divider('STEP 1: Platform Overview')
  const stats: any = await api('/stats')
  log('📊', `Collections: ${stats.total_collections}`)
  log('🏦', `Total Vaults: ${stats.total_vaults}`)
  log('💰', `Platform TVL: ${stats.total_tvl.toFixed(2)} ${NEAR_SYMBOL} ($${(stats.total_tvl * stats.near_price_usd).toFixed(2)} USD)`)
  log('📈', `NEAR Price: $${stats.near_price_usd}`)

  await sleep(800)

  // ─── Step 2: Create a new collection ───
  divider('STEP 2: Create VaultNFT Collection')
  log('🎨', 'Creating "Hackathon Heroes" collection with 3 vaults...')

  const collection: any = await api('/collections', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Hackathon Heroes',
      description: 'Limited edition VaultNFTs for NEAR Hackathon 2026 participants. Each NFT holds a treasury that earns yield from hackathon prize distributions.',
      accent_color: '#06b6d4',
      mint_count: 3,
      vault_rules: {
        min_hold_days: 7,
        max_withdrawal_pct: 50,
        revenue_schedule: 'weekly',
      },
    }),
  })

  log('✅', `Collection created: "${collection.name}"`)
  log('🔗', `NEAR Account: ${collection.near_account}`)
  log('🎫', `Minted ${collection.mint_count} VaultNFTs`)

  await sleep(800)

  // ─── Step 3: View minted vaults ───
  divider('STEP 3: View Minted Vaults')
  const vaults: any[] = await api(`/vaults/collection/${collection.id}`)

  for (const vault of vaults) {
    log('🏦', `${vault.metadata.name}`)
    console.log(`        Vault: ${vault.vault_address}`)
    console.log(`        Balance: ${vault.balance.toFixed(4)} ${NEAR_SYMBOL}`)
    console.log(`        Owner: ${vault.owner_id}`)
  }

  await sleep(800)

  // ─── Step 4: Deposit into a vault ───
  divider('STEP 4: Deposit Funds via NEAR Intents')
  const targetVault = vaults[0]
  log('💳', `Depositing 10 ${NEAR_SYMBOL} into ${targetVault.metadata.name}...`)

  const depositResult: any = await api(`/vaults/${targetVault.id}/deposit`, {
    method: 'POST',
    body: JSON.stringify({
      amount: 10,
      from_address: 'alice.testnet',
      token: 'NEAR',
    }),
  })

  log('✅', `Deposit complete!`)
  log('📄', `Tx: ${depositResult.transaction.tx_hash}`)
  log('💰', `New balance: ${depositResult.vault.balance.toFixed(4)} ${NEAR_SYMBOL}`)

  await sleep(800)

  // ─── Step 5: Check vault balance ───
  divider('STEP 5: Vault Balance Check')
  const updatedVault: any = await api(`/vaults/${targetVault.id}`)
  log('🏦', `${updatedVault.metadata.name}`)
  console.log(`        Balance: ${updatedVault.balance.toFixed(4)} ${NEAR_SYMBOL} ($${(updatedVault.balance * 6.42).toFixed(2)} USD)`)
  console.log(`        Total Deposited: ${updatedVault.total_deposited.toFixed(4)} ${NEAR_SYMBOL}`)
  console.log(`        Total Yield: ${updatedVault.total_yield.toFixed(4)} ${NEAR_SYMBOL}`)

  await sleep(800)

  // ─── Step 6: Withdraw from vault ───
  divider('STEP 6: Withdraw Funds')
  log('💸', `Withdrawing 3 ${NEAR_SYMBOL} from vault...`)

  const withdrawResult: any = await api(`/vaults/${targetVault.id}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({
      amount: 3,
      to_address: 'alice.testnet',
    }),
  })

  log('✅', `Withdrawal complete!`)
  log('📄', `Tx: ${withdrawResult.transaction.tx_hash}`)
  log('💰', `Remaining balance: ${withdrawResult.vault.balance.toFixed(4)} ${NEAR_SYMBOL}`)

  await sleep(800)

  // ─── Step 7: Revenue Distribution ───
  divider('STEP 7: Revenue Distribution')
  log('📤', `Creator distributing 9 ${NEAR_SYMBOL} across ${vaults.length} vaults...`)

  const distResult: any = await api(`/revenue/distribute/${collection.id}`, {
    method: 'POST',
    body: JSON.stringify({ total_amount: 9 }),
  })

  log('✅', `Revenue distributed!`)
  log('💰', `Per vault: ${distResult.distribution.per_vault_amount.toFixed(4)} ${NEAR_SYMBOL}`)
  log('📄', `Tx: ${distResult.distribution.tx_hash}`)

  await sleep(500)

  const vaultsAfter: any[] = await api(`/vaults/collection/${collection.id}`)
  log('📊', 'Updated vault balances:')
  for (const v of vaultsAfter) {
    console.log(`        ${v.metadata.name}: ${v.balance.toFixed(4)} ${NEAR_SYMBOL} (yield: ${v.total_yield.toFixed(4)} ${NEAR_SYMBOL})`)
  }

  await sleep(800)

  // ─── Step 8: Transfer NFT (and vault!) ───
  divider('STEP 8: Transfer VaultNFT → New Owner Gets the Vault')
  const vaultToTransfer = vaultsAfter[0]
  log('🔄', `Transferring ${vaultToTransfer.metadata.name} from ${vaultToTransfer.owner_id} to bob.testnet...`)
  log('💰', `Vault balance traveling with NFT: ${vaultToTransfer.balance.toFixed(4)} ${NEAR_SYMBOL}`)

  const transferResult: any = await api(`/vaults/${vaultToTransfer.id}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ to_address: 'bob.testnet' }),
  })

  log('✅', `Transfer complete!`)
  log('👤', `New owner: ${transferResult.vault.owner_id}`)
  log('💰', `Vault balance (unchanged): ${transferResult.vault.balance.toFixed(4)} ${NEAR_SYMBOL}`)
  log('📄', `Tx: ${transferResult.transaction.tx_hash}`)

  await sleep(800)

  // ─── Step 9: Transaction History ───
  divider('STEP 9: Vault Transaction History')
  const txs: any[] = await api(`/vaults/${targetVault.id}/transactions`)
  log('📜', `${txs.length} transactions for ${targetVault.metadata.name}:`)
  for (const tx of txs.slice(0, 5)) {
    const sign = ['deposit', 'revenue', 'mint'].includes(tx.type) ? '+' : '-'
    const amount = tx.amount ? `${sign}${tx.amount.toFixed(4)} ${NEAR_SYMBOL}` : ''
    console.log(`        ${tx.type.padEnd(10)} ${amount.padEnd(20)} ${tx.tx_hash.slice(0, 16)}...`)
  }

  await sleep(800)

  // ─── Step 10: Portfolio View ───
  divider('STEP 10: Portfolio View (bob.testnet)')
  const portfolio: any = await api('/vaults/user/bob.testnet')
  log('👛', `bob.testnet's VaultNFT Portfolio:`)
  console.log(`        Vaults: ${portfolio.length}`)
  const totalBalance = portfolio.reduce((s: number, v: any) => s + v.balance, 0)
  console.log(`        Total Value: ${totalBalance.toFixed(4)} ${NEAR_SYMBOL} ($${(totalBalance * 6.42).toFixed(2)} USD)`)

  // ─── Done ───
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ✅ Demo Complete!                                      ║
║                                                          ║
║   Full lifecycle demonstrated:                           ║
║   1. ✅ Created collection with VaultNFTs                ║
║   2. ✅ Deposited funds into vault                       ║
║   3. ✅ Checked vault balance                            ║
║   4. ✅ Withdrew funds from vault                        ║
║   5. ✅ Distributed revenue to all vaults                ║
║   6. ✅ Transferred NFT → new holder controls vault      ║
║   7. ✅ Verified transaction history                     ║
║   8. ✅ Viewed portfolio across wallets                  ║
║                                                          ║
║   Your NFT has a bank account. 🏦                        ║
║                                                          ║
║   Start the UI: npm run dev                              ║
║   Open: http://localhost:5173                            ║
╚══════════════════════════════════════════════════════════╝
`)
}

main().catch(err => {
  console.error('\n  ❌ Demo failed:', err.message)
  console.error('     Make sure the server is running: npm run dev:server')
  process.exit(1)
})
