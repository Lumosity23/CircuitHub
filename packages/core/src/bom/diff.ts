export interface BomDiff {
  added: BomItem[]
  removed: BomItem[]
  changed: BomChange[]
}

export interface BomItem {
  id?: string
  ref?: string
  mpn?: string
  footprint?: string
  quantity: number
  unitPrice?: number
  currency?: string
  suppliers?: Array<{
    name: string
    url?: string
    sku?: string
  }>
  imageUrl?: string
  datasheetUrl?: string
  attributes?: Record<string, any>
  notes?: string
}

export interface BomChange {
  id: string
  before: Partial<BomItem>
  after: Partial<BomItem>
}

export function generateBomDiff(oldItems: BomItem[], newItems: BomItem[]): BomDiff {
  const diff: BomDiff = {
    added: [],
    removed: [],
    changed: [],
  }

  // Create maps for easier comparison
  const oldMap = new Map<string, BomItem>()
  const newMap = new Map<string, BomItem>()

  // Use ref+mpn as key for comparison, fallback to index
  oldItems.forEach((item, index) => {
    const key = item.ref && item.mpn ? `${item.ref}|${item.mpn}` : `index_${index}`
    oldMap.set(key, { ...item, id: item.id || `old_${index}` })
  })

  newItems.forEach((item, index) => {
    const key = item.ref && item.mpn ? `${item.ref}|${item.mpn}` : `index_${index}`
    newMap.set(key, { ...item, id: item.id || `new_${index}` })
  })

  // Find added items
  for (const [key, newItem] of newMap) {
    if (!oldMap.has(key)) {
      diff.added.push(newItem)
    }
  }

  // Find removed items
  for (const [key, oldItem] of oldMap) {
    if (!newMap.has(key)) {
      diff.removed.push(oldItem)
    }
  }

  // Find changed items
  for (const [key, newItem] of newMap) {
    const oldItem = oldMap.get(key)
    if (oldItem) {
      const changes = findItemChanges(oldItem, newItem)
      if (Object.keys(changes.before).length > 0) {
        diff.changed.push({
          id: oldItem.id || newItem.id || key,
          before: changes.before,
          after: changes.after,
        })
      }
    }
  }

  return diff
}

function findItemChanges(oldItem: BomItem, newItem: BomItem): { before: Partial<BomItem>; after: Partial<BomItem> } {
  const before: Partial<BomItem> = {}
  const after: Partial<BomItem> = {}

  const fieldsToCompare: (keyof BomItem)[] = [
    'quantity',
    'unitPrice',
    'currency',
    'footprint',
    'notes',
    'imageUrl',
    'datasheetUrl',
  ]

  fieldsToCompare.forEach(field => {
    if (oldItem[field] !== newItem[field]) {
      before[field] = oldItem[field]
      after[field] = newItem[field]
    }
  })

  // Compare suppliers
  if (JSON.stringify(oldItem.suppliers) !== JSON.stringify(newItem.suppliers)) {
    before.suppliers = oldItem.suppliers
    after.suppliers = newItem.suppliers
  }

  // Compare attributes
  if (JSON.stringify(oldItem.attributes) !== JSON.stringify(newItem.attributes)) {
    before.attributes = oldItem.attributes
    after.attributes = newItem.attributes
  }

  return { before, after }
}

export function applyBomDiff(baseItems: BomItem[], diff: BomDiff): BomItem[] {
  let result = [...baseItems]

  // Remove items
  result = result.filter(item => 
    !diff.removed.some(removed => 
      (item.ref && removed.ref && item.mpn && removed.mpn && 
       item.ref === removed.ref && item.mpn === removed.mpn) ||
      item.id === removed.id
    )
  )

  // Add new items
  result.push(...diff.added)

  // Apply changes
  diff.changed.forEach(change => {
    const itemIndex = result.findIndex(item => item.id === change.id)
    if (itemIndex !== -1) {
      result[itemIndex] = { ...result[itemIndex], ...change.after }
    }
  })

  return result
}

export function formatBomDiff(diff: BomDiff): string {
  const lines: string[] = []

  if (diff.added.length > 0) {
    lines.push(`Added ${diff.added.length} items:`)
    diff.added.forEach(item => {
      lines.push(`  + ${item.ref || 'N/A'} (${item.mpn || 'N/A'}) x${item.quantity}`)
    })
  }

  if (diff.removed.length > 0) {
    lines.push(`Removed ${diff.removed.length} items:`)
    diff.removed.forEach(item => {
      lines.push(`  - ${item.ref || 'N/A'} (${item.mpn || 'N/A'}) x${item.quantity}`)
    })
  }

  if (diff.changed.length > 0) {
    lines.push(`Modified ${diff.changed.length} items:`)
    diff.changed.forEach(change => {
      const changes = Object.keys(change.before).join(', ')
      lines.push(`  ~ ${change.id}: ${changes}`)
    })
  }

  return lines.join('\n')
}