import React from 'react';
import { StarIcon } from 'lucide-react';
export const Testimonials = () => {
  return <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust PeerLink for their
            secure file sharing and video calling needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} className="text-yellow-500 fill-current" />)}
            </div>
            <p className="text-gray-600 mb-6">
              "PeerLink has transformed how our remote team collaborates. The
              file sharing is lightning fast, and the video quality is better
              than any other service we've tried."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Jane Doe</h4>
                <p className="text-gray-500">Product Manager, TechCorp</p>
              </div>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} className="text-yellow-500 fill-current" />)}
            </div>
            <p className="text-gray-600 mb-6">
              "As a security consultant, I appreciate that PeerLink's P2P
              approach means my sensitive files never touch a third-party
              server. The encryption is top-notch."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                MS
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Michael Smith
                </h4>
                <p className="text-gray-500">Security Consultant</p>
              </div>
            </div>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} className="text-yellow-500 fill-current" />)}
            </div>
            <p className="text-gray-600 mb-6">
              "I needed to send a 10GB video file to a client overseas. With
              PeerLink, it was done in minutes with no quality loss. Game
              changer for my creative business."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                AR
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Alex Rodriguez
                </h4>
                <p className="text-gray-500">Freelance Videographer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};