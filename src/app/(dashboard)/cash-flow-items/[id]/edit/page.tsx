"use client"

import { useState, useEffect } from "react"
import { CashFlowItemService, CashFlowItem } from "@/services/cash-flow-item-service"
import CashFlowItemForm from "@/components/shared/cash-flow-item-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function EditCashFlowItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<CashFlowItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await CashFlowItemService.getCashFlowItem(params.id)
        setItem(data)
      } catch (err: any) {
        setError("Ошибка при загрузке статьи: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [params.id])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/cash-flow-items">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку статей
          </Button>
        </Link>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Статья не найдена</div>
        <Link href="/cash-flow-items">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку статей
          </Button>
        </Link>
      </div>
    )
  }

  return <CashFlowItemForm item={item} isEdit />
}
