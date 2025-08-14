"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WalletService, Wallet, WalletBalance } from "@/services/wallet-service"
import { ExpenditureService, ReceiptService } from "@/services/financial-operations-service"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2Icon, Wallet as WalletIcon, ArrowLeftIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

export default function WalletDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [recentOperations, setRecentOperations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch wallet details
        const walletData = await WalletService.getWallet(params.id)
        setWallet(walletData)
        
        // Fetch wallet balance
        const balanceData = await WalletService.getWalletBalance(params.id)
        setBalance(balanceData)
        
        // Fetch recent operations
        const [receipts, expenditures] = await Promise.all([
          ReceiptService.getReceipts(),
          ExpenditureService.getExpenditures()
        ])
        
        // Filter operations for this wallet and combine
        const walletReceipts = receipts
          .filter((r: any) => r.wallet === params.id)
          .map((r: any) => ({ ...r, type: 'receipt' }))
        
        const walletExpenditures = expenditures
          .filter((e: any) => e.wallet === params.id)
          .map((e: any) => ({ ...e, type: 'expenditure' }))
        
        // Combine and sort by date
        const operations = [...walletReceipts, ...walletExpenditures]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
        
        setRecentOperations(operations)
      } catch (err: any) {
        setError("Ошибка при загрузке данных кошелька: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchWalletData()
  }, [params.id])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error || !wallet) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error || "Кошелек не найден"}</div>
        <Link href="/wallets">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку кошельков
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/wallets">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{wallet.name}</h1>
        </div>
        <Link href={`/wallets/${wallet.id}/edit`}>
          <Button variant="outline">
            <Edit2Icon className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Баланс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <WalletIcon className="h-8 w-8 mr-3 text-primary" />
              <div className="text-3xl font-bold">
                {balance ? balance.balance.toLocaleString('ru-RU') : '0'} ₽
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Создан:</span>
                <p>{new Date(wallet.created_at).toLocaleDateString('ru-RU')}</p>
              </div>
              {wallet.code && (
                <div>
                  <span className="text-sm text-muted-foreground">Код:</span>
                  <p>{wallet.code}</p>
                </div>
              )}
              {wallet.hidden !== undefined && (
                <div>
                  <span className="text-sm text-muted-foreground">Скрыт:</span>
                  <p>{wallet.hidden ? 'Да' : 'Нет'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/receipts/new?wallet=${wallet.id}`}>
                <Button variant="outline" className="w-full">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Приход
                </Button>
              </Link>
              <Link href={`/expenditures/new?wallet=${wallet.id}`}>
                <Button variant="outline" className="w-full">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Расход
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOperations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Дата</th>
                    <th className="pb-2">Тип</th>
                    <th className="pb-2">Сумма</th>
                    <th className="pb-2">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOperations.map((op) => (
                    <tr key={op.id} className="border-b">
                      <td className="py-2">{new Date(op.date).toLocaleDateString('ru-RU')}</td>
                      <td className="py-2">
                        {op.type === 'receipt' ? 'Приход' : 'Расход'}
                      </td>
                      <td className={`py-2 ${op.type === 'receipt' ? 'text-green-500' : 'text-red-500'}`}>
                        {op.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-2">{op.description || 'Нет описания'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">Нет операций для этого кошелька</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
