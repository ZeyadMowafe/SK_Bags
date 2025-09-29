import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from 'lucide-react';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const getAllImages = () => {
    const images = [];
    if (product?.image_url) images.push(product.image_url);
    if (Array.isArray(product?.images)) {
      product.images.forEach(img => {
        if (img && img !== product?.image_url) images.push(img);
      });
    }
    if (images.length === 0) images.push('https://via.placeholder.com/800x600?text=No+Image');
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
  const [isMobile, setIsMobile] = useState(false);
  
  const images = getAllImages();
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 640);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    if (autoPlay && images.length > 1 && !isAnimating && !isDragging) {
      autoPlayRef.current = setInterval(() => nextImage(), 3000);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, isAnimating, isDragging]);

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
    setAnimationDirection(index > currentImageIndex ? 'fade-scale-out' : 'fade-scale-out-reverse');
    setTimeout(() => {
      setCurrentImageIndex(index);
      setAnimationDirection('fade-scale-in');
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection('');
      }, 400);
    }, 200);
  };

  const handleTouchStart = (e) => {
    if (images.length <= 1 || isAnimating) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setAutoPlay(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || images.length <= 1) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - dragStart.x;
    setDragOffset(offsetX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || images.length <= 1) return;
    const threshold = isMobile ? 50 : 80;
    if (Math.abs(dragOffset) > threshold) {
      dragOffset > 0 ? prevImage() : nextImage();
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  const demoProduct = {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation technology and superior sound quality for an immersive audio experience.",
    price: "1,999",
    stock_quantity: 15,
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
    ]
  };

  const currentProduct = product || demoProduct;
  if (!currentProduct) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <div className="image-section">
            <div 
              className="image-wrapper"
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {!imageLoaded && (
                <div className="loading-skeleton">
                  <div className="shimmer-effect"></div>
                </div>
              )}
              <div 
                className={`image-container ${animationDirection} ${isDragging ? 'dragging' : ''}`}
                style={{
                  transform: isDragging ? `translateX(${dragOffset}px) scale(0.95)` : '',
                  transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <img 
                  src={images[currentImageIndex]} 
                  alt={`${currentProduct.name} - Image ${currentImageIndex + 1}`}
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'}
                  onLoad={() => setImageLoaded(true)}
                  className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                  onClick={() => !isMobile && setIsZoomed(!isZoomed)}
                  draggable={false}
                />
                <div className="image-reflection"></div>
              </div>
              
              {images.length > 1 && !isMobile && (
                <>
                  <button onClick={prevImage} disabled={isAnimating} className={`nav-arrow nav-arrow-left ${isAnimating ? 'disabled' : ''}`}>
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} disabled={isAnimating} className={`nav-arrow nav-arrow-right ${isAnimating ? 'disabled' : ''}`}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div className="controls-panel">
                {images.length > 1 && !isMobile && (
                  <button onClick={() => setAutoPlay(!autoPlay)} className={`control-btn ${autoPlay ? 'active' : ''}`}>
                    <RotateCcw size={18} />
                  </button>
                )}
                {!isMobile && (
                  <button onClick={() => setIsZoomed(!isZoomed)} className="control-btn">
                    <ZoomIn size={18} />
                  </button>
                )}
              </div>
              
              {autoPlay && !isMobile && (
                <div className="progress-bar-container">
                  <div className="progress-bar"></div>
                </div>
              )}
              
              {images.length > 1 && (
                <div className="image-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-container">
                <div className="thumbnail-wrapper">
                  {images.map((img, index) => (
                    <button key={index} onClick={() => goToImage(index)} disabled={isAnimating} className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}>
                      <img src={img} alt={`Thumbnail ${index + 1}`} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/80x80?text=' + (index + 1)} draggable={false} />
                      <div className="thumbnail-overlay"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="details-section">
            <div className="details-header">
              <div className="product-info">
                <h2 className="product-title">{currentProduct.name}</h2>
                <span className="product-category">{currentProduct.category}</span>
              </div>
              <button onClick={onClose || (() => {})} className="close-btn">
                <X size={isMobile ? 20 : 24} />
              </button>
            </div>
            
            <div className="product-description">
              <h3 className="section-title">
                Product Details
                <div className="title-underline"></div>
              </h3>
              <p className="description-text">{currentProduct.description}</p>
            </div>
            
            <div className="price-section">
              <div className="price-container">
                <div className="price-info">
                  <span className="price">EGP {currentProduct.price}</span>
                  <div className="stock-info">
                    <div className="stock-label">Stock Available</div>
                    <span className="stock-value">{currentProduct.stock_quantity}</span>
                  </div>
                </div>
                {currentProduct.stock_quantity <= 5 && currentProduct.stock_quantity > 0 && (
                  <div className="stock-alert limited">
                    <div className="alert-dot"></div>
                    Limited stock remaining
                  </div>
                )}
                {currentProduct.stock_quantity === 0 && (
                  <div className="stock-alert out-of-stock">
                    <div className="alert-dot"></div>
                    Out of stock
                  </div>
                )}
              </div>
            </div>
            
            <div className="action-buttons">
              <button onClick={() => onAddToCart?.(currentProduct)} disabled={currentProduct.stock_quantity === 0} className="btn btn-primary">
                {currentProduct.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={onClose || (() => {})} className="btn btn-secondary">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: white;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          max-width: 1400px;
          overflow: hidden;
          border-radius: 0;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s ease-out;
          display: flex;
          flex-direction: column;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .image-section {
          position: relative;
          background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
          overflow: hidden;
          flex-shrink: 0;
        }

        .image-wrapper {
          position: relative;
          height: 40vh;
          min-height: 250px;
          max-height: 400px;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-y;
        }

        .image-wrapper:active { cursor: grabbing; }

        .loading-skeleton {
          position: absolute;
          inset: 0;
          background: #e5e7eb;
          overflow: hidden;
        }

        .shimmer-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          animation: shimmer 2s infinite;
        }

        .image-container {
          position: absolute;
          inset: 0;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          backface-visibility: hidden;
        }

        .main-image.zoomed {
          transform: scale(1.5);
          cursor: zoom-out;
        }

        .image-reflection {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 8rem;
          background: linear-gradient(to top, rgba(243, 244, 246, 0.3), transparent);
          pointer-events: none;
        }

        .dragging { filter: brightness(0.9); }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          color: #1f2937;
          padding: 0.75rem;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          z-index: 20;
          cursor: pointer;
        }

        .nav-arrow:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .nav-arrow-left { left: 1rem; }
        .nav-arrow-right { right: 1rem; }
        .nav-arrow.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

        .controls-panel {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 20;
        }

        .control-btn {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          color: white;
          padding: 0.625rem;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .control-btn:hover, .control-btn.active {
          background: rgba(59, 130, 246, 0.8);
          transform: scale(1.1);
        }

        .progress-bar-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
        }

        .progress-bar {
          height: 100%;
          background: #3b82f6;
          animation: progress 3s linear infinite;
        }

        .image-counter {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .thumbnail-container {
          position: absolute;
          bottom: 3.5rem;
          left: 1rem;
          right: 1rem;
          z-index: 10;
        }

        .thumbnail-wrapper {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding: 0.5rem;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .thumbnail-wrapper::-webkit-scrollbar { display: none; }

        .thumbnail {
          flex-shrink: 0;
          width: 55px;
          height: 55px;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .thumbnail.active {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transform: scale(1.1);
        }

        .thumbnail:not(.active) {
          opacity: 0.7;
          filter: grayscale(0.3);
        }

        .thumbnail:hover:not(.active) {
          opacity: 1;
          transform: scale(1.05);
          filter: grayscale(0);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .thumbnail:hover .thumbnail-overlay { opacity: 1; }

        .details-section {
          flex: 1;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          background: linear-gradient(to bottom right, white, #f9fafb);
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          animation: slideInRight 0.4s ease-out;
          flex-shrink: 0;
        }

        .product-info { flex: 1; }

        .product-title {
          font-size: 1.375rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .product-category {
          display: inline-block;
          font-size: 0.7rem;
          color: #2563eb;
          background: #eff6ff;
          padding: 0.4rem 0.875rem;
          border-radius: 9999px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid #dbeafe;
        }

        .close-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.5rem;
          border-radius: 50%;
          border: 1px solid rgba(239, 68, 68, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }

        .product-description {
          animation: slideInRight 0.4s ease-out 0.1s backwards;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 1rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .title-underline {
          width: 3rem;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, transparent);
        }

        .description-text {
          color: #4b5563;
          line-height: 1.6;
          font-size: 0.875rem;
        }

        .price-section {
          animation: slideInRight 0.4s ease-out 0.2s backwards;
          flex-shrink: 0;
        }

        .price-container {
          background: linear-gradient(to right, #f9fafb, #eff6ff);
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .price-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .price {
          font-size: 1.75rem;
          font-weight: bold;
          color: #000;
        }

        .stock-info { text-align: right; }

        .stock-label {
          font-size: 0.7rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stock-value {
          font-size: 1rem;
          font-weight: bold;
          color: #000;
        }

        .stock-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
        }

        .stock-alert.limited {
          color: #ea580c;
          background: #fff7ed;
        }

        .stock-alert.out-of-stock {
          color: #dc2626;
          background: #fef2f2;
        }

        .alert-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .limited .alert-dot {
          background: #ea580c;
          animation: pulse 2s infinite;
        }

        .out-of-stock .alert-dot { background: #dc2626; }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: slideInRight 0.4s ease-out 0.3s backwards;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          flex-shrink: 0;
        }

        .btn {
          width: 100%;
          padding: 0.875rem 1.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.025em;
          text-transform: uppercase;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before { left: 100%; }

        .btn-primary {
          background: #000;
          color: white;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .btn-primary:disabled {
          background: linear-gradient(135deg, #d1d5db, #e5e7eb);
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-secondary {
          background: transparent;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          border-color: #374151;
          background: rgba(55, 65, 81, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(55, 65, 81, 0.1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .slide-left-3d { animation: slideLeft3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-right-3d { animation: slideRight3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-left-3d { animation: slideInLeft3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-right-3d { animation: slideInRight3D 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .fade-scale-out { animation: fadeScaleOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .fade-scale-in { animation: fadeScaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        @keyframes slideLeft3D {
          to { transform: translateX(-100%) rotateY(-15deg); opacity: 0; }
        }

        @keyframes slideRight3D {
          to { transform: translateX(100%) rotateY(15deg); opacity: 0; }
        }

        @keyframes slideInLeft3D {
          from { transform: translateX(-100%) rotateY(-15deg); opacity: 0; }
          to { transform: translateX(0) rotateY(0deg); opacity: 1; }
        }

        @keyframes slideInRight3D {
          from { transform: translateX(100%) rotateY(15deg); opacity: 0; }
          to { transform: translateX(0) rotateY(0deg); opacity: 1; }
        }

        @keyframes fadeScaleOut {
          to { transform: scale(0.8) rotateY(10deg); opacity: 0; }
        }

        @keyframes fadeScaleIn {
          from { transform: scale(1.2) rotateY(-10deg); opacity: 0; }
          to { transform: scale(1) rotateY(0deg); opacity: 1; }
        }

        @media (min-width: 640px) {
          .modal-container {
            max-width: 90vw;
            border-radius: 1rem;
            height: auto;
            max-height: 95vh;
          }
          .modal-overlay { padding: 1rem; }
          .image-wrapper { height: 55vh; }
          .details-section { padding: 2rem; }
          .product-title { font-size: 1.75rem; }
          .price { font-size: 2.25rem; }
          .thumbnail { width: 70px; height: 70px; }
        }

        @media (min-width: 1024px) {
          .modal-content { flex-direction: row; }
          .image-section { width: 60%; flex-shrink: 0; }
          .image-wrapper { height: 100%; min-height: 500px; max-height: none; }
          .details-section { width: 40%; padding: 2.5rem; }
          .product-title { font-size: 2rem; }
          .price { font-size: 2.5rem; }
          .thumbnail { width: 80px; height: 80px; }
          .thumbnail-container { bottom: 6rem; }
        }

        @media (max-width: 374px) {
          .modal-overlay { padding: 0; }
          .image-wrapper { height: 35vh; min-height: 220px; }
          .details-section { padding: 1rem; gap: 0.875rem; }
          .product-title { font-size: 1.25rem; }
          .price { font-size: 1.5rem; }
          .btn { padding: 0.75rem 1rem; font-size: 0.8rem; }
          .thumbnail { width: 50px; height: 50px; }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        * { -webkit-tap-highlight-color: transparent; }

        .details-section::-webkit-scrollbar { width: 6px; }
        .details-section::-webkit-scrollbar-track { background: #f3f4f6; }
        .details-section::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        .details-section::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  );
};

export default ProductModal;
