
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import axios from "axios";
import {toast} from 'react-hot-toast'

function Signup() {
  const liveUrl="https://eko-basava-naturals.vercel.app";
//const baseUrl="http://localhost:8000";
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userData.firstName.trim() || !userData.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(userData.mobile.trim())) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (userData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Connect your backend signup API here.
      // Example:
      // const response = await fetch("YOUR_SIGNUP_API_URL", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ...form,
      //     email: form.email.trim().toLowerCase(),
      //   }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || "Signup failed");

      const response=await axios.post(`${liveUrl}/api/auth/signup`,userData);
      console.log(response);
      if(response.data.status==="success"){
        toast.success("Your EkoBasava Account Created");
        navigate('/login');
      }
      
    } catch (error) {
      const err=error.response?.data?.message || error.message || "Unable to create your account."
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <section className="auth-shell signup-shell">
        <aside className="auth-showcase">
          <Link to="/signup" className="brand">
            <span className="brand-mark">✳</span>
            <span>Ekobasava Naturals</span>
          </Link>

          <div className="showcase-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              LET NATURE COLOUR YOUR WORLD
            </span>

            <h1>
              A greener
              <br />
              home<span>starts here.</span>
            </h1>

            <p>
              Join Ekobasava Naturals and explore paint 
              inspired by nature and traditional ingredients.
            </p>

            <div className="showcase-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />

              <div className="art-card signup-art-card">
                <div className="art-card-top">
                  <span className="art-icon">✳</span>
                  <span className="art-status">ROOTED IN NATURE</span>
                </div>

                <div className="art-heading">Natural origins.<br />Beautiful spaces.</div>

                <div className="art-lines">
                  <span />
                  <span />
                </div>

                <div className="art-progress">
                  <span />
                </div>

                <div className="art-bottom">
                  <span>COLOUR A GREENER FUTURE</span>
                  <span>↗</span>
                </div>
              </div>

              <span className="art-spark spark-one">✳</span>
              <span className="art-spark spark-two">✦</span>
              <span className="art-spark spark-three">✳</span>
            </div>
          </div>

          <div className="showcase-footer">
            <span>Growing towards a greener tomorrow.</span>
            <span>EST. WITH CARE ✳</span>
          </div>
        </aside>

        <section className="auth-form-side">
          <div className="mobile-brand">
            <span className="brand-mark">✳</span>
            <span>YourBrand</span>
          </div>

          <div className="auth-form-wrap signup-form-wrap">
            <div className="form-heading">
              <span className="form-kicker">JOIN THE NATURAL MOVEMENT</span>
              <h2>Create your Ekobasava account.</h2>
              <p>Enter your details to get started.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="firstName">First name</label>
                  <div className="input-wrap">
                    <input
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      value={userData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="lastName">Last name</label>
                  <div className="input-wrap">
                    <input
                      id="lastName"
                      name="lastName"
                      placeholder="Last name"
                      value={userData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="signup-email">Email address</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">✉</span>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={userData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="mobile">Mobile number</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">⌕</span>
                  <input
                    id="mobile"
                    type="tel"
                    name="mobile"
                    placeholder="10-digit mobile number"
                    value={userData.mobile}
                    onChange={handleChange}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="signup-password">Password</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">⌑</span>
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={userData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="field-hint">Use at least 6 characters.</span>
              </div>

              {error && (
                <div className="form-message" role="alert">{error}</div>
              )}

              {success && (
                <div className="form-success" role="status">{success}</div>
              )}

              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <span aria-hidden="true">↗</span>}
              </button>

              <p className="terms-note">
                By continuing, you agree to our{" "}
                <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </form>

            <div className="auth-switch">
              Already have an account?
              <Link to="/login">Log in <span>→</span></Link>
            </div>
          </div>

          <footer className="form-footer">
            <span>© {new Date().getFullYear()} YourBrand</span>
            <span>Made with care <span className="footer-heart">♥</span></span>
          </footer>
        </section>
      </section>
    </main>
  );
}

export default Signup;
