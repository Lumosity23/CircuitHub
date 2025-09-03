'use client'

import { useState } from 'react'
import { ProjectBomItem, Component } from '@circuithub/db'
import { Button } from '@/components/ui/button'
import { ChevronRight, Package, Plus, Cpu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc-client'
import { useParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// This should be imported from a central types file
export type BomItemWithChildren = ProjectBomItem & {
  component: Component | null;
  children: (ProjectBomItem & { component: Component | null; })[];
}

interface BomItemRowProps {
  item: BomItemWithChildren;
}

const resistorPackages = ['0201', '0402', '0603', '0805', '1206']

function QuickAddToolbar({ parentGroup }: { parentGroup: BomItemWithChildren }) {
  const params = useParams()
  const projectId = params.id as string
  const utils = trpc.useUtils()

  const [pkg, setPkg] = useState('0402')
  const [value, setValue] = useState('10k')
  const [quantity, setQuantity] = useState(1)

  const addComponentMutation = trpc.projects.addBomComponentToGroup.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId, includeBom: true })
      toast({ title: "Composant ajouté", description: "Le composant a été ajouté au groupe." })
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' })
    }
  })

  const handleAddComponent = () => {
    if (!value || quantity <= 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: 'destructive' })
      return
    }
    addComponentMutation.mutate({
      projectId,
      parentId: parentGroup.id,
      quantity,
      attributes: {
        package: pkg,
        value,
      }
    })
  }

  return (
    <div className="border-b pb-3 mb-3">
      <p className="text-sm font-medium mb-2">Ajouter une nouvelle référence</p>
      <div className="flex items-end gap-2">
        <div className="grid flex-1 items-center gap-1.5">
          <Label htmlFor="res-package">Boîtier</Label>
          <Select value={pkg} onValueChange={setPkg}>
            <SelectTrigger id="res-package"><SelectValue /></SelectTrigger>
            <SelectContent>
              {resistorPackages.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid flex-1 items-center gap-1.5">
          <Label htmlFor="res-value">Valeur</Label>
          <Input id="res-value" value={value} onChange={e => setValue(e.target.value)} />
        </div>
        <div className="grid w-24 items-center gap-1.5">
          <Label htmlFor="res-qty">Quantité</Label>
          <Input id="res-qty" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} />
        </div>
        <Button onClick={handleAddComponent} size="sm" disabled={addComponentMutation.isLoading}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export function BomItemRow({ item }: BomItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isGroup = item.type === 'GROUP'

  const totalGroupCost = item.children.reduce((acc, child) => {
      const unitPrice = child.unitPriceOverride || child.component?.unitPrice || 0
      return acc + (child.quantity * Number(unitPrice))
  }, 0)

  if (isGroup) {
    return (
      <div className="bg-muted/20 rounded-lg border">
        <div 
          className="flex items-center p-2 cursor-pointer hover:bg-muted/40"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 flex justify-center">
            <ChevronRight 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </div>
          <div className="flex-1 flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground" />
            <p className="font-semibold">{item.lineLabel} ({item.children.length})</p>
          </div>
          <div className="w-24 text-center">-</div>
          <div className="w-32 text-right">-</div>
          <div className="w-32 text-right font-medium">{totalGroupCost.toFixed(2)} EUR</div>
        </div>
        
        {isExpanded && (
          <div className="pl-10 pr-4 pb-4">
            <div className="bg-background p-4 mt-2 rounded-md border">
              <QuickAddToolbar parentGroup={item} />
              <div className="space-y-1">
                {item.children.length > 0 ? (
                  item.children.map(child => {
                    const unitPrice = child.unitPriceOverride || child.component?.unitPrice || 0;
                    const total = child.quantity * Number(unitPrice);
                    return (
                        <div key={child.id} className="flex items-center text-sm p-2 rounded-md hover:bg-muted/50">
                            <div className="flex-1 flex items-center gap-3 pl-5">
                                <Cpu className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="font-mono text-xs">{child.component?.mpn || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">{child.component?.attributes?.value} - {child.component?.attributes?.package}</p>
                                </div>
                            </div>
                            <div className="w-24 text-center">{child.quantity}</div>
                            <div className="w-32 text-right">{Number(unitPrice).toFixed(2)} EUR</div>
                            <div className="w-32 text-right font-medium">{total.toFixed(2)} EUR</div>
                        </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-4">Aucun composant dans ce groupe.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const unitPrice = item.unitPriceOverride || item.component?.unitPrice || 0;
  const total = item.quantity * Number(unitPrice);
  return (
    <div className="flex items-center p-2 border-b">
        <div className="w-10"></div>
        <div className="flex-1 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-muted-foreground" />
            <div>
                <p className="font-medium text-sm">{item.component?.mpn || item.lineLabel}</p>
                <p className="text-xs text-muted-foreground">{item.component?.attributes?.value || 'N/A'}</p>
            </div>
        </div>
        <div className="w-24 text-center">{item.quantity}</div>
        <div className="w-32 text-right">{Number(unitPrice).toFixed(2)} EUR</div>
        <div className="w-32 text-right font-medium">{total.toFixed(2)} EUR</div>
    </div>
  )
}
