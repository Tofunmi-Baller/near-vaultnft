import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import collectionsRouter from './routes/collections.js'
import vaultsRouter from './routes/vaults.js'
import revenueRouter from './routes/revenue.js'
import statsRouter from './routes/stats.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/collections', collectionsRouter)
app.use('/api/vaults', vaultsRouter)
app.use('/api/revenue', revenueRouter)
app.use('/api/stats', statsRouter)

if (process.env.NODE_ENV === 'production') {
  const clientDir = path.join(__dirname, '..', 'dist', 'client')
  app.use(express.static(clientDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`⚡ VaultNFT server running on http://localhost:${PORT}`)
})
