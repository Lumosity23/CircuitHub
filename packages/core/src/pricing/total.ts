import { BomItem } from '../bom/diff'

export interface CostBreakdown {
  totalCost: number
  currency: string
  itemCount: number
  supplierBreakdown: SupplierCost[]
  categoryBreakdown?: CategoryCost[]
}

export interface SupplierCost {
  supplier: string
  cost: number
  itemCount: number
  percentage: number
}

export interface CategoryCost {
  category: string
  cost: number
  itemCount: number
  percentage: number
}

export function calculateTotalCost(items: BomItem[]): CostBreakdown {
  let totalCost = 0
  const supplierMap = new Map<string, { cost: number; count: number }>()
  let itemCount = 0
  let primaryCurrency = 'EUR'

  items.forEach(item => {
    if (!item.quantity || item.quantity <= 0) return

    itemCount++

    // Use override price if available, otherwise use component price
    const unitPrice = item.unitPrice || 0
    const lineCost = item.quantity * unitPrice
    totalCost += lineCost

    // Track currency
    if (item.currency && item.currency !== primaryCurrency) {
      // In a real implementation, we would handle currency conversion
      // For now, we'll use the first currency we encounter
    }

    // Track supplier costs
    if (item.suppliers && item.suppliers.length > 0) {
      const supplier = item.suppliers[0].name || 'Unknown'
      const current = supplierMap.get(supplier) || { cost: 0, count: 0 }
      supplierMap.set(supplier, {
        cost: current.cost + lineCost,
        count: current.count + item.quantity,
      })
    } else {
      const supplier = 'Unknown'
      const current = supplierMap.get(supplier) || { cost: 0, count: 0 }
      supplierMap.set(supplier, {
        cost: current.cost + lineCost,
        count: current.count + item.quantity,
      })
    }
  })

  // Calculate supplier breakdown
  const supplierBreakdown: SupplierCost[] = Array.from(supplierMap.entries())
    .map(([supplier, data]) => ({
      supplier,
      cost: Number(data.cost.toFixed(4)),
      itemCount: data.count,
      percentage: Number(((data.cost / totalCost) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.cost - a.cost)

  return {
    totalCost: Number(totalCost.toFixed(4)),
    currency: primaryCurrency,
    itemCount,
    supplierBreakdown,
  }
}

export function calculateLineCost(item: BomItem): number {
  if (!item.quantity || item.quantity <= 0) return 0
  
  const unitPrice = item.unitPrice || 0
  return Number((item.quantity * unitPrice).toFixed(4))
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount)
}

export function validatePricing(items: BomItem[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  items.forEach((item, index) => {
    const rowNum = index + 1

    if (item.quantity && item.quantity <= 0) {
      errors.push(`Row ${rowNum}: Quantity must be positive`)
    }

    if (item.unitPrice && item.unitPrice < 0) {
      errors.push(`Row ${rowNum}: Unit price cannot be negative`)
    }

    if (item.unitPrice && item.quantity && item.unitPrice > 10000) {
      errors.push(`Row ${rowNum}: Unit price seems unusually high`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getCostSummary(items: BomItem[]): {
  totalItems: number
  totalQuantity: number
  uniqueSuppliers: number
  hasPricing: boolean
} {
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  
  const suppliers = new Set<string>()
  let hasPricing = false

  items.forEach(item => {
    if (item.unitPrice && item.unitPrice > 0) {
      hasPricing = true
    }

    if (item.suppliers) {
      item.suppliers.forEach(supplier => {
        if (supplier.name) {
          suppliers.add(supplier.name)
        }
      })
    }
  })

  return {
    totalItems,
    totalQuantity,
    uniqueSuppliers: suppliers.size,
    hasPricing,
  }
}