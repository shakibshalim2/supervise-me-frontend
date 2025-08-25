import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./HomePage.css"

function HomePage() {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [credentials, setCredentials] = useState({ 
    studentId: '', 
    password: '',
    captcha: ''
  });
  const [captcha, setCaptcha] = useState({ question: '', answer: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({
      question: `${num1} + ${num2}`,
      answer: String(num1 + num2)
    });
  };

  // ✅ UPDATED: Check for existing sessions (both student AND faculty)
  useEffect(() => {
    const checkExistingSession = async () => {
      // Check for faculty session first
      const facultyToken = localStorage.getItem('facultyToken');
      if (facultyToken) {
        try {
          const response = await fetch(`${API_BASE}/api/faculty/me`, {
            headers: { 'Authorization': `Bearer ${facultyToken}` }
          });
          
          if (response.ok) {
            console.log('Valid faculty session found, redirecting to faculty dashboard');
            navigate('/faculty-dashboard');
            return;
          } else {
            // Faculty token expired or invalid, clear storage
            localStorage.removeItem('facultyToken');
          }
        } catch (error) {
          console.log('Faculty session check failed:', error);
          localStorage.removeItem('facultyToken');
        }
      }

      // Check for student session
      const studentToken = localStorage.getItem('studentToken');
      const currentStudent = localStorage.getItem('currentStudent');
      
      if (studentToken && currentStudent) {
        try {
          const response = await fetch(`${API_BASE}/api/students/me`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
          });
          
          if (response.ok) {
            console.log('Valid student session found, redirecting to student dashboard');
            navigate('/student-dashboard');
            return;
          } else {
            // Student token expired or invalid, clear storage
            localStorage.removeItem('studentToken');
            localStorage.removeItem('currentStudent');
            localStorage.removeItem('tokenTimestamp');
          }
        } catch (error) {
          console.log('Student session check failed:', error);
          localStorage.removeItem('studentToken');
          localStorage.removeItem('currentStudent');
          localStorage.removeItem('tokenTimestamp');
        }
      }
      
      // No valid session found, generate captcha for login
      generateCaptcha();
    };

    checkExistingSession();
  }, [navigate, API_BASE]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (credentials.captcha !== captcha.answer) {
        generateCaptcha();
        throw new Error('Invalid captcha answer');
      }

      const response = await fetch(`${API_BASE}/api/students/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: credentials.studentId,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        generateCaptcha();
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Store token with timestamp for persistent login
      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('tokenTimestamp', Date.now().toString());

      const profileResponse = await fetch(`${API_BASE}/api/students/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`
        }
      });
      
      const profileData = await profileResponse.json();
const studentInfo = {
  ...profileData,
  isEligible: data.student.isEligible,
  isInTeam: data.student.isInTeam,
  teamName: data.student.teamName,
  hasSpecialAccess: data.student.hasSpecialAccess || false
};
    
      localStorage.setItem('currentStudent', JSON.stringify(profileData));
      
if (data.student.hasSpecialAccess) {
  console.log('✅ Special access granted - student added to team by admin despite being ineligible');
}
    
      console.log('Student login successful, session will persist until logout');
      navigate('/student-dashboard');
    } 
    catch (err) {
      setError(err.message);
      setCredentials(prev => ({ ...prev, captcha: '' }));
    } 
    finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="home-card">
          <h2>EWU Student Portal</h2>
          <form className="home-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="studentId"
              placeholder="Student ID"
              className="home-input"
              value={credentials.studentId}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="home-input"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <div className="home-captcha">
              <span>{captcha.question} = ?</span>
              <input
                type="text"
                name="captcha"
                placeholder="Enter answer"
                className="home-input home-captcha-input"
                value={credentials.captcha}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="home-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="home-links">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>
            <div className="home-other-logins">
              <Link to="/faculty" className="login-btn">Faculty Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HomePage;
