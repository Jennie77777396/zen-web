// API configuration - supports both development and production
const getApiUrl = () => {
  // In production, use environment variable or relative URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '/api';
  }
  // In development, use localhost
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

// Helper function to make API calls
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
