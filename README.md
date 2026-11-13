# VaultNFT — NFTs That Own Treasuries

> Your NFT has a bank account. 🏦

**NEAR Hackathon 2026 — Track 10: NFTs That Do Something**

VaultNFT is a platform where NFTs own real treasuries. Each VaultNFT controls a NEAR sub-account with actual funds — deposit, withdraw, earn yield, and when you sell the NFT, the buyer gets the vault too. The value travels with the token.

![VaultNFT](https://img.shields.io/badge/NEAR-Protocol-00C1DE?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge)

## The Concept

Traditional NFTs are static — a JPEG with metadata. VaultNFTs are **financial instruments**:

- **Isolated Treasury**: Each NFT owns a NEAR sub-account (e.g., `vault-001.cybervault.vaultnft.testnet`)
- **Full Control**: The holder deposits, withdraws, and manages their vault
- **Revenue Streaming**: Creators distribute funds to all vaults in a collection
- **Portable Value**: Sell the NFT → the buyer inherits the vault balance
- **Vault Rules**: Creators set guardrails — hold periods, withdrawal limits, revenue schedules

### Use Cases

| Use Case | How It Works |
|----------|-------------|
| **Membership Passes** | Club NFTs with built-in budgets for events and perks |
| **Creator Tokens** | Revenue-sharing NFTs that drip earnings to holders |
| **Investment Clubs** | Tradeable positions in a managed fund |
| **DAOs** | Treasury management as transferable NFT positions |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    VaultNFT Platform                  │
├──────────────────────┬──────────────────────────────┤
│   React Frontend     │     Express Backend           │
│                      │                               │
│  Explore             │  /api/collections             │
│  Collection View     │  /api/vaults                  │
│  Vault Detail        │  /api/revenue                 │
│  My Vaults           │  /api/stats                   │
│  Create Collection   │                               │
│  Revenue Dashboard   │  SQLite (vault state)         │
├──────────────────────┴──────────────────────────────┤
│                 NEAR Simulation Layer                 │
│                                                      │
│  Sub-accounts    Intents    Tx Hashes    Balances    │
│  vault-001.collection.vaultnft.testnet               │
├──────────────────────────────────────────────────────┤
│                   NEAR Protocol                       │
│                                                      │
│  Sub-accounts (vault isolation)                      │
│  NEP-171/177 (NFT standard)                          │
│  NEAR Intents (cross-token deposits)                 │
│  Chain Signatures (cross-chain funding)              │
└──────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | Express + better-sqlite3 |
| Icons | Lucide React |
| Charts | Recharts |
| NEAR | Sub-accounts, NEP-171, Intents (simulation mode) |

## Quick Start

```bash
# Clone
git clone https://github.com/Tofunmi-Baller/near-vaultnft.git
cd near-vaultnft

# Install
npm install

# Seed demo data
npm run seed

# Start dev servers (frontend + backend)
npm run dev

# Open http://localhost:5173
```

## Demo

Run the scripted lifecycle demo:

```bash
# Start the server first
npm run dev:server

# In another terminal, run the demo
npm run demo
```

The demo walks through the complete VaultNFT lifecycle:

1. **Create** — Mint a VaultNFT collection with treasury vaults
2. **Deposit** — Fund a vault via NEAR Intents
3. **Balance** — Check vault balance and yield
4. **Withdraw** — Pull funds from the vault
5. **Revenue** — Creator distributes earnings to all vaults
6. **Transfer** — Sell/transfer the NFT — vault goes with it
7. **History** — View full transaction history
8. **Portfolio** — See all vaults across wallets

## Key Screens

### Explore
Browse collections sorted by TVL, discover VaultNFTs with the highest treasury balances.

### Vault Detail
The core experience — see your vault's balance (big number), deposit/withdraw, view transaction history, check vault rules.

### My Vaults
Portfolio view — total value across all your VaultNFTs, aggregate yield, performance over time.

### Revenue Dashboard
Creator tool — distribute funds across all vaults in a collection, track TVL and holder activity.

## NEAR-Native Design

VaultNFT leverages NEAR's unique account model:

- **Sub-accounts** provide natural vault isolation — `vault-001.collection.vaultnft.testnet` is a real account
- **NEAR Intents** enable cross-token deposits (any token → stablecoin → vault)
- **NEP-171** compliance means VaultNFTs work with any NEAR marketplace
- **Chain Signatures** can bridge funds from other chains into vaults

This architecture is **only possible on NEAR** — no other chain has hierarchical accounts that make vault isolation this clean.

## Simulation Mode

For the hackathon demo, the platform runs in simulation mode:

- Vault addresses use realistic NEAR sub-account format
- Transaction hashes are generated in NEAR's base58 format
- Balances and yields follow realistic patterns
- NEAR price feed is simulated at market rates

All simulated data is clearly marked. The architecture is designed for direct on-chain deployment — swap the simulation layer for real NEAR RPC calls.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/collections` | List all collections |
| GET | `/api/collections/:id` | Collection detail with stats |
| POST | `/api/collections` | Create new collection + mint vaults |
| GET | `/api/vaults/collection/:id` | Vaults in a collection |
| GET | `/api/vaults/:id` | Vault detail |
| GET | `/api/vaults/user/:userId` | User's vault portfolio |
| POST | `/api/vaults/:id/deposit` | Deposit funds |
| POST | `/api/vaults/:id/withdraw` | Withdraw funds |
| POST | `/api/vaults/:id/transfer` | Transfer NFT + vault |
| GET | `/api/vaults/:id/transactions` | Transaction history |
| POST | `/api/revenue/distribute/:id` | Distribute revenue |
| GET | `/api/revenue/distributions/:id` | Distribution history |
| GET | `/api/stats` | Platform stats |

## Team

Built for NEAR Hackathon 2026 — Track 10: NFTs That Do Something.

## License

MIT
