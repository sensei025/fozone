/**
 * Contrôleur d'authentification
 * Gère l'inscription, la connexion et la gestion des sessions
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/database');
const logger = require('../config/logger');

/**
 * Inscription d'un nouvel utilisateur
 */
async function register(req, res, next) {
  try {
    const { email, password, full_name } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      logger.error('Error creating auth user:', authError);
      return res.status(400).json({
        error: 'Failed to create user account'
      });
    }

    // Créer l'utilisateur dans la table users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        password_hash: hashedPassword,
        full_name: full_name || null,
        role: 'admin', // Par défaut admin pour le MVP
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      logger.error('Error creating user record:', userError);
      return res.status(400).json({
        error: 'Failed to create user record'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token: token
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Connexion d'un utilisateur
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, role, is_active, full_name')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account is deactivated'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token: token
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Récupère les informations de l'utilisateur connecté
 */
async function getProfile(req, res, next) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile
};

