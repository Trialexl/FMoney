"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { 
  DownloadIcon, 
  FileTextIcon, 
  FileTypeIcon 
} from "lucide-react"
import { exportToCSV, exportToPDF, ExportDataRow, ExportColumn, exportChartToPDF } from "@/lib/export-utils"

interface ExportReportButtonsProps {
  data: ExportDataRow[]
  columns: ExportColumn[]
  filename: string
  title: string
  chartRef?: React.RefObject<HTMLDivElement>
}

export default function ExportReportButtons({ 
  data, 
  columns, 
  filename, 
  title,
  chartRef
}: ExportReportButtonsProps) {
  const handleExportCSV = () => {
    exportToCSV(data, columns, filename)
  }
  
  const handleExportPDF = () => {
    exportToPDF(data, columns, filename, title)
  }
  
  const handleExportChartPDF = () => {
    if (chartRef && chartRef.current) {
      exportChartToPDF(chartRef, `${filename}-chart`, title)
    }
  }

  return (
    <div className="flex space-x-2 items-center">
      <span className="text-sm text-muted-foreground mr-2">Экспорт:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="flex items-center"
      >
        <FileTextIcon className="h-3.5 w-3.5 mr-1" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="flex items-center"
      >
        <FileTypeIcon className="h-3.5 w-3.5 mr-1" />
        PDF
      </Button>
      {chartRef && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportChartPDF}
          className="flex items-center"
        >
          <DownloadIcon className="h-3.5 w-3.5 mr-1" />
          График PDF
        </Button>
      )}
    </div>
  )
}
