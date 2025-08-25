import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function ForgotPasswordFaculty() {
   const API_BASE = process.env.REACT_APP_API_URL;
  const [email, setEmail] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha] = useState(() => {
    // Generate random CAPTCHA
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return { num1, num2, sum: num1 + num2 };
  });



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (parseInt(captchaInput) !== captcha.sum) {
      alert("CAPTCHA sum failed");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE}/api/forgot-password/faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Password reset instructions sent to your email.");
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      alert("Failed to send request. Please try again.");
    }
  };

  

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="home-card">
          <h2>Password Recovery</h2>
          <form className="home-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Enter your registered email</label>
              <input
                type="email"
                placeholder="name@ewubd.edu"
                className="home-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="home-captcha">
              <label>CAPTCHA Verification</label>
              <div className="captcha-container">
                <span>{`${captcha.num1} + ${captcha.num2} = ?`}</span>
                <input
                  type="number"
                  placeholder="Enter sum"
                  className="home-input home-captcha-input"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="home-button">
              Reset Password
            </button>

            <div className="home-links">
              <Link to="/" className="back-link">
                ← Back to Login
              </Link>
            </div>
          </form>

          <div className="support-info">
            <p>Need help? Contact EWU IT Support:</p>
            <p>📞 +880 1234 567890</p>
            <p>✉️ support@ewu.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordFaculty;