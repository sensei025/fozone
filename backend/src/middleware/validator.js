/**
 * Middleware de validation des données
 * Utilise express-validator pour valider les requêtes
 */

const { validationResult } = require('express-validator');

/**
 * Middleware pour vérifier les résultats de validation
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formater les erreurs pour un meilleur affichage
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      error: 'Validation failed',
      message: formattedErrors[0]?.message || 'Erreur de validation',
      details: formattedErrors
    });
  }
  next();
};

module.exports = validate;

