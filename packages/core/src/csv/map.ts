import { CSVRow } from './parse'

export interface ColumnMapping {
  [csvColumn: string]: string // Maps CSV column to BOM field
}

export interface BomFieldMapping {
  reference?: string
  mpn?: string
  footprint?: string
  quantity?: string
  unitPrice?: string
  currency?: string
  supplier?: string
  notes?: string
  datasheet?: string
  image?: string
}

export const STANDARD_BOM_FIELDS: BomFieldMapping = {
  reference: 'reference',
  mpn: 'mpn',
  footprint: 'footprint',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  currency: 'currency',
  supplier: 'supplier',
  notes: 'notes',
  datasheet: 'datasheet',
  image: 'image',
}

export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}

  headers.forEach(header => {
    const normalized = header.toLowerCase().trim()

    // Reference/Designator mapping
    if (normalized.includes('ref') || normalized.includes('designator') || normalized === 'r') {
      mapping[header] = 'reference'
    }
    
    // MPN mapping
    else if (normalized.includes('mpn') || normalized.includes('part') || normalized.includes('number')) {
      mapping[header] = 'mpn'
    }
    
    // Footprint mapping
    else if (normalized.includes('footprint') || normalized.includes('package') || normalized.includes('case')) {
      mapping[header] = 'footprint'
    }
    
    // Quantity mapping
    else if (normalized.includes('qty') || normalized.includes('quantity') || normalized === 'q') {
      mapping[header] = 'quantity'
    }
    
    // Price mapping
    else if (normalized.includes('price') || normalized.includes('cost') || normalized.includes('unit')) {
      mapping[header] = 'unitPrice'
    }
    
    // Currency mapping
    else if (normalized.includes('currency') || normalized.includes('curr')) {
      mapping[header] = 'currency'
    }
    
    // Supplier mapping
    else if (normalized.includes('supplier') || normalized.includes('vendor') || normalized.includes('mfg')) {
      mapping[header] = 'supplier'
    }
    
    // Notes mapping
    else if (normalized.includes('note') || normalized.includes('comment') || normalized.includes('desc')) {
      mapping[header] = 'notes'
    }
    
    // Datasheet mapping
    else if (normalized.includes('datasheet') || normalized.includes('spec')) {
      mapping[header] = 'datasheet'
    }
    
    // Image mapping
    else if (normalized.includes('image') || normalized.includes('photo') || normalized.includes('pic')) {
      mapping[header] = 'image'
    }
  })

  return mapping
}

export function validateMapping(mapping: ColumnMapping): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const mappedFields = Object.values(mapping)

  // Check for required fields
  if (!mappedFields.includes('quantity')) {
    errors.push('Quantity field is required')
  }

  // Check for duplicate mappings
  const fieldCounts = mappedFields.reduce((acc, field) => {
    acc[field] = (acc[field] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(fieldCounts).forEach(([field, count]) => {
    if (count > 1) {
      errors.push(`Field "${field}" is mapped to multiple columns`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function applyMapping(rows: CSVRow[], mapping: ColumnMapping): any[] {
  return rows.map(row => {
    const mappedRow: any = {}

    Object.entries(mapping).forEach(([csvColumn, bomField]) => {
      const value = row[csvColumn]
      
      if (value !== undefined && value !== '') {
        // Apply type conversion based on field
        switch (bomField) {
          case 'quantity':
            mappedRow[bomField] = parseInt(value) || 0
            break
          case 'unitPrice':
            mappedRow[bomField] = parseFloat(value) || 0
            break
          default:
            mappedRow[bomField] = value.trim()
        }
      }
    })

    return mappedRow
  })
}

export function getUnmappedColumns(headers: string[], mapping: ColumnMapping): string[] {
  return headers.filter(header => !mapping[header])
}

export function getMappingPreview(rows: CSVRow[], mapping: ColumnMapping, maxRows: number = 5): any[] {
  const previewRows = rows.slice(0, maxRows)
  return applyMapping(previewRows, mapping)
}