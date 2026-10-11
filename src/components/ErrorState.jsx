import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto my-8">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full border border-slate-100 flex flex-col items-center text-center">
        
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-[#DC2626]" strokeWidth={2} />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-slate-600 mb-8 max-w-sm">
          {message}
        </p>
        
        {/* Action Button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="w-full sm:w-auto bg-[#1E9E8F] hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E9E8F]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
