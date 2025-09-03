// Test de la configuration de développement
const { PrismaClient } = require('@prisma/client');

async function testConfiguration() {
  console.log('🧪 Test de la configuration...');
  
  try {
    // Test de connexion à la base de données
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connexion à PostgreSQL réussie');
    
    // Test d'une requête simple
    const userCount = await prisma.user.count();
    console.log(`✅ Base de données accessible (${userCount} utilisateurs)`);
    
    await prisma.$disconnect();
    console.log('✅ Configuration complète et fonctionnelle !');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Si appelé directement
if (require.main === module) {
  testConfiguration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testConfiguration;