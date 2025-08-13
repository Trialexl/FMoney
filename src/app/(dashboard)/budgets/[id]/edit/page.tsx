"use client"

import { useState, useEffect } from "react"
import { BudgetService, Budget } from "@/services/financial-operations-service"
import BudgetForm from "@/components/shared/budget-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const data = await BudgetService.getBudget(params.id)
        setBudget(data)
      } catch (err: any) {
        setError("Ошибка при загрузке бюджета: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudget()
  }, [params.id])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/budgets">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку бюджетов
          </Button>
        </Link>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Бюджет не найден</div>
        <Link href="/budgets">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку бюджетов
          </Button>
        </Link>
      </div>
    )
  }

  return <BudgetForm budget={budget} isEdit />
}
