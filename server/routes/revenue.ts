import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import { generateTxHash } from '../near-simulator.js'
import type { DistributeInput } from '../../shared/types.js'

const router = Router()

router.post('/distribute/:collectionId', (req: Request, res: Response) => {
  try {
    const input = req.body as DistributeInput
    if (!input.total_amount || input.total_amount <= 0) {
      res.status(400).json({ error: 'total_amount must be positive' })
      return
    }

    const collection = db.prepare(`SELECT * FROM collections WHERE id = ?`).get(req.params.collectionId) as any
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' })
      return
    }

    const vaults = db.prepare(`SELECT * FROM vault_nfts WHERE collection_id = ?`).all(req.params.collectionId) as any[]
    if (vaults.length === 0) {
      res.status(400).json({ error: 'No vaults in collection' })
      return
    }

    const perVault = +(input.total_amount / vaults.length).toFixed(6)
    const distId = uuid()
    const distTxHash = generateTxHash()
    const now = new Date().toISOString()

    const run = db.transaction(() => {
      db.prepare(`
        INSERT INTO revenue_distributions (id, collection_id, total_amount, per_vault_amount, vault_count, distributed_at, tx_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(distId, req.params.collectionId, input.total_amount, perVault, vaults.length, now, distTxHash)

      const updateVault = db.prepare(`UPDATE vault_nfts SET balance = balance + ?, total_yield = total_yield + ? WHERE id = ?`)
      const insertTx = db.prepare(`
        INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
        VALUES (?, ?, 'revenue', ?, ?, ?, ?, ?, 'completed')
      `)

      for (const vault of vaults) {
        updateVault.run(perVault, perVault, vault.id)
        insertTx.run(uuid(), vault.id, perVault, collection.near_account, vault.vault_address, generateTxHash(), now)
      }
    })

    run()

    res.json({
      data: {
        id: distId,
        collection_id: req.params.collectionId,
        total_amount: input.total_amount,
        per_vault_amount: perVault,
        vault_count: vaults.length,
        distributed_at: now,
        tx_hash: distTxHash,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to distribute revenue' })
  }
})

router.get('/distributions/:collectionId', (req: Request, res: Response) => {
  try {
    const distributions = db.prepare(`
      SELECT * FROM revenue_distributions WHERE collection_id = ? ORDER BY distributed_at DESC
    `).all(req.params.collectionId)

    res.json({ data: distributions })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch distributions' })
  }
})

export default router
