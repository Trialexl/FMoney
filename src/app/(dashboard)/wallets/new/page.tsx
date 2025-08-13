"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import WalletForm from "@/components/shared/wallet-form"
import { WalletService, Wallet } from "@/services/wallet-service"

function Inner() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<Wallet | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await WalletService.getWallet(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load wallet for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])
  return <WalletForm wallet={duplicateEntity || undefined} />
}

export default function NewWalletPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
