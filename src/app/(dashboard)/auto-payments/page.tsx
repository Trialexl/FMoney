"use client"

import { useState, useEffect } from "react"
import { AutoPaymentService, AutoPayment } from "@/services/financial-operations-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon, SearchIcon, RepeatIcon, AlertCircleIcon } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { WalletService } from "@/services/wallet-service"
import { CashFlowItemService } from "@/services/cash-flow-item-service"

export default function AutoPaymentsPage() {
  const [autoPayments, setAutoPayments] = useState<AutoPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Maps for wallet and category names
  const [walletMap, setWalletMap] = useState<Record<string, string>>({})
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [isTransfer, setIsTransfer] = useState<boolean | null>(null)

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch auto payments
      const autoPaymentsData = await AutoPaymentService.getAutoPayments(isTransfer !== null ? isTransfer : undefined)
      setAutoPayments(autoPaymentsData)
      
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
      setError("Ошибка при загрузке автоплатежей: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchAllData()
  }, [isTransfer])
  
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот автоплатеж?")) {
      try {
        await AutoPaymentService.deleteAutoPayment(id)
        setAutoPayments(autoPayments.filter(autoPayment => autoPayment.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении автоплатежа: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }
  
  // Filter auto payments based on search
  const filteredAutoPayments = autoPayments.filter(autoPayment => {
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      autoPayment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walletMap[autoPayment.wallet_from]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (autoPayment.wallet_to && walletMap[autoPayment.wallet_to]?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (autoPayment.cash_flow_item && categoryMap[autoPayment.cash_flow_item]?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return searchMatch
  })
  
  // Sort by next date (soonest first)
  const sortedAutoPayments = [...filteredAutoPayments].sort(
    (a, b) => new Date(a.next_date).getTime() - new Date(b.next_date).getTime()
  )

  // Check if next date is soon (within 7 days)
  const isDateSoon = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Автоматические платежи</h1>
        <Link href="/auto-payments/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый автоплатеж
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-1">Тип автоплатежа</label>
              <div className="flex gap-2">
                <Button 
                  variant={isTransfer === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsTransfer(isTransfer === true ? null : true)}
                >
                  Переводы
                </Button>
                <Button 
                  variant={isTransfer === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsTransfer(isTransfer === false ? null : false)}
                >
                  Расходы
                </Button>
                <Button 
                  variant={isTransfer === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsTransfer(null)}
                >
                  Все
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка автоплатежей...</div>
        </div>
      ) : (
        <>
          {sortedAutoPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Следующая дата</th>
                    <th className="px-4 py-2 text-left">Тип</th>
                    <th className="px-4 py-2 text-left">Сумма</th>
                    <th className="px-4 py-2 text-left">Откуда</th>
                    <th className="px-4 py-2 text-left">Куда / Категория</th>
                    <th className="px-4 py-2 text-center">Период (дней)</th>
                    <th className="px-4 py-2 text-left">Описание</th>
                    <th className="px-4 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAutoPayments.map((autoPayment) => (
                    <tr key={autoPayment.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {isDateSoon(autoPayment.next_date) && (
                            <AlertCircleIcon className="h-4 w-4 text-amber-500 mr-2" />
                          )}
                          {formatDate(autoPayment.next_date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          autoPayment.is_transfer 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {autoPayment.is_transfer ? 'Перевод' : 'Расход'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(autoPayment.amount)}
                      </td>
                      <td className="px-4 py-3">{walletMap[autoPayment.wallet_from] || "—"}</td>
                      <td className="px-4 py-3">
                        {autoPayment.is_transfer 
                          ? walletMap[autoPayment.wallet_to!] || "—"
                          : categoryMap[autoPayment.cash_flow_item!] || "—"
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <RepeatIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                          {autoPayment.period_days}
                        </div>
                      </td>
                      <td className="px-4 py-3">{autoPayment.description || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/auto-payments/${autoPayment.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(autoPayment.id)}
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
              <p className="text-muted-foreground mb-4">Автоплатежи не найдены</p>
              <Link href="/auto-payments/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый автоплатеж
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
