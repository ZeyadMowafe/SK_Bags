import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, Phone, MessageCircle, Instagram, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

const CartModal = ({ cart, updateQuantity, removeFromCart, getTotalPrice, onClose, onCheckout }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleCheckout = () => {
    setShowInstructions(true);
  };

  const handleGotIt = () => {
    onCheckout();
  };

  const depositAmount = (getTotalPrice() * 0.5).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-black p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {showInstructions ? 'Order Confirmation' : 'Shopping Cart'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {!showInstructions ? (
          <>
            {/* Cart Items */}
            <div className="p-6 overflow-y-auto max-h-[400px] bg-gray-50">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-900 text-lg font-medium">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => {
                    const fallbackImage = 'https://via.placeholder.com/100x100?text=No+Image';
                    const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined;
                    const imageSrc = item.image_url || firstImage || fallbackImage;
                    
                    return (
                      <div 
                        key={item.id} 
                        className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Product Image */}
                          <div className="relative overflow-hidden rounded-lg">
                            <img 
                              src={imageSrc} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = fallbackImage;
                              }}
                              className="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500 text-sm">Unit Price:</span>
                              <span className="font-medium text-black">EGP {item.price}</span>
                            </div>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 hover:bg-gray-200 rounded transition-all duration-200 flex items-center justify-center group"
                            >
                              <Minus size={16} className="text-gray-600 group-hover:text-black" />
                            </button>
                            <span className="w-12 text-center font-semibold text-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 hover:bg-gray-200 rounded transition-all duration-200 flex items-center justify-center group"
                            >
                              <Plus size={16} className="text-gray-600 group-hover:text-black" />
                            </button>
                          </div>
                          
                          {/* Subtotal & Delete */}
                          <div className="text-right">
                            <p className="font-bold text-black text-lg">
                              EGP {(item.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all duration-200 mt-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer with Total */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-black font-medium">Free</span>
                  </div>
                  <div className="h-px bg-gray-300"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-black">Total</span>
                    <span className="text-2xl font-bold text-black">EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 font-medium tracking-wide uppercase transition-all duration-300 hover:bg-gray-800 transform hover:scale-[1.02] rounded-xl shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Instructions Section */
          <div className="p-6 overflow-y-auto max-h-[500px] bg-gray-50">
            <div className="space-y-4">
              {/* Order Summary Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-black p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-black text-lg">Order Summary</h4>
                </div>
                
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Amount:</span>
                    <span className="font-semibold text-black">EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-300"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Deposit Required (50%):</span>
                    <span className="text-xl font-bold text-black">EGP {depositAmount}</span>
                  </div>
                </div>
              </div>

              {/* Step 1 Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg mt-1">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-black text-lg mb-3">Step 1: Payment</h4>
                    <p className="text-gray-600 mb-4">
                      Transfer <span className="font-bold text-black">EGP {depositAmount}</span> via Vodafone Cash to:
                    </p>
                    <div className="bg-black text-white p-4 rounded-lg text-center">
                      <span className="text-2xl font-bold tracking-wider">01016887251</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg mt-1">
                    <MessageCircle className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-black text-lg mb-3">Step 2: Confirmation</h4>
                    <p className="text-gray-600 mb-4">Send payment screenshot via:</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer">
                        <div className="flex items-center justify-center gap-2">
                          <Instagram className="w-5 h-5 text-black" />
                          <span className="font-medium text-black">Instagram</span>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer">
                        <div className="flex items-center justify-center gap-2">
                          <MessageCircle className="w-5 h-5 text-black" />
                          <span className="font-medium text-black">WhatsApp</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-3 rounded-lg text-center border border-gray-300">
                      <span className="text-lg font-bold text-black">01016887251</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gray-100 p-5 rounded-xl border border-gray-300">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h5 className="font-semibold text-black mb-2">What's Next?</h5>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Our team will contact you within 24 hours to confirm your order and arrange delivery details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInstructions(false)}
                className="flex-1 bg-white border-2 border-black text-black py-3 px-4 font-semibold tracking-wide transition-all duration-300 hover:bg-gray-100 rounded-xl"
              >
                Back to Cart
              </button>
              <button
                onClick={handleGotIt}
                className="flex-1 bg-black text-white py-3 px-4 font-semibold tracking-wide transition-all duration-300 hover:bg-gray-800 rounded-xl shadow-lg"
              >
                Got it! Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;