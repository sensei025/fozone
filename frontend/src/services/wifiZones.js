/**
 * Service pour la gestion des zones Wi-Fi
 */

import api from '../config/api';

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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  const response = await fetch(`${API_URL}/wifi-zones/public/${id}`, {
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


