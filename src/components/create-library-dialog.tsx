'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'
import { toast } from '@/hooks/use-toast'

export function CreateLibraryDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const utils = trpc.useUtils()
  const createLibraryMutation = trpc.libraries.create.useMutation({
    onSuccess: () => {
      utils.libraries.list.invalidate()
      toast({ title: "Bibliothèque créée", description: "Votre nouvelle bibliothèque est prête." })
      setIsOpen(false)
      setName('')
      setDescription('')
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' })
    }
  })

  const handleSubmit = () => {
    if (!name) {
      toast({ title: "Erreur", description: "Le nom de la bibliothèque est requis.", variant: 'destructive' })
      return
    }
    createLibraryMutation.mutate({ name, description })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle bibliothèque</DialogTitle>
          <DialogDescription>
            Organisez vos composants en créant des bibliothèques personnelles.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
              placeholder="ex: Composants SMD 0805"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="col-span-3" 
              placeholder="(Optionnel)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={createLibraryMutation.isLoading}>
            {createLibraryMutation.isLoading ? 'Création...' : 'Créer la bibliothèque'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
