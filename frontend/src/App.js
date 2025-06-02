import axios from 'axios';

// Base API configuration
const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;
      
      // If token expired or invalid, redirect to login
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'INVALID_USER') {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  createAdmin: (adminData) => api.post('/auth/create-admin', adminData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
  checkAuth: () => api.get('/auth/check')
};

// Admin API methods
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Course management
  getCourses: () => api.get('/admin/courses'),
  createCourse: (courseData) => api.post('/admin/courses', courseData),
  updateCourse: (courseId, courseData) => api.put(`/admin/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
  
  // Batch management
  getBatches: (params) => api.get('/admin/batches', { params }),
  createBatch: (batchData) => api.post('/admin/batches', batchData),
  updateBatch: (batchId, batchData) => api.put(`/admin/batches/${batchId}`, batchData),
  deleteBatch: (batchId) => api.delete(`/admin/batches/${batchId}`),
  assignTutor: (batchId, tutorId) => api.put(`/admin/batches/${batchId}/tutor`, { tutorId }),
  
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),
  getReports: (reportType) => api.get(`/admin/reports/${reportType}`)
};

// Tutor API methods
export const tutorAPI = {
  getDashboard: () => api.get('/tutor/dashboard'),
  getSessions: (params) => api.get('/tutor/sessions', { params }),
  getBatches: () => api.get('/tutor/batches'),
  markAttendance: (sessionId, attendanceData) => api.post('/tutor/attendance', {
    sessionId,
    ...attendanceData
  }),
  addSessionNotes: (sessionId, notes) => api.post('/tutor/notes', {
    sessionId,
    notes
  }),
  requestLeave: (leaveData) => api.post('/tutor/leave', leaveData),
  getMaterials: (courseId) => api.get(`/tutor/materials/${courseId}`)
};

// Student API methods
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getSessions: (params) => api.get('/student/sessions', { params }),
  getRecordings: () => api.get('/student/recordings'),
  getProgress: () => api.get('/student/progress'),
  requestLeave: (leaveData) => api.post('/student/leave', leaveData),
  updateProfile: (profileData) => api.put('/student/profile', profileData)
};

// Session API methods
export const sessionAPI = {
  joinAsStudent: (sessionId) => `/session/${sessionId}/student`,
  joinAsTutor: (sessionId) => `/session/${sessionId}/tutor`,
  joinAsAdmin: (sessionId) => `/session/${sessionId}/admin`,
  getSessionDetails: (sessionId) => api.get(`/session/${sessionId}/details`)
};

// Utility methods
export const utilAPI = {
  healthCheck: () => api.get('/health'),
  uploadFile: (file, uploadType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Helper functions for local storage
export const authUtils = {
  getToken: () => localStorage.getItem('token'),
  getUserRole: () => localStorage.getItem('userRole'),
  getUserName: () => localStorage.getItem('userName'),
  isAuthenticated: () => !!localStorage.getItem('token'),
  isAdmin: () => localStorage.getItem('userRole') === 'admin',
  isTutor: () => localStorage.getItem('userRole') === 'tutor',
  isStudent: () => localStorage.getItem('userRole') === 'student',
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  },
  
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.first_name);
  }
};

export default api;
