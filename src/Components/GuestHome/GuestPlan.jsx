import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GuestNav, GuestFooter } from "./GuestLayout";
import { API_BASE_URL } from "../../api/getApiURL";

const FALLBACK_COLORS = [
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#3b82f6",
  "#10b981",
];

const Skeleton = ({ className = "" }) => (
  <div className={`rounded-lg animate-skel bg-white/5 ${className}`} />
);

const GuestPlans = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/mining/packages`)
      .then((r) => setPackages(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <GuestNav />

      {/* Page hero */}
      <div
        className="relative px-6 md:px-10 py-20 overflow-hidden"
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
        <div className="relative z-10 text-center max-w-2xl mx-auto animate-fade-up">
          <p
            className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-4"
            style={{ color: "#f59e0b" }}
          >
            All Mining Plans
          </p>
          <h1
            className="font-orbitron font-black mb-5"
            style={{ fontSize: "clamp(28px,5vw,56px)" }}
          >
            Pick Your Mining Plan
          </h1>
          <p
            className="font-rajdhani text-base leading-relaxed"
            style={{ color: "#64748b" }}
          >
            Every plan runs on real industrial hardware in our global data
            centers. Deposit once, earn daily, withdraw anytime.
          </p>
        </div>
      </div>

      {/* Plans grid */}
      <section className="px-6 md:px-10 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8 flex flex-col gap-4"
                  style={{
                    background: "#0d0d1a",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <Skeleton className="h-6 w-2/5" />
                  <Skeleton className="h-12 w-3/5" />
                  <Skeleton className="h-4 w-1/3" />
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-5 w-full" />
                  ))}
                  <Skeleton className="h-12 w-full rounded-xl mt-2" />
                </div>
              ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="font-orbitron font-bold text-xl mb-3"
              style={{ color: "#334155" }}
            >
              No plans available
            </p>
            <p className="font-rajdhani text-base" style={{ color: "#1e293b" }}>
              Check back soon for new mining packages.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {packages.map((pkg, i) => {
              const color =
                pkg.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
              const featured = pkg.featured || i === 1;
              return (
                <div
                  key={pkg.id}
                  className="plan-card rounded-2xl p-8 relative overflow-hidden transition-transform duration-300 flex flex-col"
                  style={{
                    background: "#0d0d1a",
                    border: `1px solid ${featured ? color + "55" : "rgba(255,255,255,.06)"}`,
                    boxShadow: featured ? `0 0 48px ${color}20` : undefined,
                  }}
                >
                  {/* Top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(90deg,${color},transparent)`,
                    }}
                  />
                  {featured && (
                    <span
                      className="absolute top-4 right-4 font-rajdhani font-black text-xs tracking-widest px-3 py-1 rounded-full"
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#f97316)",
                        color: "#080810",
                      }}
                    >
                      POPULAR
                    </span>
                  )}

                  <p
                    className="font-orbitron font-black text-lg mb-1"
                    style={{ color }}
                  >
                    {pkg.name}
                  </p>
                  <p
                    className="font-orbitron font-black mb-1"
                    style={{ fontSize: 36, color }}
                  >
                    {Number(pkg.rent_amount).toLocaleString()}
                  </p>
                  <p
                    className="font-rajdhani text-sm mb-7"
                    style={{ color: "#64748b" }}
                  >
                    USDT Minimum Deposit
                  </p>

                  <div className="flex-1">
                    {[
                      {
                        label: "Daily Rate",
                        val: `${pkg.daily_rate}%`,
                        c: color,
                      },
                      {
                        label: "Duration",
                        val: `${pkg.duration_days} Days`,
                        c: "#e2e8f0",
                      },
                      {
                        label: "Hashrate",
                        val: pkg.hashrate || "—",
                        c: "#e2e8f0",
                      },
                      {
                        label: "Total Return",
                        val: pkg.total_return ? `${pkg.total_return}%` : "—",
                        c: "#10b981",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center py-3 font-rajdhani text-sm"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <span style={{ color: "#64748b", fontWeight: 600 }}>
                          {row.label}
                        </span>
                        <span style={{ color: row.c, fontWeight: 700 }}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p
                      className="font-rajdhani text-xs mt-5 leading-relaxed"
                      style={{ color: "#475569" }}
                    >
                      {pkg.description}
                    </p>
                  )}

                  <button
                    onClick={() => navigate("/register")}
                    className="w-full mt-7 py-3.5 rounded-xl font-rajdhani font-bold tracking-widest text-sm cursor-pointer transition-all duration-200"
                    style={
                      featured
                        ? {
                            background: `linear-gradient(135deg,${color},#ef4444)`,
                            color: "#080810",
                            border: "none",
                          }
                        : {
                            background: "transparent",
                            color,
                            border: `1.5px solid ${color}`,
                          }
                    }
                  >
                    ACTIVATE PLAN
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
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
          Need a custom plan?
        </h3>
        <p
          className="font-rajdhani text-base mb-8 relative z-10"
          style={{ color: "#64748b" }}
        >
          Our enterprise team can build a tailored mining solution for large
          deposits.
        </p>
        <button
          onClick={() => navigate("/support")}
          className="font-rajdhani font-bold tracking-widest text-sm px-10 py-4 rounded-xl border-none cursor-pointer btn-primary transition-all duration-200 relative z-10"
          style={{
            background: "linear-gradient(135deg,#f59e0b,#f97316)",
            color: "#080810",
          }}
        >
          CONTACT SUPPORT
        </button>
      </div>

      <GuestFooter />
    </div>
  );
};

export default GuestPlans;
