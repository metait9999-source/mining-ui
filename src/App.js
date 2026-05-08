import React, { useState, useEffect } from "react";
import "./App.css";
import Home from "./Components/Home/Home";
import GuestHome from "./Components/GuestHome/GuestHome";
import Profile from "./Components/Profile/Profile";
import Account from "./Components/Account/Account";
import Notification from "./Components/Notification/Notification";
import Transaction from "./Components/Transaction/Transaction";
import ProfitStatistics from "./Components/ProfitStatistics/ProfitStatistics";
import Funds from "./Components/Funds/Funds";
// import Business from "./Components/Business/Business";
// import Contact from "./Components/Contact/Contact";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import { useUser } from "./context/UserContext";
import Spinner from "./Components/Spinner/Spinner";
import "react-toastify/dist/ReactToastify.css";
// import Converter from "./Components/Converter/Converter";
import Layout from "./Components/AdminComponents/Layout";
import AdminLogin from "./Components/AdminComponents/AdminLogin/AdminLogin";
import AdminRoute from "./Components/AdminComponents/AdminRoute";
import NotFound from "./Components/NotFound/NotFound";
import ChatComponent from "./Components/ChatComponent/ChatComponent";
import useListenMessages from "./hooks/useListenMessages";
import useConversation from "./zustand/useConversion";
import ArbitrageRoot from "./Components/Arbitrage/Arbitrage";
import MiningMachine from "./Components/MiningMachine/MiningMachine";
import LeaseMining from "./Components/MiningMachine/LeaseMining";
// import LoanHistory from "./Components/HelpLoan/LoanHistory";
// import HelpLoan from "./Components/HelpLoan/LoanApply";
// import HelpLoanLanding from "./Components/HelpLoan/LoanLanding";
import { Toaster } from "react-hot-toast";
import FaceVerification from "./Components/Settings/FaceVerification";
import TwoFactorAuth from "./Components/Settings/TwoFactorAuth";
import { IoClose } from "react-icons/io5";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
// import ChangePasscode from "./Components/Passcode/ChangePasscode";
import AboutUs from "./Components/Settings/About";
import { useRef } from "react";
import GuestPlans from "./Components/GuestHome/GuestPlan";
import GuestFeatures from "./Components/GuestHome/GuestFeatures";
import GuestAbout from "./Components/GuestHome/GuestAbout";
import GuestSupport from "./Components/GuestHome/GuestSupport";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Referral from "./Components/Refferal/Referrale";

const ContactMenuOption = ({ href, icon, label, sublabel, gradient }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      onTouchEnd={() => {
        window.location.href = href;
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 16,
        cursor: "pointer",
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(245,158,11,0.05)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 14,
            color: "#f1f5f9",
            lineHeight: 1.2,
          }}
        >
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", marginTop: 2 }}>
          {sublabel}
        </p>
      </div>
    </a>
  );
};

const DraggableChatButton = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [pos, setPos] = useState({
    x: window.innerWidth - 120,
    y: window.innerHeight - 120,
  });
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (
        btnRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      )
        return;
      setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  if (location.pathname === "/live-chat") return null;

  const clamp = (x, y) => ({
    x: Math.max(10, Math.min(window.innerWidth - 70, x)),
    y: Math.max(10, Math.min(window.innerHeight - 70, y)),
  });

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    dragStart.current = {
      x: t.clientX - posRef.current.x,
      y: t.clientY - posRef.current.y,
    };
    setDragging(false);
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      e.preventDefault();
      setPos(
        clamp(t.clientX - dragStart.current.x, t.clientY - dragStart.current.y),
      );
      setDragging(true);
    }
  };
  const handleTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    setDragging(false);
    if (Math.sqrt(dx * dx + dy * dy) < 8) {
      e.preventDefault();
      if (document.activeElement) document.activeElement.blur();
      setShowMenu((p) => !p);
    }
  };
  const handleMouseDown = (e) => {
    if (document.activeElement) document.activeElement.blur();
    const sx = e.clientX,
      sy = e.clientY;
    dragStart.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    let moved = false;
    const onMove = (e) => {
      const dx = e.clientX - sx,
        dy = e.clientY - sy;
      if (Math.sqrt(dx * dx + dy * dy) > 8) {
        moved = true;
        setDragging(true);
        setPos(
          clamp(
            e.clientX - dragStart.current.x,
            e.clientY - dragStart.current.y,
          ),
        );
      }
    };
    const onUp = () => {
      setDragging(false);
      if (!moved) setShowMenu((p) => !p);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const menuBottom = window.innerHeight - pos.y + 16;
  const menuRight = window.innerWidth - pos.x - 56;

  return (
    <div ref={btnRef}>
      {showMenu && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            bottom: menuBottom,
            right: menuRight,
            zIndex: 9998,
            animation: "fadeSlideUp 0.2s ease",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: 256,
              background: "#0d0d1a" /* was #111118 */,
              borderRadius: 24,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)",
              overflow: "hidden",
              border:
                "1px solid rgba(245,158,11,0.15)" /* was rgba(255,255,255,0.07) */,
            }}
          >
            {/* Amber top accent — NEW */}
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
              }}
            />

            {/* Header — was purple, now amber */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,#f59e0b,#f97316)" /* was #6366f1→#a855f7 */,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background:
                      "rgba(8,8,16,0.25)" /* was rgba(255,255,255,0.2) */,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    color: "#080810" /* was white */,
                    fontWeight: 800,
                    fontSize: 14,
                    margin: 0,
                    fontFamily: "'Orbitron',sans-serif",
                    letterSpacing: 1,
                  }}
                >
                  Contact Us
                </p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background:
                    "rgba(8,8,16,0.2)" /* was rgba(255,255,255,0.2) */,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#080810" /* was white */,
                }}
              >
                <IoClose size={14} />
              </button>
            </div>

            {/* Options */}
            <div style={{ padding: "8px 4px" }}>
              {/* Live Chat — icon was purple, now amber */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/live-chat");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 16,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(245,158,11,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg,#f59e0b,#f97316)" /* was #6366f1→#a855f7 */,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 10px rgba(245,158,11,0.4)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="10" r="1" fill="white" />
                    <circle cx="12" cy="10" r="1" fill="white" />
                    <circle cx="16" cy="10" r="1" fill="white" />
                  </svg>
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#f1f5f9",
                      lineHeight: 1.2,
                    }}
                  >
                    Live Chat
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "#64748b",
                      marginTop: 2,
                    }}
                  >
                    Chat with support team
                  </p>
                </div>
              </button>

              <ContactMenuOption
                href={window.__whatsapp}
                icon={<FaWhatsapp size={18} />}
                label="WhatsApp"
                sublabel="Message us on WhatsApp"
                gradient="linear-gradient(135deg,#25d366,#128c7e)"
              />
              <ContactMenuOption
                href={window.__telegram}
                icon={<FaTelegram size={18} />}
                label="Telegram"
                sublabel="Message us on Telegram"
                gradient="linear-gradient(135deg,#229ed9,#1a7fbf)"
              />
            </div>
          </div>

          {/* Arrow — bg matches card: #0d0d1a */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingRight: 14,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid #0d0d1a" /* was #111118 */,
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Floating button — was green, now amber ── */}
      <div
        data-chat-button="true"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          cursor: dragging ? "grabbing" : "pointer",
          touchAction: "pan-y",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",

            background: showMenu
              ? "linear-gradient(135deg,#d97706,#b45309)"
              : "linear-gradient(135deg,#f59e0b,#f97316)",

            boxShadow: dragging
              ? "0 12px 32px rgba(245,158,11,0.7)"
              : showMenu
                ? "0 6px 24px rgba(245,158,11,0.5)"
                : "0 6px 24px rgba(245,158,11,0.55)",
            transform: dragging
              ? "scale(1.12)"
              : showMenu
                ? "scale(1.05)"
                : "scale(1)",
            transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showMenu ? (
            <IoClose size={26} color="white" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                fill="rgba(8,8,16,0.25)"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="10" r="1.2" fill="white" />
              <circle cx="12" cy="10" r="1.2" fill="white" />
              <circle cx="16" cy="10" r="1.2" fill="white" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, loading } = useUser();
  const { setSelectedConversation, setMessages } = useConversation();
  const location = useLocation();
  useListenMessages();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { default: axios } = await import("axios");
        const { API_BASE_URL } = await import("./api/getApiURL");
        const res = await axios.get(`${API_BASE_URL}/settings`);
        window.__whatsapp = res.data?.whatsapp || null;
        window.__telegram = res.data?.telegram || null;
      } catch {}
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setMessages([]);
      setSelectedConversation(null);
    }
  }, [user, setMessages, setSelectedConversation]);

  const showMainApp = user?.status === "active";

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      <style>{`
        body { background: #0a0a0f !important; }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUpModal{ from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {loading && (
        <div id="global-loader">
          <Spinner />
        </div>
      )}

      <div className="app">
        <Routes>
          {/* ── Admin routes — always accessible regardless of user state ── */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/panel/*"
            element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }
          />

          {/* ── Authenticated user routes ── */}
          {showMainApp ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/account" element={<Account />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/profit-stat" element={<ProfitStatistics />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/funds" element={<Funds />} />
              <Route path="/arbitrage" element={<ArbitrageRoot />} />
              <Route path="/mining" element={<MiningMachine />} />
              <Route path="/mining/:id" element={<LeaseMining />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/live-chat" element={<ChatComponent />} />
              <Route path="/face-verification" element={<FaceVerification />} />
              <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/*" element={<NotFound />} />
            </>
          ) : (
            <>
              <Route path="/" element={<GuestHome />} />
              <Route path="/plans" element={<GuestPlans />} />
              <Route path="/features" element={<GuestFeatures />} />
              <Route path="/about-us" element={<GuestAbout />} />
              <Route path="/support" element={<GuestSupport />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </div>

      {showMainApp && !location.pathname.startsWith("/panel") && (
        <DraggableChatButton user={user} />
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
