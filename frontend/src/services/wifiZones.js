/**
 * Service pour la gestion des zones Wi-Fi
 */

import api from '../config/api';
import { getApiUrl } from '../config/env';

/**
 * Récupère toutes les zones Wi-Fi
 */
export async function getWifiZones() {
  return api.get('/wifi-zones');
}

/**
 * Récupère une zone Wi-Fi par ID
 */
export async function getWifiZoneById(id) {
  return api.get(`/wifi-zones/${id}`);
}

/**
 * Crée une nouvelle zone Wi-Fi
 */
export async function createWifiZone(zoneData) {
  return api.post('/wifi-zones', zoneData);
}

/**
 * Met à jour une zone Wi-Fi
 */
export async function updateWifiZone(id, zoneData) {
  return api.put(`/wifi-zones/${id}`, zoneData);
}

/**
 * Supprime une zone Wi-Fi
 */
export async function deleteWifiZone(id) {
  return api.delete(`/wifi-zones/${id}`);
}

/**
 * Récupère les informations publiques d'une zone Wi-Fi (route publique, pas d'auth)
 */
export async function getPublicWifiZoneById(id) {
  const response = await fetch(getApiUrl(`wifi-zones/public/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la zone');
  }

  return response.json();
}


