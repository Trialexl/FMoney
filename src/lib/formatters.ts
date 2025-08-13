/**
 * Форматирует дату в русском формате
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

/**
 * Форматирует валюту в рублях
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Форматирует дату в формате YYYY-MM-DD для input type="date"
 */
export const formatDateForInput = (date?: Date): string => {
  const d = date || new Date()
  return d.toISOString().split('T')[0]
}
