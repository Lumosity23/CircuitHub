#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement..."

# Vérifier si la base de données tourne
if ! docker ps | grep -q circuithub_db_dev; then
    echo "🐘 Démarrage de la base de données..."
    docker compose -f docker-compose.db.yml up -d
    
    echo "⏳ Attente de la base de données..."
    sleep 5
    
    until docker exec circuithub_db_dev pg_isready -U circuithub_dev_user -d circuithub_dev; do
      echo "En attente de PostgreSQL..."
      sleep 2
    done
    
    echo "✅ Base de données prête!"
else
    echo "✅ Base de données déjà en cours d'exécution"
fi

echo "🔧 Démarrage du serveur de développement..."
echo "📱 Votre application sera disponible sur: http://localhost:3000"
echo ""
echo "Pour arrêter :"
echo "  Ctrl+C pour arrêter le serveur"
echo "  npm run db:down pour arrêter la base de données"
echo ""

npm run dev