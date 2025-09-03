'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Library, Filter, Grid3X3, List, Plus, BookOpen } from 'lucide-react'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { AnimatedLogo } from '@/components/animated-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc-client'
import { useDebounce } from '@/hooks/use-debounce'
import { CreateLibraryDialog } from '@/components/create-library-dialog'

export default function LibrariesPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { 
    data: librariesData, 
    isLoading: isLoadingLibraries, 
    error 
  } = trpc.libraries.list.useQuery(
    { search: { query: debouncedSearchQuery } },
    { enabled: !!session?.user }
  )

  const libraries = librariesData || []

  const filteredLibraries = libraries.filter(library =>
    library.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (library.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoadingLibraries) {
    return (
      <div className="min-h-screen bg-background flex">
        <UniversalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AnimatedLogo size={120} state="loading" />
            <p className="text-muted-foreground mt-4">Chargement de vos bibliothèques...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-4">{error.message || 'Impossible de charger les bibliothèques'}</p>
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
                <h1 className="text-2xl font-bold">Mes Bibliothèques</h1>
                <p className="text-sm text-muted-foreground">
                  Organisez vos composants en bibliothèques réutilisables
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <CreateLibraryDialog>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une bibliothèque
                  </Button>
                </CreateLibraryDialog>
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
                    placeholder="Rechercher des bibliothèques..."
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
                <Library className="w-4 h-4" />
                <span>{filteredLibraries.length} bibliothèques</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{libraries.reduce((sum, l) => sum + (l._count?.components || 0), 0)} composants au total</span>
              </div>
              {/* Public libraries count is not directly available from _count, so omitting for now */}
              {/* <div className="flex items-center gap-1">
                <span>{libraries.filter(l => l.isPublic).length} publiques</span>
              </div> */}
            </div>
          </div>

          {/* Libraries Display */}
          {filteredLibraries.length === 0 && !isLoadingLibraries ? (
            <div className="text-center py-12">
              <Library className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune bibliothèque trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Essayez une autre recherche' : 'Créez votre première bibliothèque pour commencer'}
              </p>
              {!searchQuery && (
                <CreateLibraryDialog>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une bibliothèque
                  </Button>
                </CreateLibraryDialog>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLibraries.map((library) => (
                <Card key={library.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">{library.name}</CardTitle>
                      <div className="flex gap-1">
                        {/* Category is not available from backend, omitting for now */}
                        {/* <Badge variant="secondary" className="text-xs">
                          {library.category}
                        </Badge> */}
                        {/* isPublic is not available from backend, omitting for now */}
                        {/* {library.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )} */}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {library.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Library Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Composants:</span>
                        <span className="font-medium">{library._count?.components || 0}</span>
                      </div>
                      {/* isPublic is not available from backend, omitting for now */}
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Visibilité:</span>
                        <span className="font-medium">
                          {library.isPublic ? 'Publique' : 'Privée'}
                        </span>
                      </div> */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Créée:</span>
                        <span className="font-medium">{formatDate(library.createdAt)}</span>
                      </div>
                    </div>

                    {/* Last Update */}
                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      Mise à jour le {formatDate(library.updatedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLibraries.map((library) => (
                <Card key={library.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">{library.name}</h3>
                          {/* Category is not available from backend, omitting for now */}
                          {/* <Badge variant="secondary" className="text-xs">
                            {library.category}
                          </Badge> */}
                          {/* isPublic is not available from backend, omitting for now */}
                          {/* {library.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Public
                            </Badge>
                          )} */}
                          <Badge variant="default" className="text-xs">
                            {library._count?.components || 0} composants
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {library.description}
                        </p>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <span>Créée le {formatDate(library.createdAt)}</span>
                          <span>Mise à jour le {formatDate(library.updatedAt)}</span>
                          {/* isPublic is not available from backend, omitting for now */}
                          {/* <span>{library.isPublic ? 'Publique' : 'Privée'}</span> */}
                        </div>
                      </div>
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
