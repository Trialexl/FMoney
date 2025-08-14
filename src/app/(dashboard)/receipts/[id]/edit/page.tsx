"use client"

import { useState, useEffect } from "react"
import { ReceiptService, Receipt } from "@/services/financial-operations-service"
import ReceiptForm from "@/components/shared/receipt-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditReceiptPage() {
  const params = useParams()
  const idParam = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        if (!idParam) return
        const data = await ReceiptService.getReceipt(idParam as string)
        setReceipt(data)
      } catch (err: any) {
        setError("Ошибка при загрузке прихода: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceipt()
  }, [idParam])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/receipts">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку приходов
          </Button>
        </Link>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Приход не найден</div>
        <Link href="/receipts">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку приходов
          </Button>
        </Link>
      </div>
    )
  }

  return <ReceiptForm receipt={receipt} isEdit />
}
