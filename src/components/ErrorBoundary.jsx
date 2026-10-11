import React from 'react';
import { ShieldAlert, RefreshCw, Home, QrCode } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={34} />
            </div>

            <div>
              <span className="inline-block bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 mb-2">
                MedQR Safe Recovery Mode
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Unable to Display Medicine Page
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                An unexpected display issue occurred while rendering this medicine's details. You can reload the page or return to the verified medicine directory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 bg-[#0B4F9C] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>

              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl text-sm transition-all"
              >
                <Home size={16} />
                <span>Go to Home</span>
              </a>

              <a
                href="/scan"
                className="inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-3 px-6 rounded-xl text-sm transition-all border border-emerald-200"
              >
                <QrCode size={16} />
                <span>Scan QR</span>
              </a>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left bg-slate-100 p-3 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
                <summary className="cursor-pointer font-bold text-slate-600">Error Details (Debug)</summary>
                <p className="mt-2 text-rose-700 font-semibold">{this.state.error.toString()}</p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
