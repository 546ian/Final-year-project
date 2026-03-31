import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, email, password, accountType) =>
    api.post('/auth/register', { username, email, password, account_type: accountType }),
  login: (email, password) =>
    api.post('/auth/login', { email, password })
};

export const gamerAPI = {
  getProfile: (userId) => api.get(`/gamers/${userId}`),
  updateProfile: (userId, data) => api.put(`/gamers/${userId}`, data),
  getStats: (userId) => api.get(`/gamers/${userId}/stats`),
  getProgress: (userId) => api.get(`/gamers/${userId}/progress`),
  getTournaments: (userId) => api.get(`/gamers/${userId}/tournaments`)
};

export const businessAPI = {
  getProfile: (userId) => api.get(`/businesses/${userId}`),
  updateProfile: (userId, data) => api.put(`/businesses/${userId}`, data),
  getTeamRoster: (userId) => api.get(`/businesses/${userId}/team-roster`),
  getDevices: (userId) => api.get(`/businesses/${userId}/devices`),
  addDevice: (userId, data) => api.post(`/businesses/${userId}/devices`, data)
};

export const tournamentAPI = {
  getAll: () => api.get('/tournaments'),
  getDetails: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  register: (tournamentId) => api.post(`/tournaments/${tournamentId}/register`),
  getParticipants: (tournamentId) => api.get(`/tournaments/${tournamentId}/participants`),
  start: (tournamentId) => api.post(`/tournaments/${tournamentId}/start`)
};

export const activityAPI = {
  create: (data) => api.post('/activities', data),
  getAll: () => api.get('/activities'),
  update: (id, data) => api.put(`/activities/${id}`, data)
};

export const pvpAPI = {
  create: (data) => api.post('/pvp', data),
  getAll: () => api.get('/pvp'),
  accept: (id) => api.put(`/pvp/${id}/accept`),
  complete: (id, data) => api.put(`/pvp/${id}/complete`, data)
};

export const postAPI = {
  getFeed: () => api.get('/posts/feed'),
  create: (data) => api.post('/posts', data),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  like: (postId) => api.post(`/posts/${postId}/like`),
  unlike: (postId) => api.delete(`/posts/${postId}/like`)
};

export const paymentAPI = {
  initiateMPesa: (data) => api.post('/payments/mpesa/initiate', data),
  checkStatus: (paymentId) => api.get(`/payments/mpesa/${paymentId}`),
  getHistory: () => api.get('/payments')
};

export default api;
