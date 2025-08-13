"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  BudgetService, 
  ExpenditureService, 
  ReceiptService,
  Budget,
  Expenditure,
  Receipt
} from "@/services/financial-operations-service"
import { CashFlowItemService } from "@/services/cash-flow-item-service"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts"
import { formatCurrency } from "@/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { AlertCircleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import ExportReportButtons from "./export-report-buttons"
import { exportFormatters } from "@/lib/export-utils"

interface BudgetExecutionReportProps {
  dateFrom: string
  dateTo: string
}

interface BudgetItem {
  id: string
  name: string
  type: 'income' | 'expense'
  budgetAmount: number
  actualAmount: number
  difference: number
  executionPercent: number
}

export default function BudgetExecutionReport({ dateFrom, dateTo }: BudgetExecutionReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [totalBudget, setTotalBudget] = useState({ income: 0, expense: 0 })
  const [totalActual, setTotalActual] = useState({ income: 0, expense: 0 })
  
  // Refs для экспорта графиков
  const incomeChartRef = useRef<HTMLDivElement>(null)
  const expenseChartRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch all budgets, receipts, expenditures and categories
        const [budgets, receipts, expenditures, categories] = await Promise.all([
          BudgetService.getBudgets(),
          ReceiptService.getReceipts(),
          ExpenditureService.getExpenditures(),
          CashFlowItemService.getCashFlowItems()
        ])
        
        // Filter by date range
        const fromDate = new Date(dateFrom)
        const toDate = new Date(dateTo)
        
        const filteredBudgets = budgets.filter(budget => {
          const date = new Date(budget.date)
          return date >= fromDate && date <= toDate
        })
        
        const filteredReceipts = receipts.filter(receipt => {
          const date = new Date(receipt.date)
          return date >= fromDate && date <= toDate
        })
        
        const filteredExpenditures = expenditures.filter(expenditure => {
          const date = new Date(expenditure.date)
          return date >= fromDate && date <= toDate
        })
        
        // Build category map for quick lookups
        const categoryMap = new Map()
        categories.forEach(category => {
          categoryMap.set(category.id, category.name)
        })
        
        // Calculate budget execution
        const budgetMap = new Map()
        let incomeTotal = 0
        let expenseTotal = 0
        
        // Process budgets
        filteredBudgets.forEach(budget => {
          const categoryName = categoryMap.get(budget.cash_flow_item) || 'Неизвестная категория'
          const key = `${budget.type}-${budget.cash_flow_item}`
          
          budgetMap.set(key, {
            id: budget.id,
            name: categoryName,
            type: budget.type,
            budgetAmount: budget.amount,
            actualAmount: 0,
            difference: 0,
            executionPercent: 0
          })
          
          if (budget.type === 'income') {
            incomeTotal += budget.amount
          } else {
            expenseTotal += budget.amount
          }
        })
        
        // Process receipts
        let incomeActualTotal = 0
        filteredReceipts.forEach(receipt => {
          const key = `income-${receipt.cash_flow_item}`
          const budgetItem = budgetMap.get(key)
          
          if (budgetItem) {
            budgetItem.actualAmount += receipt.amount
            incomeActualTotal += receipt.amount
          } else {
            const categoryName = categoryMap.get(receipt.cash_flow_item) || 'Неизвестная категория'
            budgetMap.set(key, {
              id: receipt.id,
              name: categoryName,
              type: 'income',
              budgetAmount: 0,
              actualAmount: receipt.amount,
              difference: receipt.amount,
              executionPercent: 0
            })
            incomeActualTotal += receipt.amount
          }
        })
        
        // Process expenditures (only those included in budget)
        let expenseActualTotal = 0
        filteredExpenditures.filter(exp => exp.include_in_budget).forEach(expenditure => {
          const key = `expense-${expenditure.cash_flow_item}`
          const budgetItem = budgetMap.get(key)
          
          if (budgetItem) {
            budgetItem.actualAmount += expenditure.amount
            expenseActualTotal += expenditure.amount
          } else {
            const categoryName = categoryMap.get(expenditure.cash_flow_item) || 'Неизвестная категория'
            budgetMap.set(key, {
              id: expenditure.id,
              name: categoryName,
              type: 'expense',
              budgetAmount: 0,
              actualAmount: expenditure.amount,
              difference: -expenditure.amount,
              executionPercent: 0
            })
            expenseActualTotal += expenditure.amount
          }
        })
        
        // Calculate differences and execution percentages
        budgetMap.forEach(item => {
          item.difference = item.type === 'income' 
            ? item.actualAmount - item.budgetAmount 
            : item.budgetAmount - item.actualAmount
            
          if (item.budgetAmount > 0) {
            item.executionPercent = (item.actualAmount / item.budgetAmount) * 100
          } else if (item.actualAmount > 0) {
            item.executionPercent = 100 // No budget but has actuals
          }
        })
        
        // Convert map to array and split by type
        const budgetArray = Array.from(budgetMap.values())
        const incomeBudgets = budgetArray.filter(item => item.type === 'income')
        const expenseBudgets = budgetArray.filter(item => item.type === 'expense')
        
        // Sort by execution percentage
        incomeBudgets.sort((a, b) => b.executionPercent - a.executionPercent)
        expenseBudgets.sort((a, b) => b.executionPercent - a.executionPercent)
        
        // Combine and set state
        setBudgetItems([...incomeBudgets, ...expenseBudgets])
        setTotalBudget({ income: incomeTotal, expense: expenseTotal })
        setTotalActual({ income: incomeActualTotal, expense: expenseActualTotal })
        
      } catch (err: any) {
        console.error("Error fetching budget data:", err)
        setError("Ошибка при загрузке данных о исполнении бюджета")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateFrom, dateTo])
  
  // Custom tooltip formatter
  const formatTooltip = (value: number) => {
    return formatCurrency(value)
  }
  
  // Prepare data for charts - income
  const incomeBudgetData = budgetItems
    .filter(item => item.type === 'income')
    .map(item => ({
      name: item.name,
      budget: item.budgetAmount,
      actual: item.actualAmount,
    }))
    .slice(0, 10) // Top 10 income categories
  
  // Prepare data for charts - expenses
  const expenseBudgetData = budgetItems
    .filter(item => item.type === 'expense')
    .map(item => ({
      name: item.name,
      budget: item.budgetAmount,
      actual: item.actualAmount,
    }))
    .slice(0, 10) // Top 10 expense categories

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Summary - Income */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Исполнение бюджета доходов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">План</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget.income)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Факт</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(totalActual.income)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Исполнение</p>
                  <p className="text-2xl font-bold">
                    {totalBudget.income > 0 
                      ? `${Math.round((totalActual.income / totalBudget.income) * 100)}%` 
                      : '—'}
                  </p>
                </div>
              </div>
              
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ 
                    width: `${totalBudget.income > 0 
                      ? Math.min(100, (totalActual.income / totalBudget.income) * 100) 
                      : 0}%`
                  }}
                ></div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {totalActual.income >= totalBudget.income 
                  ? "План по доходам выполнен" 
                  : `До выполнения плана осталось ${formatCurrency(totalBudget.income - totalActual.income)}`}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Budget Summary - Expense */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Исполнение бюджета расходов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">План</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget.expense)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Факт</p>
                  <p className="text-2xl font-bold text-red-500">{formatCurrency(totalActual.expense)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Исполнение</p>
                  <p className="text-2xl font-bold">
                    {totalBudget.expense > 0 
                      ? `${Math.round((totalActual.expense / totalBudget.expense) * 100)}%` 
                      : '—'}
                  </p>
                </div>
              </div>
              
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div 
                  className={`h-full ${totalActual.expense > totalBudget.expense ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ 
                    width: `${totalBudget.expense > 0 
                      ? Math.min(100, (totalActual.expense / totalBudget.expense) * 100) 
                      : 0}%`
                  }}
                ></div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {totalActual.expense > totalBudget.expense 
                  ? `Превышение бюджета расходов на ${formatCurrency(totalActual.expense - totalBudget.expense)}` 
                  : `Остаток бюджета расходов: ${formatCurrency(totalBudget.expense - totalActual.expense)}`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget Execution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Budget Chart */}
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-start">
            <CardTitle>Исполнение бюджета доходов по категориям</CardTitle>
            <ExportReportButtons 
              data={incomeBudgetData}
              columns={[
                { key: 'name', header: 'Категория' },
                { key: 'budget', header: 'План', formatter: exportFormatters.currency },
                { key: 'actual', header: 'Факт', formatter: exportFormatters.currency }
              ]}
              filename="income-budget-execution-report"
              title="Исполнение бюджета доходов"
              chartRef={incomeChartRef}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Загрузка данных...</div>
              </div>
            ) : incomeBudgetData.length > 0 ? (
              <div className="h-80" ref={incomeChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeBudgetData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      tick={{ fontSize: 12 }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Bar dataKey="budget" name="План" fill="#3b82f6" />
                    <Bar dataKey="actual" name="Факт" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Нет данных о бюджете доходов за выбранный период</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Expense Budget Chart */}
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-start">
            <CardTitle>Исполнение бюджета расходов по категориям</CardTitle>
            <ExportReportButtons 
              data={expenseBudgetData}
              columns={[
                { key: 'name', header: 'Категория' },
                { key: 'budget', header: 'План', formatter: exportFormatters.currency },
                { key: 'actual', header: 'Факт', formatter: exportFormatters.currency }
              ]}
              filename="expense-budget-execution-report"
              title="Исполнение бюджета расходов"
              chartRef={expenseChartRef}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Загрузка данных...</div>
              </div>
            ) : expenseBudgetData.length > 0 ? (
              <div className="h-80" ref={expenseChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenseBudgetData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      tick={{ fontSize: 12 }} 
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Bar dataKey="budget" name="План" fill="#3b82f6" />
                    <Bar dataKey="actual" name="Факт" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Нет данных о бюджете расходов за выбранный период</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Budget Execution Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row justify-between items-start">
          <CardTitle>Детализация исполнения бюджета</CardTitle>
          <ExportReportButtons 
            data={budgetItems}
            columns={[
              { key: 'name', header: 'Категория' },
              { key: 'type', header: 'Тип', formatter: (type) => type === 'income' ? 'Доход' : 'Расход' },
              { key: 'budgetAmount', header: 'План', formatter: exportFormatters.currency },
              { key: 'actualAmount', header: 'Факт', formatter: exportFormatters.currency },
              { key: 'difference', header: 'Разница', formatter: exportFormatters.currency },
              { key: 'executionPercent', header: 'Исполнение, %', formatter: exportFormatters.percent }
            ]}
            filename="budget-execution-details"
            title="Детализация исполнения бюджета"
          />
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
                    <th className="pb-2">Категория</th>
                    <th className="pb-2">Тип</th>
                    <th className="pb-2 text-right">План</th>
                    <th className="pb-2 text-right">Факт</th>
                    <th className="pb-2 text-right">Разница</th>
                    <th className="pb-2 text-right">Исполнение</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.name}</td>
                      <td className="py-3">
                        {item.type === 'income' ? (
                          <Badge variant="success">Доход</Badge>
                        ) : (
                          <Badge variant="destructive">Расход</Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.budgetAmount)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={item.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(item.actualAmount)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={item.difference >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(item.difference)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.budgetAmount > 0 && (
                            <>
                              {item.type === 'income' ? (
                                item.executionPercent >= 100 ? (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircleIcon className="h-4 w-4 text-amber-500" />
                                )
                              ) : (
                                item.executionPercent > 100 ? (
                                  <XCircleIcon className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                )
                              )}
                            </>
                          )}
                          {item.budgetAmount > 0 ? (
                            `${Math.round(item.executionPercent)}%`
                          ) : (
                            '—'
                          )}
                        </div>
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
  )
}
