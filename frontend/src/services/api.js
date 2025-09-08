const API_BASE_URL = 'http://localhost:8000/api';

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
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
  console.log('Stringified body:', JSON.stringify(orderData));
  
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

// الحل الشامل: تجربة مسارات متعددة
const updateOrderStatus = async (orderId, status) => {
  console.log(`Updating order ${orderId} with status: ${status}`);
  
  const payload = { status: status };
  console.log('Payload:', JSON.stringify(payload));
  
  // قائمة المسارات المحتملة حسب الأولوية
  const endpoints = [
    `/admin/orders/${orderId}/status`,  // المسار الصحيح في الـ Backend
    `/orders/${orderId}/status`,       // المسار المستخدم في الـ Frontend سابقاً
    `/admin/orders/${orderId}`,        // بديل محتمل
    `/orders/${orderId}`               // بديل محتمل
  ];
  
  // تجربة كل مسار حتى ينجح واحد
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      console.log(`Success with endpoint: ${endpoint}`, response);
      return response;
    } catch (error) {
      console.log(`Failed with endpoint ${endpoint}:`, error.message);
      
      // إذا كان هذا آخر محاولة، ارمي الخطأ
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw new Error(`All update attempts failed. Last error: ${error.message}`);
      }
    }
  }
};

// الحل الثاني: استخدام PATCH بدلاً من PUT
const updateOrderStatusPatch = async (orderId, status) => {
  return apiRequest(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Auth API
const login = async (credentials) => {
  // Create FormData to match OAuth2PasswordRequestForm expected by FastAPI
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // FastAPI OAuth2 expects 'username'
  formData.append('password', credentials.password);
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
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

// Admin API - Updated for images field only
const createProduct = async (productData) => {
  // Clean data - use only images field
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
  // Clean data - use only images field
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
      
      // إذا كان الخطأ بسبب قيود المفتاح الخارجي
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

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/upload-simple`, {
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
  // Prefer absolute url if provided, else fallback to relative
  if (data && data.url && !data.url.startsWith('http')) {
    data.url = `http://localhost:8000${data.url}`;
  }
  return data;
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
  updateOrderStatusPatch, // بديل للتجربة
  
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
};