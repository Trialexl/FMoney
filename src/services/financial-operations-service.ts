import api from "@/lib/api"
import { toApiAmount } from "@/types"

// Base interface for financial operations
export interface FinancialOperation {
  id: string
  created_at?: string
  updated_at?: string
  deleted?: boolean
  date: string
  amount: number
  number?: string
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
    const response = await api.get<any[]>("/receipts/")
    return response.data.map((r) => ({
      id: r.id,
      date: r.date,
      amount: parseFloat(r.amount ?? "0"),
      description: r.comment ?? undefined,
      wallet: r.wallet,
      cash_flow_item: r.cash_flow_item,
      deleted: r.deleted,
    })) as Receipt[]
  },

  getReceipt: async (id: string) => {
    const { data: r } = await api.get<any>(`/receipts/${id}/`)
    const mapped: Receipt = {
      id: r.id,
      date: r.date,
      amount: parseFloat(r.amount ?? "0"),
      description: r.comment ?? undefined,
      wallet: r.wallet,
      cash_flow_item: r.cash_flow_item,
      deleted: r.deleted,
    }
    return mapped
  },

  createReceipt: async (data: Partial<Receipt>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      wallet: data.wallet,
      cash_flow_item: data.cash_flow_item,
    }
    const response = await api.post<any>("/receipts/", payload)
    return ReceiptService.getReceipt(response.data.id)
  },

  updateReceipt: async (id: string, data: Partial<Receipt>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      wallet: data.wallet,
      cash_flow_item: data.cash_flow_item,
    }
    await api.put<any>(`/receipts/${id}/`, payload)
    return ReceiptService.getReceipt(id)
  },

  deleteReceipt: async (id: string) => {
    await api.delete(`/receipts/${id}/`)
  }
}

// Expenditure service
export const ExpenditureService = {
  getExpenditures: async (includedInBudget?: boolean) => {
    const params = includedInBudget !== undefined ? { include_in_budget: includedInBudget } : {}
    const { data } = await api.get<any[]>("/expenditures/", { params })
    return data.map((e) => ({
      id: e.id,
      date: e.date,
      amount: parseFloat(e.amount ?? "0"),
      description: e.comment ?? undefined,
      wallet: e.wallet,
      cash_flow_item: e.cash_flow_item,
      include_in_budget: !!e.include_in_budget,
      deleted: e.deleted,
    })) as Expenditure[]
  },

  getExpenditure: async (id: string) => {
    const { data: e } = await api.get<any>(`/expenditures/${id}/`)
    const mapped: Expenditure = {
      id: e.id,
      date: e.date,
      amount: parseFloat(e.amount ?? "0"),
      description: e.comment ?? undefined,
      wallet: e.wallet,
      cash_flow_item: e.cash_flow_item,
      include_in_budget: !!e.include_in_budget,
      deleted: e.deleted,
    }
    return mapped
  },

  createExpenditure: async (data: Partial<Expenditure>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      wallet: data.wallet,
      cash_flow_item: data.cash_flow_item,
      include_in_budget: data.include_in_budget,
    }
    const response = await api.post<any>("/expenditures/", payload)
    return ExpenditureService.getExpenditure(response.data.id)
  },

  updateExpenditure: async (id: string, data: Partial<Expenditure>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      wallet: data.wallet,
      cash_flow_item: data.cash_flow_item,
      include_in_budget: data.include_in_budget,
    }
    await api.put<any>(`/expenditures/${id}/`, payload)
    return ExpenditureService.getExpenditure(id)
  },

  deleteExpenditure: async (id: string) => {
    await api.delete(`/expenditures/${id}/`)
  }
}

// Transfer service
export const TransferService = {
  getTransfers: async () => {
    const { data } = await api.get<any[]>("/transfers/")
    return data.map((t) => ({
      id: t.id,
      date: t.date,
      amount: parseFloat(t.amount ?? "0"),
      description: t.comment ?? undefined,
      wallet_from: t.wallet_out,
      wallet_to: t.wallet_in,
      deleted: t.deleted,
    })) as Transfer[]
  },

  getTransfer: async (id: string) => {
    const { data: t } = await api.get<any>(`/transfers/${id}/`)
    const mapped: Transfer = {
      id: t.id,
      date: t.date,
      amount: parseFloat(t.amount ?? "0"),
      description: t.comment ?? undefined,
      wallet_from: t.wallet_out,
      wallet_to: t.wallet_in,
      deleted: t.deleted,
    }
    return mapped
  },

  createTransfer: async (data: Partial<Transfer>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      wallet_out: data.wallet_from,
      wallet_in: data.wallet_to,
    }
    const response = await api.post<any>("/transfers/", payload)
    return TransferService.getTransfer(response.data.id)
  },

  updateTransfer: async (id: string, data: Partial<Transfer>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      wallet_out: data.wallet_from,
      wallet_in: data.wallet_to,
    }
    await api.put<any>(`/transfers/${id}/`, payload)
    return TransferService.getTransfer(id)
  },

  deleteTransfer: async (id: string) => {
    await api.delete(`/transfers/${id}/`)
  }
}

// Budget service
export const BudgetService = {
  getBudgets: async (type?: 'income' | 'expense') => {
    const params = type ? { type_of_budget: type === 'income' } : {}
    const { data } = await api.get<any[]>("/budgets/", { params })
    return data.map((b) => ({
      id: b.id,
      date: b.date,
      amount: parseFloat(b.amount ?? "0"),
      description: b.comment ?? undefined,
      type: b.type_of_budget ? 'income' : 'expense',
      cash_flow_item: b.cash_flow_item,
      project: b.project,
      deleted: b.deleted,
    })) as Budget[]
  },

  getBudget: async (id: string) => {
    const { data: b } = await api.get<any>(`/budgets/${id}/`)
    const mapped: Budget = {
      id: b.id,
      date: b.date,
      amount: parseFloat(b.amount ?? "0"),
      description: b.comment ?? undefined,
      type: b.type_of_budget ? 'income' : 'expense',
      cash_flow_item: b.cash_flow_item,
      project: b.project,
      deleted: b.deleted,
    }
    return mapped
  },

  createBudget: async (data: Partial<Budget>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      date_start: (data as any).date_start,
      amount: toApiAmount(data.amount),
      amount_month: (data as any).amount_month,
      comment: data.description,
      type_of_budget: data.type === 'income',
      cash_flow_item: data.cash_flow_item,
      project: data.project,
    }
    const response = await api.post<any>("/budgets/", payload)
    return BudgetService.getBudget(response.data.id)
  },

  updateBudget: async (id: string, data: Partial<Budget>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      date_start: (data as any).date_start,
      amount: toApiAmount(data.amount),
      amount_month: (data as any).amount_month,
      comment: data.description,
      type_of_budget: data.type === 'income',
      cash_flow_item: data.cash_flow_item,
      project: data.project,
    }
    await api.put<any>(`/budgets/${id}/`, payload)
    return BudgetService.getBudget(id)
  },

  deleteBudget: async (id: string) => {
    await api.delete(`/budgets/${id}/`)
  }
}

// Auto-payment service
export const AutoPaymentService = {
  getAutoPayments: async (isTransfer?: boolean) => {
    const params = isTransfer !== undefined ? { is_transfer: isTransfer } : {}
    const { data } = await api.get<any[]>("/auto-payments/", { params })
    return data.map((a) => ({
      id: a.id,
      date: a.date, // документ дата
      amount: parseFloat(a.amount ?? "0"),
      description: a.comment ?? undefined,
      is_transfer: !!a.is_transfer,
      wallet_from: a.wallet_out || "",
      wallet_to: a.wallet_in || undefined,
      cash_flow_item: a.cash_flow_item || undefined,
      // для UI используем поля ниже (совместимость формы может потребовать доработок)
      period_days: (a as any).period_days ?? 30,
      next_date: a.date_start,
    })) as AutoPayment[]
  },

  getAutoPayment: async (id: string) => {
    const { data: a } = await api.get<any>(`/auto-payments/${id}/`)
    const mapped: AutoPayment = {
      id: a.id,
      date: a.date,
      amount: parseFloat(a.amount ?? "0"),
      description: a.comment ?? undefined,
      is_transfer: !!a.is_transfer,
      wallet_from: a.wallet_out || "",
      wallet_to: a.wallet_in || undefined,
      cash_flow_item: a.cash_flow_item || undefined,
      period_days: (a as any).period_days ?? 30,
      next_date: a.date_start,
    }
    return mapped
  },

  createAutoPayment: async (data: Partial<AutoPayment>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      is_transfer: data.is_transfer,
      date_start: (data as any).next_date,
      amount_month: (data as any).period_days, // временная маппа, до выравнивания формы
      wallet_out: data.wallet_from,
      wallet_in: data.wallet_to,
      cash_flow_item: data.cash_flow_item,
    }
    const response = await api.post<any>("/auto-payments/", payload)
    return AutoPaymentService.getAutoPayment(response.data.id)
  },

  updateAutoPayment: async (id: string, data: Partial<AutoPayment>) => {
    const payload = {
      number: (data as any).number,
      date: data.date,
      amount: toApiAmount(data.amount),
      comment: data.description,
      is_transfer: data.is_transfer,
      date_start: (data as any).next_date,
      amount_month: (data as any).period_days,
      wallet_out: data.wallet_from,
      wallet_in: data.wallet_to,
      cash_flow_item: data.cash_flow_item,
    }
    await api.put<any>(`/auto-payments/${id}/`, payload)
    return AutoPaymentService.getAutoPayment(id)
  },

  deleteAutoPayment: async (id: string) => {
    await api.delete(`/auto-payments/${id}/`)
  }
}
