import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/getApiURL";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import useConversation from "../../zustand/useConversion";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

const Login = () => {
  const { setUser, setLoading } = useUser();
  const navigate = useNavigate();
  const { setSelectedConversation, setMessages } = useConversation();

  const [formData, setFormData] = useState({ emailOrMobile: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/login`, {
        emailOrMobile: formData.emailOrMobile,
        password: formData.password,
      });
      if (data?.status === "active") {
        setUser(data);
        setMessages([]);
        setSelectedConversation(null);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  /* shared input class */
  const inputCls =
    "w-full px-4 py-3.5 rounded-xl text-slate-100 text-base font-medium placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 border border-white/10 bg-white/[0.04]";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-6"
      style={{ background: "#080810" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%,rgba(245,158,11,0.06) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(249,115,22,0.04) 0%,transparent 50%)",
        }}
      />
      {/* Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.04) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div
          className="flex flex-col items-center mb-8 cursor-pointer mt-2"
          onClick={() => navigate("/")}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#080810" />
              <path
                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#080810"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-lg font-black tracking-widest"
            style={{ fontFamily: "'Orbitron',sans-serif", color: "#f59e0b" }}
          >
            CRYPTOMINE
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "#0d0d1a",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
            style={{
              background: "linear-gradient(90deg,#f59e0b,#f97316,transparent)",
            }}
          />

          <h2
            className="text-2xl font-black mb-1 tracking-wide"
            style={{ fontFamily: "'Orbitron',sans-serif", color: "#f1f5f9" }}
          >
            Welcome Back
          </h2>
          <p
            className="text-sm font-medium mb-8"
            style={{ color: "#64748b", fontFamily: "'Rajdhani',sans-serif" }}
          >
            Sign in to your CryptoMine account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2"
                style={{
                  color: "#94a3b8",
                  fontFamily: "'Rajdhani',sans-serif",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="emailOrMobile"
                placeholder="you@example.com"
                value={formData.emailOrMobile}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2"
                style={{
                  color: "#94a3b8",
                  fontFamily: "'Rajdhani',sans-serif",
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl text-sm font-black tracking-widest border-none cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "#080810",
                fontFamily: "'Rajdhani',sans-serif",
                boxShadow: submitting
                  ? "none"
                  : "0 8px 24px rgba(245,158,11,0.3)",
              }}
            >
              {submitting ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "#334155", fontFamily: "'Rajdhani',sans-serif" }}
            >
              OR
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>

          {/* Register link */}
          <p
            className="text-center text-sm font-semibold"
            style={{ color: "#64748b", fontFamily: "'Rajdhani',sans-serif" }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold transition-opacity duration-200 hover:opacity-75"
              style={{ color: "#f59e0b" }}
            >
              Create Account →
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p
          className="text-center mt-6 text-xs font-semibold"
          style={{ color: "#334155", fontFamily: "'Rajdhani',sans-serif" }}
        >
          <span
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-amber-500 transition-colors duration-200"
            style={{ color: "#475569" }}
          >
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
