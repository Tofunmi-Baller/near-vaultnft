export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  creator_id: string
  image_url: string | null
  accent_color: string
  vault_rules: VaultRules
  mint_count: number
  max_supply: number
  floor_price: number
  total_tvl: number
  holder_count: number
  near_account: string
  created_at: string
}

export interface VaultRules {
  min_hold_days: number
  max_withdrawal_pct: number
  revenue_schedule: 'weekly' | 'monthly' | 'quarterly' | 'manual'
}

export interface VaultNFT {
  id: string
  token_id: string
  collection_id: string
  collection_name?: string
  collection_slug?: string
  owner_id: string
  vault_address: string
  balance: number
  total_deposited: number
  total_withdrawn: number
  total_yield: number
  minted_at: string
  holder_since: string
  metadata: VaultMetadata
}

export interface VaultMetadata {
  name: string
  description: string
  gradient_seed: number
}

export interface Transaction {
  id: string
  vault_id: string
  type: 'deposit' | 'withdraw' | 'transfer' | 'revenue' | 'mint'
  amount: number
  from_address: string
  to_address: string
  tx_hash: string
  timestamp: string
  status: 'completed' | 'pending'
}

export interface RevenueDistribution {
  id: string
  collection_id: string
  total_amount: number
  per_vault_amount: number
  vault_count: number
  distributed_at: string
  tx_hash: string
}

export interface PlatformStats {
  total_collections: number
  total_vaults: number
  total_tvl: number
  total_transactions: number
  near_price_usd: number
}

export interface UserPortfolio {
  wallet_id: string
  vaults: VaultNFT[]
  total_balance: number
  total_yield: number
  vault_count: number
}

export interface CreateCollectionInput {
  name: string
  description: string
  accent_color: string
  mint_count: number
  vault_rules: VaultRules
}

export interface DepositInput {
  amount: number
  from_address: string
  token?: string
}

export interface WithdrawInput {
  amount: number
  to_address: string
}

export interface TransferInput {
  to_address: string
}

export interface DistributeInput {
  total_amount: number
}
