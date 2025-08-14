"use client"

import { useState, useEffect } from "react"
import { TransferService, Transfer } from "@/services/financial-operations-service"
import TransferForm from "@/components/shared/transfer-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditTransferPage() {
  const params = useParams()
  const idParam = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        if (!idParam) return
        const data = await TransferService.getTransfer(idParam as string)
        setTransfer(data)
      } catch (err: any) {
        setError("Ошибка при загрузке перевода: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransfer()
  }, [idParam])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/transfers">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку переводов
          </Button>
        </Link>
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Перевод не найден</div>
        <Link href="/transfers">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку переводов
          </Button>
        </Link>
      </div>
    )
  }

  return <TransferForm transfer={transfer} isEdit />
}
