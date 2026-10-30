
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { toast } from "react-hot-toast";
import { loginToAccount, verifyOtp } from "../APICalls/authApis";

function Login() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = userData.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!userData.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginToAccount({
        email: normalizedEmail,
        password: userData.password,
      });
      console.log("login response: ",response)
      if (response.status === "success") {
        setLoginEmail(normalizedEmail);
        setOtp("");
        setOtpStage(true);
        toast.success("OTP sent to your email!");
      } else {
        setError(response.message || "Unable to start login verification.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp({
        email: loginEmail,
        otp: otp,
      });
      console.log("response of verify opt: ",response);

      if (response.status === "success" && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.data));

        toast.success("Login successful!");
        navigate("/");
      } else {
        setError(response.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err.response?.data || err);

    setError(
        err.response?.data?.message ||
        "OTP verification failed. Check the browser console."
    );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setOtpStage(false);
    setOtp("");
    setError("");
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <section className="auth-shell">
        {/* Left-side branding and illustration */}
        <aside className="auth-showcase">
          <Link to="/login" className="brand">
            <span className="brand-mark">✳</span>
            <span>Ekobasava Naturals</span>
          </Link>

          <div className="showcase-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              NATURE-INSPIRED LIVING
            </span>

            <h1>
              Welcome back to a
              <br />
              <span>greener world.</span>
            </h1>

            <p>
              Sign in to explore natural paint solutions and bring
              nature-inspired beauty to your spaces.
            </p>

            <div className="showcase-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />

              <div className="art-card">
                <div className="art-card-top">
                  <span className="art-icon">✳</span>
                  <span className="art-status">YOUR SPACE</span>
                </div>

                <div className="art-heading">
                  Everything starts
                  <br />
                  with a little step.
                </div>

                <div className="art-lines">
                  <span />
                  <span />
                </div>

                <div className="art-progress">
                  <span />
                </div>

                <div className="art-bottom">
                  <span>KEEP GROWING</span>
                  <span>↗</span>
                </div>
              </div>

              <span className="art-spark spark-one">✳</span>
              <span className="art-spark spark-two">✦</span>
              <span className="art-spark spark-three">✳</span>
            </div>
          </div>

          <div className="showcase-footer">
            <span>Inspired by nature. Made for your spaces.</span>
            <span>EST. WITH CARE ✳</span>
          </div>
        </aside>

        {/* Right-side login and OTP forms */}
        <section className="auth-form-side">
          <div className="mobile-brand">
            <span className="brand-mark">✳</span>
            <span>Ekobasava Naturals</span>
          </div>

          <div className="auth-form-wrap">
            <div className="form-heading">
              <span className="form-kicker">
                {otpStage ? "ONE MORE STEP" : "WELCOME BACK TO NATURE"}
              </span>

              <h2>
                {otpStage
                  ? "Verify your email."
                  : "Your greener journey continues."}
              </h2>

              <p>
                {otpStage
                  ? "Enter the verification code we sent to your registered email."
                  : "Sign in to your Ekobasava Naturals account."}
              </p>
            </div>

            {!otpStage ? (
              /* Email and password form */
              <form onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label htmlFor="email">Email address</label>

                  <div className="input-wrap">
                    <span className="input-icon" aria-hidden="true">
                      ✉
                    </span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={userData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                  </div>

                  <div className="input-wrap">
                    <span className="input-icon" aria-hidden="true">
                      ⌑
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={userData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={loading}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="form-message" role="alert">
                    {error}
                  </p>
                )}

                
                  <Link to="/forgot-password"
                  className="forgot-password-link">
                    Forgot password?
                  </Link>
                
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Continue to login"}
                  {!loading && <span>→</span>}
                </button>

                <div className="secure-note">
                  <span>✓</span>
                  Secure sign-in with email verification
                </div>
              </form>
            ) : (
              /* Six-digit email OTP form */
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="field-group">
                  <label htmlFor="otp">Email verification code</label>

                  <div className="input-wrap">
                    <span className="input-icon" aria-hidden="true">
                      #
                    </span>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      disabled={loading}
                      autoFocus
                      aria-describedby="otp-help"
                    />
                  </div>

                  <span className="field-hint" id="otp-help">
                    Code sent to {loginEmail}. It expires in 5 minutes.
                  </span>
                </div>

                {error && (
                  <p className="form-message" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify and sign in"}
                  {!loading && <span>→</span>}
                </button>

                {/* <button
                  type="button"
                  className="text-link"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  style={{ marginTop: "18px" }}
                >
                  ← Back to login
                </button> */}

                <div className="secure-note">
                  <span>✓</span>
                  Never share your verification code with anyone
                </div>
              </form>
            )}

            <div className="auth-switch">
              {!otpStage ? (
                <>
                  Don't have an account?
                  <Link to="/signup">
                    Create an account <span>→</span>
                  </Link>
                </>
              ) : (
                <>
                  Having trouble?
                  <button
                    type="button"
                    className="text-link"
                    onClick={handleBackToLogin}
                    disabled={loading}
                  >
                    Return to login
                  </button>
                </>
              )}
            </div>
          </div>

          <footer className="form-footer">
            <span>© {new Date().getFullYear()} Ekobasava Naturals</span>
            <span>
              Made with care <span className="footer-heart">♥</span>
            </span>
          </footer>
        </section>
      </section>
    </main>
  );
}

export default Login;
