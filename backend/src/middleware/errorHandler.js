/**
 * Middleware de gestion des erreurs
 * Centralise la gestion et le formatage des erreurs
 */

const logger = require('../config/logger');

/**
 * Sanitise les messages d'erreur pour le frontend
 * Masque les détails techniques et retourne des messages user-friendly
 */
function sanitizeErrorMessage(error) {
  // Erreurs PostgreSQL/Supabase
  if (error.code) {
    // Erreur de contrainte unique
    if (error.code === '23505') {
      return 'Cette information existe déjà';
    }
    // Erreur de contrainte NOT NULL
    if (error.code === '23502') {
      return 'Certaines informations obligatoires sont manquantes';
    }
    // Erreur de clé étrangère
    if (error.code === '23503') {
      return 'Cette opération n\'est pas autorisée';
    }
    // Erreur de format de données
    if (error.code === '22P02' || error.code === '42804') {
      return 'Format de données invalide';
    }
    // Erreur Supabase PostgREST
    if (error.code.startsWith('PGRST')) {
      return 'Erreur lors de l\'accès aux données';
    }
  }

  // Erreurs de validation
  if (error.name === 'ValidationError') {
    return 'Les données fournies ne sont pas valides';
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return 'Session expirée. Veuillez vous reconnecter';
  }

  // Erreur réseau ou timeout
  if (error.message && (error.message.includes('ECONNREFUSED') || error.message.includes('timeout'))) {
    return 'Impossible de se connecter au serveur';
  }

  // Message générique pour toutes les autres erreurs
  return 'Une erreur est survenue. Veuillez réessayer plus tard';
}

const errorHandler = (err, req, res, next) => {
  // Logger tous les détails côté backend
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Erreur de validation (express-validator)
  if (err.name === 'ValidationError' || (err.errors && Array.isArray(err.errors))) {
    const validationErrors = err.errors || [];
    const firstError = validationErrors[0];
    const userMessage = firstError?.msg || 'Les données fournies ne sont pas valides';
    
    return res.status(400).json({
      error: userMessage
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Session expirée. Veuillez vous reconnecter'
    });
  }

  // Déterminer le code de statut
  const statusCode = err.statusCode || err.status || 500;

  // Message user-friendly
  const userMessage = sanitizeErrorMessage(err);

  // En production, ne jamais exposer les détails techniques
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    error: userMessage,
    // Ne jamais exposer stack ou détails techniques au frontend
    ...(isProduction ? {} : { 
      // En développement seulement, pour le debug
      _debug: {
        message: err.message,
        code: err.code
      }
    })
  });
};

module.exports = errorHandler;

