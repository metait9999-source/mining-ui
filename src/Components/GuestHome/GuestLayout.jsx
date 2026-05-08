import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Plans", path: "/plans" },
  { label: "Features", path: "/features" },
  { label: "About", path: "/about-us" },
  { label: "Support", path: "/support" },
];

export const LogoIcon = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      background: "linear-gradient(135deg,#f59e0b,#f97316)",
      borderRadius: 10,
      flexShrink: 0,
    }}
    className="flex items-center justify-center"
  >
    <svg
      width={size * 0.55}
      height={size * 0.55}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#080810" />
      <path
        d="M2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="#080810"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const GuestNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif !important; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif !important; }
        .nav-link-active { color: #f59e0b !important; background: rgba(245,158,11,0.1) !important; }
        .hamburger-bar { width: 22px; height: 2px; background: #94a3b8; border-radius: 2px; transition: all 0.3s; display: block; }
        .ham-open-1 { transform: rotate(45deg) translate(5px,5px); }
        .ham-open-2 { opacity: 0; }
        .ham-open-3 { transform: rotate(-45deg) translate(5px,-5px); }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes orb-rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes orb-pulse { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.08);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes skel { 0%,100%{opacity:1} 50%{opacity:.4} }
        .animate-pulse-dot { animation: pulse-dot 1.5s infinite; }
        .animate-orb-rotate { animation: orb-rotate 20s linear infinite; }
        .animate-orb-rotate-rev { animation: orb-rotate 12s linear infinite reverse; }
        .animate-orb-pulse { animation: orb-pulse 3s ease-in-out infinite; }
        .animate-fade-up { animation: fadeUp .8s ease both; }
        .animate-skel { animation: skel 1.5s ease-in-out infinite; }
        .plan-card:hover { transform: translateY(-6px); }
        .feat-card:hover { transform: translateY(-4px); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,158,11,.45); }
        .btn-outline:hover { background: rgba(245,158,11,.08) !important; border-color: #f59e0b !important; }
        .nav-link:hover { color: #f59e0b; background: rgba(245,158,11,.06); }
      `}</style>

      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-50"
        style={{
          background: "rgba(8,8,16,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(245,158,11,0.08)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => go("/")}
        >
          <LogoIcon size={36} />
          <span
            className="font-orbitron text-base font-black tracking-widest"
            style={{ color: "#f59e0b" }}
          >
            CRYPTOMINE
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <span
              key={l.path}
              onClick={() => go(l.path)}
              className={`nav-link font-rajdhani font-semibold text-sm tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === l.path ? "nav-link-active" : "text-slate-400"}`}
            >
              {l.label}
            </span>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => go("/login")}
            className="font-rajdhani font-bold text-sm tracking-widest px-5 py-2.5 rounded-lg transition-all duration-200 btn-outline"
            style={{
              color: "#f59e0b",
              border: "1.5px solid rgba(245,158,11,0.4)",
              background: "transparent",
            }}
          >
            LOGIN
          </button>
          <button
            onClick={() => go("/register")}
            className="font-rajdhani font-bold text-sm tracking-widest px-5 py-2.5 rounded-lg transition-all duration-200 btn-primary"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#f97316)",
              color: "#080810",
              border: "none",
            }}
          >
            SIGN UP
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="flex md:hidden flex-col gap-1.5 p-1.5 bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen((p) => !p)}
        >
          <span className={`hamburger-bar ${menuOpen ? "ham-open-1" : ""}`} />
          <span className={`hamburger-bar ${menuOpen ? "ham-open-2" : ""}`} />
          <span className={`hamburger-bar ${menuOpen ? "ham-open-3" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 flex flex-col px-5 py-6 gap-1"
          style={{
            background: "rgba(8,8,16,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(245,158,11,0.1)",
          }}
        >
          {NAV_LINKS.map((l) => (
            <span
              key={l.path}
              onClick={() => go(l.path)}
              className={`font-rajdhani font-bold text-lg tracking-wider px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 ${location.pathname === l.path ? "nav-link-active" : "text-slate-400"}`}
              style={{
                border:
                  location.pathname === l.path
                    ? "1px solid rgba(245,158,11,0.15)"
                    : "1px solid transparent",
              }}
            >
              {l.label}
            </span>
          ))}
          <div
            className="h-px my-3"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          <button
            onClick={() => go("/login")}
            className="font-rajdhani font-bold text-base tracking-widest w-full py-3.5 rounded-xl transition-all btn-outline"
            style={{
              color: "#f59e0b",
              border: "1.5px solid rgba(245,158,11,0.4)",
              background: "transparent",
            }}
          >
            LOGIN
          </button>
          <button
            onClick={() => go("/register")}
            className="font-rajdhani font-bold text-base tracking-widest w-full py-3.5 rounded-xl transition-all mt-1 btn-primary"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#f97316)",
              color: "#080810",
              border: "none",
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>
      )}
    </>
  );
};

export const GuestFooter = () => {
  const navigate = useNavigate();
  return (
    <footer
      className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 py-8"
      style={{
        background: "#0a0a12",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <LogoIcon size={28} />
        <span
          className="font-orbitron text-xs font-black tracking-widest"
          style={{ color: "#f59e0b" }}
        >
          CRYPTOMINE
        </span>
      </div>
      <p className="text-sm" style={{ color: "white" }}>
        © 2026 CryptoMine. All rights reserved.
      </p>
      <p className="text-xs" style={{ color: "white" }}>
        Mining involves risk. Past returns do not guarantee future results.
      </p>
    </footer>
  );
};
