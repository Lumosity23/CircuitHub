#!/bin/bash

# Script de configuration pour le développement
echo "🚀 Configuration de l'environnement de développement..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Arrêter les conteneurs existants s'ils existent
echo "🛑 Arrêt des conteneurs existants..."
docker compose -f docker-compose.db.yml down

# Démarrer la base de données
echo "🐘 Démarrage de PostgreSQL..."
docker compose -f docker-compose.db.yml up -d

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
until docker exec circuithub_db_dev pg_isready -U circuithub_dev_user -d circuithub_dev; do
  echo "En attente de PostgreSQL..."
  sleep 2
done

echo "✅ Base de données prête!"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npm run db:generate

# Appliquer les migrations
echo "🗄️ Application des migrations..."
npm run db:migrate

# Test de la configuration
echo "🧪 Test de la configuration..."
if node scripts/test-config.js; then
    echo "🎉 Configuration terminée et testée avec succès!"
else
    echo "❌ Erreur lors du test de configuration"
    exit 1
fi

echo ""
echo "🚀 Pour démarrer le développement :"
echo "  npm run dev"
echo ""
echo "📋 Commandes utiles :"
echo "  npm run db:down    # Arrêter la base de données"
echo "  npm run db:logs    # Voir les logs de la base de données"
echo "  npm run db:up      # Redémarrer la base de données"