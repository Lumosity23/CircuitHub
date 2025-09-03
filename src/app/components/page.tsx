'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Package, Filter, Grid3X3, List, Plus } from 'lucide-react'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSession } from 'next-auth/react'

export default function ComponentsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data for components - à remplacer par de vraies données
  const components = [
    {
      id: '1',
      name: 'Résistance 10kΩ',
      category: 'Résistances',
      value: '10kΩ',
      package: '0805',
      manufacturer: 'Yageo',
      partNumber: 'RC0805FR-0710KL',
      stock: 150,
      price: 0.02,
      description: 'Résistance couche épaisse 1% 1/8W'
    },
    {
      id: '2',
      name: 'Condensateur 100nF',
      category: 'Condensateurs',
      value: '100nF',
      package: '0603',
      manufacturer: 'Murata',
      partNumber: 'GRM188R71H104KA93D',
      stock: 200,
      price: 0.05,
      description: 'Condensateur céramique X7R 50V'
    },
    {
      id: '3',
      name: 'LED Rouge 5mm',
      category: 'LEDs',
      value: '2V',
      package: 'THT',
      manufacturer: 'Kingbright',
      partNumber: 'WP7113ID',
      stock: 75,
      price: 0.15,
      description: 'LED rouge haute luminosité 20mA'
    }
  ]

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background flex">
      <UniversalSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Composants</h1>
                <p className="text-sm text-muted-foreground">
                  Parcourez et gérez votre bibliothèque de composants
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un composant
                </Button>
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
                    placeholder="Rechercher des composants..."
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
                <Package className="w-4 h-4" />
                <span>{filteredComponents.length} composants</span>
              </div>
              <div className="flex items-center gap-1">
                <span>3 catégories</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Stock total: {components.reduce((sum, c) => sum + c.stock, 0)} unités</span>
              </div>
            </div>
          </div>

          {/* Components Display */}
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun composant trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Essayez une autre recherche' : 'Ajoutez votre premier composant pour commencer'}
              </p>
              {!searchQuery && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un composant
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredComponents.map((component) => (
                <Card key={component.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">{component.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {component.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {component.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Component Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valeur:</span>
                        <span className="font-medium">{component.value}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Boîtier:</span>
                        <span className="font-medium">{component.package}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={`font-medium ${component.stock < 50 ? 'text-orange-500' : 'text-green-500'}`}>
                          {component.stock} unités
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prix:</span>
                        <span className="font-medium">{component.price.toFixed(3)}€</span>
                      </div>
                    </div>

                    {/* Part Number */}
                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      {component.manufacturer} • {component.partNumber}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComponents.map((component) => (
                <Card key={component.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">{component.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {component.category}
                          </Badge>
                          <Badge 
                            variant={component.stock < 50 ? 'destructive' : 'default'} 
                            className="text-xs"
                          >
                            {component.stock} en stock
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {component.description}
                        </p>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <span>{component.value}</span>
                          <span>{component.package}</span>
                          <span>{component.manufacturer}</span>
                          <span>{component.partNumber}</span>
                          <span className="font-medium text-foreground">{component.price.toFixed(3)}€</span>
                        </div>
                      </div>
                      <Package className="w-5 h-5 text-muted-foreground" />
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