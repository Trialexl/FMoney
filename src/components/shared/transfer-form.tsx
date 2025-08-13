"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TransferService, Transfer } from "@/services/financial-operations-service"
import { WalletService, Wallet } from "@/services/wallet-service"
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
import { ArrowRightIcon } from "lucide-react"

interface TransferFormProps {
  transfer?: Transfer
  isEdit?: boolean
}

export default function TransferForm({ transfer, isEdit = false }: TransferFormProps) {
  const router = useRouter()
  
  // Form fields
  const [amount, setAmount] = useState(transfer?.amount?.toString() || "")
  const [date, setDate] = useState(transfer?.date ? formatDateForInput(new Date(transfer.date)) : formatDateForInput())
  const [description, setDescription] = useState(transfer?.description || "")
  const [walletFromId, setWalletFromId] = useState(transfer?.wallet_from || "")
  const [walletToId, setWalletToId] = useState(transfer?.wallet_to || "")

  // Reference data
  const [wallets, setWallets] = useState<Wallet[]>([])
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
        const walletsData = await WalletService.getWallets()
        setWallets(walletsData)
      } catch (err: any) {
        console.error("Ошибка при загрузке кошельков:", err)
        setError("Не удалось загрузить список кошельков. Пожалуйста, обновите страницу.")
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
      if (!amount || !date || !walletFromId || !walletToId) {
        setError("Пожалуйста, заполните все обязательные поля")
        setIsLoading(false)
        return
      }

      // Check if source and destination wallets are different
      if (walletFromId === walletToId) {
        setError("Кошельки отправления и получения должны быть разными")
        setIsLoading(false)
        return
      }

      // Check if there's enough balance
      if (walletFromBalance !== null && parseFloat(amount) > walletFromBalance) {
        setError(`Недостаточно средств. Доступный баланс: ${walletFromBalance.toLocaleString('ru-RU')} ₽`)
        setIsLoading(false)
        return
      }

      const transferData: Partial<Transfer> = {
        amount: parseFloat(amount),
        date,
        description: description || undefined,
        wallet_from: walletFromId,
        wallet_to: walletToId
      }

      if (isEdit && transfer) {
        await TransferService.updateTransfer(transfer.id, transferData)
      } else {
        await TransferService.createTransfer(transferData)
      }
      router.push("/transfers")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении перевода. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование перевода" : "Создание перевода между кошельками"}
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
            placeholder="Введите описание перевода"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2 space-y-2">
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
          
          <div className="flex justify-center items-center">
            <ArrowRightIcon className="h-6 w-6 text-primary" />
          </div>

          <div className="md:col-span-2 space-y-2">
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
                    .filter(wallet => wallet.id !== walletFromId) // Не показывать выбранный кошелек отправления
                    .map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
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
            onClick={() => router.push("/transfers")}
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
