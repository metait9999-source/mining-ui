import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import AppNav from "../Home/Navbar";

const TwoFactorAuth = () => {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [connected, setConnected] = useState(false);
  const [showSecret, setShowSecret] = useState(true);
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/2fa/generate/${user.id}`);
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
        setConnected(res.data.connected);
      } catch {
        toast.error("Failed to load 2FA data");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const handleConnect = async () => {
    if (token.length !== 6) {
      toast.error("Enter the 6-digit code from Google Authenticator");
      return;
    }
    setConnecting(true);
    try {
      await axios.post(`${API_BASE_URL}/2fa/connect`, {
        user_id: user.id,
        token,
      });
      setConnected(true);
      setToken("");
      toast.success("Google Authenticator connected!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid code. Try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await axios.post(`${API_BASE_URL}/2fa/disconnect`, { user_id: user.id });
      setConnected(false);
      setToken("");
      const res = await axios.get(`${API_BASE_URL}/2fa/generate/${user.id}`);
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      toast.success("2FA disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const copySecret = () => {
    const copy = (txt) => {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Copied!");
    };
    navigator.clipboard
      ?.writeText(secret)
      .then(() => toast.success("Copied!"))
      .catch(() => copy(secret)) || copy(secret);
  };

  const tokenReady = token.length === 6;

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080810" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-amber-500"
            style={{
              borderColor: "rgba(245,158,11,0.2)",
              borderTopColor: "#f59e0b",
              animation: "spin .8s linear infinite",
            }}
          />
          <p className="raj font-semibold text-sm" style={{ color: "#475569" }}>
            Loading 2FA data...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .fup3{animation:fup .5s ease both;animation-delay:.2s;opacity:0}
        .act{transition:transform .18s,box-shadow .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
        .token-input{letter-spacing:.5em;text-align:center}
        .token-input::placeholder{letter-spacing:normal}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ── STATUS HERO CARD ── */}
        <div className="mt-6 fup">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: connected
                ? "linear-gradient(135deg,#064e3b,#065f46)"
                : "linear-gradient(135deg,#0f1020,#0d0d1a 55%,#140f1a)",
              border: `1px solid ${connected ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.14)"}`,
            }}
          >
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                background: `radial-gradient(circle,${connected ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.1)"},transparent 70%)`,
              }}
            />
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{
                background: connected
                  ? "linear-gradient(90deg,transparent,#10b981,#059669,transparent)"
                  : "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
              }}
            />

            <div className="relative z-10 px-6 py-7 md:px-8 flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: connected
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(245,158,11,0.1)",
                    border: `1px solid ${connected ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.2)"}`,
                  }}
                >
                  {connected ? (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="5"
                        y="11"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 11V7a4 4 0 018 0v4"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="16" r="1.5" fill="#f59e0b" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className="orb font-black text-lg"
                    style={{ color: "#f1f5f9" }}
                  >
                    Google Authenticator
                  </p>
                  <p
                    className="raj font-medium text-sm mt-1"
                    style={{ color: connected ? "#6ee7b7" : "#64748b" }}
                  >
                    {connected
                      ? "Your account is protected with 2FA"
                      : "Scan the QR code and enter the 6-digit code to connect"}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full raj font-black text-sm"
                  style={{
                    background: connected
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(245,158,11,0.1)",
                    color: connected ? "#10b981" : "#f59e0b",
                    border: `1px solid ${connected ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.2)"}`,
                  }}
                >
                  <div className="relative w-2 h-2 flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: connected ? "#10b981" : "#f59e0b",
                        animation: "pulse-ring 2s ease-out infinite",
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: connected ? "#10b981" : "#f59e0b" }}
                    />
                  </div>
                  {connected ? "CONNECTED" : "NOT CONNECTED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 fup2">
          {/* LEFT: QR + Secret */}
          <div className="flex flex-col gap-5">
            {/* QR Code card */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="px-6 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p
                  className="orb font-black text-base"
                  style={{ color: "#f1f5f9" }}
                >
                  {connected ? "Your QR Code" : "Step 1 — Scan QR Code"}
                </p>
                <p
                  className="raj font-medium text-xs mt-1"
                  style={{ color: "#475569" }}
                >
                  Open Google Authenticator → tap + → Scan QR code
                </p>
              </div>
              <div className="px-6 py-6 flex flex-col items-center gap-4">
                {qrCode ? (
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: "white",
                      boxShadow: "0 8px 28px rgba(245,158,11,0.15)",
                    }}
                  >
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      style={{
                        width: 180,
                        height: 180,
                        display: "block",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-48 h-48 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <p className="raj text-sm" style={{ color: "#334155" }}>
                      Loading QR...
                    </p>
                  </div>
                )}
                <p
                  className="raj font-medium text-xs text-center"
                  style={{ color: "#334155" }}
                >
                  Scan with Google Authenticator app
                </p>
              </div>
            </div>

            {/* Secret key */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="px-6 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p
                  className="orb font-black text-base"
                  style={{ color: "#f1f5f9" }}
                >
                  {connected ? "Secret Key" : "Step 2 — Or Enter Key Manually"}
                </p>
                <p
                  className="raj font-medium text-xs mt-1"
                  style={{ color: "#475569" }}
                >
                  In Google Authenticator tap + → Enter setup key
                </p>
              </div>
              <div className="px-6 py-5">
                <div
                  className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl mb-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <code
                    className="flex-1 break-all text-xs font-mono leading-relaxed select-all"
                    style={{ color: showSecret ? "#f1f5f9" : "#334155" }}
                  >
                    {showSecret
                      ? secret
                      : "•".repeat(Math.min(secret.length, 32))}
                  </code>
                  <button
                    onClick={() => setShowSecret((p) => !p)}
                    className="flex-shrink-0 border-none cursor-pointer bg-transparent p-1"
                    style={{ color: "#475569" }}
                  >
                    {showSecret ? (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={copySecret}
                  className="act w-full py-2.5 rounded-xl raj font-bold text-sm border-none cursor-pointer"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    color: "#f59e0b",
                  }}
                >
                  COPY SECRET KEY
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: setup steps / actions */}
          <div className="flex flex-col gap-5">
            {/* App store links — only if not connected */}
            {!connected && (
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "#0a0a14",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="px-6 py-5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p
                    className="orb font-black text-base"
                    style={{ color: "#f1f5f9" }}
                  >
                    Get the App
                  </p>
                  <p
                    className="raj font-medium text-xs mt-1"
                    style={{ color: "#475569" }}
                  >
                    Download Google Authenticator
                  </p>
                </div>
                <div className="px-6 py-5 flex gap-3">
                  <a
                    href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                    target="_blank"
                    rel="noreferrer"
                    className="act flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl no-underline raj font-bold text-sm"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "#f1f5f9",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    App Store
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                    target="_blank"
                    rel="noreferrer"
                    className="act flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl no-underline raj font-bold text-sm"
                    style={{
                      background: "rgba(16,163,74,0.1)",
                      border: "1px solid rgba(22,163,74,0.2)",
                      color: "rgb(74,222,128)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3.18 23.76a2 2 0 01-.93-1.76V1.99A2 2 0 013.18.24L13.64 12 3.18 23.76zM16.94 15.3L5.8 21.73l8.55-8.56 2.59 2.13zM20.12 13.4a2 2 0 010 3.2l-2.3 1.38-2.88-2.88 2.88-2.88 2.3 1.38zM5.8 2.27l11.14 6.43-2.59 2.13-8.55-8.56z" />
                    </svg>
                    Play Store
                  </a>
                </div>
              </div>
            )}

            {/* Token input — not connected */}
            {!connected && (
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "#0a0a14",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="px-6 py-5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p
                    className="orb font-black text-base"
                    style={{ color: "#f1f5f9" }}
                  >
                    Step 3 — Enter 6-digit Code
                  </p>
                  <p
                    className="raj font-medium text-xs mt-1"
                    style={{ color: "#475569" }}
                  >
                    Open Google Authenticator, find your entry, type the 6-digit
                    code
                  </p>
                </div>
                <div className="px-6 py-5">
                  {/* 6 visual boxes */}
                  <div className="relative mb-2">
                    <div className="flex gap-2 justify-center pointer-events-none select-none mb-3">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div
                          key={i}
                          className="w-10 h-12 md:w-12 md:h-14 rounded-xl flex items-center justify-center orb font-black text-xl"
                          style={{
                            background: token[i]
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(255,255,255,0.03)",
                            border: `1.5px solid ${token[i] ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
                            color: "#f1f5f9",
                            transition: "all .15s",
                          }}
                        >
                          {token[i] || ""}
                        </div>
                      ))}
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder=""
                      value={token}
                      onChange={(e) => setToken(e.target.value.slice(0, 6))}
                      className="token-input absolute inset-0 w-full opacity-0 cursor-text"
                      style={{ fontSize: 1 }}
                    />
                  </div>
                  <p
                    className="raj text-xs text-center"
                    style={{ color: "#334155" }}
                  >
                    Code refreshes every 30 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Connected info */}
            {connected && (
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "#0a0a14",
                  border: "1px solid rgba(16,185,129,0.15)",
                }}
              >
                <div
                  className="px-6 py-5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p
                    className="orb font-black text-base"
                    style={{ color: "#f1f5f9" }}
                  >
                    Security Status
                  </p>
                </div>
                <div className="px-6 py-4">
                  {[
                    {
                      lbl: "Status",
                      val: "Active & Connected",
                      c: "#10b981",
                      bg: "rgba(16,185,129,0.12)",
                    },
                    {
                      lbl: "Method",
                      val: "TOTP (Time-based)",
                      c: "#3b82f6",
                      bg: "rgba(59,130,246,0.12)",
                    },
                    {
                      lbl: "App",
                      val: "Google Authenticator",
                      c: "#f59e0b",
                      bg: "rgba(245,158,11,0.12)",
                    },
                    {
                      lbl: "Code Refresh",
                      val: "Every 30 seconds",
                      c: "#a855f7",
                      bg: "rgba(168,85,247,0.12)",
                    },
                  ].map((r, i, arr) => (
                    <div
                      key={r.lbl}
                      className="flex items-center justify-between py-3.5"
                      style={{
                        borderBottom:
                          i < arr.length - 1
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "none",
                      }}
                    >
                      <span
                        className="raj font-semibold text-sm"
                        style={{ color: "#475569" }}
                      >
                        {r.lbl}
                      </span>
                      <span
                        className="raj font-bold text-xs px-2.5 py-1 rounded-full"
                        style={{ background: r.bg, color: r.c }}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            {!connected ? (
              <button
                onClick={handleConnect}
                disabled={connecting || !tokenReady}
                className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                style={{
                  background: tokenReady
                    ? "linear-gradient(135deg,#f59e0b,#f97316)"
                    : "rgba(255,255,255,0.04)",
                  color: tokenReady ? "#080810" : "#334155",
                  border: `1px solid ${tokenReady ? "transparent" : "rgba(255,255,255,0.07)"}`,
                  letterSpacing: 2,
                  opacity: connecting || !tokenReady ? 0.7 : 1,
                  cursor: connecting || !tokenReady ? "not-allowed" : "pointer",
                  boxShadow: tokenReady
                    ? "0 6px 20px rgba(245,158,11,0.3)"
                    : "none",
                }}
              >
                {connecting ? "VERIFYING..." : "VERIFY & CONNECT"}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#ef4444,#f97316)",
                  color: "white",
                  letterSpacing: 2,
                  boxShadow: "0 6px 20px rgba(239,68,68,0.25)",
                  opacity: disconnecting ? 0.6 : 1,
                  cursor: disconnecting ? "not-allowed" : "pointer",
                }}
              >
                {disconnecting
                  ? "DISCONNECTING..."
                  : "DISCONNECT AUTHENTICATOR"}
              </button>
            )}

            {/* Warning */}
            <div
              className="rounded-2xl p-4 flex gap-3"
              style={{
                background: "rgba(249,115,22,0.07)",
                border: "1px solid rgba(249,115,22,0.18)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0 mt-0.5"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9v4M12 17h.01"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p
                className="raj font-medium text-xs leading-relaxed"
                style={{ color: "#fb923c" }}
              >
                Never share your QR code or secret key. Store them safely —
                you'll need them if you switch devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
