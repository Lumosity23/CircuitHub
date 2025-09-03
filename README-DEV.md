# Guide de Développement CircuitHub

## Configuration Rapide

### Prérequis
- Node.js (version 18+)
- Docker et Docker Compose
- npm ou yarn

### Première Installation

1. **Configuration automatique** (recommandé) :
   ```bash
   ./scripts/dev-setup.sh
   ```

2. **Configuration manuelle** :
   ```bash
   # Démarrer la base de données
   npm run db:up
   
   # Installer les dépendances
   npm install
   
   # Configurer Prisma
   npm run db:generate
   npm run db:migrate
   ```

### Développement Quotidien

1. **Démarrer la base de données** (si pas déjà fait) :
   ```bash
   npm run db:up
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Votre application sera disponible sur** : http://localhost:3000

### Commandes Utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run db:up` | Démarre la base de données Docker |
| `npm run db:down` | Arrête la base de données |
| `npm run db:logs` | Affiche les logs de la base de données |
| `npm run db:migrate` | Applique les migrations Prisma |
| `npm run db:reset` | Remet à zéro la base de données |
| `npm run dev:setup` | Configuration complète (DB + migrations) |
| `npm run dev:full` | Setup + démarrage du dev |

### Workflow Recommandé

1. **Premier jour** :
   ```bash
   ./scripts/dev-setup.sh
   npm run dev
   ```

2. **Jours suivants** :
   ```bash
   npm run db:up  # Si la DB n'est pas déjà lancée
   npm run dev
   ```

3. **Fin de journée** (optionnel) :
   ```bash
   npm run db:down  # Pour économiser les ressources
   ```

### Avantages de cette Configuration

✅ **Mise à jour instantanée** : Hot reload avec nodemon  
✅ **Base de données isolée** : PostgreSQL dans Docker  
✅ **Développement rapide** : Pas besoin de rebuilder l'app  
✅ **Environnement propre** : Séparation dev/prod  
✅ **Facile à partager** : Configuration reproductible  

### Dépannage

**La base de données ne démarre pas** :
```bash
docker compose -f docker-compose.db.yml down
docker compose -f docker-compose.db.yml up -d
```

**Problème de connexion Prisma** :
```bash
npm run db:generate
npm run db:migrate
```

**Réinitialiser complètement** :
```bash
npm run db:down
docker volume rm circuithub_postgres_dev_data
./scripts/dev-setup.sh
```