'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { AnimatedLogo } from '@/components/animated-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { trpc } from '@/lib/trpc-client'
import { AddComponentDialog } from '@/components/add-component-dialog'
import { BomItemRow } from '@/components/bom-item-row'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
import {
  Settings,
  Download,
  Upload,
  FileText,
  Package,
  FolderOpen,
  DollarSign,
  Star,
  GitFork,
  Eye,
  Clock,
  Zap,
  UploadCloud,
  ArrowLeft,
  Plus,
  Box,
  FileImage
} from 'lucide-react'
import Link from 'next/link'
import { ProjectBomItem, Component } from '@circuithub/db'
import { toast } from '@/hooks/use-toast'

export type BomItemWithChildren = ProjectBomItem & {
  component: Component | null;
  children: (ProjectBomItem & { component: Component | null; })[];
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [isDragging, setIsDragging] = useState(false)
  const [logoState, setLogoState] = useState<'idle' | 'scared' | 'angry'>('idle')

  const {
    data: project,
    isLoading,
    error,
    refetch
  } = trpc.projects.getById.useQuery(
    { id: projectId, includeBom: true },
    {
      enabled: !!projectId,
      refetchOnWindowFocus: true,
    }
  )

  const deleteProjectMutation = trpc.projects.deleteWithPassword.useMutation({
    onSuccess: () => {
      toast({ title: "Projet supprimé", description: "Le projet a été supprimé avec succès." })
      router.push('/projects')
    },
    onError: (error) => {
      toast({ title: "Erreur de suppression", description: error.message, variant: 'destructive' })
    }
  })

  const handleDeleteProject = (password: string) => {
    deleteProjectMutation.mutate({ id: projectId, password })
  }

  const handleFileDrop = (file: File) => {
    console.log('Dropped file:', file.name)
    alert(`Fichier SVG "${file.name}" déposé ! L'upload n'est pas encore implémenté.`) 
  }

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files[0])
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const calculateTotalCost = () => {
    if (!project?.bomItems) return 0
    let total = 0;
    const calculate = (items: BomItemWithChildren[]) => {
      for (const item of items) {
        if (item.type === 'COMPONENT') {
          const unitPrice = item.unitPriceOverride || item.component?.unitPrice || 0
          total += (item.quantity * Number(unitPrice))
        } else if (item.children) {
          calculate(item.children as BomItemWithChildren[])
        }
      }
    }
    calculate(project.bomItems as BomItemWithChildren[])
    return total;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <UniversalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <AnimatedLogo size={120} state="loading" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Projet non trouvé ou erreur</h1>
          <p className="text-muted-foreground mb-4">{error?.message}</p>
          <Button asChild><Link href="/"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background flex relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <UniversalSidebar logoState={logoState} />
      
      <div className="flex-1">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          {/* Header content can be expanded here */}
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Nomenclature ({project?._count.bomItems || 0})
                    </h2>
                    <AddComponentDialog />
                  </div>
                  <CardDescription>Liste de tous les composants et groupes de votre projet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <div className="flex items-center p-2 border-b text-xs text-muted-foreground font-medium bg-muted/50">
                      <div className="w-10"></div>
                      <div className="flex-1">Composant</div>
                      <div className="w-24 text-center">Quantité</div>
                      <div className="w-32 text-right">Prix Unitaire</div>
                      <div className="w-32 text-right">Prix Total</div>
                    </div>
                    <div className="space-y-1">
                      {(project.bomItems as BomItemWithChildren[]).length > 0 ? (
                        (project.bomItems as BomItemWithChildren[]).map(item => (
                          <BomItemRow key={item.id} item={item} />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Nomenclature vide</h3>
                          <p className="text-muted-foreground mb-4 text-sm">Commencez par ajouter des groupes de composants.</p>
                          <AddComponentDialog />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CIRCUITME.md
                  </h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>L'affichage du README sera implémenté ici.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline"><Upload className="w-4 h-4 mr-2" />Importer BOM CSV</Button>
                    <Button className="w-full justify-start" variant="outline"><Download className="w-4 h-4 mr-2" />Exporter projet</Button>
                    <Button className="w-full justify-start" variant="outline"><Settings className="w-4 h-4 mr-2" />Paramètres projet</Button>
                    <div className="border-t my-2"></div>
                    <DeleteProjectDialog 
                      projectName={project.name} 
                      onConfirm={handleDeleteProject} 
                      isLoading={deleteProjectMutation.isLoading} 
                    />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Coût total</span>
                    <span className="font-semibold">{project?.totalCost?.toFixed(2) || calculateTotalCost().toFixed(2)} EUR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Composants</span>
                    <span className="font-semibold">{project?._count.bomItems || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fichiers</span>
                    <span className="font-semibold">{project?._count.files || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Versions</span>
                    <span className="font-semibold">{project?._count.bomCommits || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  {project?.bomCommits && project.bomCommits.length > 0 ? (
                    <div className="space-y-3">
                      {project.bomCommits.slice(0, 3).map((commit) => (
                        <div key={commit.id} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{commit.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(commit.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="ghost" size="sm"><FileText className="w-4 h-4 mr-2" />Datasheets</Button>
                  <Button className="w-full justify-start" variant="ghost" size="sm"><FileImage className="w-4 h-4 mr-2" />Schémas</Button>
                  <Button className="w-full justify-start" variant="ghost" size="sm"><Box className="w-4 h-4 mr-2" />Modèles 3D</Button>
                  <Button className="w-full justify-start" variant="ghost" size="sm"><FolderOpen className="w-4 h-4 mr-2" />Fichiers projet</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center text-white p-8 border-2 border-dashed border-gray-400 rounded-lg">
            <UploadCloud className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-semibold">Déposez votre fichier SVG</p>
          </div>
        </div>
      )}
    </div>
  )
}
