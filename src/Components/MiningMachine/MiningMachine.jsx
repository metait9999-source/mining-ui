import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MachineIcon, Stars } from "./miningUtils";
import {
  getMiningPackages,
  getUserMiningSubscriptions,
  cancelMiningSubscription,
} from "../../api/mining.api";
import { useUser } from "../../context/UserContext";
import { format } from "date-fns";
import AppNav from "../Home/Navbar";

/* ── Countdown timer ── */
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
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
        <path
          d="M12 6v6l4 2"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-bold text-xs"
        style={{ color: "#f59e0b", letterSpacing: "0.03em" }}
      >
        {time.d}d {String(time.h).padStart(2, "0")}h{" "}
        {String(time.m).padStart(2, "0")}m {String(time.s).padStart(2, "0")}s
      </span>
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const styles = {
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
  const s = styles[status] || styles.completed;
  return (
    <span
      className="px-2.5 py-1 rounded-full font-bold text-xs raj capitalize"
      style={{ background: s.bg, color: s.color, border: s.border }}
    >
      {status}
    </span>
  );
};

/* ── Section heading ── */
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
        className="px-2 py-0.5 rounded-full raj font-bold text-xs"
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

const MiningMachine = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getMiningPackages();
      setPackages(res.data);
    } catch {
      toast.error("Failed to load mining packages");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await getUserMiningSubscriptions(user.id);
      setSubscriptions(res.data);
    } catch {
      toast.error("Failed to load subscription history");
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchSubscriptions();
  }, [user?.id, fetchSubscriptions]);

  const handleCancel = async (subId) => {
    try {
      await cancelMiningSubscription({
        subscriptionId: subId,
        userId: user.id,
      });
      toast.success("Subscription cancelled — principal returned");
      fetchSubscriptions();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  /* derived stats */
  const totalEarned = subscriptions
    .reduce((s, x) => s + parseFloat(x.total_earned || 0), 0)
    .toFixed(4);
  const todayEarned = subscriptions
    .filter(
      (s) =>
        s.last_paid_at &&
        new Date(s.last_paid_at).toDateString() === new Date().toDateString(),
    )
    .reduce((s, x) => s + parseFloat(x.daily_earnings || 0), 0)
    .toFixed(4);
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const activeList = subscriptions.filter((s) => s.status === "active");
  const historyList = subscriptions.filter((s) => s.status !== "active");
  const displayList = activeTab === "active" ? activeList : historyList;

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
        @keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .pkg-card{transition:transform .22s,box-shadow .22s;cursor:pointer}
        .pkg-card:hover{transform:translateY(-4px)}
        .sub-row{transition:background .15s}
        .sub-row:hover{background:rgba(245,158,11,0.03)!important}
        .act{transition:transform .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        .tab-pill{transition:all .2s}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ══ HERO EARNINGS CARD ══ */}
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
                    Total Mining Earnings
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
                      Auto-credited daily
                    </span>
                  </div>
                </div>

                {/* stat chips */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { lbl: "Today", val: `$${todayEarned}`, color: "#f59e0b" },
                    {
                      lbl: "Active",
                      val: `${activeCount} machines`,
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

        {/* ══ PACKAGES ══ */}
        <div className="mt-8 fup2">
          <SH title="Mining Packages" />

          {loading ? (
            /* skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="rounded-3xl p-6 flex flex-col gap-4"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {[40, 24, 20, 20, 20, 44].map((h, j) => (
                      <div
                        key={j}
                        className="rounded-lg"
                        style={{
                          height: h,
                          background: "rgba(255,255,255,0.05)",
                          animation: "skel 1.5s ease-in-out infinite",
                        }}
                      />
                    ))}
                  </div>
                ))}
            </div>
          ) : packages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3 rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#1e293b" }}
              >
                <path
                  d="M14.5 2.5l7 7-10 10-7-7 10-10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <p
                className="raj font-semibold text-sm"
                style={{ color: "#334155" }}
              >
                No packages available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg, idx) => {
                const pkgColor = pkg.color || "#f59e0b";
                return (
                  <div
                    key={pkg.id}
                    className="pkg-card rounded-3xl overflow-hidden relative"
                    style={{
                      background: `linear-gradient(145deg,${pkgColor}22,${pkgColor}10,rgba(8,8,16,0.95))`,
                      border: `1px solid ${pkgColor}30`,
                    }}
                  >
                    {/* top accent */}
                    <div
                      className="h-0.5"
                      style={{
                        background: `linear-gradient(90deg,${pkgColor},transparent)`,
                      }}
                    />

                    <div className="p-6">
                      {/* header row */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${pkgColor}20`,
                              border: `1px solid ${pkgColor}35`,
                            }}
                          >
                            <MachineIcon size={40} />
                          </div>
                          <div>
                            <p
                              className="orb font-black text-base mb-0.5"
                              style={{ color: pkgColor }}
                            >
                              {pkg.name}
                            </p>
                            <Stars count={pkg.stars || 5} />
                          </div>
                        </div>
                        {idx === 1 && (
                          <span
                            className="raj font-black text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: `${pkgColor}25`,
                              color: pkgColor,
                              border: `1px solid ${pkgColor}40`,
                            }}
                          >
                            POPULAR
                          </span>
                        )}
                      </div>

                      {/* stats grid */}
                      <div className="grid grid-cols-2 gap-2.5 mb-5">
                        {[
                          {
                            lbl: "Daily Rate",
                            val: `${pkg.daily_rate}%`,
                            vc: pkgColor,
                          },
                          {
                            lbl: "Duration",
                            val: `${pkg.duration_days} Days`,
                            vc: "#f1f5f9",
                          },
                          {
                            lbl: "Min. Deposit",
                            val: `${Number(pkg.rent_amount).toLocaleString()} USDT`,
                            vc: "#f1f5f9",
                          },
                          {
                            lbl: "Hashrate",
                            val: pkg.hashrate || "—",
                            vc: "#f1f5f9",
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
                              style={{ color: r.vc }}
                            >
                              {r.val}
                            </p>
                          </div>
                        ))}
                      </div>

                      {pkg.computing && (
                        <p
                          className="raj font-medium text-xs mb-5 leading-relaxed"
                          style={{ color: "#475569" }}
                        >
                          Financial product — not redeemable within{" "}
                          {pkg.duration_days} days
                        </p>
                      )}

                      <button
                        onClick={() =>
                          navigate(`/mining/${pkg.id}`, {
                            state: { machine: pkg },
                          })
                        }
                        className="act w-full py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                        style={{
                          background: `linear-gradient(135deg,${pkgColor},${pkgColor}cc)`,
                          color: "#080810",
                          letterSpacing: 1.5,
                          boxShadow: `0 6px 20px ${pkgColor}40`,
                        }}
                      >
                        LEASE NOW
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ MY SUBSCRIPTIONS ══ */}
        <div className="mt-10">
          <SH
            title="My Subscriptions"
            badge={activeCount > 0 ? `${activeCount} active` : undefined}
          />

          {/* tab pills */}
          <div className="flex gap-2 mb-5">
            {[
              { key: "active", label: "Active", count: activeList.length },
              { key: "history", label: "History", count: historyList.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="tab-pill flex items-center gap-1.5 px-5 py-2.5 rounded-full raj font-bold text-sm border-none cursor-pointer"
                style={{
                  background:
                    activeTab === key
                      ? "linear-gradient(135deg,#f59e0b,#f97316)"
                      : "rgba(255,255,255,0.04)",
                  color: activeTab === key ? "#080810" : "#64748b",
                  border: `1px solid ${activeTab === key ? "transparent" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background:
                        activeTab === key
                          ? "rgba(0,0,0,0.2)"
                          : "rgba(255,255,255,0.08)",
                      color: activeTab === key ? "#080810" : "#64748b",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* table header — desktop */}
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
                "Rent Paid",
                "Daily",
                "Earned",
                "End Date",
                "",
              ].map((h, i) => (
                <span
                  key={i}
                  className={`raj font-bold text-xs tracking-widest uppercase ${i >= 1 ? "text-right" : ""} ${i === 0 ? "col-span-3" : i === 6 ? "col-span-1" : "col-span-2"}`}
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
            ) : displayList.length === 0 ? (
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
                      d="M14.5 2.5l7 7-10 10-7-7 10-10z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className="raj font-semibold text-sm"
                  style={{ color: "#334155" }}
                >
                  {activeTab === "active"
                    ? "No active subscriptions"
                    : "No history yet"}
                </p>
              </div>
            ) : (
              displayList.map((sub, idx) => {
                const pkgColor =
                  packages.find((p) => p.name === sub.package_name)?.color ||
                  "#f59e0b";
                return (
                  <div
                    key={sub.id}
                    className="sub-row"
                    style={{
                      borderBottom:
                        idx < displayList.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-12 items-center px-6 py-5">
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${pkgColor}18`,
                              border: `1px solid ${pkgColor}30`,
                            }}
                          >
                            <MachineIcon size={24} />
                          </div>
                          <div>
                            <p
                              className="raj font-bold text-sm"
                              style={{ color: "#f1f5f9" }}
                            >
                              {sub.package_name}
                            </p>
                            <p
                              className="raj font-medium text-xs"
                              style={{ color: "#475569" }}
                            >
                              {sub.duration_days} days · Qty {sub.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <StatusBadge status={sub.status} />
                      </div>
                      <div
                        className="col-span-2 text-right raj font-bold text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        {Number(sub.rent_amount).toLocaleString()}
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
                          <div className="flex flex-col items-end gap-1">
                            <CountdownTimer endDate={sub.end_date} />
                            <button
                              onClick={() => handleCancel(sub.id)}
                              className="raj font-bold text-xs border-none cursor-pointer bg-transparent underline underline-offset-2 act"
                              style={{ color: "#ef4444" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p
                            className="raj font-medium text-xs"
                            style={{ color: "#475569" }}
                          >
                            {format(new Date(sub.end_date), "dd MMM yyyy")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden p-5">
                      <div
                        className="h-0.5 rounded-full mb-4"
                        style={{
                          background: `linear-gradient(90deg,${pkgColor},transparent)`,
                        }}
                      />
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${pkgColor}18`,
                              border: `1px solid ${pkgColor}30`,
                            }}
                          >
                            <MachineIcon size={28} />
                          </div>
                          <div>
                            <p
                              className="raj font-bold text-sm"
                              style={{ color: "#f1f5f9" }}
                            >
                              {sub.package_name}
                            </p>
                            <p
                              className="raj text-xs"
                              style={{ color: "#475569" }}
                            >
                              {sub.duration_days} days · Qty {sub.quantity}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={sub.status} />
                      </div>

                      <div
                        className="grid grid-cols-3 gap-3 mb-4"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          paddingTop: 16,
                        }}
                      >
                        {[
                          {
                            lbl: "Rent Paid",
                            val: Number(sub.rent_amount).toLocaleString(),
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
                            onClick={() => handleCancel(sub.id)}
                            className="raj font-bold text-xs border-none cursor-pointer bg-transparent underline underline-offset-2"
                            style={{ color: "#ef4444" }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══ CLOUD MINING INFO ══ */}
        <div className="mt-8">
          <div
            className="rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: "rgba(245,158,11,0.04)",
              border: "1px solid rgba(245,158,11,0.1)",
            }}
          >
            <div>
              <p className="orb font-black text-sm text-white mb-1">
                Cloud Mining Machine
              </p>
              <p
                className="raj font-medium text-xs"
                style={{ color: "#475569" }}
              >
                Safe and stable — watch our platform guide on YouTube
              </p>
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="act flex items-center gap-2 px-5 py-2.5 rounded-xl raj font-bold text-xs border-none cursor-pointer flex-shrink-0 no-underline"
              style={{
                background: "#ff0000",
                color: "white",
                letterSpacing: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
              WATCH VIDEO
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningMachine;
