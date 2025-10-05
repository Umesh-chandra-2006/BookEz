import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Show a user-friendly alert before redirecting
      alert('Your session has expired or you are not authorized. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/updatedetails', profileData),
  getStats: () => api.get('/auth/stats'),
  logout: () => api.post('/auth/logout'),
}

// Books API
export const booksAPI = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  search: (params = {}) => api.get('/books/search', { params }),
  getGenres: () => api.get('/books/genres'),
  getPopular: (limit = 10) => api.get(`/books/popular?limit=${limit}`),
  getByUser: (userId, params = {}) => api.get(`/books/user/${userId}`, { params }),
}

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getForBook: (bookId, params = {}) => api.get(`/reviews/book/${bookId}`, { params }),
  getByUser: (userId, params = {}) => api.get(`/reviews/user/${userId}`, { params }),
  getMy: (params = {}) => api.get('/reviews/my/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  getAverage: (bookId) => api.get(`/reviews/average/${bookId}`),
  checkUserReview: (bookId) => api.get(`/reviews/check/${bookId}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  getHelpful: (params = {}) => api.get('/reviews/helpful', { params }),
}

export default api
