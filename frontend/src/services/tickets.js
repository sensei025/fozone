/**
 * Service pour la gestion des tickets
 */

import api from '../config/api';

/**
 * Récupère les tickets d'une zone Wi-Fi
 */
export async function getTicketsByZone(zoneId, params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(`/tickets/zone/${zoneId}${queryParams ? `?${queryParams}` : ''}`);
}

/**
 * Importe des tickets depuis un fichier CSV
 */
export async function importTickets(zoneId, csvFile) {
  const formData = new FormData();
  formData.append('csv', csvFile);

  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/tickets/zone/${zoneId}/import`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'import');
  }

  return response.json();
}

/**
 * Récupère les statistiques de tickets d'une zone
 */
export async function getTicketStats(zoneId) {
  return api.get(`/tickets/zone/${zoneId}/stats`);
}


