import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import { generateSubAccount, generateTxHash } from '../near-simulator.js'
import type { CreateCollectionInput, VaultRules } from '../../shared/types.js'

const router = Router()

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function computeStats(collectionId: string) {
  const tvl = db.prepare(
    `SELECT COALESCE(SUM(balance), 0) as total_tvl FROM vault_nfts WHERE collection_id = ?`
  ).get(collectionId) as { total_tvl: number }

  const holders = db.prepare(
    `SELECT COUNT(DISTINCT owner_id) as holder_count FROM vault_nfts WHERE collection_id = ?`
  ).get(collectionId) as { holder_count: number }

  return { total_tvl: tvl.total_tvl, holder_count: holders.holder_count }
}

router.get('/', (_req: Request, res: Response) => {
  try {
    const collections = db.prepare(`SELECT * FROM collections ORDER BY created_at DESC`).all() as any[]

    const enriched = collections.map(c => {
      const stats = computeStats(c.id)
      return {
        ...c,
        vault_rules: JSON.parse(c.vault_rules),
        total_tvl: stats.total_tvl,
        holder_count: stats.holder_count,
      }
    })

    res.json({ data: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch collections' })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const collection = db.prepare(`SELECT * FROM collections WHERE id = ? OR slug = ?`).get(req.params.id, req.params.id) as any

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' })
      return
    }

    const stats = computeStats(collection.id)
    const enriched = {
      ...collection,
      vault_rules: JSON.parse(collection.vault_rules),
      total_tvl: stats.total_tvl,
      holder_count: stats.holder_count,
    }

    res.json({ data: enriched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch collection' })
  }
})

router.post('/', (req: Request, res: Response) => {
  try {
    const input = req.body as CreateCollectionInput
    if (!input.name || !input.mint_count) {
      res.status(400).json({ error: 'name and mint_count are required' })
      return
    }

    const id = uuid()
    const slug = slugify(input.name)
    const creatorId = 'demo-creator.testnet'
    const nearAccount = `${slug}.vaultnft.testnet`
    const vaultRules: VaultRules = input.vault_rules || {
      min_hold_days: 0,
      max_withdrawal_pct: 100,
      revenue_schedule: 'manual',
    }

    const owners = ['alice.testnet', 'bob.testnet', 'charlie.testnet', 'demo-creator.testnet', 'investor.testnet']

    db.prepare(`
      INSERT INTO collections (id, name, slug, description, creator_id, accent_color, vault_rules, mint_count, max_supply, near_account)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, input.name, slug, input.description || '', creatorId,
      input.accent_color || '#06b6d4', JSON.stringify(vaultRules),
      input.mint_count, input.mint_count, nearAccount
    )

    const insertVault = db.prepare(`
      INSERT INTO vault_nfts (id, token_id, collection_id, owner_id, vault_address, balance, total_deposited, metadata, minted_at, holder_since)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
      VALUES (?, ?, 'mint', 0, ?, ?, ?, datetime('now'), 'completed')
    `)

    const mintAll = db.transaction(() => {
      for (let i = 1; i <= input.mint_count; i++) {
        const vaultId = uuid()
        const tokenId = `${slug}-${String(i).padStart(3, '0')}`
        const vaultAddress = generateSubAccount(slug, i)
        const owner = owners[i % owners.length]
        const initialBalance = Math.random() < 0.3 ? 0 : +(Math.random() * 5).toFixed(4)
        const metadata = JSON.stringify({
          name: `${input.name} #${i}`,
          description: `Vault NFT #${i} from ${input.name}`,
          gradient_seed: Math.floor(Math.random() * 10000),
        })

        insertVault.run(vaultId, tokenId, id, owner, vaultAddress, initialBalance, initialBalance, metadata)
        insertTx.run(uuid(), vaultId, nearAccount, owner, generateTxHash())
      }
    })

    mintAll()

    const created = db.prepare(`SELECT * FROM collections WHERE id = ?`).get(id) as any
    const stats = computeStats(id)

    res.status(201).json({
      data: {
        ...created,
        vault_rules: JSON.parse(created.vault_rules),
        total_tvl: stats.total_tvl,
        holder_count: stats.holder_count,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create collection' })
  }
})

export default router
