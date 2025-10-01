import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, Phone, MessageCircle, Instagram, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

const CartModal = ({ cart, updateQuantity, removeFromCart, getTotalPrice, onClose, onCheckout }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleCheckout = () => setShowInstructions(true);
  const handleGotIt = () => onCheckout();
  const depositAmount = (getTotalPrice() * 0.5).toFixed(2);

  return (
    <div className="cart-overlay">
      <div className="cart-container">
        <div className="cart-header">
          <div className="header-content">
            <div className="header-icon-wrapper">
              <ShoppingBag className="header-icon" />
            </div>
            <h2 className="header-title">
              {showInstructions ? 'Order Confirmation' : 'Shopping Cart'}
            </h2>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={isMobile ? 20 : 24} />
          </button>
        </div>
        
        {!showInstructions ? (
          <>
            <div className="cart-items-section">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon-wrapper">
                    <ShoppingBag className="empty-icon" />
                  </div>
                  <p className="empty-title">Your cart is empty</p>
                  <p className="empty-subtitle">Add items to get started</p>
                </div>
              ) : (
                <div className="items-list">
                  {cart.map((item) => {
                    const fallbackImage = 'https://via.placeholder.com/100x100?text=No+Image';
                    const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined;
                    const imageSrc = item.image_url || firstImage || fallbackImage;
                    
                    return (
                      <div key={item.id} className="cart-item">
                        <div className="item-content">
                          <div className="item-image-wrapper">
                            <img 
                              src={imageSrc} 
                              alt={item.name}
                              onError={(e) => e.target.src = fallbackImage}
                              className="item-image"
                            />
                          </div>
                          
                          <div className="item-details">
                            <h3 className="item-name">{item.name}</h3>
                            <div className="item-price-wrapper">
                              <span className="price-label">Unit Price:</span>
                              <span className="price-value">EGP {item.price}</span>
                            </div>
                            
                            <div className="mobile-controls">
                              <div className="quantity-controls">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="quantity-btn">
                                  <Minus size={14} />
                                </button>
                                <span className="quantity-value">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="quantity-btn">
                                  <Plus size={14} />
                                </button>
                              </div>
                              
                              <div className="item-actions">
                                <p className="item-subtotal">EGP {(item.price * item.quantity).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="delete-btn">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="desktop-controls">
                            <div className="quantity-controls">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="quantity-btn">
                                <Minus size={16} />
                              </button>
                              <span className="quantity-value">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="quantity-btn">
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <div className="desktop-actions">
                              <p className="item-subtotal">EGP {(item.price * item.quantity).toFixed(2)}</p>
                              <button onClick={() => removeFromCart(item.id)} className="delete-btn">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="total-breakdown">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span className="free-shipping">Free</span>
                  </div>
                  <div className="divider"></div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <button onClick={handleCheckout} className="checkout-btn">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={20} className="arrow-icon" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="instructions-section">
            <div className="instructions-content">
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon">
                    <CheckCircle className="icon" />
                  </div>
                  <h4 className="card-title">Order Summary</h4>
                </div>
                
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span className="summary-value">EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="summary-row deposit-row">
                    <span>Deposit Required (50%):</span>
                    <span className="deposit-value">EGP {depositAmount}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-header-row">
                  <div className="card-icon-small">
                    <Phone className="icon-small" />
                  </div>
                  <div className="card-content">
                    <h4 className="card-title">Step 1: Payment</h4>
                    <p className="card-description">
                      Transfer <span className="highlight">EGP {depositAmount}</span> via Vodafone Cash to:
                    </p>
                    <div className="phone-number">
                      <span>01016887251</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-header-row">
                  <div className="card-icon-small">
                    <MessageCircle className="icon-small" />
                  </div>
                  <div className="card-content">
                    <h4 className="card-title">Step 2: Confirmation</h4>
                    <p className="card-description">Send payment screenshot via:</p>
                    
                    <div className="contact-methods">
                      <div className="contact-option">
                        <Instagram className="contact-icon" />
                        <span>Instagram</span>
                      </div>
                      <div className="contact-option">
                        <MessageCircle className="contact-icon" />
                        <span>WhatsApp</span>
                      </div>
                    </div>
                    
                    <div className="contact-number">
                      <span>01016887251</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-box">
                <div className="info-icon">📞</div>
                <div>
                  <h5 className="info-title">What's Next?</h5>
                  <p className="info-text">
                    Our team will contact you within 24 hours to confirm your order and arrange delivery details.
                  </p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={() => setShowInstructions(false)} className="back-btn">
                Back to Cart
              </button>
              <button onClick={handleGotIt} className="continue-btn">
                Got it! Continue
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-overlay {
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

        .cart-container {
          background: white;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          max-width: 42rem;
          overflow: hidden;
          border-radius: 0;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s ease-out;
          display: flex;
          flex-direction: column;
        }

        .cart-header {
          background: #000;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon-wrapper {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 0.5rem;
          backdrop-filter: blur(4px);
        }

        .header-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: white;
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: white;
          letter-spacing: 0.025em;
        }

        .close-button {
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .close-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .cart-items-section {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          background: #f9fafb;
          -webkit-overflow-scrolling: touch;
          min-height: 0;
        }

        .empty-cart {
          text-align: center;
          padding: 4rem 1rem;
        }

        .empty-icon-wrapper {
          background: #f3f4f6;
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .empty-icon {
          width: 2.5rem;
          height: 2.5rem;
          color: #9ca3af;
        }

        .empty-title {
          color: #111827;
          font-size: 1.125rem;
          font-weight: 500;
        }

        .empty-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cart-item {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
        }

        .cart-item:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .item-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .item-image-wrapper {
          overflow: hidden;
          border-radius: 0.5rem;
          flex-shrink: 0;
        }

        .item-image {
          width: 70px;
          height: 70px;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .cart-item:hover .item-image {
          transform: scale(1.1);
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.375rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .item-price-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .price-label {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .price-value {
          font-weight: 500;
          color: #000;
          font-size: 0.875rem;
        }

        .mobile-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .desktop-controls {
          display: none;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 0.5rem;
          padding: 0.25rem;
        }

        .quantity-btn {
          width: 1.75rem;
          height: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          transition: all 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #4b5563;
        }

        .quantity-btn:hover {
          background: #e5e7eb;
          color: #000;
        }

        .quantity-value {
          width: 2.5rem;
          text-align: center;
          font-weight: 600;
          color: #000;
          font-size: 0.875rem;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .desktop-actions {
          text-align: right;
        }

        .item-subtotal {
          font-weight: bold;
          color: #000;
          font-size: 1rem;
        }

        .delete-btn {
          color: #6b7280;
          padding: 0.375rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .delete-btn:hover {
          color: #dc2626;
          background: #fef2f2;
        }

        .cart-footer {
          padding: 1.25rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .total-breakdown {
          margin-bottom: 1rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          margin-bottom: 0.625rem;
          font-size: 0.875rem;
        }

        .free-shipping {
          color: #000;
          font-weight: 500;
        }

        .divider {
          height: 1px;
          background: #d1d5db;
          margin: 0.75rem 0;
        }

        .grand-total {
          color: #000;
          font-weight: bold;
          font-size: 1.125rem;
          margin-bottom: 0;
        }

        .grand-total span:last-child {
          font-size: 1.375rem;
        }

        .checkout-btn {
          width: 100%;
          background: #000;
          color: white;
          padding: 0.875rem 1rem;
          font-weight: 600;
          letter-spacing: 0.025em;
          text-transform: uppercase;
          transition: all 0.3s;
          border-radius: 0.75rem;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .checkout-btn:hover {
          background: #1f2937;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .arrow-icon {
          transition: transform 0.3s;
        }

        .checkout-btn:hover .arrow-icon {
          transform: translateX(0.25rem);
        }

        .instructions-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .instructions-content {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          background: #f9fafb;
          -webkit-overflow-scrolling: touch;
          min-height: 0;
        }

        .info-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-bottom: 1rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .card-icon {
          background: #000;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }

        .icon {
          width: 1.125rem;
          height: 1.125rem;
          color: white;
        }

        .card-title {
          font-weight: bold;
          color: #000;
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        .summary-details {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .summary-value {
          font-weight: 600;
          color: #000;
        }

        .deposit-row {
          color: #374151;
          font-weight: 500;
        }

        .deposit-value {
          font-size: 1.125rem;
          font-weight: bold;
          color: #000;
        }

        .card-header-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .card-icon-small {
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.5rem;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .icon-small {
          width: 1.125rem;
          height: 1.125rem;
          color: #000;
        }

        .card-content {
          flex: 1;
        }

        .card-description {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .highlight {
          font-weight: bold;
          color: #000;
        }

        .phone-number {
          background: #000;
          color: white;
          padding: 0.875rem;
          border-radius: 0.5rem;
          text-align: center;
        }

        .phone-number span {
          font-size: 1.25rem;
          font-weight: bold;
          letter-spacing: 0.05em;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .contact-option {
          background: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .contact-option:hover {
          background: #e5e7eb;
        }

        .contact-icon {
          width: 1.125rem;
          height: 1.125rem;
          color: #000;
        }

        .contact-option span {
          font-weight: 500;
          color: #000;
          font-size: 0.875rem;
        }

        .contact-number {
          background: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          border: 1px solid #d1d5db;
        }

        .contact-number span {
          font-size: 1rem;
          font-weight: bold;
          color: #000;
        }

        .info-box {
          background: #f3f4f6;
          padding: 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 1.5rem;
        }

        .info-title {
          font-weight: 600;
          color: #000;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .info-text {
          color: #374151;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          padding: 1.25rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .back-btn,
        .continue-btn {
          flex: 1;
          padding: 0.875rem 1rem;
          font-weight: 600;
          letter-spacing: 0.025em;
          transition: all 0.3s;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .back-btn {
          background: white;
          border: 2px solid #000;
          color: #000;
        }

        .back-btn:hover {
          background: #f9fafb;
        }

        .continue-btn {
          background: #000;
          color: white;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }

        .continue-btn:hover {
          background: #1f2937;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (min-width: 640px) {
          .cart-overlay { padding: 1rem; }
          .cart-container { height: auto; max-height: 90vh; border-radius: 1rem; }
          .cart-header { padding: 1.5rem; }
          .header-title { font-size: 1.5rem; }
          .cart-items-section { padding: 1.5rem; }
          .items-list { gap: 1rem; }
          .cart-item { padding: 1.25rem; }
          .item-image { width: 80px; height: 80px; }
          .item-name { font-size: 1.125rem; }
          .mobile-controls { display: none; }
          .desktop-controls { display: flex; align-items: center; gap: 1rem; }
          .quantity-controls { padding: 0.375rem; }
          .quantity-btn { width: 2rem; height: 2rem; }
          .quantity-value { width: 3rem; font-size: 1rem; }
          .item-subtotal { font-size: 1.125rem; }
          .cart-footer { padding: 1.5rem; }
          .total-row { font-size: 1rem; }
          .checkout-btn { padding: 1rem 1.5rem; font-size: 0.95rem; }
          .instructions-content { padding: 1.5rem; }
          .info-card { padding: 1.5rem; }
          .card-title { font-size: 1.125rem; }
          .action-buttons { padding: 1.5rem; }
          .back-btn, .continue-btn { padding: 1rem 1.25rem; font-size: 0.95rem; }
        }

        @media (max-width: 374px) {
          .cart-header { padding: 1rem; }
          .header-title { font-size: 1.125rem; }
          .cart-items-section { padding: 0.75rem; }
          .cart-item { padding: 0.875rem; }
          .item-image { width: 60px; height: 60px; }
          .item-name { font-size: 0.9rem; }
          .price-label, .price-value { font-size: 0.75rem; }
          .quantity-btn { width: 1.5rem; height: 1.5rem; }
          .quantity-value { width: 2rem; font-size: 0.8rem; }
          .item-subtotal { font-size: 0.9rem; }
          .cart-footer { padding: 1rem; }
          .checkout-btn { padding: 0.75rem 0.875rem; font-size: 0.8rem; }
          .instructions-content { padding: 0.75rem; }
          .info-card { padding: 1rem; }
          .card-title { font-size: 0.9rem; }
          .card-description { font-size: 0.8rem; }
          .phone-number span { font-size: 1.125rem; }
          .contact-option { padding: 0.625rem; }
          .contact-option span { font-size: 0.8rem; }
          .info-box { padding: 1rem; }
          .info-title { font-size: 0.85rem; }
          .info-text { font-size: 0.75rem; }
          .action-buttons { padding: 1rem; gap: 0.5rem; }
          .back-btn, .continue-btn { padding: 0.75rem 0.875rem; font-size: 0.8rem; }
        }

        .cart-items-section::-webkit-scrollbar,
        .instructions-content::-webkit-scrollbar { width: 6px; }
        
        .cart-items-section::-webkit-scrollbar-track,
        .instructions-content::-webkit-scrollbar-track { background: #f3f4f6; }
        
        .cart-items-section::-webkit-scrollbar-thumb,
        .instructions-content::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        
        .cart-items-section::-webkit-scrollbar-thumb:hover,
        .instructions-content::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CartModal;
