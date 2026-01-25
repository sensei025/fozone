/**
 * Script pour s'assurer que la colonne name est NOT NULL
 * Usage: node src/utils/ensureNameNotNull.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function ensureNameNotNull() {
  console.log('=== Vérification de la contrainte NOT NULL sur name ===\n');

  try {
    // Vérifier si la colonne est NOT NULL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name, 
          is_nullable,
          data_type
        FROM information_schema.columns 
        WHERE table_name = 'pricings' 
        AND column_name = 'name';
      `
    });

    // Alternative: Vérifier en essayant d'insérer NULL
    const { data: testData, error: testError } = await supabaseAdmin
      .from('pricings')
      .select('name')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur:', testError.message);
      process.exit(1);
    }

    console.log('✅ La table pricings est accessible');

    // Vérifier les pricings sans nom
    const { data: pricingsWithoutName, error: fetchError } = await supabaseAdmin
      .from('pricings')
      .select('id, name, amount')
      .or('name.is.null,name.eq.');

    if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError.message);
      process.exit(1);
    }

    if (pricingsWithoutName && pricingsWithoutName.length > 0) {
      console.log(`\n⚠️  ${pricingsWithoutName.length} tarif(s) sans nom trouvé(s):`);
      pricingsWithoutName.forEach(p => {
        console.log(`   - ID: ${p.id}, Amount: ${p.amount}, Name: "${p.name || 'NULL'}"`);
      });
      console.log('\n💡 Exécutez: node src/utils/fixPricingNames.js pour corriger');
    } else {
      console.log('✅ Tous les tarifs ont un nom');
    }

    console.log('\n💡 Pour rendre la colonne NOT NULL, exécutez dans Supabase:');
    console.log('   ALTER TABLE pricings ALTER COLUMN name SET NOT NULL;');
    console.log('   (Mais d\'abord, assurez-vous que tous les enregistrements ont un nom)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

ensureNameNotNull();

