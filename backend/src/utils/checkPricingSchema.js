/**
 * Script de vérification du schéma de la table pricings
 * Usage: node src/utils/checkPricingSchema.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkSchema() {
  console.log('=== Vérification du schéma de la table pricings ===\n');

  try {
    // Vérifier si la colonne name existe
    const { data, error } = await supabaseAdmin
      .from('pricings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error.message);
      if (error.message.includes('column') && error.message.includes('name')) {
        console.log('\n💡 Le champ "name" n\'existe pas dans la table pricings.');
        console.log('   Exécutez la migration: backend/database/migrations/002_add_name_to_pricings.sql');
        console.log('   Ou directement dans Supabase:');
        console.log('   ALTER TABLE pricings ADD COLUMN IF NOT EXISTS name VARCHAR(255);');
      }
      process.exit(1);
    }

    // Vérifier les colonnes disponibles
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('✅ Colonnes disponibles dans la table pricings:');
      columns.forEach(col => {
        console.log(`   - ${col}`);
      });

      if (columns.includes('name')) {
        console.log('\n✅ Le champ "name" existe dans la table pricings');
      } else {
        console.log('\n❌ Le champ "name" n\'existe PAS dans la table pricings');
        console.log('   Exécutez la migration: backend/database/migrations/002_add_name_to_pricings.sql');
        process.exit(1);
      }
    } else {
      console.log('⚠️  La table pricings est vide, impossible de vérifier les colonnes');
      console.log('   Mais la table existe, donc vous pouvez créer un tarif pour tester');
    }

    console.log('\n✅ Tous les tests sont passés !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkSchema();

