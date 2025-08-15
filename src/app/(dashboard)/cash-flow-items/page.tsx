"use client"

import { useState, useEffect } from "react"
import { CashFlowItemService, CashFlowItem } from "@/services/cash-flow-item-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon } from "lucide-react"
import Link from "next/link"

export default function CashFlowItemsPage() {
  const [items, setItems] = useState<CashFlowItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await CashFlowItemService.getCashFlowItems()
      setItems(data)
    } catch (err: any) {
      setError("Ошибка при загрузке статей движения средств: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Удалить статью "${name || "без названия"}"?`)) return
    try {
      await CashFlowItemService.deleteCashFlowItem(id)
      fetchItems()
    } catch (e) {
      alert("Не удалось удалить статью. Возможно, она используется в операциях.")
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
            <CardTitle>Список статей</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-4 py-2">Название</th>
                      <th className="px-4 py-2">Код</th>
                      <th className="px-4 py-2">В бюджете</th>
                      <th className="px-4 py-2 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{item.name || "—"}</td>
                        <td className="px-4 py-2">{item.code || "—"}</td>
                        <td className="px-4 py-2">{item.include_in_budget === true ? "Да" : item.include_in_budget === false ? "Нет" : "—"}</td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center gap-2">
                            <Link href={`/cash-flow-items/${item.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2Icon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(item.id, item.name)}>
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
