import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import useSettings from "../../../hooks/useSettings";
import useWallets from "../../../hooks/useWallets";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { BiDollar, BiWallet } from "react-icons/bi";
import { MdOutlineShowChart } from "react-icons/md";
import { GiMining } from "react-icons/gi";
import { TbChartBar } from "react-icons/tb";
import { FaInfoCircle } from "react-icons/fa";

const appName = "CRYPTOMINE";

const navItems = [
  {
    label: "Wallet",
    to: "/account",
    iconBg: "linear-gradient(135deg,#f59e0b,#f97316)",
    reactIcon: <BiWallet />,
    reactIconStyle: { fontSize: 20, color: "#fff" },
  },
  {
    label: "Trade",
    to: "/",
    iconBg: "linear-gradient(135deg,#10b981,#059669)",
    icon: "/assets/images/menu/trade.png",
  },
  {
    label: "Arbitrage",
    to: "/arbitrage",
    iconBg: "linear-gradient(135deg,#3b82f6,#6366f1)",
    reactIcon: <MdOutlineShowChart />,
    reactIconStyle: { fontSize: 20, color: "#fff" },
  },
  {
    label: "Mining",
    to: "/mining",
    iconBg: "linear-gradient(135deg,#f59e0b,#f97316)",
    reactIcon: <GiMining />,
    reactIconStyle: { fontSize: 18, color: "#fff" },
  },
  {
    label: "Help Loan",
    to: "/loan-landing",
    iconBg: "linear-gradient(135deg,#f97316,#ef4444)",
    icon: "/assets/images/menu/loan.png",
  },
  {
    label: "Profit Statistics",
    to: "/profit-stat",
    iconBg: "linear-gradient(135deg,#14b8a6,#0891b2)",
    reactIcon: <TbChartBar />,
    reactIconStyle: { fontSize: 20, color: "#fff" },
  },
  {
    label: "Transaction",
    to: "/transaction",
    iconBg: "linear-gradient(135deg,#f97316,#ef4444)",
    icon: "/assets/images/menu/transaction.png",
  },
  {
    label: "About Us",
    to: "/about",
    iconBg: "linear-gradient(135deg,#14b8a6,#0891b2)",
    reactIcon: <FaInfoCircle />,
    reactIconStyle: { fontSize: 18, color: "#fff" },
  },
];

const NavIcon = ({ reactIcon, reactIconStyle, icon, iconBg }) => (
  <div
    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
    style={{ background: iconBg || "linear-gradient(135deg,#f59e0b,#f97316)" }}
  >
    {reactIcon ? (
      <span
        className="flex items-center justify-center"
        style={reactIconStyle || {}}
      >
        {reactIcon}
      </span>
    ) : (
      <img
        src={icon}
        alt=""
        className="object-contain brightness-0 invert"
        style={{ width: 18, height: 18 }}
      />
    )}
  </div>
);

const SettingsItem = ({ gradient, icon, label, sublabel, onClick, to }) => {
  const inner = (
    <div
      className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-150 hover:bg-white/5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>
            {label}
          </p>
          {sublabel && (
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {sublabel}
            </p>
          )}
        </div>
      </div>
      <svg
        width="14"
        height="14"
        fill="none"
        stroke="#334155"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
  return to ? (
    <Link to={to} onClick={onClick} className="block no-underline">
      {inner}
    </Link>
  ) : (
    <button
      className="w-full text-left bg-transparent border-none p-0"
      onClick={onClick}
    >
      {inner}
    </button>
  );
};

const SideNav = ({ toggleMenu, setToggleMenu }) => {
  const { settings } = useSettings();
  const smartContractLink = settings?.smart_contract_link || "#";
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { wallets } = useWallets(user?.id);
  const menuRef = useRef(null);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(
    () => user?.balance_visible === 1 || user?.balance_visible === true,
  );

  const closeAll = () => {
    setSettingsVisible(false);
    setToggleMenu(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setToggleMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setToggleMenu]);

  const toggleBalance = async () => {
    const next = !balanceVisible;
    setBalanceVisible(next);
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}/balance-visibility`, {
        balance_visible: next ? 1 : 0,
      });
      setUser?.((p) => ({ ...p, balance_visible: next ? 1 : 0 }));
    } catch {
      setBalanceVisible(!next);
    }
  };

  const totalBalance =
    wallets?.reduce((sum, w) => sum + parseFloat(w.coin_amount || 0), 0) ?? 0;

  return (
    <>
      {/* ── Main Drawer ── */}
      {toggleMenu && (
        <div className="fixed inset-0 z-[2016] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setToggleMenu(false)}
          />

          {/* Drawer */}
          <div
            ref={menuRef}
            className="relative flex flex-col h-full overflow-y-auto shadow-2xl"
            style={{
              width: "min(320px,85%)",
              zIndex: 2016,
              background: "#0a0a0f",
              borderRight: "1px solid rgba(245,158,11,0.1)",
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background:
                  "linear-gradient(90deg,#f59e0b,#f97316,transparent)",
              }}
            />

            {/* Header */}
            <div
              className="px-5 pt-8 pb-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Logo row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                    className="font-black tracking-widest text-sm"
                    style={{
                      fontFamily: "'Orbitron',sans-serif",
                      color: "#f59e0b",
                    }}
                  >
                    {appName}
                  </span>
                </div>

                {/* UID badge */}
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    color: "#f59e0b",
                  }}
                >
                  {user?.uuid ? `#${user.uuid}` : "—"}
                </span>
              </div>

              {/* Balance */}
              <div
                className="rounded-2xl px-4 py-4"
                style={{
                  background: "rgba(245,158,11,0.05)",
                  border: "1px solid rgba(245,158,11,0.12)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: "#64748b" }}
                  >
                    Main Wallet
                  </span>
                  <button
                    onClick={toggleBalance}
                    className="flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
                    style={{ color: "#64748b" }}
                  >
                    {balanceVisible ? (
                      <svg
                        width="16"
                        height="16"
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
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                      </svg>
                    )}
                  </button>
                </div>
                <p
                  className="font-black flex items-center"
                  style={{
                    fontSize: "1.4rem",
                    color: "#f1f5f9",
                    filter: balanceVisible ? "blur(0)" : "blur(8px)",
                    transition: "filter 0.3s",
                    userSelect: balanceVisible ? "text" : "none",
                    fontFamily: "'Orbitron',sans-serif",
                  }}
                >
                  <BiDollar size={24} style={{ color: "#f59e0b" }} />
                  {totalBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Nav items */}
            <div className="px-3 py-4 flex-1">
              <p
                className="px-3 mb-2 text-xs font-bold tracking-widest uppercase"
                style={{ color: "#334155" }}
              >
                Navigation
              </p>
              <nav className="space-y-0.5">
                {navItems.map(
                  ({ label, icon, iconBg, to, reactIcon, reactIconStyle }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setToggleMenu(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 no-underline group"
                      style={{ textDecoration: "none" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(245,158,11,0.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <NavIcon
                        reactIcon={reactIcon}
                        reactIconStyle={reactIconStyle}
                        icon={icon}
                        iconBg={iconBg}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#cbd5e1" }}
                      >
                        {label}
                      </span>
                    </Link>
                  ),
                )}

                {/* Settings */}
                <button
                  onClick={() => setSettingsVisible(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 bg-transparent border-none cursor-pointer text-left"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,158,11,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#475569,#334155)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <path
                        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#cbd5e1" }}
                  >
                    Settings
                  </span>
                </button>

                {/* Smart Contract */}
                <a
                  href={smartContractLink}
                  onClick={() => setToggleMenu(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 no-underline"
                  style={{ textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,158,11,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="white"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#cbd5e1" }}
                  >
                    Join Smart Contract
                  </span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Bottom Sheet ── */}
      {settingsVisible && (
        <div className="fixed inset-0 z-[2018] flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setSettingsVisible(false)}
          />
          <div
            className="relative rounded-t-3xl w-full max-w-md z-10 overflow-hidden pb-8"
            style={{
              background: "#111118",
              border: "1px solid rgba(245,158,11,0.1)",
              borderBottom: "none",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#1e293b" }}
              />
            </div>

            {/* Sheet header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h3
                className="font-black tracking-wide"
                style={{
                  color: "#f1f5f9",
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 15,
                }}
              >
                Settings
              </h3>
              <button
                onClick={() => setSettingsVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <SettingsItem
              gradient="linear-gradient(135deg,#f59e0b,#f97316)"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" />
                </svg>
              }
              label="Profile"
              sublabel="View & edit your profile"
              to="/profile"
              onClick={closeAll}
            />
            <SettingsItem
              gradient="linear-gradient(135deg,#f97316,#ef4444)"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 11V7a5 5 0 0110 0v4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1.5" fill="white" />
                </svg>
              }
              label="Change Passcode"
              sublabel="Update your login passcode"
              onClick={() => {
                closeAll();
                navigate("/change-passcode");
              }}
            />
            <SettingsItem
              gradient="linear-gradient(135deg,#3b82f6,#6366f1)"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 11V7a4 4 0 018 0v4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1.5" fill="white" />
                </svg>
              }
              label="2FA Security"
              sublabel="Google Authenticator setup"
              onClick={() => {
                closeAll();
                navigate("/two-factor-auth");
              }}
            />
            <SettingsItem
              gradient="linear-gradient(135deg,#10b981,#0d9488)"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="white"
                    strokeWidth="1.8"
                  />
                </svg>
              }
              label="Face Verification"
              sublabel={
                user?.face_image
                  ? "✓ Already submitted"
                  : "Verify your identity"
              }
              onClick={() => {
                closeAll();
                navigate("/face-verification");
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SideNav;
