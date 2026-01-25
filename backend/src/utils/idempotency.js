/**
 * Gestion de l'idempotence pour les webhooks de paiement
 * Évite le traitement multiple d'un même paiement
 */

const { supabaseAdmin } = require('../config/database');
const logger = require('../config/logger');

/**
 * Vérifie et enregistre une clé d'idempotence
 * @param {string} idempotencyKey - Clé unique du paiement
 * @returns {Promise<{isNew: boolean, paymentId: string|null}>}
 */
async function checkIdempotency(idempotencyKey) {
  try {
    // Vérifier si cette clé a déjà été traitée
    const { data: existing, error } = await supabaseAdmin
      .from('payment_idempotency')
      .select('payment_id')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      logger.error('Error checking idempotency:', error);
      throw error;
    }

    if (existing) {
      logger.info(`Idempotency key already processed: ${idempotencyKey}`);
      return {
        isNew: false,
        paymentId: existing.payment_id
      };
    }

    return {
      isNew: true,
      paymentId: null
    };
  } catch (error) {
    logger.error('Idempotency check failed:', error);
    throw error;
  }
}

/**
 * Enregistre une clé d'idempotence après traitement réussi
 * @param {string} idempotencyKey - Clé d'idempotence
 * @param {string} paymentId - ID du paiement traité
 */
async function saveIdempotency(idempotencyKey, paymentId) {
  try {
    const { error } = await supabaseAdmin
      .from('payment_idempotency')
      .insert({
        idempotency_key: idempotencyKey,
        payment_id: paymentId,
        created_at: new Date().toISOString()
      });

    if (error) {
      logger.error('Error saving idempotency:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Failed to save idempotency:', error);
    throw error;
  }
}

module.exports = {
  checkIdempotency,
  saveIdempotency
};

