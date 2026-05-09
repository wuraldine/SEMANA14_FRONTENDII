import axios from 'axios';

import { API_URL } from '../config';

// Clave usada en localStorage para guardar la sesión (debe coincidir con AuthContext)
const SESSION_KEY = 'session';

// Instancia de Axios preconfigurada para todas las peticiones al backend
const axiosClient = axios.create({
  baseURL: API_URL,
});

// Interceptor de peticiones: agrega el token de autorización automáticamente
// Lee la sesión desde localStorage para no depender de props ni contexto
axiosClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    // Si localStorage no está disponible, continúa sin token
  }
  return config;
});

export default axiosClient;
