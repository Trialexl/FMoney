"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AutoPaymentService, AutoPayment } from "@/services/financial-operations-service"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRightIcon } from "lucide-react"

interface AutoPaymentFormProps {
  autoPayment?: AutoPayment
  isEdit?: boolean
}

export default function AutoPaymentForm({ autoPayment, isEdit = false }: AutoPaymentFormProps) {
  const router = useRouter()
  
  // Form fields
  const [number, setNumber] = useState(autoPayment?.number || "")
  const [amount, setAmount] = useState(autoPayment?.amount?.toString() || "")
  const [nextDate, setNextDate] = useState(autoPayment?.next_date ? formatDateForInput(new Date(autoPayment.next_date)) : formatDateForInput())
  const [description, setDescription] = useState(autoPayment?.description || "")
  const [periodDays, setPeriodDays] = useState(autoPayment?.period_days?.toString() || "30")
  const [isTransfer, setIsTransfer] = useState(autoPayment?.is_transfer ?? false)
  const [walletFromId, setWalletFromId] = useState(autoPayment?.wallet_from || "")
  const [walletToId, setWalletToId] = useState(autoPayment?.wallet_to || "")
  const [cashFlowItemId, setCashFlowItemId] = useState(autoPayment?.cash_flow_item || "")

  // Reference data
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([])
  const [walletFromBalance, setWalletFromBalance] = useState<number | null>(null)

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingReferences, setIsLoadingReferences] = useState(true)

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      setIsLoadingReferences(true)
      try {
        // Fetch wallets and cash flow items in parallel
        const [walletsData, cashFlowItemsData] = await Promise.all([
          WalletService.getWallets(),
          CashFlowItemService.getCashFlowItems(),
        ])
        
        setWallets(walletsData)
        setCashFlowItems(cashFlowItemsData)
      } catch (err: any) {
        console.error("Ошибка при загрузке справочников:", err)
        setError("Не удалось загрузить справочники. Пожалуйста, обновите страницу.")
      } finally {
        setIsLoadingReferences(false)
      }
    }
    
    fetchReferenceData()
  }, [])

  // Fetch wallet balance when source wallet changes
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (walletFromId) {
        try {
          const balanceData = await WalletService.getWalletBalance(walletFromId)
          setWalletFromBalance(balanceData.balance)
        } catch (err) {
          console.error("Ошибка при загрузке баланса:", err)
          setWalletFromBalance(null)
        }
      } else {
        setWalletFromBalance(null)
      }
    }

    fetchWalletBalance()
  }, [walletFromId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!amount || !nextDate || !periodDays || !walletFromId) {
        setError("Пожалуйста, заполните все обязательные поля")
        setIsLoading(false)
        return
      }

      // Validate type-specific fields
      if (isTransfer && !walletToId) {
        setError("Для перевода необходимо указать кошелек получения")
        setIsLoading(false)
        return
      }

      if (!isTransfer && !cashFlowItemId) {
        setError("Для расхода необходимо указать статью")
        setIsLoading(false)
        return
      }

      // Check if source and destination wallets are different for transfer
      if (isTransfer && walletFromId === walletToId) {
        setError("Кошельки отправления и получения должны быть разными")
        setIsLoading(false)
        return
      }

      // Check period days is a valid number and greater than 0
      const periodDaysNum = parseInt(periodDays)
      if (isNaN(periodDaysNum) || periodDaysNum <= 0) {
        setError("Период должен быть положительным числом")
        setIsLoading(false)
        return
      }

      const autoPaymentData: Partial<AutoPayment> = {
        number: number || undefined,
        amount: parseFloat(amount),
        next_date: nextDate,
        description: description || undefined,
        period_days: periodDaysNum,
        is_transfer: isTransfer,
        wallet_from: walletFromId,
        wallet_to: isTransfer ? walletToId : undefined,
        cash_flow_item: !isTransfer ? cashFlowItemId : undefined
      }

      if (isEdit && autoPayment) {
        await AutoPaymentService.updateAutoPayment(autoPayment.id, autoPaymentData)
      } else {
        await AutoPaymentService.createAutoPayment(autoPaymentData)
      }
      router.push("/auto-payments")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении автоплатежа. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование автоплатежа" : "Создание автоплатежа"}
      </h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="required">Тип автоплатежа</Label>
          <RadioGroup 
            value={isTransfer ? "transfer" : "expense"}
            onValueChange={(value) => setIsTransfer(value === "transfer")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer" className="cursor-pointer">Перевод между кошельками</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="cursor-pointer">Регулярный расход</Label>
            </div>
          </RadioGroup>
        </div>

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
            <Label htmlFor="periodDays" className="required">Период повторения (дней)</Label>
            <input
              id="periodDays"
              type="number"
              min="1"
              value={periodDays}
              onChange={(e) => setPeriodDays(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="30"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nextDate" className="required">Дата следующего платежа</Label>
          <input
            id="nextDate"
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="walletFrom" className="required">Кошелек отправления</Label>
          {isLoadingReferences ? (
            <div className="text-sm text-muted-foreground">Загрузка кошельков...</div>
          ) : (
            <Select
              value={walletFromId}
              onValueChange={setWalletFromId}
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
          {walletFromBalance !== null && (
            <div className="text-xs text-muted-foreground mt-1">
              Доступно: {walletFromBalance.toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>

        {isTransfer ? (
          <div className="space-y-2">
            <Label htmlFor="walletTo" className="required">Кошелек получения</Label>
            {isLoadingReferences ? (
              <div className="text-sm text-muted-foreground">Загрузка кошельков...</div>
            ) : (
              <Select
                value={walletToId}
                onValueChange={setWalletToId}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите кошелек" />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter(wallet => wallet.id !== walletFromId)
                    .map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : (
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
        )}
        
        <div className="space-y-2">
          <Label htmlFor="description">Описание (необязательно)</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Введите описание автоплатежа"
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
            onClick={() => router.push("/auto-payments")}
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
