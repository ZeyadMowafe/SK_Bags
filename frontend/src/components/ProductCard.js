import React, { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // دالة للحصول على الصورة الرئيسية
  const getMainImage = () => {
    // أولوية للصورة الرئيسية
    if (product.image_url) {
      return product.image_url;
    }
    
    // إذا لم توجد صورة رئيسية، استخدم أول صورة من المجموعة
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    // fallback image
    return 'https://via.placeholder.com/800x600?text=No+Image';
  };

  // دالة للحصول على عدد الصور الإجمالي
  const getTotalImagesCount = () => {
    let count = 0;
    if (product.image_url) count++;
    if (Array.isArray(product.images)) {
      // تجنب عد نفس الصورة مرتين
      const uniqueImages = product.images.filter(img => img !== product.image_url);
      count += uniqueImages.length;
    }
    return count;
  };

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=No+Image';
    }
  };

  const totalImages = getTotalImagesCount();

  return (
    <div 
      className="bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={getMainImage()}
          alt={product.name}
          onError={handleImageError}
          className={`w-full h-64 object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        
        {/* Dark overlay on hover */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
        
        {/* Price tag */}
<div className="absolute top-4 right-4 bg-black text-white px-5 py-2 text-base tracking-wide font-medium shadow-lg uppercase">
  EGP {product.price}
</div>

        {/* Multiple Images Indicator */}
        {totalImages > 1 && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 text-xs rounded-full flex items-center space-x-1">
            <span></span>
            <span>{totalImages}</span>
          </div>
        )}
        
        {/* Stock Status */}
        {product.stock_quantity <= 5 && (
          <div className={`absolute bottom-4 left-4 px-2 py-1 text-xs font-medium rounded ${
            product.stock_quantity === 0 
              ? 'bg-red-600 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {product.stock_quantity === 0 ? 'Out of Stock' : `Only ${product.stock_quantity} left`}
          </div>
        )}
        
        {/* Quick view button */}
        <button
          onClick={() => onViewDetails(product)}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-6 py-3 font-medium tracking-wide uppercase text-sm transition-all duration-300 rounded shadow-lg ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } hover:bg-gray-100 hover:shadow-xl`}
        >
          Quick View
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-black transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity === 0}
            className={`px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 transform hover:scale-105 hover:shadow-md rounded ${
              product.stock_quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      
      {/* Custom Styles for line-clamp */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;