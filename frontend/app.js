import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import { apiService } from './src/services/api';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    // جلب المنتجات من الباك إند
    const fetchProducts = async () => {
      try {
        const productsData = await apiService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        // استخدام بيانات تجريبية في حالة فشل الاتصال
        setProducts([
          {
            id: '1',
            name: 'شنطة جلد طبيعي كلاسيك',
            description: 'شنطة يد من الجلد الطبيعي عالي الجودة، مصنوعة بحرفية عالية مع تفاصيل أنيقة. مثالية للمناسبات الرسمية والكاجوال.',
            price: 850.00,
            image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
            category: 'classic',
            in_stock: true,
            stock_quantity: 10
          },
          {
            id: '2',
            name: 'شنطة بوهيمية ملونة',
            description: 'شنطة يد بتصميم بوهيمي فريد مع ألوان زاهية وتطريز جميل، مثالية للمناسبات والخروجات.',
            price: 650.00,
            image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop',
            category: 'bohemian',
            in_stock: true,
            stock_quantity: 15
          },
          {
            id: '3',
            name: 'شنطة كروس صغيرة',
            description: 'شنطة كروس عملية وأنيقة، مناسبة للاستخدام اليومي مع تصميم عصري ومساحة مناسبة.',
            price: 450.00,
            image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
            category: 'crossbody',
            in_stock: true,
            stock_quantity: 20
          },
          {
            id: '4',
            name: 'شنطة كلتش فاخرة',
            description: 'شنطة كلتش أنيقة مصنوعة يدوياً بتفاصيل ذهبية، مثالية للمناسبات الخاصة.',
            price: 750.00,
            image_url: 'https://images.unsplash.com/photo-1566150902409-dd739999b331?w=400&h=400&fit=crop',
            category: 'clutch',
            in_stock: true,
            stock_quantity: 8
          },
          {
            id: '5',
            name: 'شنطة ظهر عملية',
            description: 'شنطة ظهر مريحة وعملية مع جيوب متعددة، مصنوعة من مواد عالية الجودة.',
            price: 550.00,
            image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
            category: 'backpack',
            in_stock: true,
            stock_quantity: 12
          },
          {
            id: '6',
            name: 'شنطة توتي كبيرة',
            description: 'شنطة توتي واسعة مثالية للتسوق والسفر، مصنوعة من القماش المتين والجلد الطبيعي.',
            price: 380.00,
            image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
            category: 'tote',
            in_stock: true,
            stock_quantity: 25
          }
        ]);
      }
    };
    
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
    setShowCart(false);
  };

  const handleOrderSubmit = async () => {
    // التحقق من وجود البيانات المطلوبة
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (cart.length === 0) return;
    
    try {
      // تحضير بيانات الطلب
      const orderData = {
        customer: customerInfo,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: getTotalPrice(),
        notes: ''
      };
      
      // إرسال الطلب إلى الباك إند
      const result = await apiService.createOrder(orderData);
      
      alert(`تم استلام طلبك بنجاح!\nرقم الطلب: ${result.id}\nإجمالي المبلغ: ${getTotalPrice().toFixed(2)} جنيه\nسيتم التواصل معك قريباً`);
      setCart([]);
      setShowCheckout(false);
      setCustomerInfo({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header 
        cartCount={cartCount} 
        toggleCart={() => setShowCart(true)} 
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)} 
      />
      
      {/* Admin Panel Link */}
      <div className="fixed top-4 left-4 z-50">
        <a
          href="/admin"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          لوحة التحكم
        </a>
      </div>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            شنط يدوية فريدة من نوعها
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            اكتشف مجموعتنا المميزة من الشنط المصنوعة يدوياً بعناية فائقة وحرفية عالية
          </p>
          <button className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl">
            تسوق الآن
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">منتجاتنا المميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showCart && (
        <CartModal 
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getTotalPrice={getTotalPrice}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
        />
      )}

      {showCheckout && (
        <CheckoutModal 
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          cart={cart}
          getTotalPrice={getTotalPrice}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleOrderSubmit}
        />
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product) => {
            addToCart(product);
            setSelectedProduct(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default App;