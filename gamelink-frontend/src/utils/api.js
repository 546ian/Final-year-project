import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests and preserve multipart form data
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) =>
    api.post('/auth/login', { email, password })
};

export const gamerAPI = {
  getProfile: (userId) => api.get(`/gamers/${userId}`),
  updateProfile: (userId, data) => api.put(`/gamers/${userId}`, data),
  deleteProfile: (userId, data) => api.delete(`/gamers/${userId}`, { data }),
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
  uploadMedia: (formData) => api.post('/posts/upload', formData),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  editComment: (postId, commentId, content) => api.put(`/posts/${postId}/comments/${commentId}`, { content }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  like: (postId) => api.post(`/posts/${postId}/like`),
  unlike: (postId) => api.delete(`/posts/${postId}/like`)
};

export const paymentAPI = {
  initiateMPesa: (data) => api.post('/payments/mpesa/initiate', data),
  checkStatus: (paymentId) => api.get(`/payments/mpesa/${paymentId}`),
  getHistory: () => api.get('/payments')
};

export default api;
