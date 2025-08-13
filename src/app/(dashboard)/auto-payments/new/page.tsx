"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import AutoPaymentForm from "@/components/shared/auto-payment-form"
import { AutoPaymentService, AutoPayment } from "@/services/financial-operations-service"

export default function NewAutoPaymentPage() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<AutoPayment | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await AutoPaymentService.getAutoPayment(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load auto-payment for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])

  return <AutoPaymentForm autoPayment={duplicateEntity || undefined} />
}
