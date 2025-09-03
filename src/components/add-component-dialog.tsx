'use client'

import { useState, useMemo } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Library, Search, X, Cpu, RadioReceiver, Waves, Dna, CheckCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CreateLibraryDialog } from './create-library-dialog'
import { useDebounce } from '@/hooks/use-debounce'
import { useParams } from 'next/navigation'

const groupTypes = [
  { id: 'RESISTOR', name: 'Résistances', icon: RadioReceiver },
  { id: 'CAPACITOR', name: 'Condensateurs', icon: Cpu },
  { id: 'INDUCTOR', name: 'Inductances', icon: Waves },
  { id: 'DIODE', name: 'Diodes', icon: Dna },
]

export function AddComponentDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const params = useParams()
  const projectId = params.id as string
  const utils = trpc.useUtils()

  const { data: projectData } = trpc.projects.getById.useQuery({ id: projectId, includeBom: true })
  const { data: libraries, isLoading: isLoadingLibraries } = trpc.libraries.list.useQuery()
  
  const { data: componentsData, isLoading: isLoadingComponents } = trpc.libraries.getComponents.useQuery(
    { libraryId: selectedLibraryId!, search: { query: debouncedSearchQuery } },
    { enabled: !!selectedLibraryId && !debouncedSearchQuery }
  )

  const { data: searchResults, isLoading: isSearching } = trpc.libraries.searchComponents.useQuery(
    { search: { query: debouncedSearchQuery } },
    { enabled: !!debouncedSearchQuery }
  )

  const addBomGroupMutation = trpc.projects.addBomGroup.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId, includeBom: true })
      toast({ title: "Groupe ajouté", description: "Le groupe de composants a été ajouté à votre nomenclature." })
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' })
    }
  })

  const displayedComponents = useMemo(() => {
    if (debouncedSearchQuery) return searchResults?.components || []
    return componentsData?.components || []
  }, [debouncedSearchQuery, searchResults, componentsData])

  const existingGroupLabels = useMemo(() => {
    return projectData?.bomItems.filter(item => item.type === 'GROUP').map(item => item.lineLabel) || []
  }, [projectData])

  const handleSelectLibrary = (libraryId: string) => {
    setSelectedLibraryId(libraryId)
    setSearchQuery('')
    setSelectedComponents([])
  }

  const handleToggleComponent = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId) 
        : [...prev, componentId]
    )
  }

  const handleAddGroup = (groupType: string) => {
    addBomGroupMutation.mutate({ projectId, groupType: groupType as any })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Ajouter Composant
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Bibliothèque de Composants</DialogTitle>
            <DialogDescription>
              Ajoutez des groupes, recherchez et sélectionnez des composants depuis vos bibliothèques.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-shrink-0 pt-4">
            <div className="grid grid-cols-4 gap-3">
              {groupTypes.map(group => {
                const isAdded = existingGroupLabels.includes(group.name)
                return (
                  <Button 
                    key={group.id} 
                    variant={isAdded ? "secondary" : "outline"} 
                    className="h-auto py-3" 
                    onClick={() => handleAddGroup(group.id)}
                    disabled={isAdded || addBomGroupMutation.isLoading}
                  >
                    {isAdded ? <CheckCircle className="w-5 h-5 mr-3 text-green-500"/> : <group.icon className="w-5 h-5 mr-3"/>}
                    {group.name}
                  </Button>
                )
              })}
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden p-1 mt-4">
            <div className="col-span-1 bg-muted/40 rounded-lg flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Mes Bibliothèques</h3>
              </div>
              <ScrollArea className="flex-1 p-2">
                {isLoadingLibraries && <p className="text-sm text-muted-foreground p-2">Chargement...</p>}
                {libraries && libraries.length > 0 ? (
                  libraries.map(lib => (
                    <Button 
                      key={lib.id} 
                      variant={selectedLibraryId === lib.id && !searchQuery ? 'secondary' : 'ghost'}
                      onClick={() => handleSelectLibrary(lib.id)}
                      className="w-full justify-start mb-1"
                    >
                      <Library className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="flex-1 truncate text-left">{lib.name}</span>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{lib._count.components}</span>
                    </Button>
                  ))
                ) : (
                  !isLoadingLibraries && (
                    <div className="text-center text-sm text-muted-foreground p-4">
                      <p className="mb-3">Aucune bibliothèque.</p>
                      <CreateLibraryDialog>
                        <Button size="sm" variant="outline"> <Plus className="w-4 h-4 mr-2" /> Créer</Button>
                      </CreateLibraryDialog>
                    </div>
                  )
                )}
              </ScrollArea>
            </div>

            <div className="col-span-3 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher dans toutes les bibliothèques..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 bg-muted/40 rounded-lg flex flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {(isLoadingComponents || isSearching) && <p className="text-sm text-muted-foreground p-2">Recherche en cours...</p>}
                    
                    {!searchQuery && !selectedLibraryId && (
                      <div className="text-center text-muted-foreground h-full flex items-center justify-center pt-24">
                        <p>Sélectionnez une bibliothèque ou lancez une recherche.</p>
                      </div>
                    )}

                    {displayedComponents.length > 0 ? (
                      displayedComponents.map((component: any) => (
                        <div 
                          key={component.id} 
                          onClick={() => handleToggleComponent(component.id)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-background/80",
                            selectedComponents.includes(component.id) && "bg-primary/10"
                          )}
                        >
                          <Checkbox checked={selectedComponents.includes(component.id)} />
                          <Cpu className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{component.mpn}</p>
                            <p className="text-xs text-muted-foreground">
                              {component.refInternal || (component.library ? `dans ${component.library.name}` : 'Pas de réf. interne')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      !isLoadingComponents && !isSearching && (selectedLibraryId || searchQuery) && (
                        <div className="text-center text-muted-foreground h-full flex items-center justify-center pt-24">
                          <p>Aucun composant trouvé.</p>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Fermer</Button>
            <Button disabled>
              Ajouter à la nomenclature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}