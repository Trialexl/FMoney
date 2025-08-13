"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import CashFlowItemForm from "@/components/shared/cash-flow-item-form"

function Inner() {
  const searchParams = useSearchParams()
  const parentId = searchParams.get("parent") || undefined
  return <CashFlowItemForm parentId={parentId} />
}

export default function NewCashFlowItemPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
