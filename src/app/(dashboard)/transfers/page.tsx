"use client"

import { useState, useEffect } from "react"
import { TransferService, Transfer } from "@/services/financial-operations-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon, SearchIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { WalletService } from "@/services/wallet-service"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Maps for wallet names
  const [walletMap, setWalletMap] = useState<Record<string, string>>({})
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [walletFromId, setWalletFromId] = useState("")
  const [walletToId, setWalletToId] = useState("")
  const [amountMin, setAmountMin] = useState("")
  const [amountMax, setAmountMax] = useState("")

  const handleResetFilters = () => {
    setSearchTerm("")
    setDateFrom("")
    setDateTo("")
    setWalletFromId("")
    setWalletToId("")
    setAmountMin("")
    setAmountMax("")
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch transfers
      const transfersData = await TransferService.getTransfers()
      setTransfers(transfersData)
      
      // Fetch wallets for names
      const wallets = await WalletService.getWallets()
      const walletMapping: Record<string, string> = {}
      wallets.forEach(wallet => {
        walletMapping[wallet.id] = wallet.name
      })
      setWalletMap(walletMapping)
      
    } catch (err: any) {
      setError("Ошибка при загрузке переводов: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchAllData()
  }, [])
  
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот перевод?")) {
      try {
        await TransferService.deleteTransfer(id)
        setTransfers(transfers.filter(transfer => transfer.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении перевода: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }
  
  // Filter transfers based on search and date filters
  const filteredTransfers = transfers.filter(transfer => {
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      transfer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walletMap[transfer.wallet_from]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walletMap[transfer.wallet_to]?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // By wallets
    const walletFromMatch = !walletFromId || transfer.wallet_from === walletFromId
    const walletToMatch = !walletToId || transfer.wallet_to === walletToId

    // Filter by date from
    const dateFromMatch = !dateFrom || new Date(transfer.date) >= new Date(dateFrom)
    
    // Filter by date to
    const dateToMatch = !dateTo || new Date(transfer.date) <= new Date(dateTo)

    // Amount range
    const amountMinMatch = !amountMin || transfer.amount >= parseFloat(amountMin)
    const amountMaxMatch = !amountMax || transfer.amount <= parseFloat(amountMax)
    
    return searchMatch && walletFromMatch && walletToMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch
  })
  
  // Sort by date (newest first)
  const sortedTransfers = [...filteredTransfers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Переводы между кошельками</h1>
        <Link href="/transfers/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый перевод
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
                  placeholder="Поиск по описанию или кошельку..."
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
              <label className="block text-sm font-medium mb-1">Откуда</label>
              <Select value={walletFromId} onValueChange={setWalletFromId}>
                <SelectTrigger>
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(walletMap).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Куда</label>
              <Select value={walletToId} onValueChange={setWalletToId}>
                <SelectTrigger>
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(walletMap).map(([id, name]) => (
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
          <div className="text-lg">Загрузка переводов...</div>
        </div>
      ) : (
        <>
          {sortedTransfers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Сумма</th>
                    <th className="px-4 py-2 text-left">Откуда</th>
                    <th className="px-4 py-2 text-center"></th>
                    <th className="px-4 py-2 text-left">Куда</th>
                    <th className="px-4 py-2 text-left">Описание</th>
                    <th className="px-4 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">{formatDate(transfer.date)}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(transfer.amount)}
                      </td>
                      <td className="px-4 py-3">{walletMap[transfer.wallet_from] || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <ArrowRightIcon className="h-5 w-5 mx-auto text-primary" />
                      </td>
                      <td className="px-4 py-3">{walletMap[transfer.wallet_to] || "—"}</td>
                      <td className="px-4 py-3">{transfer.description || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/transfers/${transfer.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/transfers/new?duplicate=${transfer.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Дублировать">
                              ⧉
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(transfer.id)}
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
              <p className="text-muted-foreground mb-4">Переводы не найдены</p>
              <Link href="/transfers/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый перевод
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
