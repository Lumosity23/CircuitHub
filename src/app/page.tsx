'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, FolderOpen, Calendar, DollarSign } from 'lucide-react'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { AnimatedLogo } from '@/components/animated-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { useSession, signIn } from 'next-auth/react'
import { trpc } from '@/lib/trpc-client'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projectsData, isLoading, error } = trpc.projects.list.useQuery(
    { search: { query: searchQuery || undefined } },
    { enabled: !!session?.user }
  )

  const projects = projectsData?.projects || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  if (status === 'loading' || (session && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AnimatedLogo size={120} state="loading" />
          <p className="text-muted-foreground mt-4">Chargement de CircuitHub...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    // Landing page logic remains the same, so it's omitted for brevity
    return <div>Landing Page...</div>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <UniversalSidebar />

      <div className="flex-1">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenue, {session?.user?.name || 'Utilisateur'} • Vue d'ensemble de votre activité
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <CreateProjectDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {projects.filter(p => new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} mis à jour cette semaine
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Composants Total</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((total, p) => total + (p._count?.bomItems || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Répartis sur {projects.length} projets
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fichiers Stockés</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((total, p) => total + (p._count?.files || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Schématiques, PCB, datasheets
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Versions BOM</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((total, p) => total + (p._count?.bomCommits || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Historique des modifications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher dans tous vos projets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Recent Projects (Left) */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Projets Récents</CardTitle>
                  <CardDescription>Vos derniers projets modifiés</CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Aucun projet créé</p>
                      <CreateProjectDialog />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project: any) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(project.updatedAt)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Activity (Right) */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <CreateProjectDialog />
                  <Button variant="outline" className="w-full justify-start">Parcourir les composants</Button>
                  <Button variant="outline" className="w-full justify-start">Mes bibliothèques</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Activité Cette Semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Activity content to be added */}
                  <p className="text-sm text-muted-foreground">Pas d'activité récente.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
