"use client"

import { useSearchParams } from "next/navigation"
import CashFlowItemForm from "@/components/shared/cash-flow-item-form"

export default function NewCashFlowItemPage() {
  const searchParams = useSearchParams()
  const parentId = searchParams.get("parent") || undefined
  
  return <CashFlowItemForm parentId={parentId} />
}
