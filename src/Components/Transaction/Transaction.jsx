import React, { useState } from "react";
import { useNavigate } from "react-router";
import AppNav from "../Home/Navbar";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import TransactionHistory from "./TransactionHistory";

const TABS = [
  {
    key: "deposit",
    label: "Deposits",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v14M5 10l7 7 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 21h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#10b981",
  },
  {
    key: "withdraw",
    label: "Withdrawals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21V7M5 14l7-7 7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 3h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#f59e0b",
  },
];

const Transaction = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [showHistory, setShowHistory] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const navigate = useNavigate();

  const openTransactionHistory = (details) => {
    setTransactionDetails(details);
    setShowHistory(true);
  };
  const closeTransactionHistory = () => {
    setShowHistory(false);
    setTransactionDetails(null);
  };

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        @keyframes dot-blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .live-dot{animation:dot-blink 2s ease-in-out infinite}
        .tab-pill{transition:all .2s}
        .tab-pill:hover{opacity:.85}
        .fund-btn{transition:transform .2s,box-shadow .2s}
        .fund-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(245,158,11,0.3)!important}
        .fund-btn:active{transform:scale(.98)}
        ::placeholder{color:#334155}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ── HERO / FUND WALLET CARD ── */}
        <div className="mt-6 fup">
          <div
            className="relative rounded-3xl overflow-hidden fund-btn cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#0f1020,#0d0d1a 55%,#140f1a)",
              border: "1px solid rgba(245,158,11,0.14)",
            }}
            onClick={() => navigate("/account")}
          >
            {/* ambient glow */}
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                background:
                  "radial-gradient(circle,rgba(245,158,11,.1),transparent 70%)",
              }}
            />
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
              }}
            />

            <div className="relative z-10 flex items-center justify-between p-5 md:p-7">
              <div className="flex items-center gap-4">
                {/* icon */}
                <div
                  className="relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    boxShadow: "0 6px 20px rgba(245,158,11,0.4)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 3H8L6 7h12l-2-4z"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="17" cy="13" r="1.5" fill="white" />
                  </svg>
                  <span
                    className="live-dot absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2"
                    style={{ borderColor: "#080810" }}
                  />
                </div>
                <div>
                  <p className="orb font-black text-base text-white mb-0.5">
                    Fund Wallet
                  </p>
                  <p
                    className="raj font-medium text-xs"
                    style={{ color: "#64748b" }}
                  >
                    Deposit or withdraw from your wallet
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="hidden sm:block raj font-bold text-sm"
                  style={{ color: "#f59e0b" }}
                >
                  Go to Wallet
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB PILLS ── */}
        <div className="mt-6 fup2">
          <div className="flex gap-3 mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="tab-pill flex items-center gap-2 px-5 py-3 rounded-2xl raj font-bold text-sm border-none cursor-pointer"
                style={{
                  background:
                    activeTab === t.key
                      ? `${t.color}18`
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeTab === t.key ? `${t.color}40` : "rgba(255,255,255,0.07)"}`,
                  color: activeTab === t.key ? t.color : "#64748b",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Divider with label */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
            <span
              className="raj font-bold text-xs tracking-widest uppercase"
              style={{ color: "#1e293b" }}
            >
              {activeTab === "deposit"
                ? "Deposit History"
                : "Withdrawal History"}
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>

          {activeTab === "deposit" ? (
            <Deposit openTransactionHistory={openTransactionHistory} />
          ) : (
            <Withdraw openTransactionHistory={openTransactionHistory} />
          )}
        </div>
      </div>

      {showHistory && (
        <TransactionHistory
          details={transactionDetails}
          onClose={closeTransactionHistory}
        />
      )}
    </div>
  );
};

export default Transaction;
