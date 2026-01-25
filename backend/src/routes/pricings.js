/**
 * Routes pour la gestion des tarifs
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const pricingController = require('../controllers/pricingController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validator');

const zoneIdValidation = [
  param('zoneId').isUUID()
];

const pricingValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom du forfait est requis')
    .isLength({ min: 1, max: 255 }).withMessage('Le nom du forfait doit contenir entre 1 et 255 caractères'),
  body('amount')
    .custom((value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 100) {
        throw new Error('Le montant minimum est de 100 FCFA');
      }
      return true;
    })
    .toFloat(),
  body('duration_hours')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Optionnel, donc OK si vide
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        throw new Error('La durée doit être un nombre entier positif');
      }
      return true;
    })
    .toInt(),
  body('description').optional({ checkFalsy: true }).trim()
];

const pricingIdValidation = [
  param('id').isUUID()
];

// Route publique pour récupérer les tarifs d'une zone (pour les clients)
router.get('/public/zone/:zoneId', zoneIdValidation, validate, pricingController.getPublicPricingsByZone);

// Routes protégées (nécessitent authentification)
router.use(authenticateToken);

router.get('/zone/:zoneId', zoneIdValidation, validate, pricingController.getPricingsByZone);
router.post('/zone/:zoneId', zoneIdValidation, pricingValidation, validate, pricingController.createPricing);
router.put('/:id', pricingIdValidation, pricingValidation, validate, pricingController.updatePricing);
router.delete('/:id', pricingIdValidation, validate, pricingController.deletePricing);

module.exports = router;

