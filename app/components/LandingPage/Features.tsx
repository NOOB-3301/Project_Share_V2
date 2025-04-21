import React from 'react';
import { FileIcon, VideoIcon, LockIcon, ZapIcon, GlobeIcon, UsersIcon } from 'lucide-react';
export const Features = () => {
  return <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PeerLink combines seamless file sharing and crystal-clear video
            calls in one secure platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5">
              <FileIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Instant File Sharing
            </h3>
            <p className="text-gray-600">
              Share files of any size with no upload limits. Transfer directly
              between peers without any server in between.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-5">
              <VideoIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              HD Video Calls
            </h3>
            <p className="text-gray-600">
              Enjoy high-definition video calls with superior quality. Connect
              directly with your peers for minimal latency.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-5">
              <LockIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              End-to-End Encryption
            </h3>
            <p className="text-gray-600">
              Your communications are secured with military-grade encryption.
              Not even we can access your data.
            </p>
          </div>
          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-5">
              <ZapIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Direct peer-to-peer connections mean faster transfers and lower
              latency video calls than traditional services.
            </p>
          </div>
          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-5">
              <GlobeIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Works Everywhere
            </h3>
            <p className="text-gray-600">
              Use PeerLink on any device with a web browser. No downloads or
              installations required.
            </p>
          </div>
          {/* Feature 6 */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-5">
              <UsersIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Group Collaboration
            </h3>
            <p className="text-gray-600">
              Host group video calls and share files with multiple participants
              simultaneously with ease.
            </p>
          </div>
        </div>
      </div>
    </section>;
};