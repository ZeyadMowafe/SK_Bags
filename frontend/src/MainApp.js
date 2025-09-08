import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import { apiService } from './services/api';
import { Palette, Hand, Award } from 'lucide-react';

const MainApp = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  const productsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await apiService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to dummy data
        setProducts([
          {
            id: 1,
            name: "Premium Leather Handbag",
            description: "Elegant handcrafted leather bag made with premium materials and attention to detail",
            price: 299.99,
            image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
            category: "Handbags",
            stock_quantity: 10
          },
          {
            id: 2,
            name: "Classic Crossbody",
            description: "Practical and comfortable crossbody bag perfect for daily use and adventures",
            price: 199.99,
            image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
            category: "Crossbody",
            stock_quantity: 15
          },
          {
            id: 3,
            name: "Evening Clutch",
            description: "Sophisticated clutch bag designed for special occasions and elegant evenings",
            price: 399.99,
            image_url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop",
            category: "Clutch",
            stock_quantity: 8
          },
          {
            id: 4,
            name: "Travel Tote",
            description: "Spacious and durable tote bag perfect for travel and everyday essentials",
            price: 499.99,
            image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
            category: "Travel",
            stock_quantity: 5
          },
          {
            id: 5,
            name: "Urban Backpack",
            description: "Modern and functional backpack designed for urban lifestyle and comfort",
            price: 249.99,
            image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
            category: "Backpack",
            stock_quantity: 12
          },
          {
            id: 6,
            name: "Mini Shoulder Bag",
            description: "Compact and stylish mini bag perfect for essentials and casual outings",
            price: 179.99,
            image_url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop",
            category: "Mini Bags",
            stock_quantity: 7
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

const handleCheckout = async () => {
  console.log('🚀 handleCheckout called');
  console.log('📊 Current state:', {
    isSubmittingOrder,
    cartLength: cart.length,
    customerInfo,
    onlineStatus: navigator.onLine
  });
  
  if (isSubmittingOrder) {
    console.log('⚠️ Already submitting, aborting');
    throw new Error('Order is already being processed');
  }
  
  try {
    console.log('🔄 Setting isSubmittingOrder to true');
    setIsSubmittingOrder(true);
    
    // ✅ Check internet connection
    if (!navigator.onLine) {
      console.log('📡 No internet connection detected');
      throw new Error('No internet connection');
    }
    
    // ✅ Check cart
    if (!cart || cart.length === 0) {
      console.log('🛒 Cart is empty');
      throw new Error('Cart is empty');
    }
    
    // ✅ Check customer info
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      console.log('📝 Missing customer info:', customerInfo);
      throw new Error('Please fill in all required fields');
    }
    
    const orderData = {
      customer_info: customerInfo,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: getTotalPrice(),
      notes: ''
    };

    console.log('📤 Prepared order data:', orderData);
    console.log('📞 Calling apiService.createOrder...');
    
    // ✅ Send order
    const result = await apiService.createOrder(orderData);
    
    console.log('📥 Server response received:', result);
    console.log('🔍 Analyzing result...');
    
    if (!result) {
      console.log('❌ No result received');
      throw new Error('No response received from server');
    }
    
    if (result.success === false) {
      console.log('❌ Server explicitly marked as failed');
      throw new Error(result.message || 'Order was rejected by server');
    }
    
    if (!result.id && result.success !== true) {
      console.log('⚠️ Ambiguous success status:', {
        hasId: !!result.id,
        successFlag: result.success
      });
      throw new Error('Server did not confirm order success');
    }
    
    console.log('✅ Order confirmed successful!');
    console.log('🧹 Cleaning up data...');
    
    // ✅ Clean data فقط
    setCart([]);
    setCustomerInfo({ name: '', email: '', phone: '', address: '' });

    // ❌ ما نقفلش المودال هنا
    // setShowCheckout(false);
    // setShowCart(false);
    
    console.log('🎉 Data cleaned, returning result');
    return result;
    
  } catch (error) {
    console.log('💥 Error in handleCheckout:', error);
    console.log('🔍 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    let finalErrorMessage;
    if (error.message) {
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('fetch')) {
        finalErrorMessage = 'Failed to connect to server. Check your internet connection';
      } 
      else if (error.message.includes('500')) {
        finalErrorMessage = 'Server error. Please try again later';
      }
      else if (error.message.includes('400') || error.message.includes('422')) {
        finalErrorMessage = 'Invalid order data';
      }
      else if (error.message.includes('401') || error.message.includes('403')) {
        finalErrorMessage = 'Not authorized for this action';
      }
      else {
        finalErrorMessage = error.message;
      }
    } else {
      finalErrorMessage = 'An unexpected error occurred';
    }
    
    console.log('🚨 Final error message:', finalErrorMessage);
    const processedError = new Error(finalErrorMessage);
    console.log('🔄 Throwing processed error');
    throw processedError;
    
  } finally {
    console.log('🏁 Finally block: setting isSubmittingOrder to false');
    setIsSubmittingOrder(false);
  }
};

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <Header
        cartCount={cartCount}
        toggleCart={() => setShowCart(true)}
        scrollToProducts={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })}
        scrollToAbout={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
        scrollToContact={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Hero Section - Optimized for Mobile */}
      <section className="relative  min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-5 sm:top-20 sm:left-20 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 border border-gray-400 rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-20 w-24 h-24 sm:w-48 sm:h-48 md:w-64 md:h-64 border border-gray-400 animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 border border-gray-400 rotate-45 animate-pulse-slow delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            
            {/* Hero Image - Mobile First */}
            <div className="flex justify-center order-1 mb-6 sm:mb-8 lg:order-2 lg:justify-end animate-fade-in-up delay-300">
  <div className="relative mt-6 sm:mt-8 md:mt-10 lg:mt-0">
    <div className="absolute inset-0 bg-black/10 blur-2xl sm:blur-3xl transform translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5"></div>
    
  <img
  src="/home_image2.jpg"
  alt="Luxury handmade bag"
  className="relative 
             
             w-72 h-96             /* موبايل */
             sm:w-96 sm:h-[28rem]  /* تابلت */
             md:w-[26rem] md:h-[32rem] /* لابتوب */
             lg:w-[30rem] lg:h-[40rem] /* شاشات كبيرة */
             object-cover 
             shadow-2xl 
             transform hover:scale-110 
             transition-all duration-700 hover:rotate-1"
/>

    {/* Tag Top Right */}
    <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 md:-top-7 md:-right-7 bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold tracking-wide uppercase shadow-lg animate-bounce-gentle">
      Premium Quality
    </div>

    {/* Tag Bottom Left */}
    <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 md:-bottom-7 md:-left-7 bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold tracking-wide uppercase shadow-lg border-2 border-gray-200 animate-bounce-gentle delay-500">
      Handcrafted
    </div>
  </div>
</div>


            {/* Text Content - Mobile Optimized */}
            <div className="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-4 sm:mb-6 leading-tight">
                <span className="block text-black font-bold">SK</span>
                <span className="block text-gray-600 font-light mt-1">Crochet Long Life</span>
                <span className="block text-black font-bold border-b-4 border-black pb-2 inline-block mt-2">BAGS</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed px-2 sm:px-4 lg:px-0">
                Discover the artistry of SK premium-quality  crochet creations designed to last and made with care
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                <button
                  onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-black text-white px-6 py-3 sm:px-8 sm:py-4 font-medium tracking-wider uppercase transition-all duration-500 hover:bg-gray-800 transform hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden text-sm sm:text-base"
                >
                  <span className="relative z-10">Explore Collection</span>
                  <div className="absolute inset-0 bg-gray-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </button>
                
                <button 
                  onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 sm:px-8 sm:py-4 font-medium tracking-wider uppercase transition-all duration-500 hover:border-black hover:text-black transform hover:-translate-y-1 hover:shadow-xl text-sm sm:text-base"
                >
                  Our Story
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-0.5 h-1.5 sm:w-1 sm:h-2 md:h-3 bg-gray-400 rounded-full mt-1 sm:mt-2 animate-scroll-indicator"></div>
          </div>
        </div>
      </section>

      {/* Products Section - Mobile Optimized */}
      <section ref={productsRef} className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 sm:mb-4">
              <span className="font-bold">Our</span> Collection
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-black mx-auto mb-3 sm:mb-4 md:mb-6"></div>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-2 md:px-0">
              Discover our carefully curated selection of premium handmade bags, 
              each piece telling its own story of craftsmanship and quality
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32 sm:h-48 md:h-64">
              <div className="relative">
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-4 border-transparent border-b-gray-400 rounded-full animate-spin-reverse"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section - Mobile Optimized */}
      <section ref={aboutRef} className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 sm:mb-4">
                <span className="font-bold">About</span> Our Craft
              </h2>
              <div className="w-16 sm:w-20 md:w-24 h-1 bg-black mx-auto mb-3 sm:mb-4 md:mb-6"></div>
              <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-2 md:px-0">
                Handcrafted with passion, SK is dedicated to creating timeless crochet designs, carefully handmade to reflect both artistry and durability
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="text-center p-4 sm:p-6 md:p-8 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Palette size={40} className="mx-auto text-purple-600 sm:w-12 sm:h-12 md:w-12 md:h-12" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-900">Unique Design</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  Every SK piece — a harmony of design and quality
                </p>
              </div>
              
              <div className="text-center p-4 sm:p-6 md:p-8 bg-black text-white hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Hand size={40} className="mx-auto text-orange-400 sm:w-12 sm:h-12 md:w-12 md:h-12" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4">Handcrafted</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                  Exquisitely Handcrafted by SK • Since 2021
                </p>
              </div>
              
              <div className="text-center p-4 sm:p-6 md:p-8 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 group sm:col-span-2 md:col-span-1">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award size={40} className="mx-auto text-blue-600 sm:w-12 sm:h-12 md:w-12 md:h-12" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-900">Premium Quality</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  Quality you can feel, craftsmanship you can trust
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Mobile Optimized */}
      <section ref={contactRef} className="py-12 sm:py-16 md:py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 sm:mb-4">
                <span className="font-bold">Get</span> In Touch
              </h2>
              <div className="w-16 sm:w-20 md:w-24 h-1 bg-black mx-auto mb-3 sm:mb-4 md:mb-6"></div>
              <p className="text-sm sm:text-base md:text-xl text-gray-600 leading-relaxed px-4 sm:px-2 md:px-0">
                Have questions about our products? We'd love to hear from you
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-12">
              <div className="text-center p-4 sm:p-6 bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">📧</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 text-gray-900">Email</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Shahdkarem776@gmail.com</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-black text-white hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">📱</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2">Phone</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">+20 101 688 7251</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
  <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">📍</div>
  <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 text-gray-900">
    Location
  </h3>


  {/* ✅ Badge Online */}
  <span className="mt-2 inline-block bg-green-100 text-green-800 text-xs sm:text-sm font-medium px-3 py-1 rounded-full">
    🟢 Online
  </span>
</div>

            </div>
            
            <div className="bg-white p-4 sm:p-6 md:p-8 shadow-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-900">Send us a Message</h3>
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <textarea 
                  placeholder="Your Message" 
                  rows={4}
                  className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                ></textarea>
                <button 
                  type="button"
                  className="w-full bg-black text-white py-3 sm:py-4 font-medium tracking-wider uppercase transition-all duration-300 hover:bg-gray-800 transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {showCart && (
        <CartModal
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getTotalPrice={getTotalPrice}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          cart={cart}
          getTotalPrice={getTotalPrice}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckout}
          isSubmitting={isSubmittingOrder} 
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
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounceGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        @keyframes pulseFlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        
        @keyframes scrollIndicator {
          0% { transform: translateY(0); }
          50% { transform: translateY(3px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-bounce-gentle {
          animation: bounceGentle 2.5s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulseFlow 3.5s ease-in-out infinite;
        }
        
        .animate-scroll-indicator {
          animation: scrollIndicator 1.8s ease-in-out infinite;
        }
        
        .animate-spin-reverse {
          animation: spinReverse 1s linear infinite;
        }
        
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }

        /* Mobile specific improvements */
        @media (max-width: 640px) {
          .animate-bounce-gentle {
            animation: bounceGentle 2s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulseFlow 3s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default MainApp;