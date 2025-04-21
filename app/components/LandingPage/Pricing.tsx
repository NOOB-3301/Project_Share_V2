import React from 'react';
import { CheckIcon } from 'lucide-react';
export const Pricing = () => {
  return <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include core
            features.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  P2P file transfers up to 2GB
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  1-to-1 video calls (20 min limit)
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">End-to-end encryption</span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Basic support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </div>
          {/* Pro Plan */}
          <div className="bg-white rounded-xl p-8 shadow-xl border-2 border-blue-500 relative transform md:scale-105">
            <div className="absolute top-0 right-0 bg-blue-500 text-white py-1 px-4 rounded-bl-lg rounded-tr-lg text-sm font-medium">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Unlimited file transfers</span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  Unlimited 1-to-1 video calls
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  Group video calls (up to 5 people)
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Screen sharing</span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Priority support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe Now
            </button>
          </div>
          {/* Business Plan */}
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Business</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$24.99</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  Group video calls (up to 25 people)
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Recording capabilities</span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">Admin controls</span>
              </li>
              <li className="flex items-start">
                <CheckIcon size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-gray-600">24/7 dedicated support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>;
};