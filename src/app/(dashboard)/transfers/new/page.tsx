"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import TransferForm from "@/components/shared/transfer-form"
import { TransferService, Transfer } from "@/services/financial-operations-service"

function Inner() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<Transfer | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await TransferService.getTransfer(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load transfer for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])

  return <TransferForm transfer={duplicateEntity || undefined} />
}

export default function NewTransferPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
