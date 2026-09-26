import axios from 'axios';
import { tokenStorage } from './tokenStorage';

// Única instancia de axios de toda la app. Todas las llamadas al backend pasan por aquí.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Antes de cada petición: si hay token, lo agrega en la cabecera Authorization.
http.interceptors.request.use((config) => {
  const token = tokenStorage.obtener();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Después de cada respuesta: si el backend responde 401 (token vencido o inválido),
// borramos el token y mandamos al login.
http.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin) {
      tokenStorage.borrar();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
