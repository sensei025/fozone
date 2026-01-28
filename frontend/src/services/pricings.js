/**
 * Service pour la gestion des tarifs
 */

import api from '../config/api';
import { getApiUrl } from '../config/env';

/**
 * Récupère les tarifs d'une zone Wi-Fi
 */
export async function getPricingsByZone(zoneId) {
  return api.get(`/pricings/zone/${zoneId}`);
}

/**
 * Crée un nouveau tarif
 */
export async function createPricing(zoneId, pricingData) {
  return api.post(`/pricings/zone/${zoneId}`, pricingData);
}

/**
 * Met à jour un tarif
 */
export async function updatePricing(id, pricingData) {
  return api.put(`/pricings/${id}`, pricingData);
}

/**
 * Supprime un tarif
 */
export async function deletePricing(id) {
  return api.delete(`/pricings/${id}`);
}

/**
 * Récupère les tarifs publics d'une zone Wi-Fi (route publique, pas d'auth)
 */
export async function getPublicPricingsByZone(zoneId) {
  const response = await fetch(getApiUrl(`pricings/public/zone/${zoneId}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des tarifs');
  }

  return response.json();
}


