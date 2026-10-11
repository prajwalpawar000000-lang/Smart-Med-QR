import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8">
      {/* Outer spinning ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#1E9E8F] border-t-transparent animate-spin"></div>
      </div>
      
      {/* Optional message */}
      {message && (
        <p className="mt-6 text-slate-500 font-medium text-lg animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
