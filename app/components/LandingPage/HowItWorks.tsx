import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
export const HowItWorks = () => {
  return <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How PeerLink Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, secure, and direct connections between peers - no middleman
            required.
          </p>
        </div>
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-200 transform -translate-y-1/2 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Create Connection
              </h3>
              <p className="text-gray-600 text-center">
                Generate a secure link with one click and share it with your
                peer via any messaging app.
              </p>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRightIcon size={32} className="text-blue-600" />
            </div>
            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Establish P2P Connection
              </h3>
              <p className="text-gray-600 text-center">
                When your peer opens the link, a direct encrypted connection is
                established between your devices.
              </p>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRightIcon size={32} className="text-blue-600" />
            </div>
            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Share Files & Talk
              </h3>
              <p className="text-gray-600 text-center">
                Start sharing files or begin your video call with no size limits
                or time restrictions.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
            Try It Now
          </button>
        </div>
      </div>
    </section>;
};