"use client"

import { useState, useEffect } from "react"
import { WalletService, Wallet } from "@/services/wallet-service"
import WalletForm from "@/components/shared/wallet-form"

export default function EditWalletPage({ params }: { params: { id: string } }) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await WalletService.getWallet(params.id)
        setWallet(data)
      } catch (err: any) {
        setError("Ошибка при загрузке кошелька: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchWallet()
  }, [params.id])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <a href="/wallets" className="text-blue-500 hover:underline">
          Вернуться к списку кошельков
        </a>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Кошелек не найден</div>
        <a href="/wallets" className="text-blue-500 hover:underline">
          Вернуться к списку кошельков
        </a>
      </div>
    )
  }

  return <WalletForm wallet={wallet} isEdit />
}
