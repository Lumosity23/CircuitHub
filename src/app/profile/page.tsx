'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AnimatedLogo } from '@/components/animated-logo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { UniversalSidebar } from '@/components/universal-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { trpc } from '@/lib/trpc-client'
import { 
  User, 
  Mail, 
  Save,
  Settings,
  Shield,
  Activity,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  })

  // Get current user data
  const { data: user, isLoading } = trpc.auth.getCurrentUser.useQuery(
    undefined,
    {
      enabled: !!session?.user,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          email: data.email,
          bio: '', // TODO: Add bio field to user model
        })
      }
    }
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleSave = () => {
    // TODO: Implement user update mutation
    console.log('Saving user data:', formData)
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AnimatedLogo size={120} state="loading" />
          <p className="text-muted-foreground mt-4">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
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
                <h1 className="text-2xl font-bold">Mon Profil</h1>
                <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription>
                      Vos informations de profil et de contact
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    ) : (
                      'Modifier'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Votre nom complet"
                      />
                    ) : (
                      <div className="p-2 bg-muted rounded-md">
                        {user.name || 'Non défini'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="p-2 bg-muted rounded-md flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (optionnel)</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Parlez-nous de vous..."
                      rows={3}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md min-h-[80px]">
                      {formData.bio || 'Aucune bio définie'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité du compte
                </CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Mot de passe</div>
                    <div className="text-sm text-muted-foreground">
                      Dernière modification il y a plus de 30 jours
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Changer
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Authentification à deux facteurs</div>
                    <div className="text-sm text-muted-foreground">
                      Sécurisez votre compte avec 2FA
                    </div>
                  </div>
                  <Badge variant="outline">Bientôt disponible</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Membre depuis</span>
                  <span className="text-sm font-medium">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dernière connexion</span>
                  <span className="text-sm font-medium">
                    {formatDate(user.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projets créés</span>
                  <span className="text-sm font-medium">
                    0 {/* TODO: Add project count */}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/">
                    <Activity className="w-4 h-4 mr-2" />
                    Mes projets
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-destructive hover:text-destructive" 
                      disabled={isSigningOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter 
                        pour accéder à vos projets et composants.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}