# CircuitHub - Contexte Complet du Projet

## 📋 Vue d'Ensemble

**CircuitHub** est un gestionnaire de Bill of Materials (BOM) moderne pour projets électroniques, inspiré de l'approche de GitHub. L'application permet de gérer des composants électroniques, d'importer des BOM depuis des fichiers CSV, de versionner les modifications, et de collaborer efficacement sur des projets électroniques.

### Objectif Principal
Créer une web-app sobre (style GitHub) où chaque **projet** regroupe sa **BOM** reliée à des **librairies de composants**, avec **images**, **datasheets**, **prix**, **liens fournisseurs**, **versionning léger** et **import CSV**.

---

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Backend**: tRPC + API REST + Zod validation
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: NextAuth.js + Argon2id
- **UI**: shadcn/ui + Tailwind CSS v3 + Lucide Icons
- **State Management**: Zustand + TanStack Query
- **Stockage**: Local (dev) / S3-compatible (prod)
- **Déploiement**: Docker + Docker Compose

### Structure du Projet
```
circuithub/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Page d'accueil (grille projets)
│   │   ├── projects/
│   │   │   ├── [id]/          # Page projet avec onglets
│   │   │   └── page.tsx       # BOM/Fichiers/CIRCUITME.md/Historique
│   │   ├── layout.tsx         # Layout principal + theme provider
│   │   └── globals.css        # Styles Tailwind + variables CSS
│   ├── components/
│   │   ├── ui/               # Composants shadcn/ui (déjà existants)
│   │   ├── bom/
│   │   │   └── BomTable.tsx   # Tableau BOM avancé
│   │   ├── theme-provider.tsx # Provider next-themes
│   │   └── theme-toggle.tsx   # Toggle dark/light mode
│   ├── lib/
│   │   ├── db.ts            # Client Prisma
│   │   ├── utils.ts         # Utilitaires (cn, etc.)
│   │   └── socket.ts        # Configuration Socket.IO
│   └── hooks/               # Hooks React personnalisés
├── packages/                # Structure monorepo (prête)
│   ├── api/                # Routeurs tRPC, schémas Zod
│   ├── core/               # Logique métier (CSV, BOM diff, pricing)
│   ├── db/                 # Schéma Prisma, migrations, seed
│   ├── storage/            # StorageDriver (local/S3)
│   ├── auth/               # Authentification NextAuth.js
│   └── ui/                 # Composants UI partagés
├── prisma/
│   └── schema.prisma       # Schéma PostgreSQL complet
├── docker-compose.yml      # Production
├── docker-compose.dev.yml  # Développement
├── Dockerfile             # Production
├── Dockerfile.dev         # Développement
└── scripts/              # Scripts de déploiement
```

---

## 🗄️ Base de Données (PostgreSQL)

### Schéma Complet
```prisma
// Fichier: prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // Hashed avec Argon2id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  projects     Project[]
  libraries    Library[]
  bomCommits   BomCommit[]
}

model Project {
  id          String   @id @default(cuid())
  ownerId     String
  name        String
  description String?
  tags        String[] // Array de tags
  readmePath  String?  // Path to CIRCUITME.md
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  owner         User           @relation(fields: [ownerId], references: [id])
  files         ProjectFile[]
  bomItems      ProjectBomItem[]
  bomCommits    BomCommit[]
  snapshots     Snapshot[]
}

model ProjectFile {
  id        String   @id @default(cuid())
  projectId String
  path      String   // Storage path
  filename  String
  mime      String
  size      Int      // File size in bytes
  createdAt DateTime @default(now())
  
  project Project @relation(fields: [projectId], references: [id])
}

model Library {
  id          String   @id @default(cuid())
  ownerId     String
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  owner      User        @relation(fields: [ownerId], references: [id])
  components Component[]
}

model Component {
  id           String   @id @default(cuid())
  libraryId    String
  refInternal  String?  // Référence interne
  mpn          String   // Manufacturer part number
  footprint    String?  // Empreinte physique
  attributes   Json?    // Attributs flexibles: {voltage, tolerance, package, ...}
  imageUrl     String?  // URL image composant
  datasheetUrl String?  // URL datasheet
  unitPrice    Decimal? @db.Decimal(12, 4)
  currency     String   @default("EUR")
  suppliers    Json?    // [{name,url,sku}]
  stock        Int?     // Quantité en stock (optionnel)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  library  Library          @relation(fields: [libraryId], references: [id])
  bomItems ProjectBomItem[]
  
  @@unique([libraryId, mpn])
}

model ProjectBomItem {
  id                  String   @id @default(cuid())
  projectId           String
  componentId         String?  // Nullable pour items "ad-hoc"
  lineLabel           String?  // Référence textuelle si pas de composant lié
  quantity            Int      // Quantité nécessaire
  unitPriceOverride   Decimal? @db.Decimal(12, 4) // Override prix
  notes               String?
  attributesOverride  Json?    // Override attributs composant
  suppliersOverride   Json?    // Override fournisseurs
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  project   Project    @relation(fields: [projectId], references: [id])
  component Component? @relation(fields: [componentId], references: [id])
}

model BomCommit {
  id        String   @id @default(cuid())
  projectId String
  authorId  String
  message   String   // Message du commit
  diff      Json     // {added:[...], removed:[...], changed:[{id,before,after}]}
  createdAt DateTime @default(now())
  
  project Project @relation(fields: [projectId], references: [id])
  author  User    @relation(fields: [authorId], references: [id])
}

model Snapshot {
  id        String   @id @default(cuid())
  projectId String
  bomJson   Json     // BOM complète en JSON
  createdAt DateTime @default(now())
  
  project Project @relation(fields: [projectId], references: [id])
}
```

---

## 🎨 UI/UX Design

### Design System
- **Framework**: shadcn/ui (composants Radix UI + Tailwind)
- **Thème**: Dark mode par défaut, support light mode
- **Couleurs**: Variables CSS avec support HSL
- **Typography**: Geist Sans + Geist Mono
- **Spacing**: Système basé sur rem (1rem = 16px)
- **Responsive**: Mobile-first avec breakpoints Tailwind

### Variables CSS Principales
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

### Composants Clés Implémentés
1. **BomTable** - Tableau BOM avancé avec:
   - Tri multi-colonnes
   - Recherche globale
   - Édition inline
   - Calcul des coûts
   - Actions par ligne

2. **ProjectCard** - Carte projet avec:
   - Métadonnées (composants, fichiers, versions)
   - Tags et description
   - Coût total
   - Lien vers page projet

3. **ThemeToggle** - Switch dark/light mode

---

## 🔧 Fonctionnalités Implémentées

### ✅ Terminé
- [x] Page d'accueil avec grille de projets
- [x] Page projet avec onglets (BOM/Fichiers/CIRCUITME.md/Historique)
- [x] Composant BomTable avec tri, recherche, édition
- [x] Dark mode avec next-themes
- [x] Schéma PostgreSQL complet
- [x] Structure monorepo prête
- [x] Configuration Docker complète
- [x] Authentification NextAuth.js + Argon2id
- [x] Thème shadcn/ui cohérent

### 🚧 En Cours
- [ ] Connexion API tRPC aux composants frontend
- [ ] Import CSV avec wizard
- [ ] Système de fichiers (upload/download)
- [ ] Éditeur Markdown pour CIRCUITME.md
- [ ] Versionning BOM avec diffs
- [ ] Bibliothèques de composants

### 📋 À Faire (Priorités)
1. **API tRPC** - Connecter les routeurs existants
2. **Import CSV** - Wizard 3 étapes (upload → mapping → validation)
3. **File Management** - Upload gerber/pcb/pdf avec StorageDriver
4. **Markdown Editor** - Éditeur + preview pour CIRCUITME.md
5. **BOM Versioning** - Système de commits avec diffs
6. **Component Libraries** - CRUD bibliothèques et composants
7. **User Management** - Inscription, connexion, profils
8. **Export** - CSV/JSON avec format standard
9. **Search** - Recherche plein texte sur composants
10. **Tests** - Unitaires, intégration, E2E

---

## 🌐 API Design

### Routeurs tRPC (Structure)
```typescript
// packages/api/src/router/
├── index.ts          // Configuration tRPC + procédures
├── auth.ts           // signUp, signIn, signOut, getCurrentUser
├── projects.ts       // CRUD projets, fichiers, readme
├── bom.ts           // Gestion BOM, import/export
├── libraries.ts      // CRUD bibliothèques
└── components.ts    // CRUD composants, recherche
```

### Exemple de Routeur
```typescript
// projects.ts
export const projectsRouter = router({
  list: protectedProcedure
    .input(z.object({ pagination, search }))
    .query(({ ctx, input }) => {
      // Retourne projets paginés avec filtres
    }),
    
  create: protectedProcedure
    .input(projectInputSchema)
    .mutation(({ ctx, input }) => {
      // Crée nouveau projet
    }),
    
  getById: protectedProcedure
    .input(z.object({ id: idSchema }))
    .query(({ ctx, input }) => {
      // Retourne projet avec BOM, fichiers, etc.
    })
})
```

### Formats d'Échange
```json
// Export BOM JSON
{
  "project": {"id":"...", "name":"...", "tags":["..."]},
  "bom": [
    {
      "ref":"R1",
      "mpn":"RC0603FR-0710KL",
      "footprint":"0603",
      "quantity":10,
      "unitPrice":0.012,
      "currency":"EUR",
      "suppliers":[{"name":"LCSC","url":"..."}],
      "imageUrl":"...",
      "datasheetUrl":"...",
      "attributes":{"tolerance":"1%","power":"0.1W"}
    }
  ],
  "total": {"currency":"EUR","value":0.12}
}
```

---

## 🐳 Déploiement

### Docker Compose (Développement)
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: circuithub_dev
      POSTGRES_USER: circuithub_dev_user
      POSTGRES_PASSWORD: circuithub_dev_password
    ports: ["5432:5432"]
  
  app:
    build: 
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - DATABASE_URL=postgresql://...
      - NEXTAUTH_URL=http://localhost:3000
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
```

### Scripts Utiles
```bash
# Démarrage développement
./scripts/dev-start.sh

# Déploiement production
./scripts/prod-deploy.sh

# Docker manuel
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🎯 Conventions de Code

### TypeScript
- Utiliser les types stricts (`strict: true` dans tsconfig)
- Préférer les interfaces pour les objets, types pour les unions
- Utiliser Zod pour la validation des données

### React/Next.js
- Composants fonctionnels avec hooks
- Utiliser App Router pour les nouvelles pages
- Préférer `use client` seulement quand nécessaire
- Utiliser les composants shadcn/ui existants

### Prisma
- Nommer les modèles en PascalCase
- Utiliser les relations avec `@relation`
- Ajouter des indexes pour les performances
- Utiliser JSONB pour les attributs flexibles

### Tailwind CSS
- Utiliser les utilitaires plutôt que CSS custom
- Préférer les classes responsive (`sm:`, `md:`, `lg:`)
- Utiliser les variables CSS pour les couleurs
- Maintenir la cohérence avec le design system

---

## 🔍 Débogage Common Issues

### Problèmes Connus et Solutions
1. **Tailwind CSS v4 incompatible avec Next.js 15**
   - Solution: Utiliser Tailwind v3.4.15 avec configuration standard
   - Vérifier postcss.config.ts et globals.css

2. **PostgreSQL connection refused**
   - Solution: Vérifier docker-compose.yml et DATABASE_URL
   - S'assurer que le conteneur PostgreSQL est démarré

3. **Prisma client non généré**
   - Solution: `npx prisma generate` après modifications du schéma
   - Vérifier que DATABASE_URL est correct

4. **NextAuth configuration**
   - Solution: Vérifier NEXTAUTH_SECRET et NEXTAUTH_URL
   - S'assurer que les URLs correspondent à l'environnement

### Commandes Utiles
```bash
# Base de données
npx prisma db push          # Pousser le schéma
npx prisma generate        # Générer client
npx prisma studio          # Ouvrir Prisma Studio

# Développement
npm run dev                # Démarrer serveur dev
npm run build              # Builder pour production
npm run lint               # Linter le code

# Docker
docker-compose up -d       # Démarrer containers
docker-compose down        # Arrêter containers
docker-compose logs -f     # Voir logs
```

---

## 📚 Ressources Externes

### Documentation Officielle
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### Packages Clés
- **@radix-ui/**: Composants UI accessibles
- **lucide-react**: Icônes cohérentes
- **react-hook-form**: Gestion de formulaires
- **@tanstack/react-query**: Gestion d'état serveur
- **zod**: Validation de schémas
- **argon2**: Hashage de mots de passe sécurisé

### Outils Recommandés
- **VS Code** avec extensions: TypeScript, Tailwind, Prisma
- **TablePlus** ou **DBeaver** pour PostgreSQL
- **Postman** ou **Insomnia** pour tester les API
- **Docker Desktop** pour la gestion des containers

---

## 🚀 Next Steps pour l'IA

Pour continuer le développement, voici les priorités:

### Immédiat (Prochaines 48h)
1. **Connecter l'API tRPC** aux composants frontend existants
2. **Implémenter le CRUD de base** pour les projets
3. **Ajouter l'authentification** (inscription/connexion)

### Court Terme (Semaine 1)
1. **Import CSV** avec wizard 3 étapes
2. **File management** basique (upload/download)
3. **BOM editing** inline dans le tableau

### Moyen Terme (Semaines 2-3)
1. **Versionning BOM** avec système de commits
2. **Component libraries** CRUD
3. **Markdown editor** pour CIRCUITME.md

### Long Terme (Mois 1)
1. **Recherche avancée** avec full-text search
2. **Export/import** avancé
3. **Tests** et optimisation performance

### Bonnes Pratiques à Respecter
- Toujours utiliser les composants shadcn/ui existants
- Maintenir la cohérence du design system
- Écrire du code TypeScript strict et bien typé
- Suivre les conventions de nommage établies
- Tester les fonctionnalités critiques
- Documenter le code complexe

---

Ce contexte fournit toutes les informations nécessaires pour continuer le développement de CircuitHub de manière cohérente et professionnelle. L'IA qui reprendra ce projet disposera de toute la connaissance technique, architecture et fonctionnelle pour avancer efficacement.