import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import BrandMark from "../components/BrandMark";

// row / column of each flowing colour tile (everything except the four text boxes)
const FLOW_AREAS = [
  "1 / 2", "1 / 3", "1 / 4",
  "2 / 1", "2 / 4",
  "3 / 1", "3 / 2", "3 / 3",
  "4 / 3", "4 / 4",
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { username, password } : { username, email, password };
      const response = await api.post(endpoint, payload);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="icon-button auth-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">{theme === "dark" ? "☼" : "☾"}</button>

      <section className="auth-visual">
        <div className="mosaic">
          {FLOW_AREAS.map((area) => (
            <div key={area} className="mosaic-tile mosaic-flow" style={{ gridArea: area }} aria-hidden="true" />
          ))}

          <div className="mosaic-tile mosaic-text mosaic-brand" style={{ gridArea: "1 / 1" }}>
            <BrandMark size={72} />
          </div>

          <div className="mosaic-tile mosaic-text mosaic-headline" style={{ gridArea: "2 / 2 / 3 / 4" }}>
            <h1>Images in.<br />Intelligence out.</h1>
            <p>Reliable queues, resilient workers and real-time visibility.</p>
          </div>

          <div className="mosaic-tile mosaic-text mosaic-metrics" style={{ gridArea: "3 / 4" }}>
            <div><strong>24/7</strong><span>Queue monitoring</span></div>
            <div><strong>4×</strong><span>Image variants</span></div>
            <div><strong>∞</strong><span>Scalable workers</span></div>
          </div>

          <div className="mosaic-tile mosaic-text mosaic-tagline" style={{ gridArea: "4 / 1 / 5 / 3" }}>
            <div
              className="mosaic-tagline-content"
              style={{ transform: "translateY(-32px)" }}
            >
              <span>QUEUE / PROCESS / DELIVER</span><br />
              <strong>BUILT TO SCALE.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-kicker">{isLogin ? "WELCOME BACK" : "GET STARTED"}</div>
          <h2>{isLogin ? "Sign in to QueueForge" : "Create your account"}</h2>
          <p className="muted">{isLogin ? "Enter your details to access your workspace." : "Create an account to start processing images."}</p>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" required />
          {!isLogin && <><label>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></>}
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={6} />
          {error && <p className="inline-error">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={loading}>{loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"} <span>→</span></button>
          <div className="auth-switch">{isLogin ? "New to QueueForge?" : "Already have an account?"} <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }}> {isLogin ? "Create an account" : "Sign in"}</button></div>
          <div className="secure-note"> <span>◇</span> Secure access to your processing workspace</div>
        </form>
      </section>
    </div>
  );
}