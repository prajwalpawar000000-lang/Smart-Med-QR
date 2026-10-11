import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-9xl font-bold text-[#0B4F9C] opacity-20 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Page Not Found</h2>
          <p className="text-slate-600 mb-8 text-lg">
            The medicine or page you are looking for does not exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[#1E9E8F] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#147a6e] transition-colors shadow-md"
          >
            Go Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
