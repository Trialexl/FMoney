"use client"

import { useState, useEffect } from "react"
import { ExpenditureService, Expenditure } from "@/services/financial-operations-service"
import ExpenditureForm from "@/components/shared/expenditure-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function EditExpenditurePage({ params }: { params: { id: string } }) {
  const [expenditure, setExpenditure] = useState<Expenditure | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExpenditure = async () => {
      try {
        const data = await ExpenditureService.getExpenditure(params.id)
        setExpenditure(data)
      } catch (err: any) {
        setError("Ошибка при загрузке расхода: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenditure()
  }, [params.id])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/expenditures">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку расходов
          </Button>
        </Link>
      </div>
    )
  }

  if (!expenditure) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Расход не найден</div>
        <Link href="/expenditures">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку расходов
          </Button>
        </Link>
      </div>
    )
  }

  return <ExpenditureForm expenditure={expenditure} isEdit />
}
