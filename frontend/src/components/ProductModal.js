import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from 'lucide-react';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  // جمع كل الصور المتاحة (image_url + images array)
  const getAllImages = () => {
    const images = [];
    
    // إضافة image_url إذا كانت موجودة
    if (product.image_url) {
      images.push(product.image_url);
    }
    
    // إضافة باقي الصور من images array
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && img !== product.image_url) { // تجنب التكرار
          images.push(img);
        }
      });
    }
    
    // إذا لم توجد صور، استخدم placeholder
    if (images.length === 0) {
      images.push('https://via.placeholder.com/800x600?text=No+Image');
    }
    
    return images;
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const images = getAllImages();
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1 && !isAnimating && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        nextImage();
      }, 3000);
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, isAnimating, isDragging]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating || isDragging) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          setAutoPlay(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, isDragging]);

  const nextImage = () => {
    if (isAnimating || isDragging) return;
    
    setIsAnimating(true);
    setImageLoaded(false);
    setAnimationDirection('slide-left-3d');
    
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setAnimationDirection('slide-in-right-3d');
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection('');
      }, 400);
    }, 200);
  };

  const prevImage = () => {
    if (isAnimating || isDragging) return;
    
    setIsAnimating(true);
    setImageLoaded(false);
    setAnimationDirection('slide-right-3d');
    
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setAnimationDirection('slide-in-left-3d');
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection('');
      }, 400);
    }, 200);
  };

  const goToImage = (index) => {
    if (isAnimating || index === currentImageIndex || isDragging) return;
    
    setIsAnimating(true);
    setImageLoaded(false);
    const direction = index > currentImageIndex ? 'fade-scale-out' : 'fade-scale-out-reverse';
    setAnimationDirection(direction);
    
    setTimeout(() => {
      setCurrentImageIndex(index);
      setAnimationDirection('fade-scale-in');
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection('');
      }, 400);
    }, 200);
  };

  // Enhanced Touch/Drag functionality for Mobile
  const handleTouchStart = (e) => {
    if (images.length <= 1 || isAnimating) return;
    
    e.preventDefault(); // منع السكرول
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setAutoPlay(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || images.length <= 1) return;
    
    e.preventDefault(); // منع السكرول
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const offsetX = clientX - dragStart.x;
    const offsetY = Math.abs(clientY - dragStart.y);
    
    // التأكد أن الحركة أفقية وليس عمودية
    if (offsetY < 50) {
      setDragOffset(offsetX);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || images.length <= 1) return;
    
    e.preventDefault();
    const threshold = 80; // تقليل المسافة المطلوبة للتنقل
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevImage(); // سحب يمين = صورة سابقة
      } else {
        nextImage(); // سحب شمال = صورة تالية
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleImageError = (e) => {
    e.currentTarget.src = 'https://via.placeholder.com/800x600?text=No+Image';
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in-advanced">
      <div className="bg-white w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-3xl animate-slide-up-advanced rounded-2xl">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Gallery Section */}
          <div className="lg:w-3/5 relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Image Container */}
            <div 
              ref={containerRef}
              className="relative h-64 sm:h-80 md:h-96 lg:h-full cursor-grab active:cursor-grabbing touch-pan-y"
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'pan-y pinch-zoom' }}
            >
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse-advanced">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
                </div>
              )}

              {/* Main Image with Advanced Animation */}
              <div 
                className={`image-container-3d ${animationDirection} ${isDragging ? 'dragging' : ''}`}
                style={{
                  transform: isDragging ? `translateX(${dragOffset}px) scale(0.95)` : '',
                  transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <img 
                  src={images[currentImageIndex]} 
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                
                {/* Image Reflection Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100/30 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Navigation Arrows with Advanced Styling */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={isAnimating}
                    className={`nav-arrow nav-arrow-left ${isAnimating ? 'disabled' : ''}`}
                  >
                    <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    disabled={isAnimating}
                    className={`nav-arrow nav-arrow-right ${isAnimating ? 'disabled' : ''}`}
                  >
                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Controls Panel */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex space-x-2 z-20">
                {images.length > 1 && (
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`control-btn ${autoPlay ? 'active' : ''}`}
                    title={autoPlay ? 'Pause slideshow' : 'Start slideshow'}
                  >
                    <RotateCcw size={16} className="sm:w-5 sm:h-5" />
                  </button>
                )}
                
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="control-btn"
                  title={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  <ZoomIn size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Progress Bar for Auto-play */}
              {autoPlay && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div className="h-full bg-blue-500 animate-progress-bar"></div>
                </div>
              )}
              
              {/* Image Counter with Enhanced Design */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium z-10 border border-white/20">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
            
            {/* Enhanced Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-2 right-2 sm:bottom-20 sm:left-4 sm:right-4 z-10">
                <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 px-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      disabled={isAnimating}
                      className={`thumbnail ${
                        index === currentImageIndex ? 'thumbnail-active' : 'thumbnail-inactive'
                      } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                      <div className="thumbnail-overlay"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Product Details Section - Responsive */}
          <div className="lg:w-2/5 p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-gradient-to-br from-white to-gray-50">
            {/* Header with Animation */}
            <div className="animate-slide-in-right">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="flex-1 mr-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight line-clamp-2">
                    {product.name}
                  </h2>
                  <span className="inline-block text-xs sm:text-sm text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold border border-blue-100">
                    {product.category}
                  </span>
                </div>
                <button 
                  onClick={onClose} 
                  className="close-btn flex-shrink-0"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            
            {/* Description with Animation */}
            <div className="mb-4 sm:mb-6 md:mb-8 animate-slide-in-right animation-delay-1">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-900 flex items-center">
                Product Details
                <div className="ml-2 w-8 sm:w-12 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-4 sm:line-clamp-none max-h-24 sm:max-h-none overflow-y-auto">
                {product.description}
              </p>
            </div>
            
            {/* Enhanced Price and Stock - Responsive */}
            <div className="mb-4 sm:mb-6 md:mb-8 animate-slide-in-right animation-delay-2">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                      EGP {product.price}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Stock Available</div>
                    <span className="text-lg sm:text-xl font-bold text-black">{product.stock_quantity}</span>
                  </div>
                </div>
                
                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <div className="flex items-center text-orange-600 text-xs sm:text-sm font-medium bg-orange-50 px-3 py-2 rounded-lg mt-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                    Limited stock remaining
                  </div>
                )}
                
                {product.stock_quantity === 0 && (
                  <div className="flex items-center text-red-600 text-xs sm:text-sm font-medium bg-red-50 px-3 py-2 rounded-lg mt-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Out of stock
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Action Buttons - Responsive */}
            <div className="space-y-3 sm:space-y-4 animate-slide-in-right animation-delay-3">
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock_quantity === 0}
                className="premium-btn primary text-sm sm:text-base"
              >
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button
                onClick={onClose}
                className="premium-btn secondary text-sm sm:text-base"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Custom Styles */}
      <style jsx>{`
        @keyframes fadeInAdvanced {
          from { 
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to { 
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }
        
        @keyframes slideUpAdvanced {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulseAdvanced {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* 3D Slide Animations */
        @keyframes slideLeft3D {
          from {
            transform: translateX(0) rotateY(0deg);
            opacity: 1;
          }
          to {
            transform: translateX(-100%) rotateY(-15deg);
            opacity: 0;
          }
        }
        
        @keyframes slideRight3D {
          from {
            transform: translateX(0) rotateY(0deg);
            opacity: 1;
          }
          to {
            transform: translateX(100%) rotateY(15deg);
            opacity: 0;
          }
        }
        
        @keyframes slideInLeft3D {
          from {
            transform: translateX(-100%) rotateY(-15deg);
            opacity: 0;
          }
          to {
            transform: translateX(0) rotateY(0deg);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight3D {
          from {
            transform: translateX(100%) rotateY(15deg);
            opacity: 0;
          }
          to {
            transform: translateX(0) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes fadeScaleOut {
          from {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
          to {
            transform: scale(0.8) rotateY(10deg);
            opacity: 0;
          }
        }

        @keyframes fadeScaleIn {
          from {
            transform: scale(1.2) rotateY(-10deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }
        
        .animate-fade-in-advanced {
          animation: fadeInAdvanced 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-slide-up-advanced {
          animation: slideUpAdvanced 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animation-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animation-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-3 { animation-delay: 0.3s; opacity: 0; }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }

        .animate-pulse-advanced {
          animation: pulseAdvanced 2s infinite;
        }

        .animate-progress-bar {
          animation: progressBar 3s linear infinite;
        }
        
        .image-container-3d {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .slide-left-3d { animation: slideLeft3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-right-3d { animation: slideRight3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-left-3d { animation: slideInLeft3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-right-3d { animation: slideInRight3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .fade-scale-out { animation: fadeScaleOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .fade-scale-in { animation: fadeScaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        .dragging {
          transition: none !important;
          filter: brightness(0.9);
          transform-origin: center;
        }

        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced Mobile Touch Support */
        .touch-pan-y {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
        }

        @media (max-width: 768px) {
          .dragging {
            transform: scale(0.98) !important;
          }
          
          .image-container-3d {
            touch-action: manipulation;
          }
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #1f2937;
          padding: 8px;
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          cursor: pointer;
        }

        @media (min-width: 640px) {
          .nav-arrow {
            padding: 12px;
          }
        }

        .nav-arrow:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .nav-arrow-left { left: 12px; }
        .nav-arrow-right { right: 12px; }

        @media (min-width: 640px) {
          .nav-arrow-left { left: 20px; }
          .nav-arrow-right { right: 20px; }
        }

        .nav-arrow.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .control-btn {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        @media (min-width: 640px) {
          .control-btn {
            padding: 10px;
          }
        }

        .control-btn:hover, .control-btn.active {
          background: rgba(59, 130, 246, 0.8);
          transform: scale(1.1);
        }

        .close-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 8px;
          border-radius: 50%;
          border: 1px solid rgba(239, 68, 68, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        @media (min-width: 640px) {
          .close-btn {
            padding: 10px;
          }
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }

        .thumbnail {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          overflow: hidden;
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        @media (min-width: 640px) {
          .thumbnail {
            width: 60px;
            height: 60px;
            border-radius: 10px;
          }
        }

        @media (min-width: 768px) {
          .thumbnail {
            width: 70px;
            height: 70px;
            border-radius: 12px;
          }
        }

        .thumbnail-active {
          border: 3px solid rgba(59, 130, 246, 0.8);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
          transform: scale(1.1);
        }

        @media (min-width: 640px) {
          .thumbnail-active {
            transform: scale(1.15);
          }
        }

        .thumbnail-inactive {
          opacity: 0.7;
          filter: grayscale(0.3);
        }

        .thumbnail-inactive:hover {
          opacity: 1;
          transform: scale(1.05);
          filter: grayscale(0);
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .thumbnail:hover .thumbnail-overlay {
          opacity: 1;
        }

        .premium-btn {
          width: 100%;
          padding: 12px 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border-radius: 10px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border: none;
        }

        @media (min-width: 640px) {
          .premium-btn {
            padding: 16px 24px;
            border-radius: 12px;
          }
        }

        .premium-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .premium-btn:hover::before {
          left: 100%;
        }

        .premium-btn.primary {
          background: #000000;
          color: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .premium-btn.primary:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .premium-btn.primary:disabled {
          background: linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%);
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .premium-btn.secondary {
          background: transparent;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .premium-btn.secondary:hover {
          border-color: #374151;
          background: rgba(55, 65, 81, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(55, 65, 81, 0.1);
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        /* Custom Scrollbar */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        
        @media (min-width: 640px) {
          .overflow-x-auto::-webkit-scrollbar {
            height: 6px;
          }
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        
        @media (min-width: 640px) {
          .overflow-x-auto::-webkit-scrollbar-track {
            border-radius: 3px;
          }
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }
        
        @media (min-width: 640px) {
          .overflow-x-auto::-webkit-scrollbar-thumb {
            border-radius: 3px;
          }
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
