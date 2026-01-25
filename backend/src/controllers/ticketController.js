/**
 * Contrôleur pour la gestion des tickets
 * Gère l'import CSV, la consultation et les statistiques
 */

const csv = require('csv-parser');
const { Readable } = require('stream');
const { supabaseAdmin } = require('../config/database');
const logger = require('../config/logger');

/**
 * Récupère tous les tickets d'une zone Wi-Fi
 */
async function getTicketsByZone(req, res, next) {
  try {
    const { zoneId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    // Vérifier que la zone appartient à l'utilisateur
    const { data: zone } = await supabaseAdmin
      .from('wifi_zones')
      .select('id')
      .eq('id', zoneId)
      .eq('owner_id', req.user.id)
      .single();

    if (!zone) {
      return res.status(404).json({
        error: 'Wi-Fi zone not found'
      });
    }

    let query = supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('wifi_zone_id', zoneId);

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: tickets, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error('Error fetching tickets:', error);
      throw error;
    }

    res.json({
      tickets: tickets || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Importe des tickets depuis un fichier CSV
 * Format CSV attendu: username,password,profile
 */
async function importTickets(req, res, next) {
  try {
    const { zoneId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        error: 'No CSV file provided'
      });
    }

    // Vérifier que la zone appartient à l'utilisateur
    const { data: zone } = await supabaseAdmin
      .from('wifi_zones')
      .select('id')
      .eq('id', zoneId)
      .eq('owner_id', req.user.id)
      .single();

    if (!zone) {
      return res.status(404).json({
        error: 'Wi-Fi zone not found'
      });
    }

    const tickets = [];
    const errors = [];

    // Parser le CSV
    return new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          if (row.username && row.password) {
            tickets.push({
              wifi_zone_id: zoneId,
              username: row.username.trim(),
              password: row.password.trim(),
              profile: row.profile || row.profile_name || null,
              status: 'free',
              created_at: new Date().toISOString()
            });
          } else {
            errors.push(`Invalid row: ${JSON.stringify(row)}`);
          }
        })
        .on('end', async () => {
          try {
            if (tickets.length === 0) {
              return res.status(400).json({
                error: 'No valid tickets found in CSV',
                details: errors
              });
            }

            // Insérer les tickets en batch
            const { data: insertedTickets, error: insertError } = await supabaseAdmin
              .from('tickets')
              .insert(tickets)
              .select();

            if (insertError) {
              logger.error('Error importing tickets:', insertError);
              return res.status(400).json({
                error: 'Failed to import tickets',
                details: insertError.message
              });
            }

            logger.info(`Imported ${insertedTickets.length} tickets for zone ${zoneId}`);

            res.status(201).json({
              message: 'Tickets imported successfully',
              imported: insertedTickets.length,
              errors: errors.length > 0 ? errors : undefined,
              tickets: insertedTickets
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Récupère les statistiques de tickets pour une zone
 */
async function getTicketStats(req, res, next) {
  try {
    const { zoneId } = req.params;
    const { getTicketStats } = require('../utils/ticketManager');

    // Vérifier que la zone appartient à l'utilisateur
    const { data: zone } = await supabaseAdmin
      .from('wifi_zones')
      .select('id')
      .eq('id', zoneId)
      .eq('owner_id', req.user.id)
      .single();

    if (!zone) {
      return res.status(404).json({
        error: 'Wi-Fi zone not found'
      });
    }

    const stats = await getTicketStats(zoneId);

    res.json({
      stats: stats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTicketsByZone,
  importTickets,
  getTicketStats
};

