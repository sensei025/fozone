/**
 * Service d'intégration avec Moneroo (agrégateur Mobile Money)
 * Gère la création de paiements et la validation des webhooks
 * Documentation: https://docs.moneroo.io
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../config/logger');

const MONEROO_BASE_URL = process.env.MONEROO_BASE_URL || 'https://api.moneroo.io';
const MONEROO_API_KEY = process.env.MONEROO_API_KEY;
const MONEROO_WEBHOOK_SECRET = process.env.MONEROO_WEBHOOK_SECRET;

/**
 * Crée une intention de paiement via Moneroo Standard Integration
 * @param {object} paymentData - Données du paiement
 * @param {number} paymentData.amount - Montant (integer)
 * @param {string} paymentData.currency - Devise (XOF par défaut pour Bénin)
 * @param {string} paymentData.description - Description du paiement
 * @param {string} paymentData.return_url - URL de retour après paiement
 * @param {object} paymentData.customer - Informations client
 * @param {string} paymentData.customer.email - Email du client
 * @param {string} paymentData.customer.first_name - Prénom
 * @param {string} paymentData.customer.last_name - Nom
 * @param {string} paymentData.customer.phone - Téléphone (optionnel)
 * @param {object} paymentData.metadata - Métadonnées additionnelles (optionnel)
 * @param {array} paymentData.methods - Méthodes de paiement disponibles (optionnel, ex: ["mtn_bj", "moov_bj"])
 * @returns {Promise<object>}
 */
async function createPayment(paymentData) {
  try {
    const {
      amount,
      currency = 'XOF',
      description,
      return_url,
      customer,
      metadata = {},
      methods = ['mtn_bj', 'moov_bj'] // Par défaut pour le Bénin
    } = paymentData;

    // Préparer le payload selon la documentation Moneroo
    const payload = {
      amount: parseInt(amount), // Doit être un integer
      currency: currency,
      description: description,
      return_url: return_url,
      customer: {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      },
      metadata: metadata
    };

    // Ajouter le téléphone si fourni
    if (customer.phone) {
      payload.customer.phone = customer.phone;
    }

    // Ajouter les méthodes de paiement si spécifiées
    if (methods && methods.length > 0) {
      payload.methods = methods;
    }

    const response = await axios.post(
      `${MONEROO_BASE_URL}/v1/payments/initialize`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${MONEROO_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Vérifier le format de réponse Moneroo : { message, data, errors }
    if (response.status === 201 && response.data && response.data.data) {
      logger.info(`Payment initialized via Moneroo: ${response.data.data.id}`);

      return {
        success: true,
        paymentId: response.data.data.id,
        checkoutUrl: response.data.data.checkout_url,
        message: response.data.message,
        data: response.data.data
      };
    } else {
      logger.error('Unexpected response format from Moneroo:', response.data);
      return {
        success: false,
        error: 'Unexpected response format from Moneroo'
      };
    }
  } catch (error) {
    logger.error('Error creating Moneroo payment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Gérer les erreurs selon le format Moneroo
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.message || 
                        error.message;

    return {
      success: false,
      error: errorMessage,
      errors: error.response?.data?.errors || null
    };
  }
}

/**
 * Vérifie le statut d'un paiement via l'endpoint verify
 * @param {string} paymentId - ID du paiement Moneroo
 * @returns {Promise<object>}
 */
async function verifyPayment(paymentId) {
  try {
    const response = await axios.get(
      `${MONEROO_BASE_URL}/v1/payments/${paymentId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${MONEROO_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Format de réponse : { message, data, errors }
    if (response.status === 200 && response.data && response.data.data) {
      return {
        success: true,
        payment: response.data.data,
        message: response.data.message
      };
    } else {
      return {
        success: false,
        error: 'Unexpected response format'
      };
    }
  } catch (error) {
    logger.error('Error verifying Moneroo payment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.message || 
                        error.message;

    return {
      success: false,
      error: errorMessage,
      errors: error.response?.data?.errors || null
    };
  }
}

/**
 * Vérifie la signature d'un webhook Moneroo
 * La signature est calculée avec HMAC-SHA256 du payload JSON stringifié
 * @param {string} payload - Corps du webhook (string JSON)
 * @param {string} signature - Signature reçue dans le header X-Moneroo-Signature
 * @returns {boolean}
 */
function verifyWebhookSignature(payload, signature) {
  try {
    // La signature est calculée avec HMAC-SHA256 du payload (string)
    // Le payload doit être la chaîne JSON brute, pas un objet
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    const expectedSignature = crypto
      .createHmac('sha256', MONEROO_WEBHOOK_SECRET)
      .update(payloadString)
      .digest('hex');

    // Comparaison sécurisée pour éviter les attaques par timing
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Parse le payload du webhook Moneroo
 * Format: { event: "payment.success", data: { id, status, amount, ... } }
 * @param {object} webhookPayload - Payload du webhook
 * @returns {object}
 */
function parseWebhookPayload(webhookPayload) {
  return {
    event: webhookPayload.event, // payment.success, payment.failed, etc.
    paymentId: webhookPayload.data?.id,
    status: webhookPayload.data?.status,
    amount: webhookPayload.data?.amount,
    currency: webhookPayload.data?.currency,
    data: webhookPayload.data
  };
}

module.exports = {
  createPayment,
  verifyPayment,
  verifyWebhookSignature,
  parseWebhookPayload
};
