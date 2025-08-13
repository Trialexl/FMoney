"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { WalletService } from "@/services/wallet-service"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts"
import { formatCurrency } from "@/lib/formatters"
import { Wallet as WalletIcon, ArrowUp, ArrowDown } from "lucide-react"

interface WalletWithBalance {
  id: string
  name: string
  description?: string
  balance: number
  percentage: number
}

export default function WalletBalancesReport() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wallets, setWallets] = useState<WalletWithBalance[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [positiveTotal, setPositiveTotal] = useState(0)
  const [negativeTotal, setNegativeTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const walletsData = await WalletService.getWallets()
        
        const walletsWithBalance: WalletWithBalance[] = []
        let total = 0
        let positive = 0
        let negative = 0
        
        // Get balance for each wallet
        for (const wallet of walletsData) {
          try {
            const balanceData = await WalletService.getWalletBalance(wallet.id)
            walletsWithBalance.push({
              ...wallet,
              balance: balanceData.balance,
              percentage: 0 // Will be calculated later
            })
            
            total += balanceData.balance
            if (balanceData.balance > 0) {
              positive += balanceData.balance
            } else if (balanceData.balance < 0) {
              negative += Math.abs(balanceData.balance)
            }
          } catch (error) {
            console.error(`Error fetching balance for wallet ${wallet.id}:`, error)
          }
        }
        
        // Calculate percentages
        if (total !== 0) {
          walletsWithBalance.forEach(wallet => {
            wallet.percentage = (wallet.balance / Math.abs(total)) * 100
          })
        }
        
        setWallets(walletsWithBalance)
        setTotalBalance(total)
        setPositiveTotal(positive)
        setNegativeTotal(negative)
        
      } catch (err: any) {
        console.error("Error fetching wallet data:", err)
        setError("Ошибка при загрузке данных о кошельках")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Sort wallets by balance (highest to lowest)
  const sortedWallets = [...wallets].sort((a, b) => b.balance - a.balance)
  
  // Prepare data for pie chart
  const positiveWallets = sortedWallets.filter(wallet => wallet.balance > 0)
  const negativeWallets = sortedWallets.filter(wallet => wallet.balance < 0)
  
  // Define colors for the pie chart
  const COLORS = ['#4ade80', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22']
  const NEGATIVE_COLORS = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#701a1a']
  
  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name]
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Общий баланс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <WalletIcon className="h-6 w-6 mr-3 text-primary" />
              <div className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalBalance)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Положительные балансы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUp className="h-6 w-6 mr-3 text-green-500" />
              <div className="text-3xl font-bold text-green-500">
                {formatCurrency(positiveTotal)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Отрицательные балансы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDown className="h-6 w-6 mr-3 text-red-500" />
              <div className="text-3xl font-bold text-red-500">
                {formatCurrency(negativeTotal)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Balances Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Распределение положительных балансов</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Загрузка данных...</div>
              </div>
            ) : positiveWallets.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={positiveWallets}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="balance"
                      nameKey="name"
                      label={({name, value, percent}) => `${name}: ${percent.toFixed(0)}%`}
                    >
                      {positiveWallets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Нет кошельков с положительным балансом</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Balances Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Список балансов по кошелькам</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Загрузка данных...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Кошелек</th>
                      <th className="pb-2 text-right">Баланс</th>
                      <th className="pb-2 text-right">% от общего</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedWallets.map(wallet => (
                      <tr key={wallet.id} className="border-b">
                        <td className="py-3">{wallet.name}</td>
                        <td className={`py-3 text-right ${wallet.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(wallet.balance)}
                        </td>
                        <td className="py-3 text-right">
                          {wallet.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
