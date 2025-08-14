"use client"

import { useState, useEffect } from "react"
import { WalletService, Wallet } from "@/services/wallet-service"
import WalletForm from "@/components/shared/wallet-form"

import { useParams } from "next/navigation"

export default function EditWalletPage() {
  const params = useParams()
  const idParam = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (!idParam) return
        const data = await WalletService.getWallet(idParam as string)
        setWallet(data)
      } catch (err: any) {
        setError("Ошибка при загрузке кошелька: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchWallet()
  }, [idParam])

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
