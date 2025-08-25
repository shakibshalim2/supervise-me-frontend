import React, { useState } from "react";
import "./ResetPassword.css";

function ChangePass({ onClose, token }) {
   const API_BASE = process.env.REACT_APP_API_URL;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/reset-pass/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful.");
        onClose();
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      setMessage("Server error.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="reset-card modal">
        <button onClick={onClose} className="close-button">X</button>
        <h2>Reset Password</h2>
        {message && <p className="reset-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="reset-input"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="reset-input"
          />
          <button type="submit" className="reset-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePass;
