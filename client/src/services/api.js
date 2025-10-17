import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

export const userService = {
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const vacationService = {
  getVacations: () => api.get('/vacations'),
  getVacation: (id) => api.get(`/vacations/${id}`),
  createVacation: (vacationData) => api.post('/vacations', vacationData),
  updateVacation: (id, vacationData) => api.put(`/vacations/${id}`, vacationData),
  deleteVacation: (id) => api.delete(`/vacations/${id}`),
};

export const calendarService = {
  getCalendarUrls: () => api.get('/calendar/urls'),
};

export default api;