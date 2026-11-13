import { Router, Request, Response } from 'express'
import db from '../db.js'
import { getNearPrice } from '../near-simulator.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  try {
    const collections = db.prepare(`SELECT COUNT(*) as count FROM collections`).get() as { count: number }
    const vaults = db.prepare(`SELECT COUNT(*) as count FROM vault_nfts`).get() as { count: number }
    const tvl = db.prepare(`SELECT COALESCE(SUM(balance), 0) as total FROM vault_nfts`).get() as { total: number }
    const txs = db.prepare(`SELECT COUNT(*) as count FROM transactions`).get() as { count: number }

    res.json({
      data: {
        total_collections: collections.count,
        total_vaults: vaults.count,
        total_tvl: tvl.total,
        total_transactions: txs.count,
        near_price_usd: getNearPrice(),
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
