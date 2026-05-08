import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "../Home/Navbar";

const Header = ({ pageTitle, fallbackPath = "/" }) => {
  const [backPressed, setBackPressed] = useState(false);
  const navigate = useNavigate();

  const goBack = () => {
    setBackPressed(true);
    setTimeout(() => setBackPressed(false), 300);
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallbackPath, { replace: true });
  };

  return (
    <>
      <AppNav />

      {/* Sub-header: back button + page title */}
      <div
        className="flex items-center gap-3 px-4 md:px-8 py-3"
        style={{
          background: "#080810",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={goBack}
          className={`flex items-center justify-center flex-shrink-0 transition-all duration-150 ${backPressed ? "scale-90" : ""}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            cursor: "pointer",
            background: backPressed
              ? "rgba(245,158,11,0.15)"
              : "rgba(245,158,11,0.07)",
            border: `1px solid ${backPressed ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.15)"}`,
          }}
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 6l-6 6 6 6"
              stroke="#f97316"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {pageTitle && (
          <span
            className="font-black tracking-wider truncate"
            style={{
              fontFamily: "'Orbitron',sans-serif",
              fontSize: "clamp(13px,3.8vw,16px)",
              color: "#f1f5f9",
            }}
          >
            {pageTitle}
          </span>
        )}
      </div>
    </>
  );
};

export default Header;
