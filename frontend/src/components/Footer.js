import React from 'react';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-4 text-center">
      <div className="mb-8">
        <div className="text-2xl font-bold tracking-wider mb-4">
          <span className="text-white">HAND</span>
          <span className="text-gray-400">CRAFT</span>
        </div>
        <p className="text-gray-400 max-w-md mx-auto">
          SK — Handcrafted crochet pieces where premium quality meets timeless design
        </p>
      </div>
      
      <div className="flex justify-center space-x-8 mb-8">
        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Shipping Info</a>
      </div>
      
      <div className="border-t border-gray-700 pt-8">
        <p className="text-gray-400 text-sm">© 2025 HandCraft Bags. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;