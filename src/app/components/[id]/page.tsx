'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { AnimatedLogo } from '@/components/animated-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { 
  ArrowLeft,
  Download, 
  ExternalLink,
  FileText, 
  Package, 
  Cpu,
  Box,
  Zap,
  DollarSign,
  Building,
  Hash,
  Ruler,
  Image as ImageIcon,
  Star,
  Heart,
  Share2
} from 'lucide-react'
import Link from 'next/link'

// Mock data - à remplacer par de vraies données
const mockComponent = {
  id: '1',
  name: 'STM32F103C8T6',
  mpn: 'STM32F103C8T6',
  manufacturer: 'STMicroelectronics',
  description: 'Microcontrôleur ARM Cortex-M3 32-bit, 64KB Flash, 20KB RAM, 72MHz',
  category: 'Microcontrôleurs',
  footprint: 'LQFP-48',
  package: 'LQFP-48',
  unitPrice: 2.45,
  currency: 'EUR',
  stock: 1250,
  minOrderQty: 1,
  imageUrl: '/api/placeholder/300/300',
  datasheetUrl: '#',
  model3dUrl: '#',
  symbolUrl: '#',
  footprintUrl: '#',
  specifications: {
    'Architecture': 'ARM Cortex-M3',
    'Fréquence': '72 MHz',
    'Flash': '64 KB',
    'RAM': '20 KB',
    'GPIO': '37',
    'ADC': '12-bit, 10 canaux',
    'Timers': '4 × 16-bit',
    'Communication': 'USART, SPI, I2C, USB',
    'Alimentation': '2.0V à 3.6V',
    'Température': '-40°C à +85°C',
    'Package': 'LQFP-48'
  },
  suppliers: [
    { name: 'Mouser', sku: '511-STM32F103C8T6', url: '#', price: 2.45 },
    { name: 'DigiKey', sku: '497-6063-ND', url: '#', price: 2.52 },
    { name: 'Farnell', sku: '1447637', url: '#', price: 2.38 }
  ],
  tags: ['ARM', 'Microcontroller', '32-bit', 'STM32'],
  projects: [
    { id: '1', name: 'Arduino Clone', description: 'Clone Arduino basé sur STM32' },
    { id: '2', name: 'IoT Sensor', description: 'Capteur IoT pour monitoring' }
  ]
}

export default function ComponentPage() {
  const params = useParams()
  const componentId = params.id as string
  const [activeTab, setActiveTab] = useState('overview')

  // Mock loading state
  const [isLoading] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <UniversalSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AnimatedLogo size={120} state="loading" />
            <p className="text-muted-foreground mt-4">Chargement du composant...</p>
          </div>
        </div>
      </div>
    )
  }

  const component = mockComponent

  return (
    <div className="min-h-screen bg-background flex">
      <UniversalSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/components">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux composants
                  </Link>
                </Button>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{component.name}</h1>
                    <Badge variant="secondary">{component.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{component.manufacturer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoris
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
                <Button size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Ajouter au projet
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Component Banner */}
        <div className="border-b bg-muted/30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4" />
                  <span className="font-medium">MPN:</span>
                  <span className="text-muted-foreground">{component.mpn}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="w-4 h-4" />
                  <span className="font-medium">Package:</span>
                  <span className="text-muted-foreground">{component.package}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Stock:</span>
                  <span className="text-muted-foreground">{component.stock.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {component.unitPrice.toFixed(2)} {component.currency}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Building className="w-3 h-3 mr-1" />
                  {component.suppliers.length} fournisseurs
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 p-6">
          {/* Left Column - Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="specs">Spécifications</TabsTrigger>
                <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
                <TabsTrigger value="projects">Projets</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Component Image & Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Image du composant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        {component.imageUrl ? (
                          <img 
                            src={component.imageUrl} 
                            alt={component.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Cpu className="w-24 h-24 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {component.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {component.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Specs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Caractéristiques principales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(component.specifications).slice(0, 8).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">{key}</div>
                          <div className="font-medium text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spécifications techniques complètes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(component.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suppliers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fournisseurs disponibles</CardTitle>
                    <CardDescription>
                      Comparez les prix et la disponibilité chez différents fournisseurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {component.suppliers.map((supplier, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Building className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {supplier.sku}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">{supplier.price.toFixed(2)} EUR</div>
                              <div className="text-sm text-muted-foreground">par unité</div>
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Voir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Projets utilisant ce composant</CardTitle>
                    <CardDescription>
                      Découvrez comment ce composant est utilisé dans d'autres projets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {component.projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{project.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {project.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Ajouter au projet
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger datasheet
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Box className="w-4 h-4 mr-2" />
                  Modèle 3D
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Symbole & Empreinte
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informations prix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prix unitaire</span>
                  <span className="font-semibold text-lg">
                    {component.unitPrice.toFixed(2)} {component.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantité min.</span>
                  <span className="font-semibold">{component.minOrderQty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock disponible</span>
                  <span className="font-semibold">{component.stock.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fournisseurs</span>
                  <span className="font-semibold">{component.suppliers.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Component Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informations techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fabricant</span>
                  <span className="font-medium">{component.manufacturer}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MPN</span>
                  <span className="font-medium">{component.mpn}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-medium">{component.package}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Footprint</span>
                  <span className="font-medium">{component.footprint}</span>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ressources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Datasheet PDF
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button className="w-full justify-start" variant="ghost" size="sm">
                  <Box className="w-4 h-4 mr-2" />
                  Modèle 3D STEP
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button className="w-full justify-start" variant="ghost" size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Symbole KiCad
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button className="w-full justify-start" variant="ghost" size="sm">
                  <Cpu className="w-4 h-4 mr-2" />
                  Empreinte PCB
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}