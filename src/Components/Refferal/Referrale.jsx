import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import AppNav from "../Home/Navbar";

/* ── helpers ── */
const fmt = (d) => format(new Date(d), "dd MMM yyyy, hh:mm a");

const StatusBadge = ({ status }) => {
  const map = {
    deposit: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
      label: "Deposit",
    },
    mining: {
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.25)",
      label: "Mining",
    },
    arbitrage: {
      color: "#a855f7",
      bg: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.25)",
      label: "Arbitrage",
    },
  };
  const s = map[status?.toLowerCase()] || map.deposit;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full raj font-bold text-xs"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
};

const Referral = () => {
  const { user } = useUser();

  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [referred, setReferred] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referral_uuid || "—";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [histRes, sumRes, refRes] = await Promise.all([
        fetch(`${API_BASE_URL}/referral/user/${user.id}`),
        fetch(`${API_BASE_URL}/referral/summary/${user.id}`),
        fetch(`${API_BASE_URL}/referral/referred/${user.id}`),
      ]);
      const [hist, sum, ref] = await Promise.all([
        histRes.json(),
        sumRes.json(),
        refRes.json(),
      ]);
      if (!histRes.ok) throw new Error(hist.message);
      setHistory(Array.isArray(hist) ? hist : []);
      setSummary(sum || {});
      setReferred(Array.isArray(ref) ? ref : []);
    } catch (e) {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const copyToClipboard = (text) => {
    const copy = (t) => {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    };
    navigator.clipboard?.writeText(text).catch(() => copy(text)) || copy(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join CryptoMine",
        text: `Use my referral code: ${referralCode}`,
        url: referralLink,
      });
    } else {
      copyToClipboard(referralLink);
    }
  };

  const TABS = [
    { key: "history", label: "Commission History", count: history.length },
    { key: "referred", label: "People Referred", count: referred.length },
  ];

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
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .fup3{animation:fup .5s ease both;animation-delay:.2s;opacity:0}
        .act{transition:transform .18s,box-shadow .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        .tab-pill{transition:all .2s}
        .row-hover:hover{background:rgba(245,158,11,0.03)!important}
        .copy-btn:hover{border-color:rgba(245,158,11,0.5)!important}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ── HERO CARD ── */}
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
                width: 280,
                height: 280,
                background:
                  "radial-gradient(circle,rgba(245,158,11,.1),transparent 70%)",
              }}
            />
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                bottom: -60,
                left: -60,
                width: 200,
                height: 200,
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

            <div className="relative z-10 p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Left: total earned */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
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
                    <p
                      className="raj font-bold text-xs tracking-widest uppercase"
                      style={{ color: "#10b981" }}
                    >
                      Referral Program Active
                    </p>
                  </div>
                  <p
                    className="raj font-bold text-xs tracking-widest uppercase mb-2"
                    style={{ color: "#475569" }}
                  >
                    Total Referral Earnings
                  </p>
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span
                      className="orb font-black"
                      style={{
                        fontSize: "clamp(32px,7vw,52px)",
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      $
                      {parseFloat(
                        summary?.total_commission_earned || 0,
                      ).toFixed(4)}
                    </span>
                    <span
                      className="raj font-bold text-base"
                      style={{ color: "#475569" }}
                    >
                      USDT
                    </span>
                  </div>
                  <p
                    className="raj font-medium text-sm"
                    style={{ color: "#475569" }}
                  >
                    from {summary?.total_referred_users || 0} referred{" "}
                    {summary?.total_referred_users === 1 ? "user" : "users"}
                  </p>
                </div>

                {/* Right: stat chips */}
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      lbl: "Deposit Commissions",
                      val: `$${parseFloat(summary?.deposit_commission || 0).toFixed(4)}`,
                      color: "#f59e0b",
                    },
                    {
                      lbl: "Referred Users",
                      val: summary?.total_referred_users || 0,
                      color: "#10b981",
                    },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="rounded-2xl px-5 py-4"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.07)",
                        minWidth: 140,
                      }}
                    >
                      <p
                        className="orb font-black text-lg mb-0.5"
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

        {/* ── REFERRAL CODE + LINK ── */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 fup2">
          {/* Referral Code */}
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
                Your Referral Code
              </p>
              <p
                className="raj font-medium text-xs mt-1"
                style={{ color: "#475569" }}
              >
                Share this code and earn commission on every deposit
              </p>
            </div>
            <div className="px-6 py-6">
              {/* Big code display */}
              <div
                className="flex items-center justify-center py-5 mb-5 rounded-2xl"
                style={{
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <span
                  className="orb font-black tracking-[0.3em]"
                  style={{
                    fontSize: "clamp(22px,5vw,36px)",
                    color: "#f59e0b",
                    letterSpacing: "0.25em",
                  }}
                >
                  {referralCode}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  className="copy-btn act flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background: copied
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(245,158,11,0.08)",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.2)"}`,
                    color: copied ? "#10b981" : "#f59e0b",
                    letterSpacing: 1.5,
                    transition: "all .2s",
                  }}
                >
                  {copied ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>{" "}
                      COPIED
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>{" "}
                      COPY CODE
                    </>
                  )}
                </button>
                <button
                  onClick={shareReferral}
                  className="act py-3.5 px-4 rounded-2xl raj font-bold text-sm border-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="18"
                      cy="5"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="6"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="19"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="8.59"
                      y1="13.51"
                      x2="15.42"
                      y2="17.49"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="15.41"
                      y1="6.51"
                      x2="8.59"
                      y2="10.49"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Referral Link */}
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
                Referral Link
              </p>
              <p
                className="raj font-medium text-xs mt-1"
                style={{ color: "#475569" }}
              >
                Share this link directly — friend signs up automatically linked
                to you
              </p>
            </div>
            <div className="px-6 py-6">
              {/* Link display */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="flex-shrink-0"
                  style={{ color: "#475569" }}
                >
                  <path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p
                  className="raj font-medium text-sm truncate flex-1"
                  style={{ color: "#64748b" }}
                >
                  {referralLink}
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(referralLink)}
                className="act w-full py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  color: "#080810",
                  letterSpacing: 2,
                  boxShadow: "0 6px 20px rgba(245,158,11,0.3)",
                }}
              >
                COPY REFERRAL LINK
              </button>

              {/* How it works */}
              <div className="mt-5 flex flex-col gap-2">
                {[
                  "Friend signs up using your code or link",
                  "Friend makes a deposit",
                  "You automatically earn a % commission in USDT",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 raj font-black text-xs mt-0.5"
                      style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        color: "#f59e0b",
                      }}
                    >
                      {i + 1}
                    </span>
                    <p
                      className="raj font-medium text-xs"
                      style={{ color: "#64748b" }}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-8 fup3">
          <div className="flex gap-2 mb-5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="tab-pill flex items-center gap-2 px-5 py-3 rounded-2xl raj font-bold text-sm border-none cursor-pointer"
                style={{
                  background:
                    activeTab === t.key
                      ? "linear-gradient(135deg,#f59e0b,#f97316)"
                      : "rgba(255,255,255,0.03)",
                  color: activeTab === t.key ? "#080810" : "#64748b",
                  border: `1px solid ${activeTab === t.key ? "transparent" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full raj font-bold text-xs"
                    style={{
                      background:
                        activeTab === t.key
                          ? "rgba(0,0,0,0.2)"
                          : "rgba(255,255,255,0.07)",
                      color: activeTab === t.key ? "#080810" : "#64748b",
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── COMMISSION HISTORY ── */}
          {activeTab === "history" && (
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Desktop header */}
              <div
                className="hidden md:grid grid-cols-12 px-6 py-3"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {["From User", "Type", "Amount (USDT)", "Rate", "Date"].map(
                  (h, i) => (
                    <span
                      key={i}
                      className={`raj font-bold text-xs tracking-widest uppercase ${i === 0 ? "col-span-3" : i === 1 ? "col-span-2" : i === 4 ? "col-span-3 text-right" : "col-span-2 text-right"}`}
                      style={{ color: "#334155" }}
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-amber-500"
                    style={{
                      borderColor: "rgba(245,158,11,0.2)",
                      borderTopColor: "#f59e0b",
                      animation: "spin .8s linear infinite",
                    }}
                  />
                  <p
                    className="raj font-semibold text-sm"
                    style={{ color: "#334155" }}
                  >
                    Loading history...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ color: "#1e293b" }}
                    >
                      <path
                        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p
                      className="orb font-black text-sm mb-1"
                      style={{ color: "#334155" }}
                    >
                      No commissions yet
                    </p>
                    <p
                      className="raj font-medium text-xs"
                      style={{ color: "#1e293b" }}
                    >
                      Share your referral code to start earning
                    </p>
                  </div>
                </div>
              ) : (
                history.map((row, idx) => (
                  <div
                    key={row.id}
                    className="row-hover"
                    style={{
                      borderBottom:
                        idx < history.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-12 items-center px-6 py-4">
                      <div className="col-span-3">
                        <p
                          className="raj font-bold text-sm"
                          style={{ color: "#f1f5f9" }}
                        >
                          {row.referred_user_name || "User"}
                        </p>
                        <p
                          className="raj text-xs mt-0.5"
                          style={{ color: "#475569" }}
                        >
                          {row.referred_user_uuid || row.user_by}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={row.type} />
                      </div>
                      <div className="col-span-2 text-right">
                        <p
                          className="raj font-black text-base"
                          style={{ color: "#10b981" }}
                        >
                          +{parseFloat(row.amount).toFixed(4)}
                        </p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p
                          className="raj font-bold text-sm"
                          style={{ color: "#f59e0b" }}
                        >
                          {row.percent}%
                        </p>
                      </div>
                      <div className="col-span-3 text-right">
                        <p
                          className="raj font-medium text-xs"
                          style={{ color: "#475569" }}
                        >
                          {fmt(row.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden px-4 py-4">
                      <div
                        className="h-0.5 rounded-full mb-3"
                        style={{
                          background:
                            "linear-gradient(90deg,#f59e0b,transparent)",
                        }}
                      />
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p
                            className="raj font-bold text-sm mb-0.5"
                            style={{ color: "#f1f5f9" }}
                          >
                            {row.referred_user_name || "User"}
                          </p>
                          <p
                            className="raj text-xs"
                            style={{ color: "#475569" }}
                          >
                            {row.referred_user_uuid || `User #${row.user_by}`}
                          </p>
                        </div>
                        <StatusBadge status={row.type} />
                      </div>
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div>
                          <p
                            className="raj text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            Commission
                          </p>
                          <p
                            className="raj font-black text-base"
                            style={{ color: "#10b981" }}
                          >
                            +{parseFloat(row.amount).toFixed(4)} USDT
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="raj text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            Rate
                          </p>
                          <p
                            className="raj font-bold text-sm"
                            style={{ color: "#f59e0b" }}
                          >
                            {row.percent}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="raj text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            Date
                          </p>
                          <p
                            className="raj font-medium text-xs"
                            style={{ color: "#64748b" }}
                          >
                            {format(new Date(row.created_at), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── REFERRED USERS ── */}
          {activeTab === "referred" && (
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Desktop header */}
              <div
                className="hidden md:grid grid-cols-12 px-6 py-3"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {["User", "Email / UUID", "Total Earned", "Joined"].map(
                  (h, i) => (
                    <span
                      key={i}
                      className={`raj font-bold text-xs tracking-widest uppercase ${i === 0 ? "col-span-3" : i === 1 ? "col-span-4" : i === 2 ? "col-span-2 text-right" : "col-span-3 text-right"}`}
                      style={{ color: "#334155" }}
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{
                      borderColor: "rgba(245,158,11,0.2)",
                      borderTopColor: "#f59e0b",
                      animation: "spin .8s linear infinite",
                    }}
                  />
                  <p
                    className="raj font-semibold text-sm"
                    style={{ color: "#334155" }}
                  >
                    Loading...
                  </p>
                </div>
              ) : referred.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ color: "#1e293b" }}
                    >
                      <path
                        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p
                      className="orb font-black text-sm mb-1"
                      style={{ color: "#334155" }}
                    >
                      No referrals yet
                    </p>
                    <p
                      className="raj font-medium text-xs"
                      style={{ color: "#1e293b" }}
                    >
                      Invite friends to join and start earning
                    </p>
                  </div>
                </div>
              ) : (
                referred.map((u, idx) => (
                  <div
                    key={u.id}
                    className="row-hover"
                    style={{
                      borderBottom:
                        idx < referred.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-12 items-center px-6 py-4">
                      <div className="col-span-3 flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 orb font-black text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#f59e0b,#f97316)",
                            color: "#080810",
                          }}
                        >
                          {(u.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <p
                          className="raj font-bold text-sm"
                          style={{ color: "#f1f5f9" }}
                        >
                          {u.name || "Unknown"}
                        </p>
                      </div>
                      <div className="col-span-4">
                        <p
                          className="raj font-medium text-sm"
                          style={{ color: "#64748b" }}
                        >
                          {u.email || "—"}
                        </p>
                        <p
                          className="raj text-xs mt-0.5"
                          style={{ color: "#334155" }}
                        >
                          UUID: {u.uuid}
                        </p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p
                          className="raj font-bold text-sm"
                          style={{ color: "#10b981" }}
                        >
                          $
                          {parseFloat(u.total_commission_earned || 0).toFixed(
                            4,
                          )}
                        </p>
                      </div>
                      <div className="col-span-3 text-right">
                        <p
                          className="raj font-medium text-xs"
                          style={{ color: "#475569" }}
                        >
                          {fmt(u.user_registered)}
                        </p>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden px-4 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 orb font-black text-base"
                          style={{
                            background:
                              "linear-gradient(135deg,#f59e0b,#f97316)",
                            color: "#080810",
                          }}
                        >
                          {(u.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="raj font-bold text-sm"
                            style={{ color: "#f1f5f9" }}
                          >
                            {u.name || "Unknown"}
                          </p>
                          <p
                            className="raj text-xs"
                            style={{ color: "#475569" }}
                          >
                            {u.email || u.uuid}
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div>
                          <p
                            className="raj text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            You Earned
                          </p>
                          <p
                            className="raj font-bold text-sm"
                            style={{ color: "#10b981" }}
                          >
                            $
                            {parseFloat(u.total_commission_earned || 0).toFixed(
                              4,
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="raj text-xs mb-0.5"
                            style={{ color: "#475569" }}
                          >
                            Joined
                          </p>
                          <p
                            className="raj font-medium text-xs"
                            style={{ color: "#64748b" }}
                          >
                            {format(new Date(u.user_registered), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Referral;
