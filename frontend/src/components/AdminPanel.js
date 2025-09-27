import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  LogIn, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Upload,
  Package,
  ShoppingCart,
  Users,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    images: []
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // إضافة حالة للـ debug
  const [debugInfo, setDebugInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    }
    
    // فحص الاتصال بالـ API
    checkConnection();
  }, []);

  // دالة فحص الاتصال
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const health = await apiService.healthCheck();
      console.log('Health check result:', health);
      setConnectionStatus('connected');
      setDebugInfo(health);
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('error');
      setDebugInfo({ error: error.message, api_url: apiService.API_BASE_URL });
    }
  };

  const fetchData = async () => {
    try {
      console.log('Fetching data from API...');
      const [productsData, ordersData] = await Promise.all([
        apiService.getProducts(),
        apiService.getOrders()
      ]);
      console.log('Products data:', productsData);
      console.log('Orders data:', ordersData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('فشل في جلب البيانات: ' + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', loginForm);
      await apiService.login(loginForm);
      setIsLoggedIn(true);
      fetchData();
    } catch (error) {
      console.error('Login error:', error);
      alert('فشل تسجيل الدخول: ' + error.message);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setProducts([]);
    setOrders([]);
  };

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    console.log('Selected files:', files);
  };

  const handleMultipleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploadingImages(true);
      console.log('Uploading files:', selectedFiles);
      
      const uploadPromises = selectedFiles.map(async (file) => {
        console.log(`Uploading file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
        return apiService.uploadFile(file);
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      console.log('Upload results:', uploadResults);
      
      const imageUrls = uploadResults.map(result => result.url);
      
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
      
      setSelectedFiles([]);
      
      alert(`تم رفع ${imageUrls.length} صورة بنجاح!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('فشل رفع الصور: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const addImageUrl = () => {
    const url = prompt('أدخل رابط الصورة:');
    if (url && url.trim()) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting product:", productForm);
      await apiService.createProduct(productForm);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        images: []
      });
      fetchData();
      alert('تم إنشاء المنتج بنجاح!');
    } catch (error) {
      console.error('Create product error:', error);
      alert('فشل إنشاء المنتج: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await apiService.deleteProduct(id);
      fetchData();
      alert('تم حذف المنتج بنجاح!');
    } catch (error) {
      console.error('Delete product error:', error);
      alert('فشل حذف المنتج: ' + error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      fetchData();
      alert('تم تحديث حالة الطلب بنجاح!');
    } catch (error) {
      console.error('Update order status error:', error);
      alert('فشل تحديث حالة الطلب: ' + error.message);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const getProductById = (productId) => {
    return products.find(p => p.id === productId);
  };

  const getOrderProductNames = (items) => {
    if (!items || items.length === 0) return 'لا توجد منتجات';
    
    const productNames = items.map(item => {
      let productName = item.name || item.product_name || item.product?.name;
      
      if (!productName && item.product_id) {
        const foundProduct = getProductById(item.product_id);
        productName = foundProduct?.name;
      }
      
      if (!productName && item.id) {
        const foundProduct = getProductById(item.id);
        productName = foundProduct?.name;
      }
      
      return productName || `منتج #${item.product_id || item.id || 'غير محدد'}`;
    });
    
    if (productNames.length > 3) {
      return `${productNames.slice(0, 3).join(', ')} + ${productNames.length - 3} أخرى`;
    }
    
    return productNames.join(', ');
  };

  const getEnhancedProductDetails = (item) => {
    let productDetails = {
      name: item.name || item.product_name || item.product?.name,
      price: item.price || item.product?.price,
      category: item.category || item.product?.category,
      description: item.description || item.product?.description,
      image_url: item.image_url || item.product?.image_url,
      images: item.images || item.product?.images
    };
    
    if (!productDetails.name && item.product_id) {
      const foundProduct = getProductById(item.product_id);
      if (foundProduct) {
        productDetails = {
          name: foundProduct.name,
          price: item.price || foundProduct.price,
          category: foundProduct.category,
          description: foundProduct.description,
          image_url: foundProduct.image_url,
          images: foundProduct.images
        };
      }
    }
    
    if (!productDetails.name && item.id) {
      const foundProduct = getProductById(item.id);
      if (foundProduct) {
        productDetails = {
          name: foundProduct.name,
          price: item.price || foundProduct.price,
          category: foundProduct.category,
          description: foundProduct.description,
          image_url: foundProduct.image_url,
          images: foundProduct.images
        };
      }
    }
    
    return {
      ...productDetails,
      quantity: item.quantity || 1,
      name: productDetails.name || `منتج #${item.product_id || item.id || 'غير محدد'}`,
      price: productDetails.price || 0,
      category: productDetails.category || 'غير محدد'
    };
  };

  // Component للـ Debug Panel
  const DebugPanel = () => (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center mb-2">
        {connectionStatus === 'connected' ? (
          <CheckCircle className="text-green-500 ml-2" size={20} />
        ) : connectionStatus === 'error' ? (
          <AlertCircle className="text-red-500 ml-2" size={20} />
        ) : (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 ml-2"></div>
        )}
        <span className="font-medium">
          حالة الاتصال: {connectionStatus === 'connected' ? 'متصل' : connectionStatus === 'error' ? 'خطأ' : 'جاري الفحص...'}
        </span>
        <button 
          onClick={checkConnection}
          className="mr-4 text-blue-600 hover:text-blue-800 text-sm"
        >
          إعادة فحص
        </button>
      </div>
      
      {debugInfo && (
        <div className="text-xs text-gray-600">
          <div>API URL: {apiService.API_BASE_URL}</div>
          {debugInfo.error && <div className="text-red-600">خطأ: {debugInfo.error}</div>}
          {debugInfo.environment && <div>البيئة: {debugInfo.environment}</div>}
          {debugInfo.supabase_configured && <div>Supabase Storage: {debugInfo.supabase_configured ? 'مفعل' : 'غير مفعل'}</div>}
        </div>
      )}
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <DebugPanel />
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">تسجيل دخول المدير</h1>
            <p className="text-gray-600">أدخل بيانات الدخول للوصول للوحة التحكم</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <LogIn size={16} />
              <span>تسجيل الدخول</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم المدير</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <LogOut size={16} />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <DebugPanel />
        
        {/* Tabs */}
        <div className="flex space-x-4 space-x-reverse mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 space-x-reverse ${
              activeTab === 'products' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package size={16} />
            <span>المنتجات ({products.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 space-x-reverse ${
              activeTab === 'orders' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart size={16} />
            <span>الطلبات ({orders.length})</span>
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">إضافة منتج جديد</h2>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <input
                      type="text"
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتاحة</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    required
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">صور المنتج</label>
                  
                  {/* Current Images Display */}
                  {productForm.images.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">الصور المضافة ({productForm.images.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {productForm.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Error+Loading';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Image Upload Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelection}
                        className="hidden"
                        id="multiple-file-upload"
                      />
                      <label
                        htmlFor="multiple-file-upload"
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer flex items-center space-x-2 space-x-reverse"
                      >
                        <Upload size={16} />
                        <span>اختيار صور</span>
                      </label>
                      
                      {selectedFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMultipleFileUpload}
                          disabled={uploadingImages}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2 space-x-reverse"
                        >
                          <ImageIcon size={16} />
                          <span>
                            {uploadingImages ? 'جاري الرفع...' : `رفع ${selectedFiles.length} صورة`}
                          </span>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                      >
                        <Plus size={16} />
                        <span>إضافة رابط</span>
                      </button>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="text-sm text-gray-600">
                        تم اختيار {selectedFiles.length} ملف: {selectedFiles.map(f => f.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Plus size={16} />
                  <span>إضافة المنتج</span>
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">قائمة المنتجات</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصور</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المخزون</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1 space-x-reverse">
                            {(() => {
                              const images = product.images && Array.isArray(product.images) ? product.images : [];
                              const fallback = 'https://via.placeholder.com/40x40?text=No+Image';
                              
                              if (images.length === 0) {
                                return (
                                  <img
                                    src={fallback}
                                    alt="No image"
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                );
                              } else if (images.length === 1) {
                                return (
                                  <img
                                    src={images[0]}
                                    onError={(e) => { e.currentTarget.src = fallback; }}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                );
                              } else {
                                return (
                                  <div className="relative">
                                    <img
                                      src={images[0]}
                                      onError={(e) => { e.currentTarget.src = fallback; }}
                                      alt={product.name}
                                      className="h-10 w-10 object-cover rounded"
                                    />
                                    {images.length > 1 && (
                                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {images.length}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.price} جنيه
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">قائمة الطلبات</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتجات المطلوبة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العدد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{order.customer_info?.name || 'غير محدد'}</div>
                          <div className="text-gray-400">{order.customer_info?.email || 'غير محدد'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={getOrderProductNames(order.items)}>
                          {getOrderProductNames(order.items)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items?.length || 0} قطعة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.total_amount || 0} جنيه
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1"
                        >
                          <option value="pending">في الانتظار</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">تفاصيل الطلب #{selectedOrder.id}</h2>
              <button
                onClick={closeOrderDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Users size={20} className="ml-2" />
                  معلومات العميل
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">الاسم:</span> {selectedOrder.customer_info?.name || 'غير محدد'}</p>
                  <p><span className="font-medium">البريد الإلكتروني:</span> {selectedOrder.customer_info?.email || 'غير محدد'}</p>
                  <p><span className="font-medium">الهاتف:</span> {selectedOrder.customer_info?.phone || 'غير محدد'}</p>
                  <p><span className="font-medium">العنوان:</span> {selectedOrder.customer_info?.address || 'غير محدد'}</p>
                </div>
              </div>
              
              {/* Order Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <ShoppingCart size={20} className="ml-2" />
                  معلومات الطلب
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">رقم الطلب:</span> #{selectedOrder.id}</p>
                  <p><span className="font-medium">تاريخ الطلب:</span> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}</p>
                  <p><span className="font-medium">الحالة:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status === 'pending' ? 'في الانتظار' :
                       selectedOrder.status === 'confirmed' ? 'مؤكد' :
                       selectedOrder.status === 'shipped' ? 'تم الشحن' :
                       selectedOrder.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                    </span>
                  </p>
                  <p><span className="font-medium">المبلغ الإجمالي:</span> {selectedOrder.total_amount || 0} جنيه</p>
                  <p><span className="font-medium">عدد المنتجات:</span> {selectedOrder.items?.length || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">المنتجات المطلوبة</h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item, index) => {
                  const productDetails = getEnhancedProductDetails(item);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {(() => {
                            let imageSrc = 'https://via.placeholder.com/64x64?text=No+Image';
                            
                            if (productDetails.image_url) {
                              imageSrc = productDetails.image_url;
                            } else if (Array.isArray(productDetails.images) && productDetails.images.length > 0) {
                              imageSrc = productDetails.images[0];
                            }
                            
                            return (
                              <img
                                src={imageSrc}
                                alt={productDetails.name}
                                className="h-16 w-16 object-cover rounded-md border"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=No+Image';
                                }}
                              />
                            );
                          })()}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 mb-1">
                                {productDetails.name}
                              </h4>
                              <span className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-2">
                                {productDetails.category}
                              </span>
                              {productDetails.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {productDetails.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900">
                                {!isNaN(productDetails.quantity * productDetails.price) ? 
                                  `${(productDetails.quantity * productDetails.price).toFixed(2)} جنيه` : 
                                  'سعر غير محدد'
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block">الكمية</span>
                              <span className="font-medium">{productDetails.quantity}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block">السعر الوحدة</span>
                              <span className="font-medium">
                                {productDetails.price ? `${productDetails.price} جنيه` : 'غير محدد'}
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-500 block">المجموع</span>
                              <span className="font-medium">
                                {!isNaN(productDetails.quantity * productDetails.price) ? 
                                  `${(productDetails.quantity * productDetails.price).toFixed(2)} جنيه` : 
                                  'غير محدد'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-4 text-gray-500">لا توجد منتجات في هذا الطلب</div>
                )}
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-700">إجمالي الطلب:</span>
                    <span className="font-bold text-2xl text-blue-600">{selectedOrder.total_amount || 0} جنيه</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                    <span>عدد المنتجات: {selectedOrder.items?.length || 0}</span>
                    <span>إجمالي القطع: {selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Update */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تحديث حالة الطلب
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({...selectedOrder, status: e.target.value});
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="pending">في الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                
                <button
                  onClick={closeOrderDetails}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom styles for better text display */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
