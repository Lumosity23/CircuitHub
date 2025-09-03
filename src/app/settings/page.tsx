'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Settings, 
  Bell, 
  Globe, 
  Palette,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      projectUpdates: true,
      bomChanges: true,
      weeklyDigest: false,
    },
    preferences: {
      language: 'fr',
      currency: 'EUR',
      dateFormat: 'dd/mm/yyyy',
      theme: 'system',
    },
    privacy: {
      profilePublic: false,
      projectsPublic: false,
      analyticsOptOut: false,
    }
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // TODO: Implement settings save
    console.log('Saving settings:', settings)
  }

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting user data...')
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation
    console.log('Delete account requested...')
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground mb-4">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <Button asChild>
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
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
                <h1 className="text-2xl font-bold">Paramètres</h1>
                <p className="text-sm text-muted-foreground">Configurez vos préférences et paramètres</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <div className="text-sm text-muted-foreground">
                    Recevez des notifications importantes par email
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => handleNotificationChange('email', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications push</Label>
                  <div className="text-sm text-muted-foreground">
                    Notifications en temps réel dans le navigateur
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(value) => handleNotificationChange('push', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mises à jour de projets</Label>
                  <div className="text-sm text-muted-foreground">
                    Notifications lors de modifications de projets
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.projectUpdates}
                  onCheckedChange={(value) => handleNotificationChange('projectUpdates', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Changements de BOM</Label>
                  <div className="text-sm text-muted-foreground">
                    Notifications lors de modifications de BOM
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.bomChanges}
                  onCheckedChange={(value) => handleNotificationChange('bomChanges', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Résumé hebdomadaire</Label>
                  <div className="text-sm text-muted-foreground">
                    Résumé de votre activité chaque semaine
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.weeklyDigest}
                  onCheckedChange={(value) => handleNotificationChange('weeklyDigest', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Préférences
              </CardTitle>
              <CardDescription>
                Personnalisez votre expérience utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) => handlePreferenceChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar US ($)</SelectItem>
                      <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                      <SelectItem value="JPY">Yen (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format de date</Label>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thème</Label>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <span className="text-sm text-muted-foreground">
                      Utilisez le bouton pour changer le thème
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Confidentialité
              </CardTitle>
              <CardDescription>
                Contrôlez la visibilité de vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profil public</Label>
                  <div className="text-sm text-muted-foreground">
                    Permettre aux autres utilisateurs de voir votre profil
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.profilePublic}
                  onCheckedChange={(value) => handlePrivacyChange('profilePublic', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Projets publics</Label>
                  <div className="text-sm text-muted-foreground">
                    Rendre vos projets visibles publiquement
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.projectsPublic}
                  onCheckedChange={(value) => handlePrivacyChange('projectsPublic', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Désactiver les analytics</Label>
                  <div className="text-sm text-muted-foreground">
                    Ne pas participer aux statistiques d'usage anonymes
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.analyticsOptOut}
                  onCheckedChange={(value) => handlePrivacyChange('analyticsOptOut', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Gestion des données
              </CardTitle>
              <CardDescription>
                Exportez ou supprimez vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Exporter mes données</div>
                  <div className="text-sm text-muted-foreground">
                    Téléchargez toutes vos données au format JSON
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <div className="font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Supprimer mon compte
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cette action est irréversible et supprimera toutes vos données
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Sauvegarder les paramètres
            </Button>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}