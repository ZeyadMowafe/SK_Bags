import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

const Header = ({ cartCount, toggleCart, scrollToProducts, scrollToAbout, scrollToContact }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToHome = () => {
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' 
        : 'bg-transparent py-6'
    }`}>
      <nav className="container mx-auto px-4 flex justify-between items-center">
        {/* 🔴 اللوجو أصبح زر للـ Home */}
        <button 
          onClick={scrollToHome}
          className="flex items-center group transition-all duration-300 hover:scale-105 transform cursor-pointer"
          aria-label="Go to Home"
        >
          <img 
            src="/SK_Logo.svg" 
            alt="SK Bags Logo" 
            className="w-20 h-15 transition-all duration-300 group-hover:brightness-110"
          />
        </button>
        
        <div className="hidden md:flex gap-12">
          {/* زر Home */}
          <button 
            onClick={scrollToHome}
            className="text-gray-700 hover:text-black transition-colors duration-300 font-medium tracking-wide uppercase text-sm relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          
          <button 
            onClick={scrollToProducts}
            className="text-gray-700 hover:text-black transition-colors duration-300 font-medium tracking-wide uppercase text-sm relative group"
          >
            Products
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          
          <button 
            onClick={scrollToAbout}
            className="text-gray-700 hover:text-black transition-colors duration-300 font-medium tracking-wide uppercase text-sm relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          
          <button 
            onClick={scrollToContact}
            className="text-gray-700 hover:text-black transition-colors duration-300 font-medium tracking-wide uppercase text-sm relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
        </div>

        <button
          onClick={toggleCart}
          className="relative bg-black text-white px-6 py-3 font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-gray-800 transform hover:-translate-y-0.5 hover:shadow-lg group"
        >
          <span className="flex items-center space-x-2">
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </span>
          <div className="absolute inset-0 bg-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -z-10"></div>
        </button>
      </nav>
    </header>
  );
};

export default Header;