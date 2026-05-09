import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import useWallets from "../../hooks/useWallets";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import { BiDollar } from "react-icons/bi";

/* ── icons ── */
const EyeOpen = () => (
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
);

const EyeOff = () => (
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
);

const SignOutIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Mining", to: "/mining" },
  { label: "Arbitrage", to: "/arbitrage" },
  { label: "Wallet", to: "/account" },
  { label: "Referral", to: "/referral" },
];

const MORE_LINKS = [{ label: "Transactions", to: "/transaction" }];

const SETTINGS_LINKS = [
  { label: "Profile", to: "/profile" },
  { label: "2FA Security", to: "/two-factor-auth" },
  { label: "Face Verify", to: "/face-verification" },
];

const LogoMark = () => (
  <div
    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
    style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#080810" />
      <path
        d="M2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="#080810"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const ChevronDown = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform .2s",
    }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const AppNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout } = useUser();
  const { wallets } = useWallets(user?.id);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [balanceVis, setBalanceVis] = useState(
    () => user?.balance_visible === 1 || user?.balance_visible === true,
  );

  const moreRef = useRef(null);
  const settRef = useRef(null);
  const userRef = useRef(null);
  const mobileRef = useRef(null);
  const hamRef = useRef(null);
  const navWrapRef = useRef(null);

  const totalBalance =
    wallets?.reduce((s, w) => s + parseFloat(w.coin_amount || 0), 0) ?? 0;

  useEffect(() => {
    const h = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target))
        setMoreOpen(false);
      if (settRef.current && !settRef.current.contains(e.target))
        setSettingsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (
        mobileRef.current &&
        !mobileRef.current.contains(e.target) &&
        hamRef.current &&
        !hamRef.current.contains(e.target)
      )
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* close all menus on route change */
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setSettingsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const toggleBalance = async () => {
    const next = !balanceVis;
    setBalanceVis(next);
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}/balance-visibility`, {
        balance_visible: next ? 1 : 0,
      });
      setUser?.((p) => ({ ...p, balance_visible: next ? 1 : 0 }));
    } catch {
      setBalanceVis(!next);
    }
  };

  const handleSignOut = () => {
    logout(); // clears user state + localStorage + sessionStorage
    navigate("/login");
  };

  const isActive = (to) => location.pathname === to;

  const linkCls = (to) =>
    `nav-link font-rajdhani font-semibold text-sm tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive(to) ? "nav-link-active" : "text-slate-400"}`;

  const dropStyle = {
    position: "absolute",
    top: "calc(100% + 8px)",
    minWidth: 180,
    background: "#0d0d1a",
    border: "1px solid rgba(245,158,11,0.12)",
    borderRadius: 16,
    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
    zIndex: 200,
    overflow: "hidden",
  };

  const DropItem = ({ to, label, onClick }) => (
    <div
      onClick={() => {
        onClick?.();
        navigate(to);
      }}
      className={`flex items-center px-4 py-3 text-sm font-semibold cursor-pointer transition-all duration-150 font-rajdhani tracking-wide ${isActive(to) ? "text-amber-400" : "text-slate-300"}`}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(245,158,11,0.06)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
      {isActive(to) && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: "#f59e0b" }}
        />
      )}
    </div>
  );

  return (
    <div ref={navWrapRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .font-orbitron { font-family:'Orbitron',sans-serif !important; }
        .font-rajdhani { font-family:'Rajdhani',sans-serif !important; }
        .nav-link-active { color:#f59e0b !important; background:rgba(245,158,11,0.1) !important; }
        .nav-link:hover { color:#f59e0b; background:rgba(245,158,11,0.06); }
        .ham-bar { width:22px; height:2px; background:#94a3b8; border-radius:2px; transition:all .3s; display:block; }
        .ham-1-open { transform:rotate(45deg) translate(5px,5px); }
        .ham-2-open { opacity:0; }
        .ham-3-open { transform:rotate(-45deg) translate(5px,-5px); }
        .signout-row:hover { background: rgba(239,68,68,0.08) !important; }
      `}</style>

      <nav
        className="sticky top-0 z-50 px-4 md:px-8"
        style={{
          background: "rgba(8,8,16,0.92)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(245,158,11,0.08)",
        }}
      >
        <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto">
          {/* ── Logo ── */}
          <div
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <LogoMark />
            <span
              className="font-orbitron font-black text-sm tracking-widest hidden sm:block"
              style={{ color: "#f59e0b" }}
            >
              CRYPTOMINE
            </span>
          </div>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <span
                key={l.to}
                className={`nav-link ${linkCls(l.to)}`}
                onClick={() => navigate(l.to)}
              >
                {l.label}
              </span>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => {
                  setMoreOpen((p) => !p);
                  setSettingsOpen(false);
                  setUserMenuOpen(false);
                }}
                className="nav-link font-rajdhani font-semibold text-sm tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 bg-transparent border-none text-slate-400"
                style={{ fontFamily: "'Rajdhani',sans-serif" }}
              >
                More <ChevronDown open={moreOpen} />
              </button>
              {moreOpen && (
                <div style={{ ...dropStyle, right: 0 }}>
                  {MORE_LINKS.map((l) => (
                    <DropItem
                      key={l.to}
                      {...l}
                      onClick={() => setMoreOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Settings dropdown */}
            <div className="relative" ref={settRef}>
              <button
                onClick={() => {
                  setSettingsOpen((p) => !p);
                  setMoreOpen(false);
                  setUserMenuOpen(false);
                }}
                className="nav-link font-rajdhani font-semibold text-sm tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 bg-transparent border-none text-slate-400"
                style={{ fontFamily: "'Rajdhani',sans-serif" }}
              >
                Settings <ChevronDown open={settingsOpen} />
              </button>
              {settingsOpen && (
                <div style={{ ...dropStyle, right: 0 }}>
                  {SETTINGS_LINKS.map((l) => (
                    <DropItem
                      key={l.to}
                      {...l}
                      onClick={() => setSettingsOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Desktop right: balance + notification ── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Notification */}
            <Link
              to="/notification"
              className="flex items-center justify-center no-underline transition-all duration-200 hover:opacity-80"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#94a3b8",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Link>

            {/* Balance pill + user menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setUserMenuOpen((p) => !p);
                  setMoreOpen(false);
                  setSettingsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl cursor-pointer border-none transition-all duration-200"
                style={{
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#10b981" }}
                />
                <span
                  className="font-orbitron font-black text-sm"
                  style={{
                    color: "#f1f5f9",
                    filter: balanceVis ? "none" : "blur(7px)",
                    transition: "filter .3s",
                    userSelect: balanceVis ? "text" : "none",
                  }}
                >
                  ${totalBalance.toFixed(2)}
                </span>
                <span
                  className="text-xs font-semibold font-rajdhani"
                  style={{ color: "#64748b" }}
                >
                  USDT
                </span>
                <ChevronDown open={userMenuOpen} />
              </button>

              {userMenuOpen && (
                <div style={{ ...dropStyle, right: 0, minWidth: 220 }}>
                  {/* Balance header */}
                  <div
                    className="px-4 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-bold tracking-widest uppercase font-rajdhani"
                        style={{ color: "#475569" }}
                      >
                        Main Wallet
                      </span>
                      <button
                        onClick={toggleBalance}
                        className="bg-transparent border-none cursor-pointer p-0"
                        style={{ color: "#64748b" }}
                      >
                        {balanceVis ? <EyeOpen /> : <EyeOff />}
                      </button>
                    </div>
                    <div
                      className="flex items-center gap-1"
                      style={{
                        filter: balanceVis ? "none" : "blur(7px)",
                        transition: "filter .3s",
                        userSelect: balanceVis ? "text" : "none",
                      }}
                    >
                      <BiDollar size={20} style={{ color: "#f59e0b" }} />
                      <span
                        className="font-orbitron font-black text-xl"
                        style={{ color: "#f1f5f9" }}
                      >
                        {totalBalance.toFixed(2)}
                      </span>
                    </div>
                    {user?.name && (
                      <p
                        className="text-xs mt-2 font-rajdhani font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        {user.name}
                      </p>
                    )}
                    {user?.uuid && (
                      <p
                        className="text-xs font-rajdhani"
                        style={{ color: "#334155" }}
                      >
                        UID: {user.uuid}
                      </p>
                    )}
                  </div>

                  <DropItem
                    to="/account"
                    label="My Wallet"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <DropItem
                    to="/profile"
                    label="Profile"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <DropItem
                    to="/transaction"
                    label="Transactions"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  {/* Sign Out */}
                  <div
                    className="signout-row flex items-center gap-2 px-4 py-3 text-sm font-semibold cursor-pointer transition-all duration-150 font-rajdhani tracking-wide"
                    style={{
                      color: "#ef4444",
                      borderTop: "1px solid rgba(239,68,68,0.1)",
                    }}
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleSignOut();
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(239,68,68,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <SignOutIcon />
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile right: notification + hamburger ── */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/notification"
              className="flex items-center justify-center no-underline"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#94a3b8",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Link>

            <button
              ref={hamRef}
              onClick={() => setMobileOpen((p) => !p)}
              className="flex flex-col gap-1.5 p-1.5 bg-transparent border-none cursor-pointer"
            >
              <span className={`ham-bar ${mobileOpen ? "ham-1-open" : ""}`} />
              <span className={`ham-bar ${mobileOpen ? "ham-2-open" : ""}`} />
              <span className={`ham-bar ${mobileOpen ? "ham-3-open" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ══ Mobile menu ══ */}
      {mobileOpen && (
        <div
          ref={mobileRef}
          className="lg:hidden fixed left-0 right-0 z-40 overflow-y-auto"
          style={{
            top: 64,
            maxHeight: "calc(100vh - 64px)",
            background: "rgba(8,8,16,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(245,158,11,0.1)",
          }}
        >
          <div className="px-4 py-4 max-w-screen-xl mx-auto">
            {/* Balance card */}
            <div
              className="rounded-2xl px-4 py-4 mb-4"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.12)",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-bold tracking-widest uppercase font-rajdhani"
                  style={{ color: "#475569" }}
                >
                  Main Wallet
                </span>
                <button
                  onClick={toggleBalance}
                  className="bg-transparent border-none cursor-pointer p-0"
                  style={{ color: "#64748b" }}
                >
                  {balanceVis ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
              <div
                className="flex items-center gap-1"
                style={{
                  filter: balanceVis ? "none" : "blur(7px)",
                  transition: "filter .3s",
                  userSelect: balanceVis ? "text" : "none",
                }}
              >
                <BiDollar size={22} style={{ color: "#f59e0b" }} />
                <span
                  className="font-orbitron font-black text-xl"
                  style={{ color: "#f1f5f9" }}
                >
                  {totalBalance.toFixed(2)}
                </span>
                <span
                  className="font-rajdhani text-sm font-semibold ml-1"
                  style={{ color: "#64748b" }}
                >
                  USDT
                </span>
              </div>
              {user?.name && (
                <p
                  className="text-xs mt-1.5 font-rajdhani font-semibold"
                  style={{ color: "#64748b" }}
                >
                  {user.name} {user?.uuid && `· #${user.uuid}`}
                </p>
              )}
            </div>

            {/* Navigation section */}
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2 px-1 font-rajdhani"
              style={{ color: "#1e293b" }}
            >
              Navigation
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[...NAV_LINKS, ...MORE_LINKS].map((l) => (
                <button
                  key={l.to}
                  onClick={() => {
                    navigate(l.to);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left border-none cursor-pointer transition-all duration-150 font-rajdhani font-semibold text-sm tracking-wide"
                  style={{
                    background: isActive(l.to)
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive(l.to) ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"}`,
                    color: isActive(l.to) ? "#f59e0b" : "#94a3b8",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Settings section */}
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2 px-1 font-rajdhani"
              style={{ color: "#1e293b" }}
            >
              Settings
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SETTINGS_LINKS.map((l) => (
                <button
                  key={l.to}
                  onClick={() => {
                    navigate(l.to);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left border-none cursor-pointer transition-all duration-150 font-rajdhani font-semibold text-sm tracking-wide"
                  style={{
                    background: isActive(l.to)
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive(l.to) ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"}`,
                    color: isActive(l.to) ? "#f59e0b" : "#94a3b8",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Sign Out */}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-none cursor-pointer font-rajdhani font-semibold text-sm tracking-wide transition-all duration-150"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#ef4444",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.13)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.07)")
              }
            >
              <SignOutIcon />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppNav;
