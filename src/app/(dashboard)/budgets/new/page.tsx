"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import BudgetForm from "@/components/shared/budget-form"
import { BudgetService, Budget } from "@/services/financial-operations-service"

export default function NewBudgetPage() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<Budget | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await BudgetService.getBudget(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load budget for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])

  return <BudgetForm budget={duplicateEntity || undefined} />
}
