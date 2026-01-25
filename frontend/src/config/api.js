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
        if (data.error && (data.error.includes('token') || data.error.includes('Token') || data.error.includes('Access denied'))) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          // Rediriger vers login si on est dans le navigateur
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Créer une erreur avec plus de détails
      let errorMessage = data.error || data.message || 'Une erreur est survenue';
      
      // Si on a des détails de validation, les inclure dans le message
      if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        const validationMessages = data.details.map(d => d.message || d.msg || JSON.stringify(d)).join(', ');
        errorMessage = `${errorMessage}: ${validationMessages}`;
      } else if (data.details && typeof data.details === 'string') {
        errorMessage = `${errorMessage}: ${data.details}`;
      }
      
      const error = new Error(errorMessage);
      error.details = data.details;
      error.response = data;
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


