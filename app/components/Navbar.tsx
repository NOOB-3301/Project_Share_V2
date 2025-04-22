'use client';

import Link from 'next/link';
import { Share2, Video, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle menu visibility on mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden sm:flex fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-6 py-2 items-center space-x-6 border border-gray-200">
        <Link
          href="/share"
          className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">File Share</span>
        </Link>
        <Link
          href="/video"
          className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition"
        >
          <Video className="w-5 h-5" />
          <span className="font-medium">Video Chat</span>
        </Link>
      </nav>

      {/* Mobile Nav: Floating Button */}
      <nav className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        {/* Button to open menu */}
        <button
          onClick={toggleMenu}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>

        {/* Dropdown Menu for mobile */}
        {isMenuOpen && (
          <div className="mt-4 bg-white/90 backdrop-blur-md shadow-lg rounded-lg w-[80%] max-w-[250px] mx-auto flex flex-col items-center space-y-4 border border-gray-200">
            <Link
              href="/share"
              className="flex flex-col items-center text-gray-800 hover:text-blue-600 transition py-3"
              onClick={() => setIsMenuOpen(false)} // Close menu after selecting
            >
              <Share2 className="w-6 h-6" />
              <span className="text-xs mt-1">Share</span>
            </Link>
            <Link
              href="/video"
              className="flex flex-col items-center text-gray-800 hover:text-blue-600 transition py-3"
              onClick={() => setIsMenuOpen(false)} // Close menu after selecting
            >
              <Video className="w-6 h-6" />
              <span className="text-xs mt-1">Video</span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
