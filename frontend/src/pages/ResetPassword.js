
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/ForgotPassword.css";
import { resetForgotPassword } from "../APICalls/authApis";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const passwordResetData={
        token,
        password,
        confirmPassword
      }
      const result = await resetForgotPassword(passwordResetData);

      setSuccess(
        result.message || "Password reset successfully!"
      );

      // Navigate to login after a successful reset.
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "The reset link may be expired. Please request a new one."
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

        <h1>Create New Password</h1>

        <p className="fp-description">
          Create a strong password to keep your account safe.
        </p>

        {!token && (
          <div className="fp-message fp-error">
            The reset token is missing from this link.
            <Link to="/forgot-password"> Request a new link</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New Password</label>

          <div className="fp-password-field">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="fp-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="confirm-password">
            Confirm New Password
          </label>

          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="fp-message fp-error">
              {error}
            </div>
          )}

          {success && (
            <div className="fp-message fp-success">
              {success}
            </div>
          )}

          <button type="submit" disabled={loading || !token}>
            {loading ? "Updating password..." : "Reset Password"}
          </button>
        </form>

        <div className="fp-footer">
          Remember your password?{" "}
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
