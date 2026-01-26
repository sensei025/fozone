/**
 * Service pour la gestion du profil utilisateur
 */

import api from '../config/api';

/**
 * Récupère le profil de l'utilisateur
 */
export async function getProfile() {
  return api.get('/auth/profile');
}

/**
 * Met à jour le profil de l'utilisateur
 */
export async function updateProfile(profileData) {
  return api.put('/auth/profile', profileData);
}

/**
 * Change le mot de passe
 */
export async function changePassword(currentPassword, newPassword) {
  return api.put('/auth/profile/password', {
    current_password: currentPassword,
    new_password: newPassword
  });
}

