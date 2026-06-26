// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or invalid
      const publicAuthPaths = ['/login', '/register', '/forgot-password'];
      const isPublicAuthPage = publicAuthPaths.some((path) => window.location.pathname.startsWith(path));

      if (error.response.status === 401 && !isPublicAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network connection failed. Please check if the backend is running.' });
  }
);

export default api;
export { API_BASE_URL };
