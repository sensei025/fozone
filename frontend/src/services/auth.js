/**
 * Service d'authentification
 */

import api from '../config/api';

/**
 * Inscription
 */
export async function register(email, password, fullName) {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Connexion
 */
export async function login(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Déconnexion
 */
export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

/**
 * Récupère l'utilisateur connecté
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export function isAuthenticated() {
  return !!localStorage.getItem('auth_token');
}

/**
 * Récupère le profil utilisateur depuis l'API
 */
export async function getProfile() {
  try {
    const response = await api.get('/auth/profile');
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    throw error;
  }
}


