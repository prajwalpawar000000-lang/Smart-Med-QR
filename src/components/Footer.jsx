import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Heart, Award, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#083366] to-[#041d3b] text-white py-12 mt-auto border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-blue-900/60 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#1E9E8F] to-emerald-400 text-white rounded-lg flex items-center justify-center font-bold">
                <QrCode size={18} />
              </div>
              <span className="font-black text-2xl tracking-tight text-white">MedQR</span>
            </div>
            <p className="text-xs text-blue-200 max-w-sm">
              Instant digital medicine information, AI Google Assistant voice guidance, and anti-counterfeit batch verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/scan" className="hover:text-white transition-colors">Scan QR</Link>
            <Link to="/verify" className="hover:text-white transition-colors">Verify Batch</Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold">
              <Award size={14} />
              <span>Avishkar Research Project</span>
            </div>
            <span className="text-[10px] text-blue-200">State Level Competition 2025</span>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/80 gap-3">
          <p>&copy; 2025 MedQR. Developed for academic & healthcare research.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for accessible patient safety
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
