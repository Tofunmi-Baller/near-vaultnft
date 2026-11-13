import type {
  Collection,
  VaultNFT,
  Transaction,
  RevenueDistribution,
  PlatformStats,
  UserPortfolio,
  CreateCollectionInput,
  DepositInput,
  WithdrawInput,
  TransferInput,
  DistributeInput,
} from '../shared/types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  const json = await res.json()
  return json.data as T
}

export function fetchCollections(): Promise<Collection[]> {
  return request('/collections')
}

export function fetchCollection(id: string): Promise<Collection> {
  return request(`/collections/${id}`)
}

export function createCollection(input: CreateCollectionInput): Promise<Collection> {
  return request('/collections', { method: 'POST', body: JSON.stringify(input) })
}

export function fetchCollectionVaults(collectionId: string): Promise<VaultNFT[]> {
  return request(`/vaults/collection/${collectionId}`)
}

export function fetchVault(id: string): Promise<VaultNFT> {
  return request(`/vaults/${id}`)
}

export function fetchUserVaults(userId: string): Promise<UserPortfolio> {
  return request(`/vaults/user/${encodeURIComponent(userId)}`)
}

export function depositToVault(id: string, input: DepositInput): Promise<Transaction> {
  return request(`/vaults/${id}/deposit`, { method: 'POST', body: JSON.stringify(input) })
}

export function withdrawFromVault(id: string, input: WithdrawInput): Promise<Transaction> {
  return request(`/vaults/${id}/withdraw`, { method: 'POST', body: JSON.stringify(input) })
}

export function transferVault(id: string, input: TransferInput): Promise<{ transaction: Transaction; vault: VaultNFT }> {
  return request(`/vaults/${id}/transfer`, { method: 'POST', body: JSON.stringify(input) })
}

export function fetchVaultTransactions(id: string): Promise<Transaction[]> {
  return request(`/vaults/${id}/transactions`)
}

export function distributeRevenue(collectionId: string, input: DistributeInput): Promise<RevenueDistribution> {
  return request(`/revenue/distribute/${collectionId}`, { method: 'POST', body: JSON.stringify(input) })
}

export function fetchDistributions(collectionId: string): Promise<RevenueDistribution[]> {
  return request(`/revenue/distributions/${collectionId}`)
}

export function fetchStats(): Promise<PlatformStats> {
  return request('/stats')
}
