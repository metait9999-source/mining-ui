import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import useWallets from "../../hooks/useWallets";
import AppNav from "./Navbar";

const Icons = {
  mining: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M14.5 2.5l7 7-10 10-7-7 10-10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M2 22l4-4M15 8l1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  arb: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 3h5v5M4 20L21 3M21 16v5h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wallet: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 12h.01M2 10h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3v18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 16l4-4 4 4 4-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  loan: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  tx: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  funds: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  shield: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  zap: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  globe: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const QUICK = [
  {
    label: "Mining",
    to: "/mining",
    icon: Icons.mining,
    c1: "#f59e0b",
    c2: "#f97316",
  },
  {
    label: "Wallet",
    to: "/account",
    icon: Icons.wallet,
    c1: "#10b981",
    c2: "#059669",
  },
  {
    label: "Arbitrage",
    to: "/arbitrage",
    icon: Icons.arb,
    c1: "#3b82f6",
    c2: "#6366f1",
  },
  {
    label: "Transactions",
    to: "/transaction",
    icon: Icons.tx,
    c1: "#14b8a6",
    c2: "#0891b2",
  },
];

const STATS = [
  { val: "847K+", lbl: "Active Miners", color: "#f59e0b" },
  { val: "$2.4B", lbl: "Total Mined", color: "#10b981" },
  { val: "99.9%", lbl: "Uptime", color: "#3b82f6" },
  { val: "180+", lbl: "Countries", color: "#a855f7" },
];

const SH = ({ title, action, onAction }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <div
        className="w-0.5 h-5 rounded-full"
        style={{ background: "linear-gradient(to bottom,#f59e0b,#f97316)" }}
      />
      <span
        className="font-black tracking-wider"
        style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: "clamp(13px,3.5vw,16px)",
          color: "#f1f5f9",
        }}
      >
        {title}
      </span>
    </div>
    {action && (
      <button
        onClick={onAction}
        className="text-xs font-semibold bg-transparent border-none cursor-pointer"
        style={{
          fontFamily: "'Rajdhani',sans-serif",
          color: "#f59e0b",
          letterSpacing: 1,
        }}
      >
        {action} ›
      </button>
    )}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { wallets } = useWallets(user?.id);
  const total =
    wallets?.reduce((s, w) => s + parseFloat(w.coin_amount || 0), 0) ?? 0;

  return (
    <div
      className="min-h-screen pb-12"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        @keyframes fa{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fb{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fc{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fa{animation:fa 3.8s ease-in-out infinite}
        .fb{animation:fb 3.8s ease-in-out infinite;animation-delay:.8s}
        .fc{animation:fc 3.8s ease-in-out infinite;animation-delay:1.5s}
        .fup{animation:fup .55s ease both}
        .qb{transition:transform .18s}
        .qb:hover{transform:translateY(-4px)}
        .qb:active{transform:scale(.9)}
        .sc{transition:transform .22s,border-color .22s;cursor:pointer}
        .sc:hover{transform:translateY(-5px)}
        .tc{transition:transform .2s}
        .tc:hover{transform:translateY(-3px)}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* BALANCE CARD */}
        <div className="mt-6 fup">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#0f1020,#0d0d1a 55%,#140f1a)",
              border: "1px solid rgba(245,158,11,0.14)",
            }}
          >
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: -70,
                right: -70,
                width: 240,
                height: 240,
                background:
                  "radial-gradient(circle,rgba(245,158,11,.1),transparent 70%)",
              }}
            />
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                bottom: -50,
                left: -50,
                width: 180,
                height: 180,
                background:
                  "radial-gradient(circle,rgba(249,115,22,.07),transparent 70%)",
              }}
            />
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
              }}
            />

            <div className="relative z-10 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                  <p
                    className="raj text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: "#475569" }}
                  >
                    Total Portfolio
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="orb font-black"
                      style={{
                        fontSize: "clamp(30px,7vw,52px)",
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      ${total.toFixed(2)}
                    </span>
                    <span
                      className="raj font-bold text-base"
                      style={{ color: "#475569" }}
                    >
                      USDT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-2 h-2 flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "#10b981",
                          animation: "pulse-ring 2s ease-out infinite",
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#10b981" }}
                      />
                    </div>
                    <span
                      className="raj font-bold text-xs tracking-widest uppercase"
                      style={{ color: "#10b981" }}
                    >
                      Live Balance
                    </span>
                    {user?.name && (
                      <span
                        className="raj text-xs font-medium"
                        style={{ color: "#334155" }}
                      >
                        · {user.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <button
                    onClick={() => navigate("/account")}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm border-none cursor-pointer hover:opacity-85 self-start sm:self-auto"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#f97316)",
                      color: "#080810",
                      fontFamily: "'Rajdhani',sans-serif",
                      letterSpacing: 2,
                      boxShadow: "0 6px 20px rgba(245,158,11,.3)",
                    }}
                  >
                    + DEPOSIT
                  </button>
                  <div className="flex gap-2">
                    {[
                      { lbl: "Today", val: "$0.00", color: "#10b981" },
                      { lbl: "Plans", val: "0", color: "#f59e0b" },
                    ].map((s) => (
                      <div
                        key={s.lbl}
                        className="rounded-xl px-4 py-2.5 text-center"
                        style={{
                          background: "rgba(255,255,255,.03)",
                          border: "1px solid rgba(255,255,255,.06)",
                          minWidth: 80,
                        }}
                      >
                        <p
                          className="orb font-black"
                          style={{
                            fontSize: "clamp(14px,4vw,18px)",
                            color: s.color,
                          }}
                        >
                          {s.val}
                        </p>
                        <p
                          className="raj font-semibold text-xs"
                          style={{ color: "#334155" }}
                        >
                          {s.lbl}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8">
          <SH title="Quick Actions" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-4">
            {QUICK.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(q.to)}
                className="qb flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-0"
              >
                <div
                  className="rounded-2xl flex items-center justify-center"
                  style={{
                    width: "clamp(50px,12vw,62px)",
                    height: "clamp(50px,12vw,62px)",
                    background: `linear-gradient(135deg,${q.c1},${q.c2})`,
                    color: "white",
                    boxShadow: `0 6px 20px ${q.c1}40`,
                  }}
                >
                  {q.icon}
                </div>
                <span
                  className="raj font-bold text-center leading-tight"
                  style={{
                    fontSize: "clamp(9px,2.5vw,11px)",
                    color: "#64748b",
                  }}
                >
                  {q.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SERVICE CARDS */}
        <div className="mt-10">
          <SH
            title="Services"
            action="Explore"
            onAction={() => navigate("/mining")}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="sc rounded-3xl relative overflow-hidden"
              style={{
                background: "#0d0d1a",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
              onClick={() => navigate("/mining")}
            >
              <div
                className="absolute top-0 inset-x-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg,#f59e0b,#f97316,transparent)",
                }}
              />
              <div
                className="absolute top-0 right-0 w-28 h-28 pointer-events-none rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(245,158,11,.12),transparent 70%)",
                  transform: "translate(30%,-30%)",
                }}
              />
              <div className="px-6 py-7">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 fa"
                  style={{
                    background: "rgba(245,158,11,.1)",
                    border: "1px solid rgba(245,158,11,.2)",
                    color: "#f59e0b",
                  }}
                >
                  {Icons.mining}
                </div>
                <h3 className="orb font-black text-lg mb-2 text-white">
                  Cloud Mining
                </h3>
                <p
                  className="raj font-medium text-sm mb-5 leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  Deposit USDT and earn daily crypto rewards with zero hardware
                  required.
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="raj font-bold text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(245,158,11,.1)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,.2)",
                    }}
                  >
                    UP TO 5% DAILY
                  </span>
                  <span style={{ color: "#f59e0b" }}>{Icons.arrow}</span>
                </div>
              </div>
            </div>

            <div
              className="sc rounded-3xl relative overflow-hidden"
              style={{
                background: "#0d0d1a",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
              onClick={() => navigate("/arbitrage")}
            >
              <div
                className="absolute top-0 inset-x-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg,#3b82f6,#6366f1,transparent)",
                }}
              />
              <div
                className="absolute top-0 right-0 w-28 h-28 pointer-events-none rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(59,130,246,.1),transparent 70%)",
                  transform: "translate(30%,-30%)",
                }}
              />
              <div className="px-6 py-7">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 fb"
                  style={{
                    background: "rgba(59,130,246,.1)",
                    border: "1px solid rgba(59,130,246,.2)",
                    color: "#3b82f6",
                  }}
                >
                  {Icons.arb}
                </div>
                <h3 className="orb font-black text-lg mb-2 text-white">
                  AI Arbitrage
                </h3>
                <p
                  className="raj font-medium text-sm mb-5 leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  Automated smart trading across 200+ exchanges maximizing your
                  ROI 24/7.
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="flex items-center gap-1.5 raj font-bold text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(16,185,129,.1)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,.2)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{
                        background: "#10b981",
                        animation: "pulse-ring 1.8s ease-out infinite",
                      }}
                    />
                    LIVE NOW
                  </span>
                  <span style={{ color: "#3b82f6" }}>{Icons.arrow}</span>
                </div>
              </div>
            </div>
            {/* 
            <div
              className="sc rounded-3xl relative overflow-hidden"
              style={{
                background: "linear-gradient(150deg,#170f1e,#0d0d1a)",
                border: "1px solid rgba(168,85,247,0.18)",
              }}
              onClick={() => navigate("/referral-list")}
            >
              <div
                className="absolute top-0 inset-x-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#ec4899,transparent)",
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(168,85,247,.14),transparent 70%)",
                  transform: "translate(30%,30%)",
                }}
              />
              <div className="px-6 py-7">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 fc"
                  style={{
                    background: "rgba(168,85,247,.1)",
                    border: "1px solid rgba(168,85,247,.2)",
                    color: "#a855f7",
                  }}
                >
                  {Icons.users}
                </div>
                <h3 className="orb font-black text-lg mb-2 text-white">
                  Invite & Earn
                </h3>
                <p
                  className="raj font-medium text-sm mb-5 leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  Refer friends and earn multi-level commissions on every
                  deposit they make.
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="raj font-bold text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(168,85,247,.1)",
                      color: "#a855f7",
                      border: "1px solid rgba(168,85,247,.2)",
                    }}
                  >
                    MULTI-LEVEL
                  </span>
                  <span style={{ color: "#a855f7" }}>{Icons.arrow}</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* PLATFORM STATS */}
        <div className="mt-10">
          <SH title="Platform Stats" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <div
                key={s.lbl}
                className="tc rounded-2xl px-4 py-5 text-center"
                style={{
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <p
                  className="orb font-black mb-1.5"
                  style={{ fontSize: "clamp(20px,5vw,28px)", color: s.color }}
                >
                  {s.val}
                </p>
                <p
                  className="raj font-semibold text-xs tracking-widest uppercase"
                  style={{ color: "#334155" }}
                >
                  {s.lbl}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TRUST PILLARS */}
        <div className="mt-10">
          <SH title="Why CryptoMine" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Icons.shield,
                color: "#10b981",
                bg: "rgba(16,185,129,.07)",
                border: "rgba(16,185,129,.14)",
                title: "Military Security",
                desc: "256-bit encryption, cold storage & multi-sig wallets protect every asset.",
              },
              {
                icon: Icons.zap,
                color: "#f59e0b",
                bg: "rgba(245,158,11,.07)",
                border: "rgba(245,158,11,.14)",
                title: "Instant Withdrawals",
                desc: "Withdraw earnings to any wallet in minutes — zero holding periods.",
              },
              {
                icon: Icons.globe,
                color: "#3b82f6",
                bg: "rgba(59,130,246,.07)",
                border: "rgba(59,130,246,.14)",
                title: "Global Infrastructure",
                desc: "40+ Tier-4 data centers across 6 continents for non-stop mining.",
              },
            ].map((w) => (
              <div
                key={w.title}
                className="tc rounded-2xl px-5 py-5 flex items-start gap-4"
                style={{
                  background: "rgba(255,255,255,.02)",
                  border: `1px solid ${w.border}`,
                }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: w.bg,
                    border: `1px solid ${w.border}`,
                    color: w.color,
                  }}
                >
                  {w.icon}
                </div>
                <div>
                  <p
                    className="orb font-black text-sm mb-1.5"
                    style={{ color: "#f1f5f9" }}
                  >
                    {w.title}
                  </p>
                  <p
                    className="font-medium text-sm leading-relaxed"
                    style={{ color: "white" }}
                  >
                    {w.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUPPORT */}
        <div className="mt-8 mb-4">
          <div
            className="rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: "rgba(245,158,11,.04)",
              border: "1px solid rgba(245,158,11,.1)",
            }}
          >
            <div>
              <p className="orb font-black text-sm text-white mb-1">
                Need Help?
              </p>
              <p
                className="raj font-medium text-xs"
                style={{ color: "#475569" }}
              >
                24/7 support via Live Chat · WhatsApp · Telegram
              </p>
            </div>
            <button
              onClick={() => navigate("/live-chat")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs border-none cursor-pointer hover:opacity-85 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "#080810",
                fontFamily: "'Rajdhani',sans-serif",
                letterSpacing: 2,
              }}
            >
              CONTACT US {Icons.arrow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
