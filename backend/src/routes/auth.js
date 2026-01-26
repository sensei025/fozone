/**
 * Routes d'authentification
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validator');

// Validation pour l'inscription
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').optional().trim().isLength({ min: 2 })
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

router.use(authenticateToken);

router.get('/profile', authController.getProfile);
router.put('/profile', 
  [body('full_name').optional().trim().isLength({ min: 2, max: 255 }),
   body('email').optional().isEmail().normalizeEmail(),
   body('phone').optional().trim().isLength({ min: 8, max: 20 }).withMessage('Le numéro de téléphone doit contenir entre 8 et 20 caractères')],
  validate,
  authController.updateProfile
);
router.put('/profile/password',
  [body('current_password').notEmpty().withMessage('Le mot de passe actuel est requis'),
   body('new_password').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')],
  validate,
  authController.changePassword
);

module.exports = router;

