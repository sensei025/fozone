/**
 * Script de test pour diagnostiquer les problèmes d'authentification
 * Usage: node src/utils/testAuth.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('=== Test de configuration JWT ===\n');

// Vérifier JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET n\'est pas configuré dans .env');
  console.log('💡 Ajoutez JWT_SECRET=votre_secret_ici dans votre fichier .env');
  process.exit(1);
}

console.log('✅ JWT_SECRET est configuré');
console.log(`   Longueur: ${process.env.JWT_SECRET.length} caractères`);
console.log(`   Commence par: ${process.env.JWT_SECRET.substring(0, 10)}...\n`);

// Tester la génération d'un token
try {
  const testPayload = {
    userId: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    role: 'admin'
  };

  const token = jwt.sign(
    testPayload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  console.log('✅ Token généré avec succès');
  console.log(`   Token (premiers 50 caractères): ${token.substring(0, 50)}...\n`);

  // Tester la vérification du token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token vérifié avec succès');
    console.log('   Payload décodé:', decoded);
  } catch (verifyError) {
    console.error('❌ Erreur lors de la vérification du token:', verifyError.message);
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Erreur lors de la génération du token:', error.message);
  process.exit(1);
}

console.log('\n✅ Tous les tests sont passés !');
console.log('💡 Si vous avez toujours des problèmes, vérifiez:');
console.log('   1. Que le backend est démarré (npm run dev)');
console.log('   2. Que le fichier .env contient JWT_SECRET');
console.log('   3. Que le même JWT_SECRET est utilisé partout');

