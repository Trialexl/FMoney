"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BudgetService, Budget } from "@/services/financial-operations-service"
import { CashFlowItemService, CashFlowItem } from "@/services/cash-flow-item-service"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { formatDateForInput } from "@/lib/formatters"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BudgetFormProps {
  budget?: Budget
  isEdit?: boolean
}

export default function BudgetForm({ budget, isEdit = false }: BudgetFormProps) {
  const router = useRouter()
  
  // Form fields
  const [amount, setAmount] = useState(budget?.amount?.toString() || "")
  const [date, setDate] = useState(budget?.date ? formatDateForInput(new Date(budget.date)) : formatDateForInput())
  const [description, setDescription] = useState(budget?.description || "")
  const [type, setType] = useState<'income' | 'expense'>(budget?.type || 'expense')
  const [cashFlowItemId, setCashFlowItemId] = useState(budget?.cash_flow_item || "")

  // Reference data
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([])

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingReferences, setIsLoadingReferences] = useState(true)

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      setIsLoadingReferences(true)
      try {
        const cashFlowItemsData = await CashFlowItemService.getCashFlowItems()
        setCashFlowItems(cashFlowItemsData)
      } catch (err: any) {
        console.error("Ошибка при загрузке статей:", err)
        setError("Не удалось загрузить справочники. Пожалуйста, обновите страницу.")
      } finally {
        setIsLoadingReferences(false)
      }
    }
    
    fetchReferenceData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!amount || !date || !cashFlowItemId || !type) {
        setError("Пожалуйста, заполните все обязательные поля")
        setIsLoading(false)
        return
      }

      const budgetData: Partial<Budget> = {
        amount: parseFloat(amount),
        date,
        description: description || undefined,
        type,
        cash_flow_item: cashFlowItemId
      }

      if (isEdit && budget) {
        await BudgetService.updateBudget(budget.id, budgetData)
      } else {
        await BudgetService.createBudget(budgetData)
      }
      router.push("/budgets")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении бюджета. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование бюджета" : "Создание бюджета"}
      </h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="required">Тип бюджета</Label>
          <RadioGroup 
            value={type} 
            onValueChange={(value) => setType(value as 'income' | 'expense')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="cursor-pointer">Доход</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="cursor-pointer">Расход</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="required">Сумма</Label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="required">Дата</Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cashFlowItem" className="required">Статья бюджета</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка статей...</div>
          ) : (
            <Select
              value={cashFlowItemId}
              onValueChange={setCashFlowItemId}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статью бюджета" />
              </SelectTrigger>
              <SelectContent>
                {cashFlowItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Описание (необязательно)</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Введите описание бюджета"
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading || isLoadingReferences}
          >
            {isLoading ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать")}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/budgets")}
          >
            Отмена
          </Button>
        </div>
      </form>
      
      <style jsx>{`
        .required:after {
          content: " *";
          color: red;
        }
      `}</style>
    </div>
  )
}
