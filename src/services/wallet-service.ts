import api from "@/lib/api"

export interface Wallet {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface WalletBalance {
  balance: number
  wallet: string
}

export const WalletService = {
  getWallets: async () => {
    const response = await api.get<Wallet[]>("/wallets/")
    return response.data
  },

  getWallet: async (id: string) => {
    const response = await api.get<Wallet>(`/wallets/${id}/`)
    return response.data
  },

  createWallet: async (data: Partial<Wallet>) => {
    const response = await api.post<Wallet>("/wallets/", data)
    return response.data
  },

  updateWallet: async (id: string, data: Partial<Wallet>) => {
    const response = await api.put<Wallet>(`/wallets/${id}/`, data)
    return response.data
  },

  deleteWallet: async (id: string) => {
    await api.delete(`/wallets/${id}/`)
  },

  getWalletBalance: async (id: string) => {
    const response = await api.get<WalletBalance>(`/wallets/${id}/balance/`)
    return response.data
  }
}
