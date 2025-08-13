"use client"

import { useState, useEffect } from "react"
import { CashFlowItemService, CashFlowItemHierarchy } from "@/services/cash-flow-item-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { TreeItem } from "@/components/shared/tree-item"

export default function CashFlowItemsPage() {
  const [items, setItems] = useState<CashFlowItemHierarchy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await CashFlowItemService.getCashFlowItemHierarchy()
      setItems(data)
    } catch (err: any) {
      setError("Ошибка при загрузке статей движения средств: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Статьи движения средств</h1>
        <Link href="/cash-flow-items/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новая статья
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка статей движения средств...</div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Иерархия статей</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map(item => (
                  <TreeItem
                    key={item.id}
                    item={item}
                    onDelete={fetchItems}
                    level={0}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">Статьи движения средств не найдены</p>
                <Link href="/cash-flow-items/new">
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> Создать первую статью
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
