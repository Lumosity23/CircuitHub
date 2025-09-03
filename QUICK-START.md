# 🚀 Démarrage Rapide - CircuitHub

## Première Installation
```bash
./scripts/dev-setup.sh
```

## Développement Quotidien
```bash
npm run dev:start
```
*ou*
```bash
npm run db:up    # Si la DB n'est pas lancée
npm run dev      # Dans un autre terminal
```

## Commandes Essentielles
- `npm run dev` - Serveur de développement avec hot reload
- `npm run db:up` - Démarre PostgreSQL + Redis
- `npm run db:down` - Arrête la base de données
- `npm run db:logs` - Logs de la base de données

## URLs
- **Application** : http://localhost:3000
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379

## Avantages ✅
- Hot reload instantané
- Base de données isolée dans Docker
- Pas de rebuild nécessaire
- Configuration reproductible