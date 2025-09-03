'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, FolderOpen, Calendar, DollarSign, Filter, Grid3X3, List } from 'lucide-react'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { AnimatedLogo } from '@/components/animated-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc-client'
import Link from 'next/link'

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Use tRPC to fetch projects
  const { data: projectsData, isLoading } = trpc.projects.list.useQuery(
    {
      page: 1,
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      query: searchQuery || undefined,
    },
    {
      enabled: !!session?.user,
      refetchOnWindowFocus: false,
    }
  )

  const projects = projectsData?.projects || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <UniversalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AnimatedLogo size={120} state="loading" />
            <p className="text-muted-foreground mt-4">Chargement de vos projets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <UniversalSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Mes Projets</h1>
                <p className="text-sm text-muted-foreground">
                  Gérez et organisez tous vos projets électroniques
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <CreateProjectDialog />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          {/* Filters and Controls */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher des projets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <FolderOpen className="w-4 h-4" />
                <span>{projects.length} projets</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Dernière activité: {projects.length > 0 ? formatDate(projects[0].updatedAt) : 'jamais'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>
                  {projects.reduce((total, p) => total + (p._count?.bomItems || 0), 0)} composants au total
                </span>
              </div>
            </div>
          </div>

          {/* Projects Display */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun projet trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Essayez une autre recherche' : 'Créez votre premier projet pour commencer'}
              </p>
              {!searchQuery && <CreateProjectDialog />}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project: any) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/projects/${project.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      {project.description && (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Tags */}
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                        <div className="text-center">
                          <div className="font-medium text-foreground">{project._count.bomItems}</div>
                          <div>composants</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-foreground">{project._count.files}</div>
                          <div>fichiers</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-foreground">{project._count.bomCommits}</div>
                          <div>versions</div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="pt-3 border-t text-xs text-muted-foreground">
                        {formatDate(project.updatedAt)}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project: any) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <Link href={`/projects/${project.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            {project.tags.length > 0 && (
                              <div className="flex gap-1">
                                {project.tags.slice(0, 3).map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <span>{project._count.bomItems} composants</span>
                            <span>{project._count.files} fichiers</span>
                            <span>{project._count.bomCommits} versions</span>
                            <span>Mis à jour le {formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}