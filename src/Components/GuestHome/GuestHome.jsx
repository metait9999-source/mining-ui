import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GuestNav, GuestFooter } from "./GuestLayout";
import { API_BASE_URL } from "../../api/getApiURL";
import { useVisitorTrack } from "../../hooks/useVisitorTrack";

const STATS = [
  { value: "847K+", label: "Active Miners" },
  { value: "$2.4B", label: "Total Mined" },
  { value: "99.9%", label: "Uptime" },
  { value: "180+", label: "Countries" },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
    title: "Global Nodes",
    desc: "40+ data centers worldwide ensuring maximum uptime and speed.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
    title: "Real-Time Earnings",
    desc: "Live dashboard updated every second — watch profits grow.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Military Security",
    desc: "256-bit encryption, cold storage & multi-sig wallet protection.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2v20M2 12h20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    title: "Instant Withdrawal",
    desc: "Withdraw to any wallet in minutes — zero holding periods.",
  },
];

const PLAN_COLORS = ["#f59e0b", "#f97316", "#ef4444"];

/* ── Animated particle canvas ── */
const ParticleField = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let id;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.5 + 0.1,
      c: Math.random() > 0.5 ? "#f59e0b" : "#f97316",
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x,
            dy = pts[i].y - pts[j].y,
            d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(245,158,11,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

/* ── Skeleton loader ── */
const Skeleton = ({ className = "" }) => (
  <div className={`rounded-lg animate-skel bg-white/5 ${className}`} />
);

const GuestHome = () => {
  useVisitorTrack();
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [packages, setPackages] = useState([]);
  const [pkgLoading, setPkgLoading] = useState(true);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/mining/packages`)
      .then((r) => setPackages((r.data || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setPkgLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <GuestNav />

      {/* ═══════════════════════════════════════ HERO */}
      <section className="relative flex items-center min-h-screen px-6 md:px-10 py-20 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%,rgba(245,158,11,.07) 0%,transparent 60%),radial-gradient(ellipse at 20% 80%,rgba(249,115,22,.05) 0%,transparent 50%)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,158,11,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.04) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <ParticleField />

        {/* Content */}
        <div className="relative z-10 max-w-xl animate-fade-up">
          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: "rgba(245,158,11,.1)",
              border: "1px solid rgba(245,158,11,.3)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: "#f59e0b" }}
            />
            <span
              className="font-rajdhani font-bold text-xs tracking-widest"
              style={{ color: "#f59e0b" }}
            >
              MINING NETWORK LIVE
            </span>
          </div>

          <h1
            className="font-orbitron font-black leading-tight mb-6"
            style={{ fontSize: "clamp(36px,6vw,72px)" }}
          >
            MINE THE{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316,#ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FUTURE
            </span>
          </h1>

          <p
            className="font-rajdhani text-lg leading-relaxed mb-10 max-w-md"
            style={{ color: "#94a3b8" }}
          >
            Deploy capital into our industrial-grade mining infrastructure. Earn
            daily crypto rewards with zero hardware required. Transparent,
            automated, and always on.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/register")}
              className="font-rajdhani font-bold tracking-widest px-8 py-4 rounded-xl border-none cursor-pointer btn-primary transition-all duration-200"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "#080810",
                fontSize: 15,
              }}
            >
              START MINING
            </button>
            <button
              onClick={() => navigate("/plans")}
              className="font-rajdhani font-bold tracking-widest px-8 py-4 rounded-xl cursor-pointer btn-outline transition-all duration-200"
              style={{
                background: "transparent",
                color: "#f59e0b",
                border: "1.5px solid rgba(245,158,11,.5)",
                fontSize: 15,
              }}
            >
              VIEW ALL PLANS
            </button>
          </div>
        </div>

        {/* Orb */}
        <div
          className="absolute hidden lg:block"
          style={{
            right: "5%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "min(420px,38%)",
            aspectRatio: "1",
          }}
        >
          <div
            className="absolute inset-0 rounded-full animate-orb-rotate"
            style={{
              background:
                "radial-gradient(circle at 40% 35%,rgba(245,158,11,.2),rgba(249,115,22,.1) 50%,transparent 70%)",
              border: "1px solid rgba(245,158,11,.15)",
            }}
          >
            <div
              className="absolute rounded-full animate-orb-rotate-rev"
              style={{
                inset: 15,
                border: "1px dashed rgba(245,158,11,.12)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            className="absolute rounded-full animate-orb-pulse"
            style={{
              inset: "25%",
              background:
                "radial-gradient(circle,rgba(245,158,11,.25),rgba(249,115,22,.1))",
              boxShadow:
                "0 0 60px rgba(245,158,11,.2),inset 0 0 40px rgba(249,115,22,.1)",
            }}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════ STATS */}
      <div
        ref={statsRef}
        className="py-14 px-6 md:px-10"
        style={{
          background: "#0d0d1a",
          borderTop: "1px solid rgba(245,158,11,.1)",
          borderBottom: "1px solid rgba(245,158,11,.1)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div
                className="font-orbitron font-black mb-2"
                style={{ fontSize: "clamp(26px,4vw,40px)", color: "#f59e0b" }}
              >
                {statsVisible ? s.value : "—"}
              </div>
              <div
                className="font-rajdhani font-bold text-xs tracking-widest uppercase"
                style={{ color: "#64748b" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════ PLANS */}
      <section className="px-6 md:px-10 py-20">
        <p
          className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-3"
          style={{ color: "#f59e0b" }}
        >
          Mining Plans
        </p>
        <h2
          className="font-orbitron font-black mb-4"
          style={{ fontSize: "clamp(24px,4vw,42px)" }}
        >
          Choose Your Power Level
        </h2>
        <p
          className="font-rajdhani text-base max-w-lg mb-12"
          style={{ color: "#64748b", lineHeight: 1.7 }}
        >
          From casual earners to serious miners — every tier backed by real
          hardware running 24/7 in our data centers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pkgLoading
            ? Array(3)
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
                    <Skeleton className="h-px w-full" />
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                    <Skeleton className="h-12 w-full rounded-xl mt-2" />
                  </div>
                ))
            : packages.map((pkg, i) => {
                const color = pkg.color || PLAN_COLORS[i % PLAN_COLORS.length];
                const featured = i === 1;
                return (
                  <div
                    key={pkg.id}
                    className="plan-card rounded-2xl p-8 relative overflow-hidden transition-transform duration-300"
                    style={{
                      background: "#0d0d1a",
                      border: `1px solid ${featured ? color + "55" : "rgba(255,255,255,.06)"}`,
                      boxShadow: featured ? `0 0 48px ${color}22` : undefined,
                    }}
                  >
                    {/* Top accent bar */}
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
                          background: `linear-gradient(135deg,#f59e0b,#f97316)`,
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
                      style={{ fontSize: 34, color }}
                    >
                      {Number(pkg.rent_amount).toLocaleString()}
                    </p>
                    <p
                      className="font-rajdhani text-sm mb-7"
                      style={{ color: "#64748b" }}
                    >
                      USDT Minimum Deposit
                    </p>

                    {[
                      {
                        label: "Daily Rate",
                        val: `${pkg.daily_rate}%`,
                        valColor: color,
                      },
                      {
                        label: "Duration",
                        val: `${pkg.duration_days} Days`,
                        valColor: "#e2e8f0",
                      },
                      {
                        label: "Hashrate",
                        val: pkg.hashrate || "—",
                        valColor: "#e2e8f0",
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
                        <span style={{ color: row.valColor, fontWeight: 700 }}>
                          {row.val}
                        </span>
                      </div>
                    ))}

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

        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/plans")}
            className="font-rajdhani font-bold tracking-widest text-sm px-8 py-3.5 rounded-xl cursor-pointer btn-outline transition-all duration-200"
            style={{
              background: "transparent",
              color: "#f59e0b",
              border: "1.5px solid rgba(245,158,11,.5)",
            }}
          >
            SEE ALL PLANS →
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════ FEATURES */}
      <section
        className="px-6 md:px-10 py-20"
        style={{
          background: "#0d0d1a",
          borderTop: "1px solid rgba(255,255,255,.05)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <p
          className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-3"
          style={{ color: "#f59e0b" }}
        >
          Why Choose Us
        </p>
        <h2
          className="font-orbitron font-black mb-12"
          style={{ fontSize: "clamp(24px,4vw,42px)" }}
        >
          Built for Serious Miners
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feat-card rounded-2xl p-6 text-center transition-all duration-300"
              style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,.05)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "rgba(245,158,11,.08)",
                  border: "1px solid rgba(245,158,11,.15)",
                  color: "#f59e0b",
                }}
              >
                {f.icon}
              </div>
              <p className="font-orbitron font-bold text-sm mb-2">{f.title}</p>
              <p
                className="font-rajdhani text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ CTA */}
      <div
        className="mx-4 md:mx-10 my-20 rounded-3xl p-16 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#0f0f1f,#161628)",
          border: "1px solid rgba(245,158,11,.15)",
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 200,
            background:
              "radial-gradient(ellipse,rgba(245,158,11,.12),transparent 70%)",
          }}
        />
        <h2
          className="font-orbitron font-black mb-4 relative z-10"
          style={{ fontSize: "clamp(26px,4vw,46px)" }}
        >
          Ready to Start <span style={{ color: "#f59e0b" }}>Mining?</span>
        </h2>
        <p
          className="font-rajdhani text-base mb-10 max-w-md mx-auto relative z-10"
          style={{ color: "#64748b" }}
        >
          Join 847,000+ miners already earning daily passive income with our
          platform.
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
            CREATE ACCOUNT
          </button>
          <button
            onClick={() => navigate("/about-us")}
            className="font-rajdhani font-bold tracking-widest px-10 py-4 rounded-xl cursor-pointer btn-outline transition-all duration-200"
            style={{
              background: "transparent",
              color: "#f59e0b",
              border: "1.5px solid rgba(245,158,11,.5)",
              fontSize: 15,
            }}
          >
            LEARN MORE
          </button>
        </div>
      </div>

      <GuestFooter />
    </div>
  );
};

export default GuestHome;
