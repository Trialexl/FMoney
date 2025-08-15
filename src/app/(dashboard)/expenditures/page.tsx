"use client"

import { useState, useEffect } from "react"
import { ExpenditureService, Expenditure } from "@/services/financial-operations-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon, SearchIcon, CheckCircleIcon } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { WalletService } from "@/services/wallet-service"
import { CashFlowItemService } from "@/services/cash-flow-item-service"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function ExpendituresPage() {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Maps for wallet and category names
  const [walletMap, setWalletMap] = useState<Record<string, string>>({})
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [includeInBudget, setIncludeInBudget] = useState<boolean | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [amountMin, setAmountMin] = useState("")
  const [amountMax, setAmountMax] = useState("")

  const handleResetFilters = () => {
    setSearchTerm("")
    setDateFrom("")
    setDateTo("")
    setIncludeInBudget(null)
    setSelectedWalletId("")
    setSelectedCategoryId("")
    setAmountMin("")
    setAmountMax("")
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch expenditures
      const expendituresData = await ExpenditureService.getExpenditures()
      setExpenditures(expendituresData)
      
      // Fetch wallets for names
      const wallets = await WalletService.getWallets()
      const walletMapping: Record<string, string> = {}
      wallets.forEach(wallet => {
        walletMapping[wallet.id] = wallet.name
      })
      setWalletMap(walletMapping)
      
      // Fetch categories for names
      const categories = await CashFlowItemService.getCashFlowItems()
      const categoryMapping: Record<string, string> = {}
      categories.forEach(category => {
        categoryMapping[category.id] = category.name || "—"
      })
      setCategoryMap(categoryMapping)
      
    } catch (err: any) {
      setError("Ошибка при загрузке расходов: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchAllData()
  }, [])
  
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот расход?")) {
      try {
        await ExpenditureService.deleteExpenditure(id)
        setExpenditures(expenditures.filter(expenditure => expenditure.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении расхода: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }

  const handleFilterByBudget = async (includedInBudget?: boolean) => {
    setIsLoading(true);
    try {
      const expendituresData = await ExpenditureService.getExpenditures(includedInBudget);
      setExpenditures(expendituresData);
      setIncludeInBudget(includedInBudget !== undefined ? includedInBudget : null);
    } catch (err: any) {
      setError("Ошибка при загрузке расходов: " + (err.message || "Неизвестная ошибка"));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter expenditures based on search and date filters
  const filteredExpenditures = expenditures.filter(expenditure => {
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      expenditure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walletMap[expenditure.wallet]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryMap[expenditure.cash_flow_item]?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by wallet
    const walletMatch = !selectedWalletId || expenditure.wallet === selectedWalletId

    // Filter by category
    const categoryMatch = !selectedCategoryId || expenditure.cash_flow_item === selectedCategoryId

    // Filter by date from
    const dateFromMatch = !dateFrom || new Date(expenditure.date) >= new Date(dateFrom)
    
    // Filter by date to
    const dateToMatch = !dateTo || new Date(expenditure.date) <= new Date(dateTo)

    // Filter by amount range
    const amountMinMatch = !amountMin || expenditure.amount >= parseFloat(amountMin)
    const amountMaxMatch = !amountMax || expenditure.amount <= parseFloat(amountMax)
    
    return searchMatch && walletMatch && categoryMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch
  })
  
  // Sort by date (newest first)
  const sortedExpenditures = [...filteredExpenditures].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Расходы</h1>
        <Link href="/expenditures/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый расход
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Filters */}
      <div className="inline-block origin-top-left scale-75 mb-3">
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
                  placeholder="Поиск по описанию, кошельку, категории..."
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
              <label className="block text-sm font-medium mb-1">Включен в бюджет</label>
              <div className="flex gap-2">
                <Button 
                  variant={includeInBudget === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterByBudget(true)}
                >
                  Да
                </Button>
                <Button 
                  variant={includeInBudget === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterByBudget(false)}
                >
                  Нет
                </Button>
                <Button 
                  variant={includeInBudget === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterByBudget()}
                >
                  Все
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Кошелек</label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Все кошельки" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(walletMap).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка расходов...</div>
        </div>
      ) : (
        <>
          {sortedExpenditures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Сумма</th>
                    <th className="px-4 py-2 text-left">Кошелек</th>
                    <th className="px-4 py-2 text-left">Категория</th>
                    <th className="px-4 py-2 text-left">Описание</th>
                    <th className="px-4 py-2 text-center">В бюджете</th>
                    <th className="px-4 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpenditures.map((expenditure) => (
                    <tr key={expenditure.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">{formatDate(expenditure.date)}</td>
                      <td className="px-4 py-3 font-medium text-red-500">
                        {formatCurrency(expenditure.amount)}
                      </td>
                      <td className="px-4 py-3">{walletMap[expenditure.wallet] || "—"}</td>
                      <td className="px-4 py-3">{categoryMap[expenditure.cash_flow_item] || "—"}</td>
                      <td className="px-4 py-3">{expenditure.description || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {expenditure.include_in_budget ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">Нет</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/expenditures/${expenditure.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/expenditures/new?duplicate=${expenditure.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Дублировать">
                              ⧉
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(expenditure.id)}
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
              <p className="text-muted-foreground mb-4">Расходы не найдены</p>
              <Link href="/expenditures/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый расход
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
