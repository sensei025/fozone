/**
 * Configuration de l'API backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Récupère le token JWT depuis le localStorage
 */
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Effectue une requête API avec authentification
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Debug: Log les requêtes DELETE
  if (config.method === 'DELETE') {
    console.log(`[API] DELETE request to: ${API_URL}${endpoint}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Gérer les réponses non-JSON (comme 204 No Content)
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      // Si erreur d'authentification, nettoyer le localStorage
      if (response.status === 401 || response.status === 403) {
        if (data.error && (data.error.includes('token') || data.error.includes('Token') || data.error.includes('Session expirée') || data.error.includes('Access denied'))) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          // Rediriger vers login si on est dans le navigateur
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Message d'erreur user-friendly (déjà sanitized par le backend)
      const errorMessage = data.error || 'Une erreur est survenue. Veuillez réessayer';
      
      // Logger les détails techniques uniquement en console (pas affichés à l'utilisateur)
      if (process.env.NODE_ENV === 'development' && data._debug) {
        console.error('[API Debug]', data._debug);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Méthodes HTTP simplifiées
 */
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;


