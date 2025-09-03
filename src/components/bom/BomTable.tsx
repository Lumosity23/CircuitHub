'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Edit, 
  MoreVertical,
  Search,
  ArrowUpDown,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BomItem {
  id: string
  lineLabel?: string
  quantity: number
  unitPriceOverride?: number
  notes?: string
  attributesOverride?: Record<string, any>
  suppliersOverride?: Array<{
    name: string
    url?: string
    sku?: string
  }>
  component?: {
    id: string
    refInternal?: string
    mpn: string
    footprint?: string
    imageUrl?: string
    datasheetUrl?: string
    unitPrice?: number
    currency: string
    attributes?: Record<string, any>
    suppliers?: Array<{
      name: string
      url?: string
      sku?: string
    }>
  }
}

interface BomTableProps {
  items: BomItem[]
  onEditItem?: (item: BomItem) => void
  onDeleteItem?: (itemId: string) => void
  onViewItem?: (item: BomItem) => void
  editable?: boolean
  showCostSummary?: boolean
}

export function BomTable({ 
  items, 
  onEditItem, 
  onDeleteItem, 
  onViewItem,
  editable = true,
  showCostSummary = true 
}: BomTableProps) {
  const [sortField, setSortField] = useState<keyof BomItem | 'component.mpn'>('lineLabel')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filter and sort items
  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.lineLabel?.toLowerCase().includes(searchLower) ||
      item.component?.refInternal?.toLowerCase().includes(searchLower) ||
      item.component?.mpn.toLowerCase().includes(searchLower) ||
      item.component?.footprint?.toLowerCase().includes(searchLower) ||
      item.notes?.toLowerCase().includes(searchLower)
    )
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: any, bValue: any

    if (sortField === 'component.mpn') {
      aValue = a.component?.mpn || ''
      bValue = b.component?.mpn || ''
    } else {
      aValue = a[sortField]
      bValue = b[sortField]
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (field: keyof BomItem | 'component.mpn') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getUnitPrice = (item: BomItem): number => {
    return item.unitPriceOverride || item.component?.unitPrice || 0
  }

  const getLineTotal = (item: BomItem): number => {
    return item.quantity * getUnitPrice(item)
  }

  const getSuppliers = (item: BomItem): Array<{ name: string; url?: string; sku?: string }> => {
    return item.suppliersOverride || item.component?.suppliers || []
  }

  const getTotalCost = (): number => {
    return sortedItems.reduce((sum, item) => sum + getLineTotal(item), 0)
  }

  const SortableHeader = ({ field, children }: { field: keyof BomItem | 'component.mpn'; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher dans la BOM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {editable && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4 mr-2" />
              Ajouter composant
            </Button>
            <Button variant="outline" size="sm">
              Importer CSV
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <SortableHeader field="lineLabel">Référence</SortableHeader>
              <SortableHeader field="component.mpn">MPN</SortableHeader>
              <TableHead>Empreinte</TableHead>
              <SortableHeader field="quantity">Qté</SortableHeader>
              <SortableHeader field="unitPriceOverride">Prix unit.</SortableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Total ligne</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item, index) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="text-sm text-muted-foreground">
                  {index + 1}
                </TableCell>
                
                {/* Reference */}
                <TableCell className="font-medium">
                  {item.lineLabel || item.component?.refInternal || '-'}
                </TableCell>
                
                {/* MPN with image */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.component?.imageUrl && (
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                        <img 
                          src={item.component.imageUrl} 
                          alt={item.component.mpn}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{item.component?.mpn}</div>
                      {item.component?.refInternal && (
                        <div className="text-xs text-muted-foreground">
                          {item.component.refInternal}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                {/* Footprint */}
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {item.component?.footprint || '-'}
                  </Badge>
                </TableCell>
                
                {/* Quantity */}
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        // Handle quantity update
                      }}
                      className="w-20"
                    />
                  ) : (
                    <span className="font-medium">{item.quantity}</span>
                  )}
                </TableCell>
                
                {/* Unit Price */}
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      step="0.001"
                      value={getUnitPrice(item)}
                      onChange={(e) => {
                        // Handle price update
                      }}
                      className="w-24"
                    />
                  ) : (
                    <span>
                      {getUnitPrice(item).toFixed(3)} {item.component?.currency || 'EUR'}
                    </span>
                  )}
                </TableCell>
                
                {/* Supplier */}
                <TableCell>
                  <div className="space-y-1">
                    {getSuppliers(item).slice(0, 2).map((supplier, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="text-sm">{supplier.name}</span>
                        {supplier.url && (
                          <a
                            href={supplier.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                    {getSuppliers(item).length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{getSuppliers(item).length - 2} autres
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Line Total */}
                <TableCell className="text-right font-medium">
                  {getLineTotal(item).toFixed(2)} {item.component?.currency || 'EUR'}
                </TableCell>
                
                {/* Actions */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    {onViewItem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewItem(item)}
                        className="w-8 h-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {editable && onEditItem && (
                          <DropdownMenuItem onClick={() => onEditItem(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        )}
                        {item.component?.datasheetUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={item.component.datasheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Datasheet
                            </a>
                          </DropdownMenuItem>
                        )}
                        {item.component?.imageUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={item.component.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Image
                            </a>
                          </DropdownMenuItem>
                        )}
                        {editable && onDeleteItem && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteItem(item.id)}
                            className="text-destructive"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cost Summary */}
      {showCostSummary && (
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {sortedItems.length} lignes • {sortedItems.reduce((sum, item) => sum + item.quantity, 0)} composants au total
            </div>
            <div className="text-xs text-muted-foreground">
              Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Coût total</div>
            <div className="text-2xl font-bold">
              {getTotalCost().toFixed(2)} EUR
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Aucun composant trouvé' : 'Aucun composant dans la BOM'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter des composants à votre BOM'}
          </p>
          {editable && !searchTerm && (
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Ajouter un composant
            </Button>
          )}
        </div>
      )}
    </div>
  )
}