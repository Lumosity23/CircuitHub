'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimatedLogo } from '@/components/animated-logo'
import {
  User,
  Settings,
  FolderOpen,
  Package,
  ShoppingCart,
  Home,
  Library,
  ChevronRight,
  Zap
} from 'lucide-react'

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  badge?: string
  isActive?: boolean
}

export function UniversalSidebar({ logoState }: { logoState?: 'idle' | 'loading' | 'scared' | 'angry' }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  // Auto-expand logic
  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setIsExpanded(true), 200)
      return () => clearTimeout(timer)
    } else {
      setIsExpanded(false)
    }
  }, [isHovered])

  const user = session?.user
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  const navigationItems: SidebarItem[] = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/',
      isActive: pathname === '/'
    },
    {
      icon: FolderOpen,
      label: 'Mes Projets',
      href: '/projects',
      isActive: pathname.startsWith('/projects')
    },
    {
      icon: Library,
      label: 'Librairies',
      href: '/libraries',
      isActive: pathname.startsWith('/libraries')
    },
    {
      icon: Package,
      label: 'Composants',
      href: '/components',
      isActive: pathname.startsWith('/components')
    },
    {
      icon: ShoppingCart,
      label: 'Marketplace',
      href: '/marketplace',
      badge: 'Bientôt',
      isActive: pathname.startsWith('/marketplace')
    }
  ]

  const userItems: SidebarItem[] = [
    {
      icon: User,
      label: 'Mon Profil',
      href: '/profile',
      isActive: pathname === '/profile'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      href: '/settings',
      isActive: pathname === '/settings'
    }
  ]

  const handleNavigation = (href: string) => {
    if (href !== pathname) {
      setIsNavigating(true)
      router.push(href)
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000)
    }
  }

  if (!session) return null

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-background/95 backdrop-blur border-r z-50 transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AnimatedLogo 
                size={32} 
                state={logoState || (isNavigating ? 'loading' : 'idle')}
              />
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg whitespace-nowrap">CircuitHub</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Electronics Design
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isExpanded && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium truncate">
                  {user?.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          {/* Main Navigation */}
          <div className="px-2 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  item.isActive && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {!item.badge && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          <Separator className="my-4 mx-2" />

          {/* User Navigation */}
          <div className="px-2 space-y-1">
            {userItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  item.isActive && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              CircuitHub v1.0.0
            </div>
          </div>
        )}
      </div>

      {/* Spacer for content */}
      <div className="w-16" />
    </>
  )
}