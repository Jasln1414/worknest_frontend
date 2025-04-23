// src/utils/index.js
// This file combines all utility imports in one place

// Re-export icons
export { GrSearch } from 'react-icons/gr';
export { GoLocation } from 'react-icons/go';

// Setup API configuration
export const API_CONFIG = {
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
   baseURL:  'http://127.0.0.1:8000',
  endpoints: {
    autocomplete: '/api/empjob/autocomplete/',
    search: '/api/empjob/search/',
    allJobs: '/api/empjob/getAlljobs/',
  
  }
};

// Helper functions
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const formatImageUrl = (imageUrl, baseURL) => {
  if (!imageUrl) return null;
  
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    return `${baseURL}/${imageUrl}`;
  } else if (imageUrl.startsWith('/')) {
    return `${baseURL}${imageUrl}`;
  }
  
  return imageUrl;
};

// Cache service
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const CacheService = {
  getItem(key) {
    try {
      const cached = JSON.parse(localStorage.getItem(key) || '{}');
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    } catch (e) {
      console.error('Cache retrieval error:', e);
    }
    return null;
  },
  
  setItem(key, data) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (e) {
      console.error('Cache storage error:', e);
    }
  },
  
  clearCache() {
    // Find and clear old cache entries
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('jobSearch_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}');
          if (now - cached.timestamp > CACHE_TTL) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
  }
};

// Auth service
export const AuthService = {
  getToken() {
    return localStorage.getItem('access');
  },
  
  getAuthHeaders() {
    const token = this.getToken();
    return token ? {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    } : {};
  },
  
  isAuthenticated() {
    return !!this.getToken();
  },
  
  logout() {
    localStorage.removeItem('access');
  }
};