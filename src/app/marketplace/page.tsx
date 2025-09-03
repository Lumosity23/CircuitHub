'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Zap } from 'lucide-react'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { AnimatedLogo } from '@/components/animated-logo'
import { ThemeToggle } from '@/components/theme-toggle'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background flex">
      <UniversalSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Marketplace</h1>
                <p className="text-sm text-muted-foreground">
                  Découvrez et achetez des composants électroniques
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-8">
              <AnimatedLogo size={120} state="idle" />
            </div>
            
            <div className="mb-8">
              <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-4">Marketplace Bientôt Disponible</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Nous travaillons sur une marketplace révolutionnaire qui vous permettra d'acheter 
                des composants directement depuis vos projets, avec comparaison automatique des prix 
                et gestion des stocks en temps réel.
              </p>
            </div>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Fonctionnalités à venir
                </CardTitle>
                <CardDescription>
                  Ce qui vous attend dans la marketplace CircuitHub
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Comparaison automatique des prix</h4>
                    <p className="text-sm text-muted-foreground">
                      Trouvez automatiquement les meilleurs prix chez tous les fournisseurs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Achat direct depuis vos BOM</h4>
                    <p className="text-sm text-muted-foreground">
                      Commandez tous vos composants en un clic directement depuis vos projets
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Gestion des stocks intelligente</h4>
                    <p className="text-sm text-muted-foreground">
                      Suivi en temps réel des disponibilités et alertes de rupture
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Intégration fournisseurs</h4>
                    <p className="text-sm text-muted-foreground">
                      Connexion directe avec Mouser, Digi-Key, Farnell et bien d'autres
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous souhaitez être notifié du lancement ?
              </p>
              <Button size="lg" className="px-8">
                <ShoppingCart className="w-4 h-4 mr-2" />
                M'informer du lancement
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}