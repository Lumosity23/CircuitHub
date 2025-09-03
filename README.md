# CircuitHub - BOM Manager pour Projets Électroniques

![CircuitHub Logo](public/logo.svg)

**CircuitHub** est un gestionnaire de Bill of Materials (BOM) moderne pour projets électroniques, inspiré de l'approche de GitHub. Il permet de gérer des composants, d'importer des BOM depuis des fichiers CSV, de versionner les modifications, et de collaborer efficacement sur des projets électroniques.

## 🚀 Fonctionnalités

### Core Features
- 📋 **Gestion de BOM** - Tableau de bord complet avec gestion des composants
- 📊 **Import/Export CSV** - Importez facilement vos BOM existants
- 🔧 **Versionning** - Suivi des modifications avec système de commits
- 🏷️ **Bibliothèques de composants** - Composants réutilisables entre projets
- 🌙 **Dark Mode** - Interface optimisée pour le travail nocturne
- 📄 **CIRCUITME.md** - Documentation Markdown par projet

### Technical Features
- ⚡ **Next.js 15** - Framework React moderne avec App Router
- 🗄️ **PostgreSQL** - Base de données robuste avec Prisma ORM
- 🔐 **Authentification sécurisée** - NextAuth.js avec Argon2id
- 🎨 **UI moderne** - shadcn/ui avec Tailwind CSS
- 🐳 **Docker** - Déploiement simplifié avec Docker Compose
- 📱 **Responsive Design** - Optimisé pour tous les appareils

## 🏗️ Architecture

### Stack Technique
- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: tRPC + API REST
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: NextAuth.js + Argon2id
- **UI**: shadcn/ui + Tailwind CSS + Lucide Icons
- **Stockage**: Local (dev) / S3-compatible (prod)
- **Déploiement**: Docker + Docker Compose

### Structure du Projet
```
circuithub/
├── apps/web/                 # Application Next.js
│   ├── src/
│   │   ├── app/             # Pages et routes
│   │   ├── components/      # Composants UI
│   │   └── lib/            # Utilitaires
│   └── public/             # Fichiers statiques
├── packages/               # Packages partagés
│   ├── api/               # API tRPC et schémas
│   ├── core/              # Logique métier (CSV, BOM, pricing)
│   ├── db/                # Schéma Prisma et client
│   ├── storage/           # Gestion des fichiers
│   ├── auth/              # Authentification
│   └── ui/                # Composants UI partagés
├── scripts/               # Scripts de déploiement
├── docker-compose.yml     # Production
├── docker-compose.dev.yml # Développement
└── README.md             # Ce fichier
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Cloner le dépôt**
```bash
git clone <repository-url>
cd circuithub
```

2. **Lancer l'environnement de développement**
```bash
# Sur Linux/macOS
./scripts/dev-start.sh

# Sur Windows
scripts\dev-start.bat
```

3. **Accéder à l'application**
- Frontend: http://localhost:3000
- Base de données: localhost:5432

### Développement Local

Sans Docker:
```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.development .env

# Générer le client Prisma
npx prisma generate

# Pousser le schéma de la base de données
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

## 🐳 Docker

### Développement
```bash
# Démarrer l'environnement de développement
docker-compose -f docker-compose.dev.yml up -d

# Arrêter les services
docker-compose -f docker-compose.dev.yml down

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Production
```bash
# Déployer en production
./scripts/prod-deploy.sh

# Ou manuellement
docker-compose up -d --build
```

### Variables d'Environnement

Copiez `.env.example` vers `.env` et configurez les variables nécessaires:

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/circuithub"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Application
NODE_ENV="development"
```

## 📚 Utilisation

### Créer un Projet
1. Cliquez sur "Nveau Projet" depuis la page d'accueil
2. Remplissez les informations du projet (nom, description, tags)
3. Votre projet est prêt à recevoir des composants

### Importer une BOM
1. Depuis la page d'un projet, cliquez sur "Importer CSV"
2. Uploadez votre fichier CSV
3. Mappez les colonnes avec les champs correspondants
4. Validez et confirmez l'import

### Gérer les Composants
- **Ajouter**: Cliquez sur "Ajouter composant" dans la BOM
- **Modifier**: Utilisez le menu actions sur chaque ligne
- **Supprimer**: Supprimez des composants individuellement

### Versionning
Chaque modification importante de la BOM crée un "commit" avec:
- Message descriptif
- Diff des modifications
- Auteur et timestamp

## 🔧 Configuration

### Base de Données
Le schéma PostgreSQL inclut:
- `users` - Utilisateurs et authentification
- `projects` - Projets et métadonnées
- `libraries` - Bibliothèques de composants
- `components` - Composants réutilisables
- `project_bom_items` - Items de BOM par projet
- `bom_commits` - Historique des versions
- `snapshots` - Snapshots pour performance
- `project_files` - Fichiers joints

### Authentification
- **Hashage**: Argon2id pour les mots de passe
- **Sessions**: HTTP-only cookies sécurisés
- **Prêt pour OAuth**: Configuration pour GitHub/Google

### Stockage
- **Développement**: Stockage local dans `./storage`
- **Production**: Interface pour S3-compatible (MinIO, R2, etc.)

## 📝 API

### Endpoints tRPC
- `auth` - Inscription, connexion, déconnexion
- `projects` - CRUD projets
- `projects.bom` - Gestion des BOM
- `projects.files` - Gestion des fichiers
- `libraries` - Gestion des bibliothèques
- `components` - Gestion des composants

### Export
- `GET /projects/:id/bom.csv` - Export CSV
- `GET /projects/:id/bom.json` - Export JSON

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous license MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://prisma.io/) - ORM moderne
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Icônes

## 📞 Support

Pour toute question ou problème:
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation

---

**CircuitHub** - Gérez vos projets électroniques comme un pro ! 🚀⚡