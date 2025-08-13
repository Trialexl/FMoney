import api from "@/lib/api"

// Base interface for financial operations
export interface FinancialOperation {
  id: string
  created_at: string
  updated_at: string
  deleted: boolean
  date: string
  amount: number
  description?: string
  project?: string
}

// Receipts (Income)
export interface Receipt extends FinancialOperation {
  wallet: string
  cash_flow_item: string
}

// Expenditures (Expenses)
export interface Expenditure extends FinancialOperation {
  wallet: string
  cash_flow_item: string
  include_in_budget: boolean
}

// Transfers
export interface Transfer extends FinancialOperation {
  wallet_from: string
  wallet_to: string
}

// Budgets
export interface Budget extends FinancialOperation {
  type: 'income' | 'expense'
  cash_flow_item: string
}

// Auto-payments
export interface AutoPayment extends FinancialOperation {
  is_transfer: boolean
  wallet_from: string
  wallet_to?: string
  cash_flow_item?: string
  period_days: number
  next_date: string
}

// Receipt service
export const ReceiptService = {
  getReceipts: async () => {
    const response = await api.get<Receipt[]>("/receipts/")
    return response.data
  },

  getReceipt: async (id: string) => {
    const response = await api.get<Receipt>(`/receipts/${id}/`)
    return response.data
  },

  createReceipt: async (data: Partial<Receipt>) => {
    const response = await api.post<Receipt>("/receipts/", data)
    return response.data
  },

  updateReceipt: async (id: string, data: Partial<Receipt>) => {
    const response = await api.put<Receipt>(`/receipts/${id}/`, data)
    return response.data
  },

  deleteReceipt: async (id: string) => {
    await api.delete(`/receipts/${id}/`)
  }
}

// Expenditure service
export const ExpenditureService = {
  getExpenditures: async (includedInBudget?: boolean) => {
    const params = includedInBudget !== undefined ? { include_in_budget: includedInBudget } : {}
    const response = await api.get<Expenditure[]>("/expenditures/", { params })
    return response.data
  },

  getExpenditure: async (id: string) => {
    const response = await api.get<Expenditure>(`/expenditures/${id}/`)
    return response.data
  },

  createExpenditure: async (data: Partial<Expenditure>) => {
    const response = await api.post<Expenditure>("/expenditures/", data)
    return response.data
  },

  updateExpenditure: async (id: string, data: Partial<Expenditure>) => {
    const response = await api.put<Expenditure>(`/expenditures/${id}/`, data)
    return response.data
  },

  deleteExpenditure: async (id: string) => {
    await api.delete(`/expenditures/${id}/`)
  }
}

// Transfer service
export const TransferService = {
  getTransfers: async () => {
    const response = await api.get<Transfer[]>("/transfers/")
    return response.data
  },

  getTransfer: async (id: string) => {
    const response = await api.get<Transfer>(`/transfers/${id}/`)
    return response.data
  },

  createTransfer: async (data: Partial<Transfer>) => {
    const response = await api.post<Transfer>("/transfers/", data)
    return response.data
  },

  updateTransfer: async (id: string, data: Partial<Transfer>) => {
    const response = await api.put<Transfer>(`/transfers/${id}/`, data)
    return response.data
  },

  deleteTransfer: async (id: string) => {
    await api.delete(`/transfers/${id}/`)
  }
}

// Budget service
export const BudgetService = {
  getBudgets: async (type?: 'income' | 'expense') => {
    const params = type ? { type } : {}
    const response = await api.get<Budget[]>("/budgets/", { params })
    return response.data
  },

  getBudget: async (id: string) => {
    const response = await api.get<Budget>(`/budgets/${id}/`)
    return response.data
  },

  createBudget: async (data: Partial<Budget>) => {
    const response = await api.post<Budget>("/budgets/", data)
    return response.data
  },

  updateBudget: async (id: string, data: Partial<Budget>) => {
    const response = await api.put<Budget>(`/budgets/${id}/`, data)
    return response.data
  },

  deleteBudget: async (id: string) => {
    await api.delete(`/budgets/${id}/`)
  }
}

// Auto-payment service
export const AutoPaymentService = {
  getAutoPayments: async (isTransfer?: boolean) => {
    const params = isTransfer !== undefined ? { is_transfer: isTransfer } : {}
    const response = await api.get<AutoPayment[]>("/auto-payments/", { params })
    return response.data
  },

  getAutoPayment: async (id: string) => {
    const response = await api.get<AutoPayment>(`/auto-payments/${id}/`)
    return response.data
  },

  createAutoPayment: async (data: Partial<AutoPayment>) => {
    const response = await api.post<AutoPayment>("/auto-payments/", data)
    return response.data
  },

  updateAutoPayment: async (id: string, data: Partial<AutoPayment>) => {
    const response = await api.put<AutoPayment>(`/auto-payments/${id}/`, data)
    return response.data
  },

  deleteAutoPayment: async (id: string) => {
    await api.delete(`/auto-payments/${id}/`)
  }
}
