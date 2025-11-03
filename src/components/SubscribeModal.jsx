import React from "react";
import { X } from "lucide-react";

const SubscribeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Free Plan */}
          <div className="border-2 border-neutral-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">Free</h3>
                <p className="text-neutral-600 text-sm">Basic access to repair guides</p>
              </div>
              <span className="text-2xl font-bold text-neutral-900">RM0</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Access to basic repair guides
              </li>
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Community support
              </li>
            </ul>
            <button className="w-full py-3 bg-neutral-100 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-200 transition-colors">
              Select Free Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-blue-50 hover:border-blue-600 transition-colors cursor-pointer relative">
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">Premium</h3>
                <p className="text-neutral-600 text-sm">Full access with exclusive features</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-neutral-900">RM10</span>
                <span className="text-sm text-neutral-600 block">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All basic features
              </li>
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Exclusive premium guides
              </li>
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ad-free experience
              </li>
              <li className="flex items-center text-sm text-neutral-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Video tutorials access
              </li>
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe to Premium - RM10/month
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;

