import React from "react";
import { fmt, STATUS } from "./Transactionlist";

const TransactionHistory = ({ details, onClose }) => {
  const status = details?.status?.toLowerCase() || "pending";
  const statusInfo = STATUS[status] || STATUS.pending;
  const isDeposit = !!details?.amount;

  const InfoRow = ({ label, value, mono = false, accent = false }) => (
    <div
      className="flex flex-col gap-1.5 py-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span
        className="raj font-bold text-xs tracking-widest uppercase"
        style={{ color: "#334155" }}
      >
        {label}
      </span>
      <span
        className={
          mono ? "font-mono break-all text-sm" : "raj font-semibold text-sm"
        }
        style={{ color: accent ? "#f59e0b" : "#f1f5f9", lineHeight: 1.6 }}
      >
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[2016] flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(245,158,11,0.15)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "#1e293b" }}
          />
        </div>

        {/* amber top accent */}
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  transform: "scale(1.3)",
                  filter: "blur(4px)",
                }}
              />
              <img
                src={`/assets/images/coins/${details?.coin_symbol?.toLowerCase()}-logo.png`}
                alt={details?.coin_symbol}
                className="relative w-11 h-11 rounded-full object-contain"
                style={{ background: "white", padding: 2 }}
                onError={(e) => {
                  e.target.style.background = "rgba(245,158,11,0.1)";
                }}
              />
            </div>
            <div>
              <p
                className="orb font-black text-base"
                style={{ color: "#f1f5f9" }}
              >
                Transaction Details
              </p>
              <p
                className="raj font-medium text-xs mt-0.5"
                style={{ color: "#475569" }}
              >
                {details?.coin_symbol} · {isDeposit ? "Deposit" : "Withdrawal"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border-none cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status + amount hero */}
        <div
          className="flex flex-col items-center py-8 gap-3 relative"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.01)",
          }}
        >
          {/* ambient */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 160,
              height: 160,
              background: `radial-gradient(circle,${statusInfo.color}12,transparent 70%)`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          />

          {/* status icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
            style={{
              background: `${statusInfo.color}15`,
              border: `2px solid ${statusInfo.color}35`,
            }}
          >
            {status === "approved" && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5 9-9"
                  stroke={statusInfo.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {status === "pending" && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke={statusInfo.color}
                  strokeWidth="2"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke={statusInfo.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {status === "rejected" && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={statusInfo.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <span
            className="raj font-black text-sm px-4 py-1.5 rounded-full relative z-10"
            style={{
              background: statusInfo.bg,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.border}`,
            }}
          >
            {statusInfo.label}
          </span>

          {isDeposit && (
            <div className="text-center relative z-10">
              <p
                className="raj font-semibold text-xs mb-1"
                style={{ color: "#475569" }}
              >
                Amount
              </p>
              <p
                className="orb font-black"
                style={{
                  fontSize: "clamp(28px,8vw,44px)",
                  color: "#f1f5f9",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {parseFloat(details.amount).toFixed(2)}
              </p>
              <p
                className="raj font-bold text-sm mt-1"
                style={{ color: "#64748b" }}
              >
                {details?.coin_symbol} USDT
              </p>
            </div>
          )}

          {details?.created_at && (
            <p
              className="raj font-medium text-xs relative z-10"
              style={{ color: "#334155" }}
            >
              {fmt(details.created_at)}
            </p>
          )}
        </div>

        {/* Detail rows */}
        <div className="px-6 pb-6">
          <InfoRow label="Transaction Hash" value={details?.trans_hash} mono />
          <InfoRow label="From Address" value={details?.wallet_from} mono />
          <InfoRow label="To Address" value={details?.wallet_to} mono />
          <InfoRow
            label="Asset"
            value={`${details?.coin_symbol} Wallet`}
            accent
          />
          <InfoRow label="Type" value={isDeposit ? "Deposit" : "Withdrawal"} />
          {isDeposit && (
            <InfoRow
              label="Amount"
              value={`${parseFloat(details?.amount || 0).toFixed(4)} USDT`}
              accent
            />
          )}
          <div className="pt-2" style={{ borderBottom: "none" }}>
            <span
              className="raj font-bold text-xs tracking-widest uppercase"
              style={{ color: "#334155" }}
            >
              Status
            </span>
            <div className="mt-2">
              <span
                className="raj font-black text-sm px-4 py-2 rounded-xl"
                style={{
                  background: statusInfo.bg,
                  color: statusInfo.color,
                  border: `1px solid ${statusInfo.border}`,
                }}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748b",
              letterSpacing: 2,
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
