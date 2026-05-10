import React, { useEffect, useState } from "react";

const COINS = ["BTC", "ETH", "USDT", "LTC", "TRX", "XMR"];
const PLANS = ["Starter", "Pro", "Elite", "Ultimate", "Diamond"];
const ACTIONS = [
  {
    type: "mining",
    template: (plan, coin, amount) =>
      `Subscribed to ${plan} Mining Plan — ${amount} ${coin}`,
  },
  {
    type: "deposit",
    template: (plan, coin, amount) =>
      `Deposited ${amount} ${coin} successfully`,
  },
  {
    type: "payout",
    template: (plan, coin, amount) =>
      `Mining payout of ${amount} ${coin} credited`,
  },
  {
    type: "arbitrage",
    template: (plan, coin, amount) =>
      `Started ${plan} Arbitrage — ${amount} ${coin}`,
  },
  {
    type: "profit",
    template: (plan, coin, amount) =>
      `Earned ${amount} ${coin} from ${plan} plan`,
  },
];

const DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "proton.me",
];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

const COUNTRIES = [
  { flag: "🇺🇸", name: "US" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇩🇪", name: "DE" },
  { flag: "🇯🇵", name: "JP" },
  { flag: "🇨🇦", name: "CA" },
  { flag: "🇦🇺", name: "AU" },
  { flag: "🇸🇬", name: "SG" },
  { flag: "🇦🇪", name: "AE" },
  { flag: "🇫🇷", name: "FR" },
  { flag: "🇧🇷", name: "BR" },
  { flag: "🇮🇳", name: "IN" },
  { flag: "🇳🇬", name: "NG" },
];

const ICON_MAP = {
  mining: {
    icon: "⛏️",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
  },
  deposit: {
    icon: "💰",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
  payout: {
    icon: "✅",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
  },
  arbitrage: {
    icon: "⚡",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.25)",
  },
  profit: {
    icon: "📈",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.25)",
  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(coin) {
  if (coin === "BTC") return (Math.random() * 0.05 + 0.001).toFixed(4);
  if (coin === "ETH") return (Math.random() * 1.5 + 0.1).toFixed(3);
  if (coin === "USDT") return randomInt(50, 5000).toString();
  if (coin === "LTC") return (Math.random() * 5 + 0.5).toFixed(3);
  if (coin === "TRX") return randomInt(200, 10000).toString();
  if (coin === "XMR") return (Math.random() * 2 + 0.1).toFixed(4);
  return randomInt(10, 1000).toString();
}

function maskEmail() {
  // e.g. "ab*****yz@gmail.com"
  const prefixLen = randomInt(4, 9);
  const prefix = Array.from(
    { length: prefixLen },
    () => CHARS[randomInt(0, CHARS.length - 1)],
  ).join("");
  const visible = prefix.slice(0, 2);
  const stars = "*".repeat(Math.max(3, prefixLen - 4));
  const tail = prefix.slice(-2);
  const domain = DOMAINS[randomInt(0, DOMAINS.length - 1)];
  return `${visible}${stars}${tail}@${domain}`;
}

function generateNotification() {
  const action = ACTIONS[randomInt(0, ACTIONS.length - 1)];
  const coin = COINS[randomInt(0, COINS.length - 1)];
  const plan = PLANS[randomInt(0, PLANS.length - 1)];
  const amount = randomAmount(coin);
  const country = COUNTRIES[randomInt(0, COUNTRIES.length - 1)];
  const email = maskEmail();
  const minsAgo = randomInt(1, 59);

  return {
    id: Date.now() + Math.random(),
    type: action.type,
    message: action.template(plan, coin, amount),
    email,
    country,
    minsAgo,
    coin,
    amount,
  };
}

function timeAgo(mins) {
  if (mins < 2) return "just now";
  return `${mins}m ago`;
}

export default function LiveNotification() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [current, setCurrent] = useState(null);

  const showNext = () => {
    setLeaving(false);
    setCurrent(generateNotification());
    setVisible(true);

    // Start leave animation after 4.5s
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
    }, 4500);

    // Hide fully after 5.2s
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5200);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
    };
  };

  useEffect(() => {
    // First show after 2s
    const first = setTimeout(() => {
      showNext();
    }, 2000);

    return () => clearTimeout(first);
  }, []);

  useEffect(() => {
    if (!visible && current) {
      // Wait 3s between toasts then show next
      const next = setTimeout(() => {
        showNext();
      }, 3000);
      return () => clearTimeout(next);
    }
  }, [visible]);

  if (!current || !visible) return null;

  const style = ICON_MAP[current.type];

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-110%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-110%); opacity: 0; }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        .live-notif {
          animation: slideInLeft 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .live-notif.leaving {
          animation: slideOutLeft 0.4s ease-in both;
        }
      `}</style>

      <div
        className={`live-notif${leaving ? " leaving" : ""}`}
        style={{
          position: "fixed",
          bottom: "clamp(16px, 4vw, 28px)",
          left: "clamp(12px, 3vw, 24px)",
          zIndex: 9999,
          width: "clamp(280px, 88vw, 360px)",
          background: "#0d0d1a",
          border: `1px solid ${style.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${style.border}`,
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            height: 2,
            background: `${style.color}30`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: style.color,
              animation: "progressBar 4.5s linear forwards",
            }}
          />
        </div>

        <div style={{ padding: "clamp(10px,3vw,14px) clamp(12px,3.5vw,16px)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {/* Icon */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                flexShrink: 0,
                background: style.bg,
                border: `1px solid ${style.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {style.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Email + country */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(11px,2.8vw,12px)",
                    fontWeight: 700,
                    color: style.color,
                    fontFamily: "'Rajdhani', sans-serif",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "75%",
                  }}
                >
                  {current.email}
                </span>
                <span
                  style={{
                    fontSize: "clamp(10px,2.5vw,11px)",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    flexShrink: 0,
                  }}
                >
                  {current.country.flag} {current.country.name}
                </span>
              </div>

              {/* Message */}
              <div
                style={{
                  fontSize: "clamp(12px,3vw,13px)",
                  color: "#cbd5e1",
                  lineHeight: 1.45,
                  fontWeight: 500,
                  fontFamily: "'Rajdhani', sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {current.message}
              </div>

              {/* Time */}
              <div
                style={{
                  fontSize: "clamp(10px,2.3vw,11px)",
                  color: "#334155",
                  marginTop: 5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                />
                {timeAgo(current.minsAgo)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
