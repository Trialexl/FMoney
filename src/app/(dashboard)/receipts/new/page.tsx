"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ReceiptForm from "@/components/shared/receipt-form"
import { ReceiptService, Receipt } from "@/services/financial-operations-service"

function Inner() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<Receipt | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await ReceiptService.getReceipt(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load receipt for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])

  return <ReceiptForm receipt={duplicateEntity || undefined} />
}

export default function NewReceiptPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
