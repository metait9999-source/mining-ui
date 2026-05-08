import React from "react";
import { useNavigate } from "react-router-dom";
import { GuestNav, GuestFooter } from "./GuestLayout";

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7l10 5 10-5-10-5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#f59e0b",
    title: "Distributed Mining Nodes",
    desc: "Our infrastructure spans 40+ Tier-4 data centers across 6 continents. Redundant power, cooling, and network connections ensure your machines never go offline.",
    points: [
      "40+ global data centers",
      "99.9% uptime SLA",
      "N+1 power redundancy",
      "Tier-4 certified facilities",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 6v6l4 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#f97316",
    title: "Real-Time Earnings Dashboard",
    desc: "Watch your hashrate, daily earnings, and total returns update live every second. Full transparency into exactly what your hardware is producing.",
    points: [
      "Second-by-second updates",
      "Hashrate monitoring",
      "Profit/loss analytics",
      "Export earnings history",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#a855f7",
    title: "Military-Grade Security",
    desc: "Your assets are protected at every layer. From AES-256 encryption to hardware security modules and cold storage custody of principal funds.",
    points: [
      "AES-256 encryption",
      "Cold storage custody",
      "Multi-sig wallets",
      "2FA & biometric auth",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2v20M2 12h20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    color: "#10b981",
    title: "Instant Withdrawals",
    desc: "No lock-in on your earnings. Withdraw to any wallet address at any time with zero waiting periods. Principal returns automatically at plan maturity.",
    points: [
      "Zero holding periods",
      "Any wallet supported",
      "Auto principal return",
      "Low gas fee optimization",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#3b82f6",
    title: "Referral Rewards",
    desc: "Earn passive income on top of your mining returns by referring new miners. Multi-tier commissions paid out instantly on every deposit your referrals make.",
    points: [
      "Multi-tier commissions",
      "Instant referral payouts",
      "Dedicated referral link",
      "Real-time referral tracking",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#ef4444",
    title: "24/7 Support",
    desc: "Our expert support team is available around the clock via live chat, WhatsApp, and Telegram. Average response time under 2 minutes.",
    points: [
      "24/7 live chat support",
      "WhatsApp & Telegram",
      "<2 min response time",
      "Dedicated account managers",
    ],
  },
];

const GuestFeatures = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <GuestNav />

      {/* Hero */}
      <div
        className="relative px-6 md:px-10 py-20 text-center overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#0d0d20 0%,#080810 60%)",
          borderBottom: "1px solid rgba(245,158,11,.08)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,158,11,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.03) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto animate-fade-up">
          <p
            className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-4"
            style={{ color: "#f59e0b" }}
          >
            Platform Features
          </p>
          <h1
            className="font-orbitron font-black mb-5"
            style={{ fontSize: "clamp(28px,5vw,56px)" }}
          >
            Everything You Need to{" "}
            <span style={{ color: "#f59e0b" }}>Mine Smarter</span>
          </h1>
          <p
            className="font-rajdhani text-base leading-relaxed"
            style={{ color: "#64748b" }}
          >
            Built from the ground up for performance, security, and
            transparency. Here's what makes CryptoMine different.
          </p>
        </div>
      </div>

      {/* Features list */}
      <section className="px-6 md:px-10 py-20 max-w-6xl mx-auto">
        <div className="flex flex-col gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feat-card rounded-2xl p-8 flex flex-col md:flex-row gap-8 transition-all duration-300"
              style={{
                background: "#0d0d1a",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
              </div>
              {/* Text */}
              <div className="flex-1">
                <h3
                  className="font-orbitron font-black text-xl mb-3"
                  style={{ color: f.color }}
                >
                  {f.title}
                </h3>
                <p
                  className="font-rajdhani text-base leading-relaxed mb-6"
                  style={{ color: "#94a3b8" }}
                >
                  {f.desc}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {f.points.map((pt, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: f.color }}
                      />
                      <span
                        className="font-rajdhani text-sm font-600"
                        style={{ color: "#64748b" }}
                      >
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div
        className="mx-4 md:mx-10 mb-20 rounded-3xl px-8 py-14 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#0f0f1f,#161628)",
          border: "1px solid rgba(245,158,11,.12)",
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 300,
            height: 150,
            background:
              "radial-gradient(ellipse,rgba(245,158,11,.1),transparent 70%)",
          }}
        />
        <h3 className="font-orbitron font-black text-2xl mb-3 relative z-10">
          Ready to experience all of this?
        </h3>
        <p
          className="font-rajdhani text-base mb-8 relative z-10"
          style={{ color: "#64748b" }}
        >
          Create your free account and start mining in under 2 minutes.
        </p>
        <div className="flex flex-wrap gap-4 justify-center relative z-10">
          <button
            onClick={() => navigate("/register")}
            className="font-rajdhani font-bold tracking-widest px-10 py-4 rounded-xl border-none cursor-pointer btn-primary transition-all duration-200"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#f97316)",
              color: "#080810",
              fontSize: 15,
            }}
          >
            GET STARTED FREE
          </button>
          <button
            onClick={() => navigate("/plans")}
            className="font-rajdhani font-bold tracking-widest px-10 py-4 rounded-xl cursor-pointer btn-outline transition-all duration-200"
            style={{
              background: "transparent",
              color: "#f59e0b",
              border: "1.5px solid rgba(245,158,11,.5)",
              fontSize: 15,
            }}
          >
            VIEW PLANS
          </button>
        </div>
      </div>

      <GuestFooter />
    </div>
  );
};

export default GuestFeatures;
