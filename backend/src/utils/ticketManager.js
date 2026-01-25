/**
 * Gestionnaire de tickets
 * Gère l'attribution atomique des tickets avec transactions
 */

const { supabaseAdmin } = require('../config/database');
const logger = require('../config/logger');

/**
 * Attribue un ticket de manière atomique pour un paiement
 * Utilise une transaction pour garantir qu'un ticket n'est vendu qu'une fois
 * 
 * @param {string} wifiZoneId - ID de la zone Wi-Fi
 * @param {string} paymentId - ID du paiement confirmé
 * @returns {Promise<{success: boolean, ticket: object|null, error: string|null}>}
 */
async function assignTicketAtomically(wifiZoneId, paymentId) {
  try {
    // Utiliser une transaction PostgreSQL via Supabase
    // RPC (Remote Procedure Call) pour exécuter une fonction SQL atomique
    
    const { data, error } = await supabaseAdmin.rpc('assign_ticket_atomic', {
      p_wifi_zone_id: wifiZoneId,
      p_payment_id: paymentId
    });

    if (error) {
      logger.error('Error in atomic ticket assignment:', error);
      return {
        success: false,
        ticket: null,
        error: error.message
      };
    }

    if (!data || !data.ticket_id) {
      return {
        success: false,
        ticket: null,
        error: 'No available ticket found for this zone'
      };
    }

    // Récupérer les détails du ticket assigné
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', data.ticket_id)
      .single();

    if (ticketError) {
      logger.error('Error fetching assigned ticket:', ticketError);
      return {
        success: false,
        ticket: null,
        error: ticketError.message
      };
    }

    logger.info(`Ticket ${ticket.id} assigned to payment ${paymentId}`);
    
    return {
      success: true,
      ticket: ticket,
      error: null
    };
  } catch (error) {
    logger.error('Unexpected error in ticket assignment:', error);
    return {
      success: false,
      ticket: null,
      error: error.message
    };
  }
}

/**
 * Récupère les statistiques de tickets pour une zone Wi-Fi
 * @param {string} wifiZoneId - ID de la zone Wi-Fi
 * @returns {Promise<object>}
 */
async function getTicketStats(wifiZoneId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .select('status')
      .eq('wifi_zone_id', wifiZoneId);

    if (error) throw error;

    const stats = {
      total: data.length,
      free: data.filter(t => t.status === 'free').length,
      sold: data.filter(t => t.status === 'sold').length,
      reserved: data.filter(t => t.status === 'reserved').length,
      expired: data.filter(t => t.status === 'expired').length
    };

    return stats;
  } catch (error) {
    logger.error('Error getting ticket stats:', error);
    throw error;
  }
}

module.exports = {
  assignTicketAtomically,
  getTicketStats
};

