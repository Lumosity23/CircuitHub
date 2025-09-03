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
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DeleteProjectDialogProps {
  projectName: string;
  onConfirm: (password: string) => void;
  isLoading: boolean;
}

export function DeleteProjectDialog({ projectName, onConfirm, isLoading }: DeleteProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')

  const isConfirmationMatching = confirmationText === projectName

  const handleConfirm = () => {
    if (!isConfirmationMatching) {
      toast({ title: "Confirmation incorrecte", variant: "destructive" })
      return
    }
    if (!password) {
      toast({ title: "Mot de passe requis", variant: "destructive" })
      return
    }
    onConfirm(password)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" variant="ghost">
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer le projet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supprimer le projet "{projectName}"</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les données associées à ce projet seront définitivement perdues.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm">
            Pour confirmer, veuillez taper <span className="font-bold text-foreground">{projectName}</span> dans le champ ci-dessous.
          </p>
          <Input 
            value={confirmationText} 
            onChange={(e) => setConfirmationText(e.target.value)}
          />
          <div>
            <Label htmlFor="password">Votre mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" requis pour confirmer"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            disabled={!isConfirmationMatching || !password || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? 'Suppression...' : 'Je comprends, supprimer ce projet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
