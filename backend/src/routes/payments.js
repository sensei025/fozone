/**
 * Routes pour la gestion des paiements
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validator');

// Validation pour la création de paiement (route publique)
const paymentIntentValidation = [
  body('wifi_zone_id').isUUID(),
  body('amount').optional().isFloat({ min: 0 }),
  body('pricing_id').optional().isUUID(),
  body('customer').isObject(),
  body('customer.phone').trim().isLength({ min: 8, max: 20 }),
  body('customer.email').optional().isEmail(),
  body('customer.first_name').optional().trim(),
  body('customer.last_name').optional().trim(),
  body().custom((value) => {
    // Soit amount, soit pricing_id doit être fourni
    if (!value.amount && !value.pricing_id) {
      throw new Error('Either amount or pricing_id must be provided');
    }
    return true;
  })
];

const paymentIdValidation = [
  param('paymentId').isUUID()
];

const zoneIdValidation = [
  param('zoneId').isUUID()
];

// Route publique pour créer un paiement (appelée depuis le portail captif)
router.post('/intent', paymentIntentValidation, validate, paymentController.createPaymentIntent);

// Route publique pour le webhook Moneroo (sécurisée par signature)
router.post('/moneroo/webhook', paymentController.handleMonerooWebhook);

// Route publique pour vérifier le statut d'un paiement (pour le client)
router.get('/:paymentId', paymentIdValidation, validate, paymentController.getPaymentStatus);

// Routes protégées pour l'admin
router.use(authenticateToken);

router.get('/zone/:zoneId', 
  zoneIdValidation,
  [query('status').optional().isIn(['pending', 'completed', 'failed']),
   query('page').optional().isInt({ min: 1 }),
   query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  paymentController.getPaymentsByZone
);

module.exports = router;

