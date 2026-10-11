import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const AdminLogin = () => {
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    const enteredPass = password.trim() || 'admin123';
    if (login(enteredPass)) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 300);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  const handleDemoLogin = () => {
    setPassword('admin123');
    login('admin123');
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/dashboard', { replace: true });
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className={`bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 transition-all ${error ? 'animate-shake' : ''}`}>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-[#0B4F9C]/10 rounded-2xl flex items-center justify-center mb-4 text-[#0B4F9C]">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Portal Login</h1>
            <p className="text-slate-500 mt-1 text-center text-sm">
              Authenticate to manage medicine data, batches, & QR print sheets
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-xs text-blue-800 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-[#0B4F9C] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Authorized Competition Access:</span>
              <p className="mt-0.5 text-blue-700">
                Default Password: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-[#0B4F9C] text-sm">admin123</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-[#1E9E8F] transition-all pr-12 text-slate-800 font-medium`}
                  placeholder="Enter admin password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-2 font-semibold">
                  ❌ Incorrect password. Please use <strong>admin123</strong>.
                </p>
              )}
            </div>

            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} /> Login successful! Redirecting to dashboard...
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full bg-[#1E9E8F] text-white py-3.5 rounded-xl font-bold hover:bg-[#147a6e] transition-colors shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-gradient-to-r from-[#0B4F9C] to-[#1a66c2] text-white py-3.5 rounded-xl font-bold hover:opacity-95 transition-opacity shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>⚡ 1-Click Instant Login (admin123)</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
              ← Back to Patient Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}} />
    </div>
  );
};

export default AdminLogin;
