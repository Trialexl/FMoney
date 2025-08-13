"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ReceiptService, ExpenditureService } from "@/services/financial-operations-service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { formatCurrency } from "@/lib/formatters"

interface IncomeExpenseReportProps {
  dateFrom: string
  dateTo: string
}

export default function IncomeExpenseReport({ dateFrom, dateTo }: IncomeExpenseReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [incomeTotal, setIncomeTotal] = useState(0)
  const [expenseTotal, setExpenseTotal] = useState(0)
  const [barChartData, setBarChartData] = useState<any[]>([])
  const [lineChartData, setLineChartData] = useState<any[]>([])
  const [viewType, setViewType] = useState<"daily" | "monthly">("daily")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch all receipts and expenditures
        const [receipts, expenditures] = await Promise.all([
          ReceiptService.getReceipts(),
          ExpenditureService.getExpenditures()
        ])
        
        // Filter by date range
        const fromDate = new Date(dateFrom)
        const toDate = new Date(dateTo)
        
        const filteredReceipts = receipts.filter(receipt => {
          const date = new Date(receipt.date)
          return date >= fromDate && date <= toDate
        })
        
        const filteredExpenditures = expenditures.filter(expenditure => {
          const date = new Date(expenditure.date)
          return date >= fromDate && date <= toDate
        })
        
        // Calculate totals
        const totalIncome = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0)
        const totalExpense = filteredExpenditures.reduce((sum, expenditure) => sum + expenditure.amount, 0)
        
        setIncomeTotal(totalIncome)
        setExpenseTotal(totalExpense)
        
        // Prepare data for charts
        const dailyDataMap = new Map()
        const monthlyDataMap = new Map()
        
        // Process receipts
        filteredReceipts.forEach(receipt => {
          const date = new Date(receipt.date)
          const day = date.toISOString().substring(0, 10)
          const month = date.toISOString().substring(0, 7)
          
          // Daily data
          const dailyData = dailyDataMap.get(day) || { date: day, income: 0, expense: 0, balance: 0 }
          dailyData.income += receipt.amount
          dailyData.balance += receipt.amount
          dailyDataMap.set(day, dailyData)
          
          // Monthly data
          const monthlyData = monthlyDataMap.get(month) || { month, income: 0, expense: 0, balance: 0 }
          monthlyData.income += receipt.amount
          monthlyData.balance += receipt.amount
          monthlyDataMap.set(month, monthlyData)
        })
        
        // Process expenditures
        filteredExpenditures.forEach(expenditure => {
          const date = new Date(expenditure.date)
          const day = date.toISOString().substring(0, 10)
          const month = date.toISOString().substring(0, 7)
          
          // Daily data
          const dailyData = dailyDataMap.get(day) || { date: day, income: 0, expense: 0, balance: 0 }
          dailyData.expense += expenditure.amount
          dailyData.balance -= expenditure.amount
          dailyDataMap.set(day, dailyData)
          
          // Monthly data
          const monthlyData = monthlyDataMap.get(month) || { month, income: 0, expense: 0, balance: 0 }
          monthlyData.expense += expenditure.amount
          monthlyData.balance -= expenditure.amount
          monthlyDataMap.set(month, monthlyData)
        })
        
        // Convert map to array and sort by date
        const dailyDataArray = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date))
        const monthlyDataArray = Array.from(monthlyDataMap.values()).sort((a, b) => a.month.localeCompare(b.month))
        
        // Format labels for better display
        dailyDataArray.forEach(data => {
          const date = new Date(data.date)
          data.displayDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
        })
        
        monthlyDataArray.forEach(data => {
          const date = new Date(data.month + '-01')
          data.displayMonth = date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
        })
        
        setBarChartData(viewType === "daily" ? dailyDataArray : monthlyDataArray)
        setLineChartData(viewType === "daily" ? dailyDataArray : monthlyDataArray)
        
      } catch (err: any) {
        console.error("Error fetching report data:", err)
        setError("Ошибка при загрузке данных для отчета")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateFrom, dateTo, viewType])
  
  // Custom tooltip formatter for the charts
  const formatTooltip = (value: number) => {
    return formatCurrency(value)
  }
  
  // Toggle between daily and monthly view
  const toggleViewType = () => {
    setViewType(viewType === "daily" ? "monthly" : "daily")
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
            <CardTitle className="text-lg">Доходы за период</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(incomeTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Расходы за период</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {formatCurrency(expenseTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Баланс за период</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${incomeTotal - expenseTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(incomeTotal - expenseTotal)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={toggleViewType}
          className="px-3 py-1 text-xs bg-muted rounded-md hover:bg-muted/80"
        >
          {viewType === "daily" ? "Показать по месяцам" : "Показать по дням"}
        </button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            {viewType === "daily" ? "Доходы и расходы по дням" : "Доходы и расходы по месяцам"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Загрузка данных...</div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewType === "daily" ? "displayDate" : "displayMonth"} 
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Bar dataKey="income" name="Доходы" fill="#4ade80" />
                  <Bar dataKey="expense" name="Расходы" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            {viewType === "daily" ? "Динамика баланса по дням" : "Динамика баланса по месяцам"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Загрузка данных...</div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewType === "daily" ? "displayDate" : "displayMonth"}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    name="Баланс" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
