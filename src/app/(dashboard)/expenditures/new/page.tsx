"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ExpenditureForm from "@/components/shared/expenditure-form"
import { ExpenditureService, Expenditure } from "@/services/financial-operations-service"

export default function NewExpenditurePage() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<Expenditure | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await ExpenditureService.getExpenditure(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load expenditure for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])

  return <ExpenditureForm expenditure={duplicateEntity || undefined} />
}
