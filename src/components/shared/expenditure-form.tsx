"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ExpenditureService, Expenditure } from "@/services/financial-operations-service"
import { WalletService, Wallet } from "@/services/wallet-service"
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
import { Checkbox } from "@/components/ui/checkbox"

interface ExpenditureFormProps {
  expenditure?: Expenditure
  isEdit?: boolean
}

export default function ExpenditureForm({ expenditure, isEdit = false }: ExpenditureFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultWalletId = searchParams.get("wallet") || expenditure?.wallet || ""
  
  // Form fields
  const [amount, setAmount] = useState(expenditure?.amount?.toString() || "")
  const [date, setDate] = useState(expenditure?.date ? formatDateForInput(new Date(expenditure.date)) : formatDateForInput())
  const [description, setDescription] = useState(expenditure?.description || "")
  const [walletId, setWalletId] = useState(defaultWalletId)
  const [cashFlowItemId, setCashFlowItemId] = useState(expenditure?.cash_flow_item || "")
  const [includeInBudget, setIncludeInBudget] = useState(expenditure?.include_in_budget ?? false)
  const [projectId, setProjectId] = useState(expenditure?.project || "")

  // Reference data
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([])
  const [projects, setProjects] = useState<any[]>([]) // Типизацию для проектов добавим позже

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingReferences, setIsLoadingReferences] = useState(true)

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      setIsLoadingReferences(true)
      try {
        // Fetch wallets, cash flow items, and projects in parallel
        const [walletsData, cashFlowItemsData, projectsData] = await Promise.all([
          WalletService.getWallets(),
          CashFlowItemService.getCashFlowItems(),
          [] // TODO: добавить проекты после реализации ProjectService
        ])
        
        setWallets(walletsData)
        setCashFlowItems(cashFlowItemsData)
        setProjects(projectsData)
      } catch (err: any) {
        console.error("Ошибка при загрузке справочников:", err)
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
      if (!amount || !date || !walletId || !cashFlowItemId) {
        setError("Пожалуйста, заполните все обязательные поля")
        setIsLoading(false)
        return
      }

      const expenditureData: Partial<Expenditure> = {
        amount: parseFloat(amount),
        date,
        description: description || undefined,
        wallet: walletId,
        cash_flow_item: cashFlowItemId,
        include_in_budget: includeInBudget,
        project: projectId || undefined
      }

      if (isEdit && expenditure) {
        await ExpenditureService.updateExpenditure(expenditure.id, expenditureData)
      } else {
        await ExpenditureService.createExpenditure(expenditureData)
      }
      router.push("/expenditures")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении расхода. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование расхода" : "Создание расхода"}
      </h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="description">Описание (необязательно)</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Введите описание расхода"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wallet" className="required">Кошелек</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка кошельков...</div>
          ) : (
            <Select
              value={walletId}
              onValueChange={setWalletId}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите кошелек" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashFlowItem" className="required">Статья расхода</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка статей...</div>
          ) : (
            <Select
              value={cashFlowItemId}
              onValueChange={setCashFlowItemId}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статью расхода" />
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

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeInBudget"
            checked={includeInBudget}
            onCheckedChange={(checked) => setIncludeInBudget(checked as boolean)}
          />
          <Label
            htmlFor="includeInBudget"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Включить в бюджет
          </Label>
        </div>

        {/* Проекты будут добавлены в будущем */}
        {/* 
        <div className="space-y-2">
          <Label htmlFor="project">Проект (необязательно)</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка проектов...</div>
          ) : (
            <Select
              value={projectId}
              onValueChange={setProjectId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Не указано</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        */}

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
            onClick={() => router.push("/expenditures")}
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
