"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateForInput } from "@/lib/formatters"
import IncomeExpenseReport from "@/components/reports/income-expense-report"
import WalletBalancesReport from "@/components/reports/wallet-balances-report"
import CashFlowCategoriesReport from "@/components/reports/cash-flow-categories-report"
import BudgetExecutionReport from "@/components/reports/budget-execution-report"

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() - 1))))
  const [dateTo, setDateTo] = useState(formatDateForInput())
  const [isLoading, setIsLoading] = useState(false)

  // Handle date range changes
  const handleDateRangeChange = (range: string) => {
    const now = new Date()
    let from = new Date()
    
    switch(range) {
      case "week":
        from = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        from = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "quarter":
        from = new Date(now.setMonth(now.getMonth() - 3))
        break
      case "year":
        from = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        from = new Date(now.setMonth(now.getMonth() - 1))
    }
    
    setDateFrom(formatDateForInput(from))
    setDateTo(formatDateForInput(new Date()))
  }

  const dateFilterCard = (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Период отчета</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium mb-1">Дата с</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-9 w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium mb-1">Дата по</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-9 w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateRangeChange("week")}
            >
              Неделя
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateRangeChange("month")}
            >
              Месяц
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateRangeChange("quarter")}
            >
              Квартал
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateRangeChange("year")}
            >
              Год
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Отчеты и аналитика</h1>
      
      {dateFilterCard}
      
      <Tabs defaultValue="income-expense" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="income-expense">Доходы и расходы</TabsTrigger>
          <TabsTrigger value="wallet-balances">Балансы кошельков</TabsTrigger>
          <TabsTrigger value="categories">Категории расходов</TabsTrigger>
          <TabsTrigger value="budget-execution">Исполнение бюджета</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income-expense" className="mt-0">
          <IncomeExpenseReport dateFrom={dateFrom} dateTo={dateTo} />
        </TabsContent>
        
        <TabsContent value="wallet-balances" className="mt-0">
          <WalletBalancesReport />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-0">
          <CashFlowCategoriesReport dateFrom={dateFrom} dateTo={dateTo} />
        </TabsContent>
        
        <TabsContent value="budget-execution" className="mt-0">
          <BudgetExecutionReport dateFrom={dateFrom} dateTo={dateTo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
