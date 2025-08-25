import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const FacultyAutoLogin = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const lastActivity = localStorage.getItem('facultyLastActivity');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Check if token exists and try to refresh it
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/faculty/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          // Update last activity
          localStorage.setItem('facultyLastActivity', Date.now().toString());
          setIsAuthenticated(true);
        } else if (response.status === 401 || response.status === 403) {
          // Try to refresh the session
          const refreshed = await attemptSessionRefresh(token);
          if (refreshed) {
            localStorage.setItem('facultyLastActivity', Date.now().toString());
            setIsAuthenticated(true);
          } else {
            // Session cannot be refreshed, logout
            handleLogout();
            setIsAuthenticated(false);
          }
        } else {
          handleLogout();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('Auth check failed:', error.message);
        // Don't logout on network errors, just show login
        const token = localStorage.getItem('facultyToken');
        if (!token) {
          setIsAuthenticated(false);
        } else {
          // Keep them logged in if it's just a network issue
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const attemptSessionRefresh = async (token) => {
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
            return true;
          }
        }
        return false;
      } catch (error) {
        console.log('Session refresh failed:', error);
        return false;
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('facultyToken');
      localStorage.removeItem('facultyLastActivity');
    };

    checkAuth();

    // Set up periodic token refresh every 45 minutes
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem('facultyToken');
      if (token) {
        await attemptSessionRefresh(token);
      }
    }, 45 * 60 * 1000); // 45 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Show loading while checking authentication
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
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/faculty-dashboard" replace />;
  }

  // Show login page if not authenticated
  return children;
};

export default FacultyAutoLogin;
