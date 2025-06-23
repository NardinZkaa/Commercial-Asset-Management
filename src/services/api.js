import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (username, password) => {
  const response = await api.post('auth/login/', { username, password });
  localStorage.setItem('accessToken', response.data.access);
  localStorage.setItem('refreshToken', response.data.refresh);
  return response.data.user;
};

export const logout = async () => {
  await api.post('auth/logout/');
};

export const register = async (data) => {
  return api.post('auth/register/', data);
};

// Asset APIs
export const getAssets = async (params = {}) => {
  return api.get('assets/', { params });
};

export const createAsset = async (data) => {
  return api.post('assets/', data);
};

export const updateAsset = async (id, data) => {
  return api.put(`assets/${id}/`, data);
};

export const deleteAsset = async (id) => {
  return api.delete(`assets/${id}/`);
};

export const getAssetQR = async (id) => {
  return api.get(`assets/${id}/qr/`, { responseType: 'blob' });
};

export const exportAssets = async (params = {}) => {
  return api.get('assets/export/', { responseType: 'blob', params });
};

// Branch APIs
export const getBranches = async () => {
  return api.get('branches/');
};

// Category APIs
export const getCategories = async () => {
  return api.get('categories/');
};

// Audit APIs
export const startAudit = async () => {
  return api.post('audit/start/');
};

export const scanQRCode = async (qrCode) => {
  return api.post('audit/scan/', { qr_code: qrCode });
};

export const endAudit = async () => {
  return api.post('audit/end/', { responseType: 'blob' });
};

export const getAuditTasks = async () => {
  return api.get('audit/tasks/');
};

// Compliance APIs
export const getCompliances = async (params = {}) => {
  return api.get('compliance/', { params });
};

export const createCompliance = async (data) => {
  return api.post('compliance/', data);
};

export const updateCompliance = async (id, data) => {
  return api.put(`compliance/${id}/`, data);
};

export const getComplianceTimeline = async () => {
  return api.get('compliance/timeline/');
};

export const getComplianceReport = async (id) => {
  return api.get(`compliance/${id}/report/`, { responseType: 'blob' });
};

// Assignment APIs
export const assignAssets = async (data) => {
  return api.post('assignments/', data);
};

export const deleteAssignment = async (id) => {
  return api.delete(`assignments/${id}/`);
};

export const getEmployeesWithAssets = async () => {
  return api.get('assignments/employees/');
};

export const getAssignmentAgreement = async (id) => {
  return api.get(`assignments/${id}/agreement/`, { responseType: 'blob' });
};

// Attachment APIs
export const uploadAttachment = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  return api.post('attachments/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAttachments = async (assignmentId) => {
  return api.get(`attachments/${assignmentId}/`);
};

export const deleteAttachment = async (id) => {
  return api.delete(`attachments/${id}/delete/`);
};

// Analytics APIs
export const getLifecycleData = async (category) => {
  return api.get('analytics/lifecycle/', { params: { category } });
};

export const getAssetStatus = async (category) => {
  return api.get('analytics/asset-status/', { params: { category } });
};

export const getOwnershipChanges = async (category) => {
  return api.get('analytics/ownership-changes/', { params: { category } });
};

export const getOwnershipPeriod = async (category) => {
  return api.get('analytics/ownership-period/', { params: { category } });
};

export const getAssetValueTrend = async () => {
  return api.get('analytics/asset-value-trend/');
};

export const getCategoryDistribution = async () => {
  return api.get('analytics/category-distribution/');
};

export const getUtilizationRate = async () => {
  return api.get('analytics/utilization-rate/');
};

export const getDepreciation = async () => {
  return api.get('analytics/depreciation/');
};

export const getMetrics = async () => {
  return api.get('analytics/metrics/');
};

// Profile/Settings APIs
export const getProfile = async () => {
  return api.get('profile/');
};

export const updateProfile = async (data) => {
  return api.put('profile/', data);
};

export const getSettings = async () => {
  return api.get('settings/');
};

export default api;