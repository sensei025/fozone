/**
 * Service pour le dashboard
 */

import api from '../config/api';

/**
 * Récupère les statistiques globales
 */
export async function getGlobalStats() {
  return api.get('/dashboard/stats');
}

/**
 * Récupère les statistiques d'une zone Wi-Fi
 */
export async function getZoneStats(zoneId) {
  return api.get(`/dashboard/zone/${zoneId}`);
}

/**
 * Récupère les statistiques par période
 */
export async function getStatsByPeriod(zoneId, period = '7d') {
  return api.get(`/dashboard/zone/${zoneId}/period?period=${period}`);
}


