import { v4 as uuid } from 'uuid'
import db from './db.js'
import { generateSubAccount, generateTxHash } from './near-simulator.js'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60))
  return d.toISOString()
}

function randomBetween(min: number, max: number): number {
  return +(min + Math.random() * (max - min)).toFixed(4)
}

const owners = ['alice.testnet', 'bob.testnet', 'charlie.testnet', 'demo-creator.testnet', 'investor.testnet']

interface CollectionDef {
  name: string
  slug: string
  description: string
  accent_color: string
  mint_count: number
  vault_rules: { min_hold_days: number; max_withdrawal_pct: number; revenue_schedule: string }
  balanceRange: [number, number]
  createdDaysAgo: number
}

const collections: CollectionDef[] = [
  {
    name: 'CyberVault Genesis',
    slug: 'cybervault-genesis',
    description: 'The original VaultNFT collection. Each token holds a treasury powered by NEAR sub-accounts. Genesis holders earn monthly revenue distributions from protocol fees.',
    accent_color: '#06b6d4',
    mint_count: 10,
    vault_rules: { min_hold_days: 7, max_withdrawal_pct: 25, revenue_schedule: 'monthly' },
    balanceRange: [2, 50],
    createdDaysAgo: 28,
  },
  {
    name: 'Creator Collective',
    slug: 'creator-collective',
    description: 'A community of creators sharing revenue through VaultNFTs. Weekly distributions, no lockup. Hold a token to earn your share.',
    accent_color: '#a78bfa',
    mint_count: 5,
    vault_rules: { min_hold_days: 0, max_withdrawal_pct: 100, revenue_schedule: 'weekly' },
    balanceRange: [0.5, 15],
    createdDaysAgo: 14,
  },
  {
    name: 'Investment DAO Alpha',
    slug: 'investment-dao-alpha',
    description: 'Exclusive investment club — each VaultNFT is a position in the DAO treasury. Quarterly distributions, 30-day hold minimum, 10% max withdrawal per tx.',
    accent_color: '#f59e0b',
    mint_count: 8,
    vault_rules: { min_hold_days: 30, max_withdrawal_pct: 10, revenue_schedule: 'quarterly' },
    balanceRange: [10, 100],
    createdDaysAgo: 21,
  },
]

console.log('🗑️  Clearing existing data...')
db.exec('DELETE FROM transactions')
db.exec('DELETE FROM revenue_distributions')
db.exec('DELETE FROM vault_nfts')
db.exec('DELETE FROM collections')

console.log('🌱 Seeding VaultNFT demo data...\n')

for (const def of collections) {
  const collectionId = uuid()
  const nearAccount = `${def.slug}.vaultnft.testnet`
  const createdAt = daysAgo(def.createdDaysAgo)

  db.prepare(`
    INSERT INTO collections (id, name, slug, description, creator_id, accent_color, vault_rules, mint_count, max_supply, floor_price, near_account, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    collectionId, def.name, def.slug, def.description, 'demo-creator.testnet',
    def.accent_color, JSON.stringify(def.vault_rules), def.mint_count, def.mint_count,
    randomBetween(0.5, 5), nearAccount, createdAt,
  )

  console.log(`📦 ${def.name} (${def.mint_count} vaults)`)

  const vaultIds: string[] = []

  for (let i = 1; i <= def.mint_count; i++) {
    const vaultId = uuid()
    vaultIds.push(vaultId)
    const tokenId = `${def.slug}-${String(i).padStart(3, '0')}`
    const vaultAddress = generateSubAccount(def.slug, i)
    const owner = owners[(i - 1) % owners.length]
    const isEmpty = i <= 2 && def.slug !== 'investment-dao-alpha'
    const balance = isEmpty ? 0 : randomBetween(def.balanceRange[0], def.balanceRange[1])
    const mintedAt = daysAgo(def.createdDaysAgo - Math.floor(Math.random() * 2))

    const metadata = JSON.stringify({
      name: `${def.name} #${i}`,
      description: `Vault NFT #${i} from ${def.name}`,
      gradient_seed: Math.floor(Math.random() * 10000),
    })

    db.prepare(`
      INSERT INTO vault_nfts (id, token_id, collection_id, owner_id, vault_address, balance, total_deposited, total_withdrawn, total_yield, minted_at, holder_since, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      vaultId, tokenId, collectionId, owner, vaultAddress,
      balance, balance > 0 ? balance * 1.2 : 0, balance > 0 ? balance * 0.1 : 0, balance > 0 ? balance * 0.15 : 0,
      mintedAt, mintedAt, metadata,
    )

    db.prepare(`
      INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
      VALUES (?, ?, 'mint', 0, ?, ?, ?, ?, 'completed')
    `).run(uuid(), vaultId, nearAccount, owner, generateTxHash(), mintedAt)

    if (balance > 0) {
      const depositDays = def.createdDaysAgo - 2 - Math.floor(Math.random() * 3)
      const depositTime = daysAgo(depositDays > 0 ? depositDays : 1)
      const depositAmount = +(balance * 1.2).toFixed(4)

      db.prepare(`
        INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
        VALUES (?, ?, 'deposit', ?, ?, ?, ?, ?, 'completed')
      `).run(uuid(), vaultId, depositAmount, `${owner}`, vaultAddress, generateTxHash(), depositTime)

      if (Math.random() > 0.5) {
        const withdrawDays = Math.max(1, depositDays - 5)
        const withdrawTime = daysAgo(withdrawDays)
        const withdrawAmount = +(balance * 0.1).toFixed(4)

        db.prepare(`
          INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
          VALUES (?, ?, 'withdraw', ?, ?, ?, ?, ?, 'completed')
        `).run(uuid(), vaultId, withdrawAmount, vaultAddress, owner, generateTxHash(), withdrawTime)
      }
    }
  }

  const numDistributions = def.slug === 'creator-collective' ? 3 : def.slug === 'cybervault-genesis' ? 2 : 1
  for (let d = 0; d < numDistributions; d++) {
    const totalAmount = randomBetween(2, 20)
    const perVault = +(totalAmount / def.mint_count).toFixed(6)
    const distDays = Math.max(1, def.createdDaysAgo - 5 - d * 7)
    const distTime = daysAgo(distDays)
    const distId = uuid()
    const distTxHash = generateTxHash()

    db.prepare(`
      INSERT INTO revenue_distributions (id, collection_id, total_amount, per_vault_amount, vault_count, distributed_at, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(distId, collectionId, totalAmount, perVault, vaultIds.length, distTime, distTxHash)

    for (const vid of vaultIds) {
      db.prepare(`
        INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
        VALUES (?, ?, 'revenue', ?, ?, ?, ?, ?, 'completed')
      `).run(uuid(), vid, perVault, nearAccount, `vault.${def.slug}.vaultnft.testnet`, generateTxHash(), distTime)
    }

    console.log(`  💰 Revenue distribution #${d + 1}: ${totalAmount.toFixed(2)} NEAR → ${vaultIds.length} vaults`)
  }

  console.log('')
}

const stats = {
  collections: (db.prepare('SELECT COUNT(*) as c FROM collections').get() as any).c,
  vaults: (db.prepare('SELECT COUNT(*) as c FROM vault_nfts').get() as any).c,
  tvl: (db.prepare('SELECT COALESCE(SUM(balance), 0) as t FROM vault_nfts').get() as any).t,
  txs: (db.prepare('SELECT COUNT(*) as c FROM transactions').get() as any).c,
}

console.log('✅ Seed complete!')
console.log(`   ${stats.collections} collections, ${stats.vaults} vaults, ${stats.tvl.toFixed(2)} NEAR TVL, ${stats.txs} transactions`)
