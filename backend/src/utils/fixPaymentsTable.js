/**
 * Script pour vérifier et corriger la table payments
 * Vérifie si la colonne moneroo_payment_id existe, sinon la crée ou renomme l'ancienne
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/database');
const logger = require('../config/logger');

async function fixPaymentsTable() {
  try {
    logger.info('🔍 Vérification de la structure de la table payments...');

    // Vérifier si la colonne moneroo_payment_id existe
    const { data: columns, error: columnsError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'payments' 
          AND column_name IN ('moneroo_payment_id', 'monerro_payment_id')
        `
      });

    if (columnsError) {
      // Si RPC n'existe pas, utiliser une requête directe via SQL
      logger.info('⚠️ RPC exec_sql non disponible, utilisation d\'une approche alternative...');
      
      // Essayer d'insérer une valeur de test pour voir quelle colonne existe
      logger.info('📝 Tentative de vérification via test d\'insertion...');
      
      // Vérifier avec une requête SELECT simple
      const { data: testData, error: testError } = await supabaseAdmin
        .from('payments')
        .select('id')
        .limit(1);

      if (testError) {
        logger.error('❌ Erreur lors de la vérification:', testError);
        return;
      }

      // Essayer d'insérer avec moneroo_payment_id
      const { error: insertError } = await supabaseAdmin
        .from('payments')
        .insert({
          moneroo_payment_id: 'test_check_' + Date.now(),
          wifi_zone_id: '00000000-0000-0000-0000-000000000000', // UUID invalide pour test
          amount: 0,
          phone: 'test',
          status: 'pending'
        })
        .select();

      if (insertError) {
        if (insertError.message.includes('moneroo_payment_id')) {
          logger.error('❌ La colonne moneroo_payment_id n\'existe pas dans la table payments');
          logger.info('💡 Solution: Exécutez la migration 005_ensure_moneroo_payment_id.sql dans Supabase SQL Editor');
          logger.info('   Ou exécutez cette commande SQL dans Supabase:');
          logger.info('');
          logger.info('   ALTER TABLE payments ADD COLUMN IF NOT EXISTS moneroo_payment_id VARCHAR(255);');
          logger.info('   ALTER TABLE payments ALTER COLUMN moneroo_payment_id SET NOT NULL;');
          logger.info('   CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_moneroo ON payments(moneroo_payment_id);');
          logger.info('');
        } else if (insertError.message.includes('monerro_payment_id')) {
          logger.warn('⚠️ La colonne s\'appelle monerro_payment_id (avec 2 r)');
          logger.info('💡 Solution: Renommez-la avec cette commande SQL dans Supabase:');
          logger.info('');
          logger.info('   ALTER TABLE payments RENAME COLUMN monerro_payment_id TO moneroo_payment_id;');
          logger.info('');
        } else {
          logger.error('❌ Erreur inattendue:', insertError.message);
        }
      } else {
        logger.info('✅ La colonne moneroo_payment_id existe et fonctionne correctement');
        // Nettoyer le test
        await supabaseAdmin
          .from('payments')
          .delete()
          .eq('moneroo_payment_id', 'test_check_' + Date.now());
      }
    } else {
      logger.info('✅ Colonnes trouvées:', columns);
    }

  } catch (error) {
    logger.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  fixPaymentsTable()
    .then(() => {
      logger.info('✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = fixPaymentsTable;

