import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor for debugging
apiClient.interceptors.request.use((config) => {
  console.log('[CLIENT DEBUG] API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    hasAuth: !!config.headers.Authorization,
  });
  return config;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('[CLIENT DEBUG] API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('[CLIENT DEBUG] API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export function setAuthToken(token?: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log('[CLIENT DEBUG] Auth token set');
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
  console.log('[CLIENT DEBUG] Auth token removed');
}
