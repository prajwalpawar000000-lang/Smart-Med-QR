import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import MedicinePage from './pages/MedicinePage';
import BatchVerify from './pages/BatchVerify';
import ADRChecker from './pages/ADRChecker';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

// Keep heavy scanner and admin dashboard lazy
const Scanner = React.lazy(() => import('./pages/Scanner'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-10 h-10 border-4 border-[#1E9E8F] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicine/:id" element={<MedicinePage />} />
          <Route path="/side-effects" element={<ADRChecker />} />
          <Route path="/adr" element={<Navigate to="/side-effects" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/verify" element={<BatchVerify />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
