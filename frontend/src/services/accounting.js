/**
 * Service pour la comptabilité
 */

import api from '../config/api';

/**
 * Récupère les statistiques de paiements (pour graphique chiffre d'affaires)
 */
export async function getPaymentStats(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(`/accounting/payment-stats${queryParams ? `?${queryParams}` : ''}`);
}

/**
 * Récupère les statistiques de tickets vendus (pour graphique)
 */
export async function getTicketsSoldStats(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(`/accounting/tickets-sold-stats${queryParams ? `?${queryParams}` : ''}`);
}

/**
 * Récupère l'historique des paiements
 */
export async function getPaymentHistory(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(`/accounting/payment-history${queryParams ? `?${queryParams}` : ''}`);
}

/**
 * Exporte l'historique en CSV
 */
export async function exportPaymentHistoryCSV(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const token = localStorage.getItem('auth_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  const response = await fetch(
    `${API_URL}/accounting/export-csv${queryParams ? `?${queryParams}` : ''}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'export');
  }

  // Télécharger le fichier
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recettes_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

