import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { format } from "date-fns";
import useWallets from "../../hooks/useWallets";
import {
  getPackages,
  getUserSubscriptions,
  subscribePackage,
  cancelSubscription,
} from "../../api/arbitrage.api";
import { useNavigate } from "react-router";
import AppNav from "../Home/Navbar";

const SUPPORTED_COINS = ["USDT", "BTC", "ETH"];
const COIN_COLORS = { USDT: "#26a17b", BTC: "#f7931a", ETH: "#627eea" };

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      bg: "rgba(16,185,129,0.12)",
      color: "#10b981",
      border: "1px solid rgba(16,185,129,0.25)",
    },
    completed: {
      bg: "rgba(100,116,139,0.12)",
      color: "#94a3b8",
      border: "1px solid rgba(100,116,139,0.2)",
    },
    cancelled: {
      bg: "rgba(239,68,68,0.12)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.25)",
    },
  };
  const s = map[status] || map.completed;
  return (
    <span
      className="px-2.5 py-1 rounded-full font-bold text-xs raj capitalize"
      style={{ background: s.bg, color: s.color, border: s.border }}
    >
      {status}
    </span>
  );
};

const CountdownTimer = ({ endDate }) => {
  const calc = useCallback(() => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [endDate]);
  const [time, setTime] = useState(calc);
  useEffect(() => {
    setTime(calc());
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  if (!time)
    return (
      <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
        Ending soon
      </span>
    );
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{
        background: "rgba(245,158,11,0.1)",
        border: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
        <path
          d="M12 6v6l4 2"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="raj font-bold text-xs" style={{ color: "#f59e0b" }}>
        {time.d}d {String(time.h).padStart(2, "0")}h{" "}
        {String(time.m).padStart(2, "0")}m {String(time.s).padStart(2, "0")}s
      </span>
    </div>
  );
};

const CoinIcon = ({ symbol, size = 36, selected = false, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
    style={{ opacity: onClick ? 1 : 0.9 }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        border: selected
          ? `2.5px solid #f59e0b`
          : "2.5px solid rgba(255,255,255,0.1)",
        boxShadow: selected ? "0 0 0 3px rgba(245,158,11,0.2)" : "none",
        transition: "border .2s, box-shadow .2s",
        background: `${COIN_COLORS[symbol] || "#333"}25`,
      }}
    >
      <img
        src={`/assets/images/coins/${symbol.toLowerCase()}-logo.png`}
        alt={symbol}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
    {onClick && (
      <span
        className="raj font-semibold text-xs"
        style={{ color: selected ? "#f59e0b" : "#64748b" }}
      >
        {symbol}
      </span>
    )}
  </button>
);

const SH = ({ title, badge }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div
      className="w-0.5 h-5 rounded-full"
      style={{ background: "linear-gradient(to bottom,#f59e0b,#f97316)" }}
    />
    <span
      className="font-black tracking-wider orb"
      style={{ fontSize: "clamp(13px,3.5vw,16px)", color: "#f1f5f9" }}
    >
      {title}
    </span>
    {badge && (
      <span
        className="px-2.5 py-1 rounded-full raj font-bold text-xs"
        style={{
          background: "rgba(16,185,129,0.12)",
          color: "#10b981",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

/* ════════════════════════════════
   HOSTING (LISTING) PAGE
════════════════════════════════ */
const HostingPage = ({
  onSubscribe,
  packages,
  subscriptions,
  loadingHistory,
  onCancel,
  wallets,
}) => {
  const totalEarned = subscriptions
    .reduce((s, x) => s + parseFloat(x.total_earned || 0), 0)
    .toFixed(4);
  const todayEarned = subscriptions
    .filter(
      (s) =>
        s.last_paid_at &&
        new Date(s.last_paid_at).toDateString() === new Date().toDateString(),
    )
    .reduce(
      (s, x) => s + (parseFloat(x.amount) * parseFloat(x.daily_rate)) / 100,
      0,
    )
    .toFixed(4);
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const supportedWallets =
    wallets?.filter((w) =>
      SUPPORTED_COINS.includes(w.coin_symbol?.toUpperCase()),
    ) || [];

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
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
                top: -80,
                right: -80,
                width: 260,
                height: 260,
                background:
                  "radial-gradient(circle,rgba(245,158,11,.09),transparent 70%)",
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
                  "radial-gradient(circle,rgba(249,115,22,.06),transparent 70%)",
              }}
            />
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
              }}
            />

            <div className="relative z-10 p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                <div className="flex-1">
                  <p
                    className="raj text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: "#475569" }}
                  >
                    Total Arbitrage Earnings
                  </p>
                  <div className="flex items-baseline gap-2.5 mb-3">
                    <span
                      className="orb font-black"
                      style={{
                        fontSize: "clamp(32px,7vw,54px)",
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      ${totalEarned}
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
                      AI Trading 24/7
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { lbl: "Today", val: `$${todayEarned}`, color: "#f59e0b" },
                    {
                      lbl: "Active",
                      val: `${activeCount} plans`,
                      color: "#10b981",
                    },
                    {
                      lbl: "All Time",
                      val: `${subscriptions.length} plans`,
                      color: "#3b82f6",
                    },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="rounded-2xl px-4 py-3 text-center"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.07)",
                        minWidth: 110,
                      }}
                    >
                      <p
                        className="orb font-black text-sm mb-0.5"
                        style={{ color: s.color }}
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

        {supportedWallets.length > 0 && (
          <div className="mt-6 fup2">
            <SH title="My Wallets" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supportedWallets.map((w) => (
                <div
                  key={w.id}
                  className="rounded-2xl px-4 py-4 flex items-center gap-3"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${COIN_COLORS[w.coin_symbol] || "#333"}20`,
                      border: `1px solid ${COIN_COLORS[w.coin_symbol] || "#333"}35`,
                    }}
                  >
                    <img
                      src={`/assets/images/coins/${w.coin_symbol.toLowerCase()}-logo.png`}
                      alt={w.coin_symbol}
                      className="w-7 h-7 rounded-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="raj font-bold text-sm"
                      style={{ color: "#f1f5f9" }}
                    >
                      {w.coin_symbol}
                    </p>
                    <p className="raj text-xs" style={{ color: "#475569" }}>
                      {w.coin_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="raj font-bold text-sm"
                      style={{ color: "#f1f5f9" }}
                    >
                      {parseFloat(w.coin_amount || 0).toFixed(4)}
                    </p>
                    <p className="raj text-xs" style={{ color: "#475569" }}>
                      ≈ ${parseFloat(w.usd_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PACKAGES ── */}
        <div className="mt-8 fup2">
          <SH title="Arbitrage Products" />
          {packages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-3xl gap-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="raj font-semibold text-sm"
                style={{ color: "#334155" }}
              >
                No packages available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg, idx) => (
                <div
                  key={pkg.id}
                  className="pkg-card rounded-3xl overflow-hidden relative"
                  style={{
                    background: "#0a0a14",
                    border: "1px solid rgba(245,158,11,0.12)",
                  }}
                >
                  <div
                    className="h-0.5"
                    style={{
                      background:
                        "linear-gradient(90deg,#f59e0b,#f97316,transparent)",
                    }}
                  />

                  {idx === 1 && (
                    <div className="absolute top-4 right-4">
                      <span
                        className="raj font-black text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(245,158,11,0.15)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.3)",
                        }}
                      >
                        POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* duration badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-4"
                      style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#f59e0b"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 6v6l4 2"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="orb font-black text-xs"
                        style={{ color: "#f59e0b" }}
                      >
                        {pkg.duration_days} Days
                      </span>
                    </div>

                    <p
                      className="raj font-medium text-sm mb-5 leading-relaxed"
                      style={{ color: "#64748b" }}
                    >
                      Financial product — redeemable within {pkg.duration_days}{" "}
                      days
                    </p>

                    {/* stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[
                        {
                          lbl: "Amount Range",
                          val: `${Number(pkg.min_amount).toLocaleString()} – ${Number(pkg.max_amount).toLocaleString()}`,
                          color: "#f1f5f9",
                        },
                        {
                          lbl: "Daily Income",
                          val: `${pkg.daily_rate_min}–${pkg.daily_rate_max}%`,
                          color: "#f59e0b",
                        },
                      ].map((r) => (
                        <div
                          key={r.lbl}
                          className="rounded-xl px-3 py-2.5"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <p
                            className="raj font-semibold text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            {r.lbl}
                          </p>
                          <p
                            className="orb font-black text-sm"
                            style={{ color: r.color }}
                          >
                            {r.val}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* coins row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="raj font-semibold text-xs mb-2"
                          style={{ color: "#475569" }}
                        >
                          Supported
                        </p>
                        <div className="flex items-center gap-1.5">
                          {SUPPORTED_COINS.map((sym) => (
                            <div
                              key={sym}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "1.5px solid rgba(255,255,255,0.1)",
                                background: `${COIN_COLORS[sym] || "#333"}20`,
                              }}
                            >
                              <img
                                src={`/assets/images/coins/${sym.toLowerCase()}-logo.png`}
                                alt={sym}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => onSubscribe(pkg)}
                        className="act px-5 py-2.5 rounded-xl raj font-black text-sm border-none cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg,#f59e0b,#f97316)",
                          color: "#080810",
                          letterSpacing: 1.5,
                          boxShadow: "0 6px 20px rgba(245,158,11,0.35)",
                        }}
                      >
                        SUBSCRIBE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SUBSCRIPTIONS ── */}
        <div className="mt-10 fup3">
          <SH
            title="My Subscriptions"
            badge={activeCount > 0 ? `${activeCount} active` : undefined}
          />

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Desktop headers */}
            <div
              className="hidden md:grid grid-cols-12 px-6 py-3"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {[
                "Plan",
                "Status",
                "Principal",
                "Daily",
                "Earned",
                "End Date",
              ].map((h, i) => (
                <span
                  key={i}
                  className={`raj font-bold text-xs tracking-widest uppercase ${i > 0 ? "text-right" : ""} ${i === 0 ? "col-span-3" : "col-span-2"} ${i === 5 ? "col-span-3" : ""}`}
                  style={{ color: "#334155" }}
                >
                  {h}
                </span>
              ))}
            </div>

            {loadingHistory ? (
              <div
                className="py-16 text-center raj font-semibold text-sm"
                style={{ color: "#334155" }}
              >
                Loading...
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: "#1e293b" }}
                  >
                    <path
                      d="M16 3h5v5M4 20L21 3M21 16v5h-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className="raj font-semibold text-sm"
                  style={{ color: "#334155" }}
                >
                  No subscriptions yet
                </p>
                <p className="raj text-xs" style={{ color: "#1e293b" }}>
                  Subscribe to a package to start earning
                </p>
              </div>
            ) : (
              subscriptions.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="sub-row"
                  style={{
                    borderBottom:
                      idx < subscriptions.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 items-center px-6 py-5">
                    <div className="col-span-3">
                      <p
                        className="raj font-bold text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        {sub.package_name}
                      </p>
                      <p
                        className="raj text-xs mt-0.5"
                        style={{ color: "#475569" }}
                      >
                        {sub.duration_days} days · {sub.coin_id}
                      </p>
                    </div>
                    <div className="col-span-2 text-right">
                      <StatusBadge status={sub.status} />
                    </div>
                    <div
                      className="col-span-2 text-right raj font-bold text-sm"
                      style={{ color: "#f1f5f9" }}
                    >
                      {Number(sub.amount).toLocaleString()}
                    </div>
                    <div
                      className="col-span-2 text-right raj font-bold text-sm"
                      style={{ color: "#f59e0b" }}
                    >
                      {sub.daily_rate}%
                    </div>
                    <div
                      className="col-span-2 text-right raj font-bold text-sm"
                      style={{ color: "#10b981" }}
                    >
                      +{Number(sub.total_earned).toFixed(4)}
                    </div>
                    <div className="col-span-1 text-right">
                      {sub.status === "active" ? (
                        <button
                          onClick={() => onCancel(sub.id)}
                          className="raj font-bold text-xs bg-transparent border-none cursor-pointer underline underline-offset-2 act"
                          style={{ color: "#ef4444" }}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span
                          className="raj text-xs"
                          style={{ color: "#334155" }}
                        >
                          {format(new Date(sub.end_date), "dd MMM")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden p-5">
                    <div
                      className="h-0.5 rounded-full mb-4"
                      style={{
                        background:
                          "linear-gradient(90deg,#f59e0b,transparent)",
                      }}
                    />
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p
                          className="raj font-bold text-sm mb-0.5"
                          style={{ color: "#f1f5f9" }}
                        >
                          {sub.package_name}
                        </p>
                        <p className="raj text-xs" style={{ color: "#475569" }}>
                          {sub.duration_days} days · {sub.coin_id}
                        </p>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>
                    <div
                      className="grid grid-cols-3 gap-3 mb-4"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        paddingTop: 14,
                      }}
                    >
                      {[
                        {
                          lbl: "Principal",
                          val: Number(sub.amount).toLocaleString(),
                          color: "#f1f5f9",
                        },
                        {
                          lbl: "Daily",
                          val: `${sub.daily_rate}%`,
                          color: "#f59e0b",
                        },
                        {
                          lbl: "Earned",
                          val: `+${Number(sub.total_earned).toFixed(4)}`,
                          color: "#10b981",
                        },
                      ].map((r) => (
                        <div key={r.lbl}>
                          <p
                            className="raj text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            {r.lbl}
                          </p>
                          <p
                            className="raj font-bold text-sm"
                            style={{ color: r.color }}
                          >
                            {r.val}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex items-center justify-between"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        paddingTop: 12,
                      }}
                    >
                      <div>
                        <p
                          className="raj text-xs mb-1"
                          style={{ color: "#475569" }}
                        >
                          Ends {format(new Date(sub.end_date), "dd MMM yyyy")}
                        </p>
                        {sub.status === "active" && (
                          <CountdownTimer endDate={sub.end_date} />
                        )}
                      </div>
                      {sub.status === "active" && (
                        <button
                          onClick={() => onCancel(sub.id)}
                          className="raj font-bold text-xs bg-transparent border-none cursor-pointer underline underline-offset-2"
                          style={{ color: "#ef4444" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════
   ARBITRAGE DETAIL PAGE
════════════════════════════════ */
const ArbitragePage = ({
  onBack,
  selectedPackage: pkg,
  onSubscribed,
  onWalletsRefresh,
  wallets,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [sliderVal, setSliderVal] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [submitting, setSubmitting] = useState(false);

  const selectedWallet = wallets?.find(
    (w) => w.coin_symbol?.toUpperCase() === selectedCoin,
  );
  const maxBalance = parseFloat(selectedWallet?.coin_amount || 0);
  const enteredAmount = parseFloat(amount) || 0;
  const expectedEarnings =
    pkg && amount
      ? ((parseFloat(amount) * parseFloat(pkg.daily_rate_min)) / 100).toFixed(2)
      : "0.00";
  const insufficient = enteredAmount > maxBalance && enteredAmount > 0;

  const BENEFITS = [
    "Daily income credited to your USDT, BTC, or ETH wallet",
    "Zero risk of investment funds — principal always protected",
    "Withdraw your funds back anytime with zero penalties",
    "Artificial intelligence operates and optimizes 24/7",
    "Transparent real-time tracking of all earnings",
  ];

  const handleSubscribe = async () => {
    if (!pkg) return toast.error("Please select a package");
    if (!amount || parseFloat(amount) <= 0)
      return toast.error("Please enter an amount");
    if (parseFloat(amount) < parseFloat(pkg.min_amount))
      return toast.error(
        `Minimum amount is ${Number(pkg.min_amount).toLocaleString()}`,
      );
    if (parseFloat(amount) > parseFloat(pkg.max_amount))
      return toast.error(
        `Maximum amount is ${Number(pkg.max_amount).toLocaleString()}`,
      );
    if (insufficient) return toast.error("Insufficient balance");
    try {
      setSubmitting(true);
      await subscribePackage({
        userId: user.id,
        packageId: pkg.id,
        coinId: selectedWallet?.coin_id,
        amount: parseFloat(amount),
      });
      toast.success("Subscribed successfully!");
      await Promise.all([onSubscribed(), onWalletsRefresh()]);
      onBack();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecharge = () => {
    const w = wallets?.find(
      (w) => w.coin_symbol?.toUpperCase() === selectedCoin,
    );
    if (w)
      navigate("/funds", {
        state: {
          wallet: w,
          coinAmount: w.coin_amount,
          returnTo: "/arbitrage",
        },
      });
    else toast.error("Wallet not found");
  };

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      {/* Back header */}
      <div
        className="flex items-center gap-3 px-4 md:px-8 py-3 sticky top-0 z-50"
        style={{
          background: "rgba(8,8,16,0.92)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(245,158,11,0.08)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center flex-shrink-0 border-none cursor-pointer act"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
        <span
          className="orb font-black tracking-wider flex-1 text-center"
          style={{ fontSize: "clamp(13px,3.8vw,16px)", color: "#f1f5f9" }}
        >
          AI Arbitrage
        </span>
        <div style={{ width: 38 }} />
      </div>

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ── Hero banner ── */}
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

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 3h5v5M4 20L21 3M21 16v5h-5"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p
                  className="orb font-black mb-1"
                  style={{ fontSize: "clamp(18px,4vw,26px)", color: "#f1f5f9" }}
                >
                  {pkg ? pkg.name : "AI Arbitrage"}
                </p>
                {pkg && (
                  <p
                    className="raj font-medium text-sm"
                    style={{ color: "#64748b" }}
                  >
                    {pkg.duration_days} days · {pkg.daily_rate_min}–
                    {pkg.daily_rate_max}% daily income
                  </p>
                )}
              </div>
              {pkg && (
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      lbl: "Duration",
                      val: `${pkg.duration_days}d`,
                      color: "#f59e0b",
                    },
                    {
                      lbl: "Daily Rate",
                      val: `${pkg.daily_rate_min}–${pkg.daily_rate_max}%`,
                      color: "#10b981",
                    },
                    {
                      lbl: "Range",
                      val: `${Number(pkg.min_amount).toLocaleString()}+`,
                      color: "#3b82f6",
                    },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="rounded-2xl px-4 py-2.5 text-center"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.07)",
                        minWidth: 90,
                      }}
                    >
                      <p
                        className="orb font-black text-sm mb-0.5"
                        style={{ color: s.color }}
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
              )}
            </div>
          </div>
        </div>

        {/* ── Two-col layout ── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 fup2">
          {/* LEFT: Subscribe form */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "#0a0a14",
              border: "1px solid rgba(245,158,11,0.12)",
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
                Subscribe
              </p>
            </div>
            <div className="px-6 py-6 flex flex-col gap-5">
              {/* Coin selector */}
              <div>
                <p
                  className="raj font-bold text-xs tracking-widest uppercase mb-3"
                  style={{ color: "#475569" }}
                >
                  Select Coin
                </p>
                <div className="flex items-center gap-4">
                  {SUPPORTED_COINS.map((sym) => (
                    <CoinIcon
                      key={sym}
                      symbol={sym}
                      size={44}
                      selected={selectedCoin === sym}
                      onClick={() => setSelectedCoin(sym)}
                    />
                  ))}
                </div>
              </div>

              {/* Available balance */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${maxBalance <= 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
                  transition: "border-color .2s",
                }}
              >
                <span
                  className="raj font-semibold text-sm"
                  style={{ color: "#64748b" }}
                >
                  Available ({selectedCoin})
                </span>
                <div className="flex items-center gap-2.5">
                  <span
                    className="orb font-black text-sm"
                    style={{ color: maxBalance > 0 ? "#f1f5f9" : "#ef4444" }}
                  >
                    {maxBalance}
                  </span>
                  {maxBalance <= 0 ? (
                    <button
                      onClick={handleRecharge}
                      className="raj font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer act"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      + RECHARGE
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setAmount(maxBalance.toString());
                        setSliderVal(100);
                      }}
                      className="raj font-bold text-xs border-none cursor-pointer bg-transparent act"
                      style={{ color: "#f59e0b" }}
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <p
                  className="raj font-bold text-xs tracking-widest uppercase mb-2"
                  style={{ color: "#475569" }}
                >
                  Hosting Amount
                </p>
                <div
                  className="iw flex items-center gap-3 px-4 py-4 rounded-2xl"
                  style={{
                    border: `1.5px solid ${insufficient ? "#ef4444" : parseFloat(amount) > 0 ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                    background: "rgba(255,255,255,0.02)",
                    transition: "border-color .2s",
                  }}
                >
                  <CoinIcon symbol={selectedCoin} size={28} />
                  <input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAmount(v);
                      if (maxBalance > 0)
                        setSliderVal(
                          Math.min(100, (parseFloat(v) / maxBalance) * 100) ||
                            0,
                        );
                    }}
                    className="flex-1 bg-transparent outline-none border-none raj font-black"
                    style={{
                      fontSize: "clamp(18px,4vw,24px)",
                      color: "#f1f5f9",
                    }}
                  />
                  <span
                    className="raj font-semibold text-sm flex-shrink-0"
                    style={{ color: "#475569" }}
                  >
                    {selectedCoin}
                  </span>
                </div>
                {insufficient ? (
                  <div
                    className="mt-2 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#ef4444"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 8v4M12 16h.01"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p
                        className="raj font-semibold text-xs"
                        style={{ color: "#ef4444" }}
                      >
                        Insufficient {selectedCoin} balance
                      </p>
                    </div>
                    <button
                      onClick={handleRecharge}
                      className="raj font-black text-xs px-4 py-2 rounded-xl border-none cursor-pointer act flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#f97316)",
                        color: "#080810",
                        letterSpacing: 1,
                        boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                      }}
                    >
                      + RECHARGE
                    </button>
                  </div>
                ) : (
                  <p className="raj text-xs mt-2" style={{ color: "#334155" }}>
                    {pkg
                      ? `Min: ${Number(pkg.min_amount).toLocaleString()} · Max: ${Number(pkg.max_amount).toLocaleString()}`
                      : ""}
                  </p>
                )}
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderVal}
                  step={1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setSliderVal(v);
                    setAmount(((maxBalance * v) / 100).toFixed(4));
                  }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg,#f59e0b ${sliderVal}%,rgba(255,255,255,0.1) ${sliderVal}%)`,
                    accentColor: "#f59e0b",
                  }}
                />
                <div
                  className="flex justify-between mt-1 raj font-semibold text-xs"
                  style={{ color: "#334155" }}
                >
                  {["0%", "25%", "50%", "75%", "100%"].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
              </div>

              {/* Expected earnings */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(16,185,129,0.05)",
                  border: "1px solid rgba(16,185,129,0.12)",
                }}
              >
                <span
                  className="raj font-semibold text-sm"
                  style={{ color: "#64748b" }}
                >
                  Est. daily earnings
                </span>
                <span
                  className="orb font-black text-base"
                  style={{ color: "#10b981" }}
                >
                  ${expectedEarnings}
                </span>
              </div>

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={
                  submitting ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  insufficient
                }
                className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  color: "#080810",
                  letterSpacing: 2,
                  boxShadow: "0 6px 20px rgba(245,158,11,0.3)",
                  opacity: submitting ? 0.6 : 1,
                  cursor:
                    submitting ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    insufficient
                      ? "not-allowed"
                      : "pointer",
                  transition: "transform .18s",
                }}
              >
                {submitting ? "PROCESSING..." : "HOST NOW"}
              </button>
            </div>
          </div>

          {/* RIGHT: info + benefits */}
          <div className="flex flex-col gap-5">
            {/* Plan details */}
            {pkg && (
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
                    Plan Details
                  </p>
                </div>
                <div className="px-6 py-4">
                  {[
                    { lbl: "Package", val: pkg.name, color: "#f1f5f9" },
                    {
                      lbl: "Duration",
                      val: `${pkg.duration_days} Days`,
                      color: "#f59e0b",
                    },
                    {
                      lbl: "Daily Rate",
                      val: `${pkg.daily_rate_min}–${pkg.daily_rate_max}%`,
                      color: "#10b981",
                    },
                    {
                      lbl: "Min. Amount",
                      val: Number(pkg.min_amount).toLocaleString(),
                      color: "#f1f5f9",
                    },
                    {
                      lbl: "Max. Amount",
                      val: Number(pkg.max_amount).toLocaleString(),
                      color: "#f1f5f9",
                    },
                    {
                      lbl: "Est. Today",
                      val: `$${expectedEarnings}`,
                      color: "#10b981",
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
                        className="raj font-bold text-sm"
                        style={{ color: r.color }}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
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
                  Why AI Arbitrage?
                </p>
              </div>
              <div className="px-6 py-4">
                {BENEFITS.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-3"
                    style={{
                      borderBottom:
                        i < BENEFITS.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.25)",
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2 2 4-4"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p
                      className="raj font-medium text-sm leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {b}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════
   ROOT
════════════════════════════════ */
export default function ArbitrageRoot() {
  const { user } = useUser();
  const { wallets, refreshWallets } = useWallets(user?.id);
  const [page, setPage] = useState("hosting");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const supportedWallets =
    wallets?.filter((w) =>
      SUPPORTED_COINS.includes(w.coin_symbol?.toUpperCase()),
    ) || [];

  useEffect(() => {
    fetchPackages();
  }, []);
  useEffect(() => {
    if (user?.id) fetchSubscriptions();
  }, [user?.id]);

  const fetchPackages = async () => {
    try {
      const res = await getPackages();
      setPackages(res.data);
    } catch {
      toast.error("Failed to load packages");
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingHistory(true);
      const res = await getUserSubscriptions(user.id);
      setSubscriptions(res.data);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCancel = async (subId) => {
    try {
      await cancelSubscription({ subscriptionId: subId, userId: user.id });
      toast.success("Cancelled — principal returned");
      await Promise.all([fetchSubscriptions(), refreshWallets()]);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        @keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .fup3{animation:fup .5s ease both;animation-delay:.2s;opacity:0}
        .pkg-card{transition:transform .22s;cursor:pointer}
        .pkg-card:hover{transform:translateY(-4px)}
        .sub-row{transition:background .15s}
        .sub-row:hover{background:rgba(245,158,11,0.02)!important}
        .act{transition:transform .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#f59e0b;cursor:pointer;box-shadow:0 0 8px rgba(245,158,11,0.5)}
      `}</style>

      {page === "arbitrage" ? (
        <ArbitragePage
          onBack={() => setPage("hosting")}
          selectedPackage={selectedPackage}
          onSubscribed={fetchSubscriptions}
          onWalletsRefresh={refreshWallets}
          wallets={supportedWallets}
        />
      ) : (
        <HostingPage
          onSubscribe={(pkg) => {
            setSelectedPackage(pkg);
            setPage("arbitrage");
          }}
          packages={packages}
          subscriptions={subscriptions}
          loadingHistory={loadingHistory}
          onCancel={handleCancel}
          wallets={wallets}
        />
      )}
    </>
  );
}
