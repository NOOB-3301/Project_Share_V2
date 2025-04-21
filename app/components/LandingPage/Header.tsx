import React, { useState } from 'react';
import { MenuIcon, XIcon } from 'lucide-react';
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PeerLink
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
              How it Works
            </a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                Pricing
              </a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                FAQ
              </a>
            </div>
          </div>}
      </div>
    </header>;
};