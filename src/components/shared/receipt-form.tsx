"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ReceiptService, Receipt } from "@/services/financial-operations-service"
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

interface ReceiptFormProps {
  receipt?: Receipt
  isEdit?: boolean
}

export default function ReceiptForm({ receipt, isEdit = false }: ReceiptFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultWalletId = searchParams.get("wallet") || receipt?.wallet || ""
  
  // Form fields
  const [number, setNumber] = useState(receipt?.number || "")
  const [amount, setAmount] = useState(receipt?.amount?.toString() || "")
  const [date, setDate] = useState(receipt?.date ? formatDateForInput(new Date(receipt.date)) : formatDateForInput())
  const [description, setDescription] = useState(receipt?.description || "")
  const [walletId, setWalletId] = useState(defaultWalletId)
  const [cashFlowItemId, setCashFlowItemId] = useState(receipt?.cash_flow_item || "")
  const [projectId, setProjectId] = useState(receipt?.project || "")

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

      const receiptData: Partial<Receipt> = {
        number: number || undefined,
        amount: parseFloat(amount),
        date,
        description: description || undefined,
        wallet: walletId,
        cash_flow_item: cashFlowItemId,
        project: projectId || undefined
      }

      if (isEdit && receipt) {
        await ReceiptService.updateReceipt(receipt.id, receiptData)
      } else {
        await ReceiptService.createReceipt(receiptData)
      }
      router.push("/receipts")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении прихода. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование прихода" : "Создание прихода"}
      </h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="number">Номер</Label>
            <input
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Номер документа"
            />
          </div>
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
            placeholder="Введите описание прихода"
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
          <Label htmlFor="cashFlowItem" className="required">Статья прихода</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка статей...</div>
          ) : (
            <Select
              value={cashFlowItemId}
              onValueChange={setCashFlowItemId}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статью прихода" />
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

        {/* Проекты будут добавлены в будущем */}
        {/* 
        <div className="space-y-2">
          <Label htmlFor="project">Проект (необязательно)</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка проектов...</div>
          ) : (
            <Select
              value={projectId || "none"}
              onValueChange={(value) => setProjectId(value === "none" ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указано</SelectItem>
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
            onClick={() => router.push("/receipts")}
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
