"use client"

import { useState, useEffect } from "react"
import { BudgetService, Budget } from "@/services/financial-operations-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { CashFlowItemService } from "@/services/cash-flow-item-service"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Maps for category names
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [budgetType, setBudgetType] = useState<'income' | 'expense' | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [amountMin, setAmountMin] = useState("")
  const [amountMax, setAmountMax] = useState("")

  const handleResetFilters = () => {
    setSearchTerm("")
    setDateFrom("")
    setDateTo("")
    setBudgetType(null)
    setSelectedCategoryId("")
    setAmountMin("")
    setAmountMax("")
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch budgets
      const budgetsData = await BudgetService.getBudgets(budgetType || undefined)
      setBudgets(budgetsData)
      
      // Fetch categories for names
      const categories = await CashFlowItemService.getCashFlowItems()
      const categoryMapping: Record<string, string> = {}
      categories.forEach(category => {
        categoryMapping[category.id] = category.name || "—"
      })
      setCategoryMap(categoryMapping)
      
    } catch (err: any) {
      setError("Ошибка при загрузке бюджетов: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchAllData()
  }, [budgetType])
  
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот бюджет?")) {
      try {
        await BudgetService.deleteBudget(id)
        setBudgets(budgets.filter(budget => budget.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении бюджета: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }
  
  // Filter budgets based on search and date filters
  const filteredBudgets = budgets.filter(budget => {
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      budget.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryMap[budget.cash_flow_item]?.toLowerCase().includes(searchTerm.toLowerCase())

    // By category
    const categoryMatch = !selectedCategoryId || budget.cash_flow_item === selectedCategoryId
    
    // Filter by date from
    const dateFromMatch = !dateFrom || new Date(budget.date) >= new Date(dateFrom)
    
    // Filter by date to
    const dateToMatch = !dateTo || new Date(budget.date) <= new Date(dateTo)

    // Amount range
    const amountMinMatch = !amountMin || budget.amount >= parseFloat(amountMin)
    const amountMaxMatch = !amountMax || budget.amount <= parseFloat(amountMax)
    
    return searchMatch && categoryMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch
  })
  
  // Sort by date (newest first)
  const sortedBudgets = [...filteredBudgets].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Бюджеты</h1>
        <Link href="/budgets/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый бюджет
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-1">Поиск</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по описанию или категории..."
                  className="pl-9 w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium mb-1">Дата с</label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium mb-1">Дата по</label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Тип бюджета</label>
              <div className="flex gap-2">
                <Button 
                  variant={budgetType === 'income' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBudgetType(budgetType === 'income' ? null : 'income')}
                >
                  Доходы
                </Button>
                <Button 
                  variant={budgetType === 'expense' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBudgetType(budgetType === 'expense' ? null : 'expense')}
                >
                  Расходы
                </Button>
                <Button 
                  variant={budgetType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBudgetType(null)}
                >
                  Все
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Категория</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryMap).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="amountMin" className="block text-sm font-medium mb-1">Сумма от</label>
              <input
                type="number"
                id="amountMin"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="amountMax" className="block text-sm font-medium mb-1">Сумма до</label>
              <input
                type="number"
                id="amountMax"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="∞"
                min="0"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleResetFilters}>Сбросить фильтры</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка бюджетов...</div>
        </div>
      ) : (
        <>
          {sortedBudgets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Тип</th>
                    <th className="px-4 py-2 text-left">Сумма</th>
                    <th className="px-4 py-2 text-left">Категория</th>
                    <th className="px-4 py-2 text-left">Описание</th>
                    <th className="px-4 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBudgets.map((budget) => (
                    <tr key={budget.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">{formatDate(budget.date)}</td>
                      <td className="px-4 py-3">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            budget.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {budget.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${budget.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(budget.amount)}
                      </td>
                      <td className="px-4 py-3">{categoryMap[budget.cash_flow_item] || "—"}</td>
                      <td className="px-4 py-3">{budget.description || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/budgets/${budget.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/budgets/new?duplicate=${budget.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Дублировать">
                              ⧉
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(budget.id)}
                          >
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
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Бюджеты не найдены</p>
              <Link href="/budgets/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый бюджет
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
