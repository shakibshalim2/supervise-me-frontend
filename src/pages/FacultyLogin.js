import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";

const API_BASE = process.env.REACT_APP_API_URL;

function FacultyLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    captcha: ""
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Generate CAPTCHA
  const [captcha] = useState(() => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return { num1, num2, sum: num1 + num2 };
  });

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        if (!token) {
          setIsCheckingAuth(false);
          return;
        }

        // Verify token with server
        const response = await fetch(`${API_BASE}/api/faculty/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          // User is already logged in, redirect to dashboard
          console.log("User already authenticated, redirecting...");
          navigate('/faculty-dashboard', { replace: true });
          return;
        } else if (response.status === 401) {
          // Try to refresh session
          const refreshResponse = await fetch(`${API_BASE}/api/refresh-session`, {
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
              navigate('/faculty-dashboard', { replace: true });
              return;
            }
          }
        }
        
        // Invalid token, remove it
        localStorage.removeItem('facultyToken');
        localStorage.removeItem('facultyLastActivity');
        setIsCheckingAuth(false);
      } catch (error) {
        console.log("Auth check failed:", error.message);
        // Don't remove token on network errors
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      console.log("Starting login process...");
      
      // Input validation
      if (!credentials.email.trim() || !credentials.password.trim()) {
        throw new Error("Please enter both email and password");
      }

      if (!credentials.email.includes('@')) {
        throw new Error("Please enter a valid email address");
      }
      
      // CAPTCHA validation
      if (!credentials.captcha || parseInt(credentials.captcha) !== captcha.sum) {
        throw new Error("CAPTCHA verification failed. Please check your math.");
      }

      // API call
      console.log("Sending request to:", `${API_BASE}/api/faculty/login`);
      const response = await fetch(`${API_BASE}/api/faculty/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password
        }),
        signal: AbortSignal.timeout(15000) // Increased timeout
      });

      const data = await response.json();
      console.log("Server response status:", response.status);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          throw new Error("Invalid email or password. Please check your credentials.");
        } else if (response.status === 403) {
          throw new Error("Your account is not active. Please contact administration.");
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(data.message || 'Login failed. Please check your credentials.');
        }
      }

      if (!data.token) {
        throw new Error("Invalid server response. Please try again.");
      }

      // Store token and activity timestamp
      localStorage.setItem('facultyToken', data.token);
      localStorage.setItem('facultyLastActivity', Date.now().toString());
      localStorage.setItem('facultyRememberMe', 'true'); // Flag for persistent login
      
      console.log("Login successful, token stored");

      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to dashboard
      console.log("Redirecting to dashboard...");
      navigate('/faculty-dashboard', { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      
      // Handle network errors
      if (err.name === 'AbortError') {
        setError("Login request timed out. Please check your connection and try again.");
      } else if (err.message.includes('fetch')) {
        setError("Unable to connect to server. Please check your internet connection.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="home-container">
        <div className="home-overlay">
          <div className="home-card homeC">
            <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #e3e3e3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }}></div>
              <h3>Checking authentication...</h3>
              <p>Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="home-card homeC">
          <h2>Faculty Portal Login</h2>
          
          {error && (
            <div className="error-message">
              <strong>⚠️ Login Failed</strong><br />
              {error}
            </div>
          )}

          <form className="home-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Faculty Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your faculty email"
                className="home-input"
                value={credentials.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                className="home-input"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="home-captcha">
              <label htmlFor="captcha">Security Check *</label>
              <div className="captcha-container">
                <span className="captcha-question">
                  {`${captcha.num1} + ${captcha.num2} = ?`}
                </span>
                <input
                  id="captcha"
                  type="number"
                  name="captcha"
                  placeholder="Enter sum"
                  className="home-input home-captcha-input"
                  value={credentials.captcha}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  min="0"
                  max="18"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`home-button ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="home-links">
              <Link 
                to="/forgot-password/faculty" 
                className="forgot-password-link"
                tabIndex={isSubmitting ? -1 : 0}
              >
                Forgot Password?
              </Link>
              <Link 
                to="/" 
                className="back-link"
                tabIndex={isSubmitting ? -1 : 0}
              >
                ← Back to Student Login
              </Link>
            </div>

            <div className="support-info">
              <p><strong>Faculty Support:</strong></p>
              <p>📞 <a href="tel:+8801234567892">+880 1234 567892</a></p>
              <p>✉️ <a href="mailto:faculty-support@ewu.edu">faculty-support@ewu.edu</a></p>
              <p><small>Available Mon-Fri, 9 AM - 5 PM</small></p>
            </div>
          </form>

          <div className="login-help">
            <details>
              <summary>Need Help?</summary>
              <ul>
                <li>Make sure you're using your official faculty email</li>
                <li>Password is case-sensitive</li>
                <li>Clear your browser cache if login persists to fail</li>
                <li>Contact IT support if you continue to have issues</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyLogin;
