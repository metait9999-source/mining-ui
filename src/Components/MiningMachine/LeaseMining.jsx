import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { BENEFITS, MachineIcon, Stars } from "./miningUtils";
import { useUser } from "../../context/UserContext";
import {
  getMiningPackages,
  subscribeMining,
  getUserMiningSubscriptions,
  cancelMiningSubscription,
} from "../../api/mining.api";
import AppNav from "../Home/Navbar";

/* ── Status badge ── */
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

/* ── Confirm modal ── */
const ConfirmModal = ({ amount, qty, pkg, onConfirm, onClose, loading }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm rounded-3xl overflow-hidden"
      style={{
        background: "#0d0d1a",
        border: "1px solid rgba(245,158,11,0.2)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* top accent */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
        }}
      />

      <div className="px-8 pt-10 pb-8 text-center">
        {/* icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#f59e0b,#f97316)",
            boxShadow: "0 8px 28px rgba(245,158,11,0.4)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18l7 7 13-13"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="raj font-bold text-sm mb-2" style={{ color: "#64748b" }}>
          Escrow Amount
        </p>
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span
            className="orb font-black"
            style={{
              fontSize: "clamp(32px,8vw,48px)",
              color: "#f59e0b",
              lineHeight: 1,
            }}
          >
            {Number(amount).toLocaleString()}
          </span>
          <span className="raj font-bold text-xl" style={{ color: "#f1f5f9" }}>
            USDT
          </span>
        </div>

        {qty > 1 && (
          <p
            className="raj font-medium text-sm mb-2"
            style={{ color: "#64748b" }}
          >
            {qty} machines × {Number(amount / qty).toLocaleString()} USDT each
          </p>
        )}

        <p
          className="orb font-black text-base mb-8"
          style={{ color: "#f1f5f9" }}
        >
          {pkg?.name} · Mining Machine Leasing
        </p>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer mb-5"
          style={{
            background: "linear-gradient(135deg,#f59e0b,#f97316)",
            color: "#080810",
            letterSpacing: 2,
            boxShadow: "0 8px 28px rgba(245,158,11,0.4)",
            opacity: loading ? 0.6 : 1,
            transition: "transform .18s",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "PROCESSING..." : "CONFIRM LEASE"}
        </button>

        <p
          className="raj font-medium text-xs leading-relaxed"
          style={{ color: "#475569" }}
        >
          Daily income is automatically credited to your wallet each day during
          the lease period.
        </p>
      </div>
    </div>
  </div>
);

const LeaseMining = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const [machine, setMachine] = useState(location.state?.machine || null);
  const [qty, setQty] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState(!location.state?.machine);

  const totalCost = machine ? parseFloat(machine.rent_amount) * qty : 0;

  useEffect(() => {
    if (!location.state?.machine) {
      setLoadingPkg(true);
      getMiningPackages()
        .then((res) => {
          const pkg = res.data.find((p) => p.id === parseInt(id));
          if (pkg) setMachine(pkg);
          else {
            toast.error("Package not found");
            navigate("/mining");
          }
        })
        .catch(() => {
          toast.error("Failed to load package");
          navigate("/mining");
        })
        .finally(() => setLoadingPkg(false));
    }
  }, [id, location.state, navigate]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await getUserMiningSubscriptions(user.id);
      setSubscriptions(res.data);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchSubscriptions();
  }, [user?.id, fetchSubscriptions]);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await subscribeMining({
        userId: user.id,
        packageId: machine.id,
        quantity: qty,
      });
      toast.success("Mining subscription started!");
      setShowConfirm(false);
      await fetchSubscriptions();
      setShowHistory(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to subscribe");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (subId) => {
    try {
      await cancelMiningSubscription({
        subscriptionId: subId,
        userId: user.id,
      });
      toast.success("Cancelled — principal returned");
      fetchSubscriptions();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  const pkgColor = machine?.color || "#f59e0b";

  if (loadingPkg)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080810" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent"
            style={{ animation: "spin .8s linear infinite" }}
          />
          <p className="raj font-semibold text-sm" style={{ color: "#475569" }}>
            Loading package...
          </p>
        </div>
      </div>
    );

  if (!machine) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        @keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .fup3{animation:fup .5s ease both;animation-delay:.2s;opacity:0}
        .act{transition:transform .18s,box-shadow .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        .qty-btn{transition:transform .15s,background .15s}
        .qty-btn:hover{transform:scale(1.08)}
        .qty-btn:active{transform:scale(.92)}
        .benefit-row{transition:background .15s}
        .benefit-row:hover{background:rgba(245,158,11,0.04)!important}
      `}</style>

      <div
        className="min-h-screen pb-32"
        style={{ background: "#080810", color: "#e2e8f0" }}
      >
        <AppNav />

        <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
          {/* ══ MACHINE HERO ══ */}
          <div className="mt-6 fup">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg,${pkgColor}22,${pkgColor}12,rgba(8,8,16,0.98))`,
                border: `1px solid ${pkgColor}35`,
              }}
            >
              <div
                className="h-px"
                style={{
                  background: `linear-gradient(90deg,${pkgColor},transparent)`,
                }}
              />
              {/* glow */}
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  background: `radial-gradient(circle,${pkgColor}18,transparent 70%)`,
                }}
              />

              <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* left: machine info */}
                  <div className="flex items-start gap-5 flex-1">
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${pkgColor}20`,
                        border: `1px solid ${pkgColor}35`,
                      }}
                    >
                      <MachineIcon size={54} />
                    </div>
                    <div>
                      <p
                        className="orb font-black mb-1"
                        style={{
                          fontSize: "clamp(18px,4vw,26px)",
                          color: pkgColor,
                        }}
                      >
                        {machine.name}
                      </p>
                      <Stars count={machine.stars || 5} />
                      <p
                        className="raj font-medium text-sm mt-2 leading-relaxed"
                        style={{ color: "#64748b" }}
                      >
                        Financial product — not redeemable within{" "}
                        {machine.duration_days} days
                      </p>
                    </div>
                  </div>

                  {/* right: qty control */}
                  <div className="flex flex-col items-start md:items-end gap-3 md:min-w-48">
                    <p
                      className="raj font-bold text-xs tracking-widest uppercase"
                      style={{ color: "#475569" }}
                    >
                      Quantity
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="qty-btn w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
                        style={{
                          background: `${pkgColor}20`,
                          border: `1px solid ${pkgColor}35`,
                          color: pkgColor,
                          fontSize: 20,
                          fontWeight: 800,
                        }}
                      >
                        −
                      </button>
                      <span
                        className="orb font-black text-2xl w-8 text-center"
                        style={{ color: "#f1f5f9" }}
                      >
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="qty-btn w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
                        style={{
                          background: `${pkgColor}20`,
                          border: `1px solid ${pkgColor}35`,
                          color: pkgColor,
                          fontSize: 20,
                          fontWeight: 800,
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div
                      className="px-4 py-2 rounded-xl"
                      style={{
                        background: `${pkgColor}15`,
                        border: `1px solid ${pkgColor}30`,
                      }}
                    >
                      <span
                        className="orb font-black text-base"
                        style={{ color: pkgColor }}
                      >
                        {totalCost.toLocaleString()} USDT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ TWO-COL LAYOUT: intro + benefits ══ */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 fup2">
            {/* Intro / stats */}
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
                  {
                    label: "Daily Output",
                    val: `${machine.daily_rate}% USDT/Day`,
                    color: pkgColor,
                  },
                  {
                    label: "Computing Power",
                    val: machine.computing || "—",
                    color: "#f1f5f9",
                  },
                  {
                    label: "Power Usage",
                    val: machine.power || "—",
                    color: "#f1f5f9",
                  },
                  {
                    label: "Lease Cycle",
                    val: `${machine.duration_days} Days`,
                    color: "#f1f5f9",
                  },
                  {
                    label: "Rent Amount",
                    val: `${Number(machine.rent_amount).toLocaleString()} USDT`,
                    color: pkgColor,
                  },
                  {
                    label: "Total Cost",
                    val: `${totalCost.toLocaleString()} USDT (×${qty})`,
                    color: "#10b981",
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
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
                      {row.label}
                    </span>
                    <span
                      className="raj font-bold text-sm"
                      style={{ color: row.color }}
                    >
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
                  Why Choose Us
                </p>
              </div>
              <div className="px-6 py-4">
                {BENEFITS.map((b, i) => (
                  <div
                    key={i}
                    className="benefit-row flex items-start gap-3 py-3.5 -mx-2 px-2 rounded-xl"
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
                        background: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.3)",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2 2 4-4"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span
                      className="raj font-medium text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ MY SUBSCRIPTIONS (collapsible) ══ */}
          <div className="mt-5 fup3">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <button
                onClick={() => setShowHistory((p) => !p)}
                className="w-full flex items-center justify-between px-6 py-5 bg-transparent border-none cursor-pointer text-left"
                style={{
                  borderBottom: showHistory
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="orb font-black text-base"
                    style={{ color: "#f1f5f9" }}
                  >
                    My Subscriptions
                  </span>
                  {subscriptions.filter((s) => s.status === "active").length >
                    0 && (
                    <span
                      className="px-2.5 py-1 rounded-full raj font-bold text-xs"
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        color: "#10b981",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      {
                        subscriptions.filter((s) => s.status === "active")
                          .length
                      }{" "}
                      active
                    </span>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform: showHistory ? "rotate(180deg)" : "none",
                    transition: "transform .2s",
                    color: "#475569",
                  }}
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {showHistory && (
                <div className="px-6 py-4">
                  {loadingHistory ? (
                    <p
                      className="text-center py-8 raj font-semibold text-sm"
                      style={{ color: "#334155" }}
                    >
                      Loading...
                    </p>
                  ) : subscriptions.length === 0 ? (
                    <p
                      className="text-center py-8 raj font-semibold text-sm"
                      style={{ color: "#334155" }}
                    >
                      No subscriptions yet
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-2xl overflow-hidden"
                          style={{
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          <div
                            className="h-0.5"
                            style={{
                              background: `linear-gradient(90deg,${pkgColor},transparent)`,
                            }}
                          />
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p
                                  className="raj font-bold text-sm mb-0.5"
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
                                  Ends{" "}
                                  {format(
                                    new Date(sub.end_date),
                                    "dd MMM yyyy",
                                  )}
                                </p>
                                {sub.status === "active" && (
                                  <div
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                    style={{
                                      background: "rgba(245,158,11,0.1)",
                                      border: "1px solid rgba(245,158,11,0.2)",
                                    }}
                                  >
                                    <svg
                                      width="9"
                                      height="9"
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
                                      className="raj font-bold text-xs"
                                      style={{ color: "#f59e0b" }}
                                    >
                                      {format(
                                        new Date(sub.end_date),
                                        "dd MMM yyyy",
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {sub.status === "active" && (
                                <button
                                  onClick={() => handleCancel(sub.id)}
                                  className="raj font-bold text-xs border-none cursor-pointer bg-transparent underline underline-offset-2 act"
                                  style={{ color: "#ef4444" }}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STICKY LEASE BUTTON ══ */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 px-4 md:px-8 lg:px-16 pb-6 pt-3"
        style={{
          background: "rgba(8,8,16,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={() => setShowConfirm(true)}
            className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer flex items-center justify-center gap-3"
            style={{
              background: `linear-gradient(135deg,${pkgColor},${pkgColor}cc)`,
              color: "#080810",
              letterSpacing: 2,
              boxShadow: `0 8px 28px ${pkgColor}45`,
              fontSize: "clamp(14px,3.5vw,16px)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="7"
                width="20"
                height="14"
                rx="2"
                fill="rgba(0,0,0,0.25)"
              />
              <path
                d="M16 7V5a2 2 0 00-4 0v2M2 11h20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="16" cy="14" r="1.5" fill="currentColor" />
            </svg>
            LEASE NOW
            <span
              className="px-3 py-1 rounded-xl font-bold text-xs"
              style={{ background: "rgba(0,0,0,0.2)", letterSpacing: 1 }}
            >
              {totalCost.toLocaleString()} USDT
            </span>
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          amount={totalCost}
          qty={qty}
          pkg={machine}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
          loading={submitting}
        />
      )}
    </>
  );
};

export default LeaseMining;
