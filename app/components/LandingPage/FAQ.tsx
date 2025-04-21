import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
export const FAQ = () => {
  const faqs = [{
    question: 'How does peer-to-peer file sharing work?',
    answer: 'PeerLink uses WebRTC technology to establish a direct connection between two devices. Files are transferred directly from one device to another without going through any intermediate servers, resulting in faster transfers and enhanced privacy.'
  }, {
    question: 'Is my data secure with PeerLink?',
    answer: "Yes, all communications on PeerLink are protected with end-to-end encryption. This means that only you and the person you're connecting with can access the shared files or video calls. Not even we can see your data."
  }, {
    question: 'Do I need to create an account to use PeerLink?',
    answer: "No, you can use PeerLink's basic features without creating an account. However, creating a free account allows you to access additional features like saved contacts and transfer history."
  }, {
    question: 'Are there any file size limitations?',
    answer: 'Free users can transfer files up to 2GB in size. Pro and Business users have no file size limitations, allowing them to transfer files of any size.'
  }, {
    question: 'How many people can join a video call?',
    answer: 'Free users can have 1-to-1 video calls. Pro users can host group calls with up to 5 participants, while Business users can have up to 25 participants in a call.'
  }, {
    question: 'Does PeerLink work on mobile devices?',
    answer: 'Yes, PeerLink works on any device with a modern web browser, including smartphones and tablets. We also offer native mobile apps for iOS and Android for an optimized experience.'
  }];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-gray-50 transition-colors" onClick={() => toggleFAQ(index)}>
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                {openIndex === index ? <ChevronUpIcon size={20} className="text-blue-600" /> : <ChevronDownIcon size={20} className="text-gray-500" />}
              </button>
              {openIndex === index && <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>}
            </div>)}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>;
};