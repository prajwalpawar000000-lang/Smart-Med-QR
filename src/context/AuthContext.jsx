import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true' || 
           sessionStorage.getItem('isAdminAuthenticated') === 'true';
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true' || 
                   sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password) => {
    const validPasswords = [
      'admin123',
      'admin',
      'smartmedqr2025',
      import.meta.env.VITE_ADMIN_PASSWORD
    ].filter(Boolean);

    if (validPasswords.includes(password.trim())) {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    sessionStorage.removeItem('isAdminAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

