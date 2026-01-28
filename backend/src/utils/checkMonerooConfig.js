/**
 * Script utilitaire pour vérifier la configuration Moneroo
 * Usage: node src/utils/checkMonerooConfig.js
 */

require('dotenv').config();

const MONEROO_API_KEY = process.env.MONEROO_API_KEY;
const MONEROO_WEBHOOK_SECRET = process.env.MONEROO_WEBHOOK_SECRET;
const MONEROO_BASE_URL = process.env.MONEROO_BASE_URL || 'https://api.moneroo.io';

console.log('\n=== Vérification de la configuration Moneroo ===\n');

// Vérifier MONEROO_API_KEY
if (!MONEROO_API_KEY) {
  console.log('❌ MONEROO_API_KEY: NON CONFIGURÉ');
  console.log('   → Ajoutez MONEROO_API_KEY dans votre fichier .env');
} else if (MONEROO_API_KEY === 'votre_moneroo_api_key' || MONEROO_API_KEY.includes('votre_')) {
  console.log('⚠️  MONEROO_API_KEY: VALEUR PAR DÉFAUT DÉTECTÉE');
  console.log('   → Remplacez la valeur par votre vraie clé API Moneroo');
  console.log(`   → Longueur actuelle: ${MONEROO_API_KEY.length} caractères`);
} else {
  console.log('✅ MONEROO_API_KEY: Configuré');
  console.log(`   → Longueur: ${MONEROO_API_KEY.length} caractères`);
  console.log(`   → Préfixe: ${MONEROO_API_KEY.substring(0, 10)}...`);
}

// Vérifier MONEROO_WEBHOOK_SECRET
if (!MONEROO_WEBHOOK_SECRET) {
  console.log('❌ MONEROO_WEBHOOK_SECRET: NON CONFIGURÉ');
  console.log('   → Ajoutez MONEROO_WEBHOOK_SECRET dans votre fichier .env');
} else if (MONEROO_WEBHOOK_SECRET === 'votre_moneroo_webhook_secret' || MONEROO_WEBHOOK_SECRET.includes('votre_')) {
  console.log('⚠️  MONEROO_WEBHOOK_SECRET: VALEUR PAR DÉFAUT DÉTECTÉE');
  console.log('   → Remplacez la valeur par votre vrai secret webhook Moneroo');
} else {
  console.log('✅ MONEROO_WEBHOOK_SECRET: Configuré');
  console.log(`   → Longueur: ${MONEROO_WEBHOOK_SECRET.length} caractères`);
}

// Vérifier MONEROO_BASE_URL
console.log(`✅ MONEROO_BASE_URL: ${MONEROO_BASE_URL}`);
const finalUrl = MONEROO_BASE_URL.endsWith('/v1') ? MONEROO_BASE_URL : `${MONEROO_BASE_URL}/v1`;
console.log(`   → URL finale: ${finalUrl}`);

console.log('\n=== Instructions ===');
console.log('1. Connectez-vous à votre dashboard Moneroo');
console.log('2. Allez dans la section "Developers" ou "API Keys"');
console.log('3. Créez ou copiez votre Secret Key (pas la Public Key)');
console.log('4. Ajoutez-la dans votre fichier .env comme MONEROO_API_KEY');
console.log('5. Assurez-vous d\'utiliser la Secret Key pour le backend');
console.log('6. Redémarrez votre serveur backend après modification\n');

