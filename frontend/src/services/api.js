// تحديد عنوان API بناءً على البيئة
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://skbags-production.up.railway.app' 
  : 'http://localhost:8000';

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// API request helper محسن
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // إزالة /api من بداية المسار لأن Backend يتعامل معها تلقائياً
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
  console.log('Making API request to:', fullUrl);

  try {
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Product API
const getProducts = async () => {
  return apiRequest('/products');
};

const getProduct = async (id) => {
  return apiRequest(`/products/${id}`);
};

// Order API
const createOrder = async (orderData) => {
  console.log('Sending order data:', orderData);
  
  return apiRequest('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
};

const getOrders = async () => {
  return apiRequest('/orders');
};

const updateOrderStatus = async (orderId, status) => {
  console.log(`Updating order ${orderId} with status: ${status}`);
  
  const payload = { status: status };
  console.log('Payload:', JSON.stringify(payload));
  
  // المسار الصحيح حسب Backend
  return apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// Auth API
const login = async (credentials) => {
  console.log('Attempting login to:', `${API_BASE_URL}/admin/login`);
  
  // Create FormData to match OAuth2PasswordRequestForm expected by FastAPI
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // FastAPI OAuth2 expects 'username'
  formData.append('password', credentials.password);
  
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Login error:', errorText);
    throw new Error(`Login failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.access_token) {
    setToken(data.access_token);
  }
  
  return data;
};

const logout = () => {
  removeToken();
};

// Admin API
const createProduct = async (productData) => {
  const preparedData = {
    name: productData.name,
    description: productData.description,
    price: parseFloat(productData.price),
    category: productData.category,
    stock_quantity: parseInt(productData.stock_quantity),
    images: Array.isArray(productData.images) ? productData.images : []
  };

  console.log('Sending product data:', preparedData);

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
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (errorData.code === '23503' || errorData.message?.includes('foreign key constraint')) {
        throw new Error('Cannot delete product. It is associated with existing orders.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// تحسين دالة رفع الملف
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = getToken();
  
  // جرب مسارين مختلفين للرفع
  const uploadEndpoints = ['/admin/upload', '/upload-simple'];
  
  for (const endpoint of uploadEndpoints) {
    try {
      console.log(`Trying to upload file to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      
      return data;
    } catch (error) {
      console.error(`Upload failed with endpoint ${endpoint}:`, error);
      
      // إذا كان هذا آخر محاولة، ارمي الخطأ
      if (endpoint === uploadEndpoints[uploadEndpoints.length - 1]) {
        throw error;
      }
    }
  }
};

// Health check function
const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', error: error.message };
  }
};

// Export API service
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
  
  // Utils
  getToken,
  setToken,
  removeToken,
  healthCheck,
  
  // Configuration
  API_BASE_URL,
};
