import api from "@/lib/api"

export interface CashFlowItem {
  id: string
  name: string
  parent?: string
  description?: string
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface CashFlowItemHierarchy extends CashFlowItem {
  children?: CashFlowItemHierarchy[]
}

export const CashFlowItemService = {
  getCashFlowItems: async () => {
    const response = await api.get<CashFlowItem[]>("/cash-flow-items/")
    return response.data
  },

  getCashFlowItem: async (id: string) => {
    const response = await api.get<CashFlowItem>(`/cash-flow-items/${id}/`)
    return response.data
  },

  createCashFlowItem: async (data: Partial<CashFlowItem>) => {
    const response = await api.post<CashFlowItem>("/cash-flow-items/", data)
    return response.data
  },

  updateCashFlowItem: async (id: string, data: Partial<CashFlowItem>) => {
    const response = await api.put<CashFlowItem>(`/cash-flow-items/${id}/`, data)
    return response.data
  },

  deleteCashFlowItem: async (id: string) => {
    await api.delete(`/cash-flow-items/${id}/`)
  },

  getCashFlowItemHierarchy: async () => {
    const response = await api.get<CashFlowItemHierarchy[]>("/cash-flow-items/hierarchy/")
    return response.data
  }
}
