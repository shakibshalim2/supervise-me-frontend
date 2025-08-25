// src/components/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import "../index.css"
const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/check-auth`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) throw new Error('Invalid token');
        setIsAuthenticated(true);
      } 
      catch (err) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default ProtectedRoute;