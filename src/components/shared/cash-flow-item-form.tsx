"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CashFlowItemService, CashFlowItem } from "@/services/cash-flow-item-service"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CashFlowItemFormProps {
  item?: CashFlowItem
  parentId?: string
  isEdit?: boolean
}

export default function CashFlowItemForm({ item, parentId, isEdit = false }: CashFlowItemFormProps) {
  const router = useRouter()
  const [name, setName] = useState(item?.name || "")
  const [code, setCode] = useState(item?.code || "")
  const [includeInBudget, setIncludeInBudget] = useState<boolean>(item?.include_in_budget ?? false)
  const [parent, setParent] = useState(item?.parent || parentId || "")
  const [allItems, setAllItems] = useState<CashFlowItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(true)

  // Fetch all items for parent selection
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true)
      try {
        const data = await CashFlowItemService.getCashFlowItems()
        // Filter out the current item (can't be its own parent)
        const filteredItems = isEdit 
          ? data.filter(i => i.id !== item?.id)
          : data
        setAllItems(filteredItems)
      } catch (err: any) {
        console.error("Ошибка при загрузке статей:", err)
      } finally {
        setIsLoadingItems(false)
      }
    }
    
    fetchItems()
  }, [item?.id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
        const data: Partial<CashFlowItem> = {
          name,
          code: code || undefined,
          include_in_budget: includeInBudget,
          parent: parent || undefined
        }

      if (isEdit && item) {
        await CashFlowItemService.updateCashFlowItem(item.id, data)
      } else {
        await CashFlowItemService.createCashFlowItem(data)
      }
      router.push("/cash-flow-items")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении статьи. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование статьи" : "Создание статьи движения средств"}
      </h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Название статьи</Label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Введите название статьи"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Код (необязательно)</Label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Код"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent">Родительская статья (необязательно)</Label>
          {isLoadingItems ? (
            <div className="text-sm text-muted-foreground">Загрузка статей...</div>
          ) : (
            <Select
              value={parent || "none"}
              onValueChange={(value) => setParent(value === "none" ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите родительскую статью" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Нет (корневая статья)</SelectItem>
                {allItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="includeInBudget"
            type="checkbox"
            checked={includeInBudget}
            onChange={(e) => setIncludeInBudget(e.target.checked)}
          />
          <Label htmlFor="includeInBudget">Включать в бюджет по умолчанию</Label>
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать")}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cash-flow-items")}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}
