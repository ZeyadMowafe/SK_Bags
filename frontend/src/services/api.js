// تحديد عنوان API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://skbags-production.up.railway.app' 
  : 'http://localhost:8000';

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
  console.log('API Request:', fullUrl);

  try {
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || `HTTP ${response.status}`;
      } catch {
        errorMessage = await response.text() || `HTTP ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
    
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// Products
const getProducts = async () => apiRequest('/products');
const getProduct = async (id) => apiRequest(`/products/${id}`);

// Orders
const createOrder = async (orderData) => {
  console.log('Creating order:', orderData);
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

const getOrders = async () => apiRequest('/orders');

const updateOrderStatus = async (orderId, status) => {
  console.log(`Updating order ${orderId} to ${status}`);
  return apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Auth
const login = async (credentials) => {
  console.log('Login attempt');
  
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);
  
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.access_token) {
    setToken(data.access_token);
  }
  
  return data;
};

const logout = () => removeToken();

// Admin - Products
const createProduct = async (productData) => {
  const preparedData = {
    name: productData.name,
    description: productData.description,
    price: parseFloat(productData.price),
    category: productData.category,
    stock_quantity: parseInt(productData.stock_quantity),
    images: Array.isArray(productData.images) ? productData.images : []
  };

  console.log('Creating product:', preparedData);
  return apiRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(preparedData),
  });
};

const updateProduct = async (id, productData) => {
  const preparedData = {
    name: productData.name,
    description: productData.description,
    price: parseFloat(productData.price),
    category: productData.category,
    stock_quantity: parseInt(productData.stock_quantity),
    images: Array.isArray(productData.images) ? productData.images : []
  };

  return apiRequest(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(preparedData),
  });
};

const deleteProduct = async (id) => {
  try {
    return await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
  } catch (error) {
    if (error.message?.includes('foreign key') || error.message?.includes('constraint')) {
      throw new Error('Cannot delete product with existing orders');
    }
    throw error;
  }
};

// File Upload - محسن
const uploadFile = async (file) => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  console.log(`Uploading: ${file.name} (${file.size} bytes)`);
  
  const formData = new FormData();
  formData.append('file', file);
  
  // جرب endpoints متعددة
  const endpoints = ['/admin/upload', '/upload-simple'];
  let lastError;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${endpoint} failed:`, errorText);
        lastError = new Error(`Upload failed: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      return result;
      
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      lastError = error;
    }
  }
  
  throw lastError || new Error('All upload attempts failed');
};

// Storage status check - جديد
const checkStorageStatus = async () => {
  try {
    return await apiRequest('/admin/storage-status');
  } catch (error) {
    console.error('Storage check failed:', error);
    return null;
  }
};

// Health check
const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', error: error.message };
  }
};

// Export
export const apiService = {
  // Products
  getProducts,
  getProduct,
  
  // Orders
  createOrder,
  getOrders,
  updateOrderStatus,
  
  // Auth
  login,
  logout,
  
  // Admin
  createProduct,
  updateProduct,
  deleteProduct,
  uploadFile,
  checkStorageStatus,
  
  // Utils
  getToken,
  setToken,
  removeToken,
  healthCheck,
  
  // Config
  API_BASE_URL,
};
