// API utility for making authenticated requests

const API_URL = import.meta.env.VITE_API_URL;

// Get token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('tracker_token');
}

// Create headers with Authorization if token exists
function createAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Authenticated fetch wrapper
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const { headers = {}, ...restOptions } = options;
  
  const authHeaders = createAuthHeaders(headers as Record<string, string>);
  
  return fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: authHeaders,
  });
}

// Authenticated fetch wrapper for form data (e.g., file uploads)
export async function apiRequestFormData(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers,
    ...options,
  });
}

// Convenience methods for common HTTP verbs
export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  
  post: (endpoint: string, data?: unknown) => 
    apiRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: (endpoint: string, data?: unknown) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (endpoint: string) =>
    apiRequest(endpoint, { method: 'DELETE' }),
    
  uploadFile: (endpoint: string, formData: FormData) =>
    apiRequestFormData(endpoint, formData),
};
