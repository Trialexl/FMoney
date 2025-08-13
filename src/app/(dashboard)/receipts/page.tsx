"use client"

import { useState, useEffect } from "react"
import { ReceiptService, Receipt } from "@/services/financial-operations-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon, SearchIcon } from "lucide-react"
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

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Maps for wallet and category names
  const [walletMap, setWalletMap] = useState<Record<string, string>>({})
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedWalletId, setSelectedWalletId] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [amountMin, setAmountMin] = useState("")
  const [amountMax, setAmountMax] = useState("")

  const handleResetFilters = () => {
    setSearchTerm("")
    setDateFrom("")
    setDateTo("")
    setSelectedWalletId("")
    setSelectedCategoryId("")
    setAmountMin("")
    setAmountMax("")
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch receipts
      const receiptsData = await ReceiptService.getReceipts()
      setReceipts(receiptsData)
      
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
        categoryMapping[category.id] = category.name
      })
      setCategoryMap(categoryMapping)
      
    } catch (err: any) {
      setError("Ошибка при загрузке приходов: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchAllData()
  }, [])
  
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот приход?")) {
      try {
        await ReceiptService.deleteReceipt(id)
        setReceipts(receipts.filter(receipt => receipt.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении прихода: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }
  
  // Filter receipts based on search and date filters
  const filteredReceipts = receipts.filter(receipt => {
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walletMap[receipt.wallet]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryMap[receipt.cash_flow_item]?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by wallet
    const walletMatch = !selectedWalletId || receipt.wallet === selectedWalletId

    // Filter by category
    const categoryMatch = !selectedCategoryId || receipt.cash_flow_item === selectedCategoryId

    // Filter by date from
    const dateFromMatch = !dateFrom || new Date(receipt.date) >= new Date(dateFrom)
    
    // Filter by date to
    const dateToMatch = !dateTo || new Date(receipt.date) <= new Date(dateTo)

    // Filter by amount range
    const amountMinMatch = !amountMin || receipt.amount >= parseFloat(amountMin)
    const amountMaxMatch = !amountMax || receipt.amount <= parseFloat(amountMax)
    
    return searchMatch && walletMatch && categoryMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch
  })
  
  // Sort by date (newest first)
  const sortedReceipts = [...filteredReceipts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Приходы</h1>
        <Link href="/receipts/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый приход
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="pl-9 w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium mb-1">Дата по</label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Кошелек</label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                className="w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
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
          <div className="text-lg">Загрузка приходов...</div>
        </div>
      ) : (
        <>
          {sortedReceipts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Сумма</th>
                    <th className="px-4 py-2 text-left">Кошелек</th>
                    <th className="px-4 py-2 text-left">Категория</th>
                    <th className="px-4 py-2 text-left">Описание</th>
                    <th className="px-4 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">{formatDate(receipt.date)}</td>
                      <td className="px-4 py-3 font-medium text-green-500">
                        {formatCurrency(receipt.amount)}
                      </td>
                      <td className="px-4 py-3">{walletMap[receipt.wallet] || "—"}</td>
                      <td className="px-4 py-3">{categoryMap[receipt.cash_flow_item] || "—"}</td>
                      <td className="px-4 py-3">{receipt.description || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/receipts/${receipt.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(receipt.id)}
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
              <p className="text-muted-foreground mb-4">Приходы не найдены</p>
              <Link href="/receipts/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый приход
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
