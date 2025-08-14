import api from "@/lib/api"

export interface Wallet {
  id: string
  name: string
  code?: string | null
  hidden?: boolean
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
    const { data } = await api.get<any[]>("/wallets/")
    return data.map((w) => ({
      id: w.id,
      name: w.name,
      code: w.code ?? null,
      hidden: !!w.hidden,
      created_at: w.created_at,
      updated_at: w.updated_at,
      deleted: !!w.deleted,
    })) as Wallet[]
  },

  getWallet: async (id: string) => {
    const { data: w } = await api.get<any>(`/wallets/${id}/`)
    const mapped: Wallet = {
      id: w.id,
      name: w.name,
      code: w.code ?? null,
      hidden: !!w.hidden,
      created_at: w.created_at,
      updated_at: w.updated_at,
      deleted: !!w.deleted,
    }
    return mapped
  },

  createWallet: async (data: Partial<Wallet>) => {
    const payload = {
      code: data.code,
      name: data.name,
      hidden: data.hidden,
    }
    const response = await api.post<any>("/wallets/", payload)
    return WalletService.getWallet(response.data.id)
  },

  updateWallet: async (id: string, data: Partial<Wallet>) => {
    const payload = {
      code: data.code,
      name: data.name,
      hidden: data.hidden,
    }
    await api.put<any>(`/wallets/${id}/`, payload)
    return WalletService.getWallet(id)
  },

  deleteWallet: async (id: string) => {
    await api.delete(`/wallets/${id}/`)
  },

  getWalletBalance: async (id: string) => {
    const { data } = await api.get<any>(`/wallets/${id}/balance/`)
    // спецификация возвращает объект кошелька; если бек вернет другое — адаптируйте здесь
    if (typeof data.balance === 'number') {
      return { balance: data.balance, wallet: id }
    }
    return { balance: 0, wallet: id }
  }
}
