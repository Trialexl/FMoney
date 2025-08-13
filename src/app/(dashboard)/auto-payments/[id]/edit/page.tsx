"use client"

import { useState, useEffect } from "react"
import { AutoPaymentService, AutoPayment } from "@/services/financial-operations-service"
import AutoPaymentForm from "@/components/shared/auto-payment-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function EditAutoPaymentPage({ params }: { params: { id: string } }) {
  const [autoPayment, setAutoPayment] = useState<AutoPayment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAutoPayment = async () => {
      try {
        const data = await AutoPaymentService.getAutoPayment(params.id)
        setAutoPayment(data)
      } catch (err: any) {
        setError("Ошибка при загрузке автоплатежа: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAutoPayment()
  }, [params.id])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/auto-payments">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку автоплатежей
          </Button>
        </Link>
      </div>
    )
  }

  if (!autoPayment) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Автоплатеж не найден</div>
        <Link href="/auto-payments">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку автоплатежей
          </Button>
        </Link>
      </div>
    )
  }

  return <AutoPaymentForm autoPayment={autoPayment} isEdit />
}
