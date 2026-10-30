
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";
import { sendEmailForForgotPassword } from "../APICalls/authApis";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await sendEmailForForgotPassword(email);

      setMessage(
        result.message ||
          "If your account exists, a reset link will be sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send the reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <Link to="/login" className="fp-back-home">
          <span>←</span> Back to Login
        </Link>
        <div className="fp-logo">
        <img className="logo" src="./ekobasava_logo.jpg" alt="ekobasava_logo"></img>
        </div>

        <p className="fp-brand">EKOBASAVA NATURALS</p>

        <h1>Forgot Password?</h1>

        <p className="fp-description">
          Don't worry! It happens. Enter your registered
          email address and we'll send you a secure link
          to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fp-email">Email Address</label>

          <input
            id="fp-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {error && (
            <div className="fp-message fp-error">
              {error}
            </div>
          )}

          {message && (
            <div className="fp-message fp-success">
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="fp-footer">
          Remember your password?{" "}
          <Link to="/login">Login</Link>
        </div>

        <div className="fp-security">
          <span>🔒</span>
          Your account security matters to us.
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
