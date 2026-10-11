import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ScanLine, ShieldCheck, Settings, Menu, X, QrCode, HeartPulse, Sparkles } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={17} /> },
    { name: '🏆 Prototype', path: '/#prototype-showcase', isAnchor: true, icon: <Sparkles size={16} className="text-amber-500" /> },
    { name: 'Scan QR', path: '/scan', icon: <ScanLine size={17} /> },
    { name: 'Verify Batch', path: '/verify', icon: <ShieldCheck size={17} /> },
    { name: 'Side Effects & ADRs', path: '/side-effects', icon: <HeartPulse size={17} /> },
    { name: 'Admin', path: '/admin', icon: <Settings size={17} /> },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Short & Catchy Brand Logo: MedQR */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#0B4F9C] to-[#1E9E8F] text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <QrCode size={22} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#0B4F9C] to-[#1E9E8F] bg-clip-text text-transparent">
                    MedQR
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline-block">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                  Smart Medicine Assistant
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
              {navLinks.map((link) => (
                link.isAnchor ? (
                  <a
                    key={link.path}
                    href={link.path}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 text-slate-700 hover:text-[#0B4F9C] hover:bg-white/60"
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-white text-[#0B4F9C] shadow-sm'
                        : 'text-slate-600 hover:text-[#0B4F9C] hover:bg-white/60'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                )
              ))}
            </div>
            
            <div className="flex items-center pl-2 border-l border-slate-200">
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <LanguageToggle />
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-[#0B4F9C] hover:bg-slate-100 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-[#0B4F9C] border-l-4 border-[#1E9E8F]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            )
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
