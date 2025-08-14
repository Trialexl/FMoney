"use client"

import { useState, useEffect } from "react"
import { WalletService, Wallet } from "@/services/wallet-service"
import { ExpenditureService, ReceiptService, Expenditure, Receipt } from "@/services/financial-operations-service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expenditure[]>([])
  const [recentIncomes, setRecentIncomes] = useState<Receipt[]>([])
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({})
  const [showAllWallets, setShowAllWallets] = useState<boolean>(false)
  const [spentToday, setSpentToday] = useState<number>(0)
  const [spentThisMonth, setSpentThisMonth] = useState<number>(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch wallets
        const walletsData = await WalletService.getWallets()
        setWallets(walletsData)

        // Calculate per-wallet balances
        const balancesMap: Record<string, number> = {}
        for (const wallet of walletsData) {
          try {
            const balanceData = await WalletService.getWalletBalance(wallet.id)
            balancesMap[wallet.id] = balanceData.balance
          } catch (error) {
            console.error(`Error fetching balance for wallet ${wallet.id}:`, error)
          }
        }
        setWalletBalances(balancesMap)

        // Fetch recent expenses and incomes
        const expensesData = await ExpenditureService.getExpenditures()
        const incomesData = await ReceiptService.getReceipts()
        
        // Sort by date and take only 5 most recent
        setRecentExpenses(
          expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        )
        setRecentIncomes(
          incomesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        )

        // Spending stats
        const now = new Date()
        const isSameDay = (d: Date, ref: Date) =>
          d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
        const isSameMonth = (d: Date, ref: Date) =>
          d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()

        let todaySum = 0
        let monthSum = 0
        for (const exp of expensesData) {
          const d = new Date(exp.date)
          if (isSameDay(d, now)) todaySum += exp.amount
          if (isSameMonth(d, now)) monthSum += exp.amount
        }
        setSpentToday(todaySum)
        setSpentThisMonth(monthSum)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Recompute total balance based on toggle and loaded balances
  useEffect(() => {
    const sum = wallets.reduce((acc, wallet) => {
      if (!showAllWallets && wallet.hidden) return acc
      const balance = walletBalances[wallet.id] ?? 0
      return acc + balance
    }, 0)
    setTotalBalance(sum)
  }, [showAllWallets, wallets, walletBalances])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Дашборд</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Балансы кошельков (вверху, на две колонки) */}
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Балансы кошельков</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllWallets((v) => !v)}
              >
                {showAllWallets ? 'Только нескрытые' : 'Показать все'}
              </Button>
            </div>
            {(() => {
              const list = showAllWallets ? wallets : wallets.filter((w) => !w.hidden)
              if (list.length === 0) {
                return <p className="text-sm text-muted-foreground">Нет кошельков для отображения</p>
              }
              return (
                <div className="divide-y rounded-md border">
                  {list.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{wallet.name}</span>
                        {wallet.hidden && (
                          <span className="text-xs text-muted-foreground">(скрыт)</span>
                        )}
                      </div>
                      <span className="font-medium">{(walletBalances[wallet.id] ?? 0).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </Card>

          {/* Summary Cards */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Общий баланс</h3>
            <p className="text-3xl font-bold">{totalBalance.toLocaleString('ru-RU')} ₽</p>
          </Card>
          
          {/* Compact stats widget: wallets count + latest ops count */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Статистика</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Кошельки</p>
                <p className="text-2xl font-semibold">{wallets.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Последние операции</p>
                <p className="text-2xl font-semibold">{recentExpenses.length + recentIncomes.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">За день потрачено</p>
                <p className="text-2xl font-semibold text-red-500">{spentToday.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">За месяц потрачено</p>
                <p className="text-2xl font-semibold text-red-500">{spentThisMonth.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>
          </Card>

          
          
          {/* Recent Expenses */}
          <Card className="p-6 md:col-span-3">
            <h3 className="text-lg font-medium mb-4">Последние расходы</h3>
            {recentExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Дата</th>
                      <th className="pb-2">Сумма</th>
                      <th className="pb-2">Описание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((expense: Expenditure) => (
                      <tr key={expense.id} className="border-b">
                        <td className="py-2">{new Date(expense.date).toLocaleDateString('ru-RU')}</td>
                        <td className="py-2 text-red-500">{expense.amount.toLocaleString('ru-RU')} ₽</td>
                        <td className="py-2">{expense.description || 'Нет описания'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">Нет недавних расходов</p>
            )}
          </Card>
          
          {/* Recent Incomes */}
          <Card className="p-6 md:col-span-3">
            <h3 className="text-lg font-medium mb-4">Последние доходы</h3>
            {recentIncomes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Дата</th>
                      <th className="pb-2">Сумма</th>
                      <th className="pb-2">Описание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncomes.map((income: Receipt) => (
                      <tr key={income.id} className="border-b">
                        <td className="py-2">{new Date(income.date).toLocaleDateString('ru-RU')}</td>
                        <td className="py-2 text-green-500">{income.amount.toLocaleString('ru-RU')} ₽</td>
                        <td className="py-2">{income.description || 'Нет описания'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">Нет недавних доходов</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
