"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ExpenditureService } from "@/services/financial-operations-service"
import { CashFlowItemService } from "@/services/cash-flow-item-service"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveTreeMap } from "@nivo/treemap"
import { ResponsiveBar } from "@nivo/bar"
import { formatCurrency } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import ExportReportButtons from "./export-report-buttons"
import { exportFormatters } from "@/lib/export-utils"

interface CashFlowCategoriesReportProps {
  dateFrom: string
  dateTo: string
}

interface CategoryExpense {
  id: string
  name: string
  amount: number
  percentage: number
  children?: CategoryExpense[]
}

export default function CashFlowCategoriesReport({ dateFrom, dateTo }: CashFlowCategoriesReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])
  const [totalExpense, setTotalExpense] = useState(0)
  const [viewType, setViewType] = useState<"pie" | "treemap" | "bar">("pie")
  
  // Refs для экспорта графиков
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch all categories and expenditures
        const [categories, expenditures] = await Promise.all([
          CashFlowItemService.getCashFlowItems(),
          ExpenditureService.getExpenditures()
        ])
        
        // Filter expenditures by date range
        const fromDate = new Date(dateFrom)
        const toDate = new Date(dateTo)
        
        const filteredExpenditures = expenditures.filter(expenditure => {
          const date = new Date(expenditure.date)
          return date >= fromDate && date <= toDate
        })
        
        // Build category map for quick lookups
        const categoryMap = new Map()
        categories.forEach(category => {
          categoryMap.set(category.id, {
            id: category.id,
            name: category.name,
            parent: category.parent,
            amount: 0,
            percentage: 0,
            children: []
          })
        })
        
        // Calculate expenditure amounts by category
        let total = 0
        filteredExpenditures.forEach(expenditure => {
          const category = categoryMap.get(expenditure.cash_flow_item)
          if (category) {
            category.amount += expenditure.amount
            total += expenditure.amount
          }
        })
        
        // Calculate percentages
        if (total > 0) {
          categoryMap.forEach(category => {
            category.percentage = (category.amount / total) * 100
          })
        }
        
        // Build category hierarchy for treemap
        const rootCategories = []
        categoryMap.forEach(category => {
          if (!category.parent) {
            rootCategories.push(category)
          } else {
            const parentCategory = categoryMap.get(category.parent)
            if (parentCategory) {
              parentCategory.children.push(category)
            }
          }
        })
        
        // Sort categories by amount (highest to lowest)
        const sortedCategories = Array.from(categoryMap.values())
          .filter(category => category.amount > 0)
          .sort((a, b) => b.amount - a.amount)
        
        setCategoryExpenses(sortedCategories)
        setTotalExpense(total)
        
      } catch (err: any) {
        console.error("Error fetching category data:", err)
        setError("Ошибка при загрузке данных о категориях расходов")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateFrom, dateTo])
  
  // Top 10 categories for bar chart
  const topCategories = categoryExpenses.slice(0, 10)
  
  // Colors for the charts
  const COLORS = [
    '#4ade80', '#34d399', '#10b981', '#059669', '#047857',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'
  ]
  
  const pieData = categoryExpenses.map((c) => ({ id: c.name, label: c.name, value: c.amount }))
  const barData = topCategories.map((c) => ({ name: c.name, amount: c.amount }))
  const treeData = {
    name: "root",
    children: categoryExpenses.map((c) => ({ name: c.name, value: c.amount })),
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Общая сумма расходов за период</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-500">
            {formatCurrency(totalExpense)}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <ExportReportButtons 
          data={categoryExpenses}
          columns={[
            { key: 'name', header: 'Категория' },
            { key: 'amount', header: 'Сумма', formatter: exportFormatters.currency },
            { key: 'percentage', header: 'Доля', formatter: exportFormatters.percent }
          ]}
          filename="expenses-by-category-report"
          title="Отчет по категориям расходов"
          chartRef={chartRef}
        />
        
        <div className="flex space-x-2">
          <Button 
            variant={viewType === "pie" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewType("pie")}
          >
            Круговая диаграмма
          </Button>
          <Button 
            variant={viewType === "treemap" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewType("treemap")}
          >
            Карта категорий
          </Button>
          <Button 
            variant={viewType === "bar" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewType("bar")}
          >
            Топ 10
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            {viewType === "pie" && "Распределение расходов по категориям"}
            {viewType === "treemap" && "Карта категорий расходов"}
            {viewType === "bar" && "Топ 10 категорий расходов"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Загрузка данных...</div>
            </div>
          ) : categoryExpenses.length > 0 ? (
            <div className="h-[500px]" ref={chartRef}>
              {viewType === "pie" && (
                <ResponsivePie
                  data={pieData}
                  margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
                  innerRadius={0.5}
                  padAngle={1}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'category10' }}
                  tooltip={({ datum }) => (
                    <div className="rounded border bg-background px-2 py-1 text-xs">
                      {datum.label}: {formatCurrency(Number(datum.value))}
                    </div>
                  )}
                  legends={[
                    {
                      anchor: 'right',
                      direction: 'column',
                      translateX: 100,
                      itemWidth: 100,
                      itemHeight: 18,
                    },
                  ]}
                />
              )}
              {viewType === "treemap" && (
                <ResponsiveTreeMap
                  data={treeData as any}
                  identity="name"
                  value="value"
                  innerPadding={3}
                  outerPadding={3}
                  labelSkipSize={12}
                  label={(n) => `${n.id}`}
                  tooltip={({ node }) => (
                    <div className="rounded border bg-background px-2 py-1 text-xs">
                      {String(node.id)}: {formatCurrency(Number(node.value))}
                    </div>
                  )}
                />
              )}
              {viewType === "bar" && (
                <ResponsiveBar
                  data={barData}
                  keys={["amount"]}
                  indexBy="name"
                  margin={{ top: 20, right: 20, bottom: 60, left: 120 }}
                  padding={0.3}
                  layout="horizontal"
                  axisBottom={{ tickSize: 0, tickPadding: 8 }}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  tooltip={({ value, indexValue }) => (
                    <div className="rounded border bg-background px-2 py-1 text-xs">
                      {String(indexValue)}: {formatCurrency(Number(value))}
                    </div>
                  )}
                  colors={{ scheme: 'red_yellow_blue' }}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Нет данных о расходах за выбранный период</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Детализация расходов по категориям</CardTitle>
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
                    <th className="pb-2 text-right">Сумма</th>
                    <th className="pb-2 text-right">% от общей</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryExpenses.map(category => (
                    <tr key={category.id} className="border-b">
                      <td className="py-3">{category.name}</td>
                      <td className="py-3 text-right text-red-500">
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="py-3 text-right">
                        {category.percentage.toFixed(1)}%
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
