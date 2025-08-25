import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
const API_BASE = process.env.REACT_APP_API_URL;
function ActivateID() {
  const [studentId, setStudentId] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captcha] = useState(() => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return { num1, num2, sum: num1 + num2 };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (parseInt(captchaInput) !== captcha.sum) {
      setError("CAPTCHA verification failed");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/activation-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      setSuccess('Activation request submitted! Admin will review your request.');
      setStudentId("");
      setCaptchaInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="activation-card">
          <div className="card-header">
            <h2>Activate Your EWU ID</h2>
            <p className="card-subtitle">Get started with your university journey</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form className="activation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Student ID</label>
              <input
                type="text"
                placeholder="2023-1-60-054"
                className="form-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Security Check</label>
              <div className="captcha-box">
                <div className="captcha-question">
                  <span className="captcha-numbers">{captcha.num1}</span>
                  <span className="captcha-plus">+</span>
                  <span className="captcha-numbers">{captcha.num2}</span>
                  <span className="captcha-equals">=</span>
                </div>
                <input
                  type="number"
                  placeholder="?"
                  className="captcha-input"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="activate-button">
              Send Activation Link
              <span className="button-icon">→</span>
            </button>

            <div className="back-link-container">
              <Link to="/" className="back-link">
                <span className="arrow">←</span> Return to Login
              </Link>
            </div>
          </form>

          <div className="info-section">
            <div className="instructions">
              <h4 className="info-heading">Activation Steps</h4>
              <ol className="steps-list">
                <li className="step-item">
                  <span className="step-number"></span>
                  Enter your student ID above
                </li>
                <li className="step-item">
                  <span className="step-number"></span>
                  Check registered email for activation link
                </li>
                <li className="step-item">
                  <span className="step-number"></span>
                  Set password via email instructions
                </li>
                <li className="step-item">
                  <span className="step-number"></span>
                  Login with new credentials
                </li>
              </ol>
            </div>

            <div className="support-section">
              <h4 className="info-heading">Need Help?</h4>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                +880 1234 567891
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                registrar@ewu.edu
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivateID;