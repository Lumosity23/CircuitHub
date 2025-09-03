'use client'

import { useState }'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, ExternalLink } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'
import { toast } from '@/hooks/use-toast'
import { ProjectBomItem, Component } from '@circuithub/db'
import { useParams } from 'next/navigation'

interface ComponentDetailsDialogProps {
  item: ProjectBomItem & { component: Component | null };
  children: React.ReactNode;
}

export function ComponentDetailsDialog({ item, children }: ComponentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams()
  const projectId = params.id as string
  const utils = trpc.useUtils()

  const deleteBomItemMutation = trpc.projects.deleteBomItem.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId, includeBom: true })
      toast({ title: "Composant supprimé", description: "Le composant a été retiré de la nomenclature." })
      setIsOpen(false)
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' })
    }
  })

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce composant ?`)) {
      deleteBomItemMutation.mutate({ bomItemId: item.id, projectId })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du Composant</DialogTitle>
          <DialogDescription>
            Informations et actions pour le composant sélectionné.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* Read-only Specs */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Label>MPN:</Label><p className="font-medium">{item.component?.mpn || 'N/A'}</p>
            <Label>Référence Interne:</Label><p>{item.component?.refInternal || 'N/A'}</p>
            <Label>Valeur:</Label><p>{item.component?.attributes?.value || 'N/A'}</p>
            <Label>Boîtier:</Label><p>{item.component?.attributes?.package || 'N/A'}</p>
            <Label>Quantité:</Label><p className="font-medium">{item.quantity}</p>
          </div>

          {/* Project-specific actions */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <Label>Actions sur le projet:</Label>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleDelete}
              disabled={deleteBomItemMutation.isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer du projet
            </Button>
            {item.component && (
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Aller à la fiche composant
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}