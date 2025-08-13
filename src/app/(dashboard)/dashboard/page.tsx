"use client"

import { useState, useEffect } from "react"
import { WalletService, Wallet } from "@/services/wallet-service"
import { ExpenditureService, ReceiptService, Expenditure, Receipt } from "@/services/financial-operations-service"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expenditure[]>([])
  const [recentIncomes, setRecentIncomes] = useState<Receipt[]>([])
  const [totalBalance, setTotalBalance] = useState<number>(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch wallets
        const walletsData = await WalletService.getWallets()
        setWallets(walletsData)

        // Calculate total balance
        let total = 0
        for (const wallet of walletsData) {
          try {
            const balanceData = await WalletService.getWalletBalance(wallet.id)
            total += balanceData.balance
          } catch (error) {
            console.error(`Error fetching balance for wallet ${wallet.id}:`, error)
          }
        }
        setTotalBalance(total)

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
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Дашборд</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Общий баланс</h3>
            <p className="text-3xl font-bold">{totalBalance.toLocaleString('ru-RU')} ₽</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Кошельки</h3>
            <p className="text-3xl font-bold">{wallets.length}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Последние операции</h3>
            <p className="text-3xl font-bold">{recentExpenses.length + recentIncomes.length}</p>
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
