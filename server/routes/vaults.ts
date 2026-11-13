import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import { generateTxHash, simulateDeposit, simulateWithdraw, simulateTransfer } from '../near-simulator.js'
import type { DepositInput, WithdrawInput, TransferInput, VaultRules } from '../../shared/types.js'

const router = Router()

router.get('/collection/:collectionId', (req: Request, res: Response) => {
  try {
    const vaults = db.prepare(`
      SELECT v.*, c.name as collection_name, c.slug as collection_slug
      FROM vault_nfts v
      JOIN collections c ON v.collection_id = c.id
      WHERE v.collection_id = ?
      ORDER BY v.token_id ASC
    `).all(req.params.collectionId) as any[]

    const parsed = vaults.map(v => ({ ...v, metadata: JSON.parse(v.metadata) }))
    res.json({ data: parsed })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch vaults' })
  }
})

router.get('/user/:userId', (req: Request, res: Response) => {
  try {
    const vaults = db.prepare(`
      SELECT v.*, c.name as collection_name, c.slug as collection_slug
      FROM vault_nfts v
      JOIN collections c ON v.collection_id = c.id
      WHERE v.owner_id = ?
      ORDER BY v.balance DESC
    `).all(req.params.userId) as any[]

    const parsed = vaults.map(v => ({ ...v, metadata: JSON.parse(v.metadata) }))

    const total_balance = parsed.reduce((sum, v) => sum + v.balance, 0)
    const total_yield = parsed.reduce((sum, v) => sum + v.total_yield, 0)

    res.json({
      data: {
        wallet_id: req.params.userId,
        vaults: parsed,
        total_balance,
        total_yield,
        vault_count: parsed.length,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user vaults' })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const vault = db.prepare(`
      SELECT v.*, c.name as collection_name, c.slug as collection_slug, c.vault_rules as collection_vault_rules, c.accent_color
      FROM vault_nfts v
      JOIN collections c ON v.collection_id = c.id
      WHERE v.id = ?
    `).get(req.params.id) as any

    if (!vault) {
      res.status(404).json({ error: 'Vault not found' })
      return
    }

    res.json({
      data: {
        ...vault,
        metadata: JSON.parse(vault.metadata),
        collection_vault_rules: JSON.parse(vault.collection_vault_rules),
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch vault' })
  }
})

router.post('/:id/deposit', (req: Request, res: Response) => {
  try {
    const input = req.body as DepositInput
    if (!input.amount || input.amount <= 0) {
      res.status(400).json({ error: 'amount must be positive' })
      return
    }

    const vault = db.prepare(`SELECT * FROM vault_nfts WHERE id = ?`).get(req.params.id) as any
    if (!vault) {
      res.status(404).json({ error: 'Vault not found' })
      return
    }

    const sim = simulateDeposit(input.amount)
    const txId = uuid()

    const run = db.transaction(() => {
      db.prepare(`
        UPDATE vault_nfts SET balance = balance + ?, total_deposited = total_deposited + ? WHERE id = ?
      `).run(input.amount, input.amount, vault.id)

      db.prepare(`
        INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
        VALUES (?, ?, 'deposit', ?, ?, ?, ?, ?, 'completed')
      `).run(txId, vault.id, input.amount, input.from_address || 'external.testnet', vault.vault_address, sim.tx_hash, sim.timestamp)
    })

    run()

    const updated = db.prepare(`SELECT * FROM vault_nfts WHERE id = ?`).get(req.params.id) as any
    res.json({
      data: {
        vault: { ...updated, metadata: JSON.parse(updated.metadata) },
        transaction: { id: txId, tx_hash: sim.tx_hash, block_height: sim.block_height },
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to deposit' })
  }
})

router.post('/:id/withdraw', (req: Request, res: Response) => {
  try {
    const input = req.body as WithdrawInput
    if (!input.amount || input.amount <= 0) {
      res.status(400).json({ error: 'amount must be positive' })
      return
    }

    const vault = db.prepare(`
      SELECT v.*, c.vault_rules FROM vault_nfts v
      JOIN collections c ON v.collection_id = c.id
      WHERE v.id = ?
    `).get(req.params.id) as any

    if (!vault) {
      res.status(404).json({ error: 'Vault not found' })
      return
    }

    const rules: VaultRules = JSON.parse(vault.vault_rules)
    const maxAmount = vault.balance * (rules.max_withdrawal_pct / 100)

    if (input.amount > maxAmount) {
      res.status(400).json({ error: `Exceeds max withdrawal (${rules.max_withdrawal_pct}% = ${maxAmount.toFixed(4)} NEAR)` })
      return
    }

    if (input.amount > vault.balance) {
      res.status(400).json({ error: 'Insufficient balance' })
      return
    }

    const holdDays = (Date.now() - new Date(vault.holder_since).getTime()) / (1000 * 60 * 60 * 24)
    if (holdDays < rules.min_hold_days) {
      res.status(400).json({ error: `Must hold for ${rules.min_hold_days} days (held ${Math.floor(holdDays)} days)` })
      return
    }

    const sim = simulateWithdraw(input.amount)
    const txId = uuid()

    const run = db.transaction(() => {
      db.prepare(`
        UPDATE vault_nfts SET balance = balance - ?, total_withdrawn = total_withdrawn + ? WHERE id = ?
      `).run(input.amount, input.amount, vault.id)

      db.prepare(`
        INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
        VALUES (?, ?, 'withdraw', ?, ?, ?, ?, ?, 'completed')
      `).run(txId, vault.id, input.amount, vault.vault_address, input.to_address || vault.owner_id, sim.tx_hash, sim.timestamp)
    })

    run()

    const updated = db.prepare(`SELECT * FROM vault_nfts WHERE id = ?`).get(req.params.id) as any
    res.json({
      data: {
        vault: { ...updated, metadata: JSON.parse(updated.metadata) },
        transaction: { id: txId, tx_hash: sim.tx_hash, block_height: sim.block_height },
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to withdraw' })
  }
})

router.post('/:id/transfer', (req: Request, res: Response) => {
  try {
    const input = req.body as TransferInput
    if (!input.to_address) {
      res.status(400).json({ error: 'to_address is required' })
      return
    }

    const vault = db.prepare(`SELECT * FROM vault_nfts WHERE id = ?`).get(req.params.id) as any
    if (!vault) {
      res.status(404).json({ error: 'Vault not found' })
      return
    }

    const sim = simulateTransfer(vault.owner_id, input.to_address)
    const txId = uuid()
    const prevOwner = vault.owner_id

    const run = db.transaction(() => {
      db.prepare(`
        UPDATE vault_nfts SET owner_id = ?, holder_since = datetime('now') WHERE id = ?
      `).run(input.to_address, vault.id)

      db.prepare(`
        INSERT INTO transactions (id, vault_id, type, amount, from_address, to_address, tx_hash, timestamp, status)
        VALUES (?, ?, 'transfer', ?, ?, ?, ?, ?, 'completed')
      `).run(txId, vault.id, vault.balance, prevOwner, input.to_address, sim.tx_hash, sim.timestamp)
    })

    run()

    const updated = db.prepare(`SELECT * FROM vault_nfts WHERE id = ?`).get(req.params.id) as any
    res.json({
      data: {
        vault: { ...updated, metadata: JSON.parse(updated.metadata) },
        transaction: { id: txId, tx_hash: sim.tx_hash, block_height: sim.block_height },
        previous_owner: prevOwner,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to transfer' })
  }
})

router.get('/:id/transactions', (req: Request, res: Response) => {
  try {
    const txs = db.prepare(`
      SELECT * FROM transactions WHERE vault_id = ? ORDER BY timestamp DESC LIMIT 50
    `).all(req.params.id)

    res.json({ data: txs })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

export default router
