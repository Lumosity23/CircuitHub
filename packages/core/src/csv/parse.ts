import Papa from 'papaparse'

export interface CSVRow {
  [key: string]: string | undefined
}

export interface ParsedCSV {
  headers: string[]
  rows: CSVRow[]
  errors: Papa.ParseError[]
}

export function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const parsed: ParsedCSV = {
          headers: results.meta.fields || [],
          rows: results.data as CSVRow[],
          errors: results.errors,
        }
        resolve(parsed)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export function validateCSVData(data: ParsedCSV): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (data.headers.length === 0) {
    errors.push('CSV file has no headers')
  }

  if (data.rows.length === 0) {
    errors.push('CSV file has no data rows')
  }

  // Check for required columns (flexible mapping will be done later)
  const hasQuantity = data.headers.some(h => 
    h.toLowerCase().includes('qty') || 
    h.toLowerCase().includes('quantity')
  )
  
  if (!hasQuantity) {
    errors.push('No quantity column found. Expected headers containing "qty" or "quantity"')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}