import React from 'react';
import { FileIcon, VideoIcon, ShieldIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


export const Hero = () => {

  const router = useRouter();

  return <section className="w-full bg-gradient-to-br from-blue-50 to-purple-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              P2P File Sharing & Video Calling
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Connect and share directly with anyone, anywhere. No servers, no
              limits, just fast and secure peer-to-peer communication.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={()=>router.push('/share')} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                Get Started - It's Free
              </button>
              <button className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                See How It Works
              </button>
            </div>
            <div className="mt-10 flex items-center space-x-2">
              <ShieldIcon size={20} className="text-green-500" />
              <span className="text-sm text-gray-600">
                End-to-end encrypted. Your data stays private.
              </span>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gray-800 py-3 px-4 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 h-72 flex flex-col items-center justify-center text-white">
                  <div className="flex space-x-6 mb-6">
                    <div className="flex flex-col items-center">
                      <FileIcon size={40} />
                      <span className="mt-2">File Sharing</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <VideoIcon size={40} />
                      <span className="mt-2">Video Calls</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full mt-4">
                    <div className="text-center">
                      <p className="font-medium">PeerLink Connection Active</p>
                      <p className="text-sm opacity-80">End-to-end encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center z-10">
                <span className="text-purple-600 font-bold">New</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
};