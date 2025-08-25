import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import "../index.css";

const FacultyProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const rememberMe = localStorage.getItem('facultyRememberMe');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to verify current token
        let response = await fetch(`${process.env.REACT_APP_API_URL}/api/faculty/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          // Update last activity
          localStorage.setItem('facultyLastActivity', Date.now().toString());
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If token is expired but user chose to remember, try to refresh
        if (response.status === 401 && rememberMe === 'true') {
          const refreshResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/refresh-session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            if (data.token) {
              localStorage.setItem('facultyToken', data.token);
              localStorage.setItem('facultyLastActivity', Date.now().toString());
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
          }
        }

        // Authentication failed, clean up
        handleLogout();
        setIsAuthenticated(false);
      } 
      catch (err) {
        console.log('Auth verification failed:', err.message);
        
        // On network error, don't logout immediately if we have a token
        const token = localStorage.getItem('facultyToken');
        if (token) {
          // Give benefit of doubt for network issues
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('facultyToken');
      localStorage.removeItem('facultyLastActivity');
      localStorage.removeItem('facultyRememberMe');
    };

    verifyAuth();

    // Set up periodic verification every 30 minutes
    const verificationInterval = setInterval(() => {
      verifyAuth();
    }, 30 * 60 * 1000);

    // Set up token refresh every 45 minutes
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem('facultyToken');
      const rememberMe = localStorage.getItem('facultyRememberMe');
      
      if (token && rememberMe === 'true') {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/refresh-session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              localStorage.setItem('facultyToken', data.token);
              localStorage.setItem('facultyLastActivity', Date.now().toString());
            }
          }
        } catch (error) {
          console.log('Background token refresh failed:', error);
        }
      }
    }, 45 * 60 * 1000);

    return () => {
      clearInterval(verificationInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e3e3e3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/faculty" replace />;
};

export default FacultyProtectedRoute;
