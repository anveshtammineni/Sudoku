import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export function setAuthToken(token?: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}
