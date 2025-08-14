"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WalletService, Wallet } from "@/services/wallet-service"
import { Button } from "@/components/ui/button"

interface WalletFormProps {
  wallet?: Wallet
  isEdit?: boolean
}

export default function WalletForm({ wallet, isEdit = false }: WalletFormProps) {
  const router = useRouter()
  const [name, setName] = useState(wallet?.name || "")
  const [code, setCode] = useState(wallet?.code || "")
  const [hidden, setHidden] = useState<boolean>(wallet?.hidden ?? false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isEdit && wallet) {
        await WalletService.updateWallet(wallet.id, { name, code, hidden })
      } else {
        await WalletService.createWallet({ name, code, hidden })
      }
      router.push("/wallets")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении кошелька. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование кошелька" : "Создание кошелька"}
      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Название кошелька
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Введите название кошелька"
          />
        </div>
        
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-1">Код (необязательно)</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Код"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
          />
          Скрыть кошелек
        </label>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать")}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/wallets")}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}
