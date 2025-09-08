import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

const CheckoutModal = ({ customerInfo = {}, setCustomerInfo, cart, getTotalPrice, onClose, onSubmit }) => {
  const [showResult, setShowResult] = useState(null); // null, 'success', or 'failure'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setShowResult(null);

    try {
      const result = await onSubmit();

      if (result && (result.id || result.success === true)) {
        setShowResult('success');
      } else {
        throw new Error('Order confirmation failed');
      }
    } catch (error) {
      let errorMsg = 'An error occurred while submitting your order';

      if (error && error.message) {
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          !navigator.onLine
        ) {
          errorMsg = 'No internet connection. Please check your network and try again';
        } else if (error.message.includes('500')) {
          errorMsg = 'Server error. Please try again later';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
      setShowResult('failure');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndTryAgain = () => {
    setShowResult(null);
    setErrorMessage('');
    setIsLoading(false);
  };

  const closeModal = () => {
    setShowResult(null);
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };

  // ✅ Success Screen
  if (showResult === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md rounded-lg shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We will contact you shortly to confirm the details.
          </p>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6 space-y-3">
  {/* Step 1 */}
  <div className="flex items-start gap-2">
    <span className="font-bold text-green-700">1.</span>
    <p className="text-green-700 text-sm">
      Please transfer the deposit <span className="font-bold">50%</span> to 
      <span className="font-bold"> 01016887251</span> via Vodafone Cash to confirm your order
    </p>
  </div>

  {/* Step 2 */}
  <div className="flex items-start gap-2">
    <span className="font-bold text-green-700">2.</span>
    <p className="text-green-700 text-sm">
      Send us a screenshot of the transaction after payment
    </p>
  </div>
</div>

          <button
            onClick={closeModal}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ❌ Failure Screen
  if (showResult === 'failure') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md rounded-lg shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Failed</h3>
          <p className="text-gray-600 mb-6">{errorMessage || 'Unknown error occurred'}</p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <p className="text-red-700 text-sm">
              Please check your information and try again, or contact us directly.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetAndTryAgain}
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ⏳ Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-2xl text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Processing your order...</p>
        </div>
      </div>
    );
  }

  // 📝 Main Checkout Form
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Full Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
                disabled={isLoading}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
                disabled={isLoading}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
                disabled={isLoading}
              />
              <textarea
                placeholder="Delivery Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 h-24 resize-none"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm text-gray-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span>EGP {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 border-gray-200">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>EGP {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 font-medium tracking-wide uppercase transition-all duration-300 rounded ${
                isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Place Order'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
