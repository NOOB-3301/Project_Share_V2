'use client';

import Link from 'next/link';
import { Share2, Video } from 'lucide-react';

const Navbar = () => {
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

      {/* Mobile Nav */}
      <nav className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center justify-around w-[90%] max-w-sm border border-gray-200">
        <Link
          href="/share"
          className="flex flex-col items-center text-gray-800 hover:text-blue-600 transition"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs mt-1">Share</span>
        </Link>
        <Link
          href="/video"
          className="flex flex-col items-center text-gray-800 hover:text-blue-600 transition"
        >
          <Video className="w-6 h-6" />
          <span className="text-xs mt-1">Video</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
