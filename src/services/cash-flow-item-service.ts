import api from "@/lib/api"

export interface CashFlowItem {
  id: string
  name: string | null
  code?: string | null
  parent?: string
  include_in_budget?: boolean | null
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface CashFlowItemHierarchy extends CashFlowItem {
  children?: CashFlowItemHierarchy[]
}

export const CashFlowItemService = {
  getCashFlowItems: async () => {
    const { data } = await api.get<any[]>("/cash-flow-items/")
    return data.map((i) => ({
      id: i.id,
      name: i.name ?? null,
      code: i.code ?? null,
      parent: i.parent ?? undefined,
      include_in_budget: i.include_in_budget ?? null,
      created_at: i.created_at,
      updated_at: i.updated_at,
      deleted: !!i.deleted,
    })) as CashFlowItem[]
  },

  getCashFlowItem: async (id: string) => {
    const { data: i } = await api.get<any>(`/cash-flow-items/${id}/`)
    const mapped: CashFlowItem = {
      id: i.id,
      name: i.name ?? null,
      code: i.code ?? null,
      parent: i.parent ?? undefined,
      include_in_budget: i.include_in_budget ?? null,
      created_at: i.created_at,
      updated_at: i.updated_at,
      deleted: !!i.deleted,
    }
    return mapped
  },

  createCashFlowItem: async (data: Partial<CashFlowItem>) => {
    const payload = {
      code: data.code,
      name: data.name,
      parent: data.parent,
      include_in_budget: data.include_in_budget,
    }
    const response = await api.post<any>("/cash-flow-items/", payload)
    return CashFlowItemService.getCashFlowItem(response.data.id)
  },

  updateCashFlowItem: async (id: string, data: Partial<CashFlowItem>) => {
    const payload = {
      code: data.code,
      name: data.name,
      parent: data.parent,
      include_in_budget: data.include_in_budget,
    }
    await api.put<any>(`/cash-flow-items/${id}/`, payload)
    return CashFlowItemService.getCashFlowItem(id)
  },

  deleteCashFlowItem: async (id: string) => {
    await api.delete(`/cash-flow-items/${id}/`)
  },

  getCashFlowItemHierarchy: async () => {
    const response = await api.get<CashFlowItemHierarchy[]>("/cash-flow-items/hierarchy/")
    return response.data
  }
}
