import React, { useEffect, useRef, useState } from "react";
import Header from "../Header/Header";

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ── Animated counter stat ──────────────────────────────────────────────────
function Stat({ value, suffix, label, start }) {
  const count = useCountUp(value, 2000, start);
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "clamp(28px, 7vw, 48px)",
          fontWeight: 800,
          color: "#f59e0b",
          lineHeight: 1,
          fontFamily: "'Orbitron', monospace",
          letterSpacing: "-0.02em",
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: "clamp(11px, 2.8vw, 13px)",
          color: "#64748b",
          marginTop: 6,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Hash rate animated ticker ──────────────────────────────────────────────
function HashTicker() {
  const [hash, setHash] = useState("847.3");
  useEffect(() => {
    const id = setInterval(() => {
      setHash(parseFloat(Math.random() * 200 + 750).toFixed(1));
    }, 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      style={{
        fontFamily: "'Orbitron', monospace",
        color: "#10b981",
        fontWeight: 700,
        fontSize: "clamp(13px, 3.2vw, 16px)",
        transition: "all 0.3s ease",
      }}
    >
      {hash} TH/s
    </span>
  );
}

// ── Mining rig illustration ────────────────────────────────────────────────
function RigCard({ name, hashrate, power, efficiency, color, delay }) {
  const [ref, inView] = useInView();
  const bars = [0.85, 0.72, 0.91, 0.68, 0.88, 0.75, 0.94, 0.62];
  return (
    <div
      ref={ref}
      style={{
        background: "rgba(15,15,25,0.8)",
        border: `1px solid ${color}40`,
        borderRadius: 16,
        padding: "clamp(16px,4vw,24px)",
        position: "relative",
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `${color}15`,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "clamp(13px,3.5vw,15px)",
              fontWeight: 700,
              color: "#f1f5f9",
              fontFamily: "'Orbitron', monospace",
              letterSpacing: "0.05em",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: "clamp(10px,2.5vw,12px)",
              color: "#475569",
              marginTop: 2,
            }}
          >
            {power}W · {efficiency} J/TH
          </div>
        </div>
        <div
          style={{
            background: `${color}20`,
            border: `1px solid ${color}40`,
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: "clamp(11px,2.8vw,13px)",
            fontWeight: 700,
            color,
            fontFamily: "'Orbitron', monospace",
          }}
        >
          {hashrate}
        </div>
      </div>
      {/* Mini bar chart — simulated GPU utilization */}
      <div
        style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 36 }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: 3,
              background: `${color}${inView ? "cc" : "30"}`,
              transition: `height 0.8s ease ${delay + i * 60}ms, background 0.4s ease`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: "clamp(9px,2.2vw,11px)",
          color: "#475569",
        }}
      >
        <span>GPU Load</span>
        <span style={{ color: "#10b981" }}>● Active</span>
      </div>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "clamp(18px,4vw,28px)",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${accent}18`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: "clamp(22px,5vw,28px)",
          marginBottom: "clamp(10px,2.5vw,16px)",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "clamp(14px,3.5vw,16px)",
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 8,
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: "0.03em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "clamp(12px,3vw,14px)",
          color: "#64748b",
          lineHeight: 1.7,
        }}
      >
        {desc}
      </div>
    </div>
  );
}

// ── Coin card ─────────────────────────────────────────────────────────────
function CoinCard({ symbol, name, algo, color, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 14,
        padding: "clamp(14px,3.5vw,20px)",
        textAlign: "center",
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.9)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          fontSize: "clamp(24px,6vw,32px)",
          fontWeight: 900,
          color,
          fontFamily: "'Orbitron', monospace",
          marginBottom: 6,
        }}
      >
        {symbol}
      </div>
      <div
        style={{
          fontSize: "clamp(11px,2.8vw,13px)",
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 4,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: "clamp(9px,2.2vw,11px)",
          color: "#475569",
          background: `${color}18`,
          borderRadius: 6,
          padding: "2px 8px",
          display: "inline-block",
        }}
      >
        {algo}
      </div>
    </div>
  );
}

// ── Timeline item ──────────────────────────────────────────────────────────
function TimelineItem({ year, title, desc, isLast, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: "clamp(12px,3vw,20px)",
        alignItems: "flex-start",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-24px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 4,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#f59e0b",
            boxShadow: "0 0 0 4px rgba(245,158,11,0.2)",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              background: "rgba(245,158,11,0.2)",
              minHeight: 32,
              marginTop: 4,
            }}
          />
        )}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : "clamp(20px,5vw,36px)" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 99,
            padding: "2px 10px",
            fontSize: "clamp(10px,2.5vw,12px)",
            fontWeight: 700,
            color: "#f59e0b",
            marginBottom: 8,
            fontFamily: "'Orbitron', monospace",
          }}
        >
          {year}
        </div>
        <div
          style={{
            fontSize: "clamp(14px,3.5vw,16px)",
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "clamp(12px,3vw,14px)",
            color: "#64748b",
            lineHeight: 1.65,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

// ── Team card ──────────────────────────────────────────────────────────────
function TeamCard({ initials, name, role, color, image, delay }) {
  const [ref, inView] = useInView();
  const [imgError, setImgError] = useState(false);
  return (
    <div
      ref={ref}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "clamp(16px,4vw,24px)",
        textAlign: "center",
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.93)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: 60,
          borderRadius: "50%",
          background: `${color}20`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: "clamp(52px,14vw,68px)",
          height: "clamp(52px,14vw,68px)",
          borderRadius: "50%",
          margin: "0 auto clamp(10px,2.5vw,16px)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}55)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: "50%",
            background: "#080810",
          }}
        />
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              position: "relative",
              zIndex: 2,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${color}cc, ${color}55)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(14px,4vw,18px)",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Orbitron', monospace",
              position: "relative",
              zIndex: 2,
            }}
          >
            {initials}
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: "clamp(13px,3.5vw,15px)",
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 6,
        }}
      >
        {name}
      </div>
      <div
        style={{
          display: "inline-block",
          background: `${color}18`,
          border: `1px solid ${color}35`,
          borderRadius: 99,
          padding: "3px 10px",
          fontSize: "clamp(10px,2.5vw,12px)",
          color,
          fontWeight: 600,
        }}
      >
        {role}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AboutUs() {
  const [statsRef, statsInView] = useInView(0.3);

  const rigs = [
    {
      name: "ANTMINER S21",
      hashrate: "200 TH/s",
      power: "3550",
      efficiency: "17.5",
      color: "#f59e0b",
      delay: 0,
    },
    {
      name: "WHATSMINER M60",
      hashrate: "186 TH/s",
      power: "3441",
      efficiency: "18.5",
      color: "#10b981",
      delay: 100,
    },
    {
      name: "ANTMINER S19 XP",
      hashrate: "140 TH/s",
      power: "3010",
      efficiency: "21.5",
      color: "#3b82f6",
      delay: 200,
    },
    {
      name: "AVALON A1466",
      hashrate: "150 TH/s",
      power: "3400",
      efficiency: "22.7",
      color: "#a78bfa",
      delay: 300,
    },
  ];

  const coins = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      algo: "SHA-256",
      color: "#f59e0b",
      delay: 0,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      algo: "Ethash",
      color: "#627eea",
      delay: 80,
    },
    {
      symbol: "LTC",
      name: "Litecoin",
      algo: "Scrypt",
      color: "#a0a0a0",
      delay: 160,
    },
    {
      symbol: "XMR",
      name: "Monero",
      algo: "RandomX",
      color: "#ff6600",
      delay: 240,
    },
  ];

  const features = [
    {
      icon: "⛏️",
      title: "Industrial-Grade Hardware",
      desc: "Our data centers run the latest ASIC miners from Bitmain, MicroBT, and Canaan — machines that deliver maximum hash rate with minimum power draw.",
      accent: "#f59e0b",
      delay: 0,
    },
    {
      icon: "⚡",
      title: "Renewable Energy First",
      desc: "70% of our mining operations are powered by renewable energy sources — hydro, solar, and wind — keeping your carbon footprint and electricity costs low.",
      accent: "#10b981",
      delay: 80,
    },
    {
      icon: "📊",
      title: "Real-Time Dashboard",
      desc: "Monitor your mining output, hash rate, power consumption, and earnings 24/7 from any device with our live analytics dashboard.",
      accent: "#3b82f6",
      delay: 160,
    },
    {
      icon: "🔒",
      title: "Non-Custodial Payouts",
      desc: "Mined coins go directly to your wallet. We never hold your funds. Automatic payouts are triggered daily when your balance hits the threshold.",
      accent: "#a78bfa",
      delay: 240,
    },
    {
      icon: "🌡️",
      title: "Thermal Management",
      desc: "Immersion cooling and precision airflow systems keep our rigs at peak operating temperature, maximizing lifespan and preventing costly downtime.",
      accent: "#ec4899",
      delay: 320,
    },
    {
      icon: "🤖",
      title: "Auto-Switch Mining",
      desc: "Our profitability engine automatically switches your hash power to the most profitable coin at any given moment, silently maximizing your daily returns.",
      accent: "#f59e0b",
      delay: 400,
    },
  ];

  const timeline = [
    {
      year: "2019",
      title: "First Mining Farm",
      desc: "Launched our first 50-rig Bitcoin mining facility in Iceland, leveraging geothermal energy for ultra-low operating costs.",
      delay: 0,
    },
    {
      year: "2021",
      title: "Multi-Coin Expansion",
      desc: "Expanded to Ethereum, Litecoin, and Monero mining pools — giving subscribers diversified exposure across proof-of-work blockchains.",
      delay: 100,
    },
    {
      year: "2022",
      title: "10,000 Active Miners",
      desc: "Crossed 10,000 active cloud mining subscribers across 60 countries, with over $180M in cumulative payouts.",
      delay: 200,
    },
    {
      year: "2024",
      title: "Next-Gen ASICs",
      desc: "Deployed the Antminer S21 Pro fleet — our most energy-efficient hardware to date — across three new data centers in Norway and Canada.",
      delay: 300,
    },
  ];

  const team = [
    {
      initials: "RK",
      name: "Rajan Kohli",
      role: "CEO & Mining Architect",
      color: "#f59e0b",
      image:
        "https://media.licdn.com/dms/image/v2/D4E03AQFXjmSFhCVXoA/profile-displayphoto-scale_200_200/B4EZfGrcEVHwAc-/0/1751384965788?e=2147483647&v=beta&t=6N5rC33Uy6tFRsRu7dlbjsS9IhPDZaDqw-45WwlkUq8",
      delay: 0,
    },
    {
      initials: "TW",
      name: "Tara Walsh",
      role: "CTO & Infrastructure",
      color: "#10b981",
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQGqMlev2bNlQQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1728390189568?e=2147483647&v=beta&t=NRXA-p7nKAhiwiJUV7e_9jbvq-77ABJpV5TcDFXLZX0",
      delay: 80,
    },
    {
      initials: "DM",
      name: "Denis Müller",
      role: "Head of Operations",
      color: "#3b82f6",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWSIhcak19CtkPCl8PQkJdjSHaA6KOWDoJQA&s",
      delay: 160,
    },
    {
      initials: "AL",
      name: "Aiko Lim",
      role: "Blockchain Security",
      color: "#a78bfa",
      image:
        "https://www.cedarcrest.edu/wp-content/uploads/2024/10/Nina_Patel_2.jpg",
      delay: 240,
    },
  ];

  return (
    <div
      style={{
        background: "#080810",
        minHeight: "100vh",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {/* Load fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }

        /* Scrolling ticker */
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .ticker-inner { display: flex; gap: 40px; animation: ticker 18s linear infinite; white-space: nowrap; }

        /* Pulse dot */
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .pulse { animation: pulse 2s ease infinite; }

        /* Grid line bg */
        .grid-bg {
          background-image:
            linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @media (min-width: 768px) {
          .rig-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; }
          .coin-grid { grid-template-columns: repeat(4,1fr) !important; }
          .feature-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; }
          .team-grid { grid-template-columns: repeat(4,1fr) !important; }
          .stats-row { flex-direction: row !important; }
          .stats-divider-v { width: 1px !important; height: auto !important; }
          .hero-inner { flex-direction: row !important; align-items: center !important; }
          .hero-text { max-width: 520px; }
          .hero-visual { flex: 1; }
        }

        @media (min-width: 1024px) {
          .rig-grid { grid-template-columns: repeat(4,1fr) !important; }
          .feature-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>

      <div className="flex-shrink-0">
        <Header pageTitle="About Us" />
      </div>

      {/* ── HERO ── */}
      <div
        className="grid-bg"
        style={{
          padding: "clamp(40px,10vw,80px) clamp(20px,6vw,60px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Amber glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80vw",
            height: "40vw",
            maxWidth: 700,
            maxHeight: 300,
            background:
              "radial-gradient(ellipse,rgba(245,158,11,0.12) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="hero-inner"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(32px,6vw,60px)",
            maxWidth: 1200,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div className="hero-text">
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 99,
                padding: "5px 14px",
                marginBottom: "clamp(16px,4vw,24px)",
              }}
            >
              <span
                className="pulse"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Est. 2019 · Mining First
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(32px,8vw,64px)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                fontFamily: "'Orbitron', monospace",
                color: "#f1f5f9",
                marginBottom: "clamp(14px,3vw,20px)",
              }}
            >
              MINE SMARTER.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#fbbf24,#f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                EARN HARDER.
              </span>
            </h1>

            <p
              style={{
                fontSize: "clamp(14px,3.5vw,17px)",
                color: "#94a3b8",
                lineHeight: 1.75,
                maxWidth: 480,
                marginBottom: "clamp(20px,5vw,32px)",
              }}
            >
              CryptoMine operates industrial-scale ASIC mining farms across 6
              countries, delivering consistent crypto earnings to over 50,000
              subscribers worldwide — no hardware, no headaches.
            </p>

            {/* Live hash ticker */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 12,
                padding: "10px 16px",
              }}
            >
              <span
                className="pulse"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(11px,2.8vw,13px)",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                LIVE NETWORK HASH RATE
              </span>
              <HashTicker />
            </div>
          </div>

          {/* Visual — rig metrics panel */}
          <div className="hero-visual" style={{ flex: 1 }}>
            <div
              style={{
                background: "rgba(10,10,20,0.9)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 20,
                padding: "clamp(16px,4vw,28px)",
                maxWidth: 480,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: "clamp(11px,2.8vw,13px)",
                    color: "#f59e0b",
                    fontWeight: 700,
                  }}
                >
                  FARM STATUS
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "clamp(10px,2.5vw,12px)",
                    color: "#10b981",
                    fontWeight: 600,
                  }}
                >
                  <span
                    className="pulse"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "inline-block",
                    }}
                  />
                  ALL SYSTEMS ONLINE
                </span>
              </div>
              {[
                {
                  label: "Active ASICs",
                  value: "12,847",
                  color: "#f59e0b",
                  pct: 97,
                },
                {
                  label: "24h Output",
                  value: "4.2 BTC",
                  color: "#10b981",
                  pct: 88,
                },
                {
                  label: "Power Draw",
                  value: "48.3 MW",
                  color: "#3b82f6",
                  pct: 74,
                },
                { label: "Uptime", value: "99.94%", color: "#a78bfa", pct: 99 },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(11px,2.8vw,13px)",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {m.label}
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(12px,3vw,14px)",
                        fontWeight: 700,
                        color: m.color,
                        fontFamily: "'Orbitron', monospace",
                      }}
                    >
                      {m.value}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${m.pct}%`,
                        borderRadius: 99,
                        background: m.color,
                        transition: "width 1.2s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrolling coin ticker ── */}
      <div
        style={{
          background: "rgba(245,158,11,0.06)",
          borderTop: "1px solid rgba(245,158,11,0.15)",
          borderBottom: "1px solid rgba(245,158,11,0.15)",
          padding: "10px 0",
          overflow: "hidden",
        }}
      >
        <div className="ticker-inner" style={{ display: "flex", gap: 40 }}>
          {[...Array(2)].map((_, ri) =>
            [
              "BTC +2.4%",
              "ETH +1.8%",
              "LTC +3.1%",
              "XMR +0.9%",
              "DOGE +5.2%",
              "BTC +2.4%",
              "ETH +1.8%",
              "LTC +3.1%",
            ].map((t, i) => (
              <span
                key={`${ri}-${i}`}
                style={{
                  fontSize: "clamp(11px,2.8vw,13px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.08em",
                  opacity: 0.8,
                }}
              >
                ⛏ {t}
              </span>
            )),
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div
        ref={statsRef}
        style={{ padding: "clamp(40px,8vw,64px) clamp(20px,6vw,60px)" }}
      >
        <div
          style={{
            background: "rgba(15,15,25,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 24,
            padding: "clamp(28px,6vw,48px)",
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div
            className="stats-row"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(24px,5vw,40px)",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            {[
              { value: 50000, suffix: "+", label: "Active Subscribers" },
              { value: 12847, suffix: "", label: "ASIC Miners Online" },
              { value: 6, suffix: "", label: "Countries" },
              { value: 99, suffix: "%", label: "Uptime SLA" },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <Stat {...s} start={statsInView} />
                {i < 3 && (
                  <div
                    className="stats-divider-v"
                    style={{
                      height: 1,
                      width: "80%",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Rigs ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(48px,8vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "clamp(24px,5vw,40px)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 99,
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                Our Hardware
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,5.5vw,40px)",
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "'Orbitron', monospace",
                letterSpacing: "-0.02em",
              }}
            >
              FLEET OF <span style={{ color: "#f59e0b" }}>12,847</span> ASICS
            </h2>
          </div>
          <div
            className="rig-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(12px,2.5vw,16px)",
            }}
          >
            {rigs.map((r, i) => (
              <RigCard key={i} {...r} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Supported Coins ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(48px,8vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "clamp(20px,4vw,32px)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 99,
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                Mineable Assets
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,5.5vw,40px)",
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "'Orbitron', monospace",
                letterSpacing: "-0.02em",
              }}
            >
              COINS WE MINE
            </h2>
          </div>
          <div
            className="coin-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(10px,2.5vw,16px)",
            }}
          >
            {coins.map((c, i) => (
              <CoinCard key={i} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(48px,8vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "clamp(24px,5vw,40px)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 99,
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                Platform
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,5.5vw,40px)",
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "'Orbitron', monospace",
                letterSpacing: "-0.02em",
              }}
            >
              WHY CRYPTOMINE
            </h2>
          </div>
          <div
            className="feature-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(12px,2.5vw,16px)",
            }}
          >
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Story / Timeline ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(48px,8vw,72px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ marginBottom: "clamp(24px,5vw,40px)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 99,
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                Our Journey
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,5.5vw,40px)",
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "'Orbitron', monospace",
                letterSpacing: "-0.02em",
              }}
            >
              MILESTONES
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {timeline.map((t, i) => (
              <TimelineItem key={i} {...t} isLast={i === timeline.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Energy section ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(48px,8vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 24,
              padding: "clamp(24px,5vw,48px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.1)",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: "clamp(12px,3vw,20px)",
              }}
            >
              <span style={{ fontSize: 24 }}>🌿</span>
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#10b981",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                Green Mining
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(20px,5vw,36px)",
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "'Orbitron', monospace",
                marginBottom: "clamp(12px,3vw,20px)",
                letterSpacing: "-0.02em",
              }}
            >
              70% RENEWABLE ENERGY
            </h2>
            <p
              style={{
                fontSize: "clamp(13px,3.2vw,16px)",
                color: "#94a3b8",
                lineHeight: 1.75,
                maxWidth: 600,
                marginBottom: "clamp(20px,4vw,32px)",
              }}
            >
              Our data centers are strategically located near hydroelectric
              dams, wind farms, and solar arrays. We actively reduce the
              environmental footprint of crypto mining without compromising
              profitability.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "clamp(10px,2.5vw,16px)",
              }}
            >
              {[
                { icon: "💧", val: "45%", label: "Hydro Power" },
                { icon: "☀️", val: "15%", label: "Solar" },
                { icon: "💨", val: "10%", label: "Wind" },
              ].map((e, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 14,
                    padding: "clamp(12px,3vw,20px)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(20px,5vw,28px)",
                      marginBottom: 6,
                    }}
                  >
                    {e.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(16px,4vw,24px)",
                      fontWeight: 800,
                      color: "#10b981",
                      fontFamily: "'Orbitron', monospace",
                      marginBottom: 4,
                    }}
                  >
                    {e.val}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px,2.5vw,12px)",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    {e.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Team ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(48px,8vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "clamp(24px,5vw,40px)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 99,
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontSize: "clamp(10px,2.5vw,12px)",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                The Team
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,5.5vw,40px)",
                fontWeight: 900,
                color: "#f1f5f9",
                fontFamily: "'Orbitron', monospace",
                letterSpacing: "-0.02em",
              }}
            >
              BUILT BY MINERS
            </h2>
          </div>
          <div
            className="team-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(10px,2.5vw,16px)",
            }}
          >
            {team.map((m, i) => (
              <TeamCard key={i} {...m} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission CTA ── */}
      <div style={{ padding: "0 clamp(20px,6vw,60px) clamp(60px,12vw,100px)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "linear-gradient(135deg,#111118,#1a1508,#111118)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 28,
            padding: "clamp(32px,7vw,64px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative corners */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 60,
              height: 60,
              borderTop: "2px solid #f59e0b",
              borderLeft: "2px solid #f59e0b",
              borderRadius: "28px 0 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 60,
              height: 60,
              borderBottom: "2px solid #f59e0b",
              borderRight: "2px solid #f59e0b",
              borderRadius: "0 0 28px 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "60%",
              height: "60%",
              background:
                "radial-gradient(ellipse,rgba(245,158,11,0.08) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontSize: "clamp(10px,2.5vw,12px)",
              fontWeight: 700,
              color: "#f59e0b",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "'Orbitron', monospace",
              marginBottom: "clamp(12px,3vw,20px)",
            }}
          >
            OUR MISSION
          </div>
          <h2
            style={{
              fontSize: "clamp(22px,6vw,48px)",
              fontWeight: 900,
              color: "#f1f5f9",
              fontFamily: "'Orbitron', monospace",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              marginBottom: "clamp(14px,3vw,24px)",
            }}
          >
            MAKE CRYPTO MINING
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#f59e0b,#fbbf24,#f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ACCESSIBLE TO ALL
            </span>
          </h2>
          <p
            style={{
              fontSize: "clamp(13px,3.5vw,16px)",
              color: "#94a3b8",
              lineHeight: 1.75,
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            We believe mining shouldn't require a warehouse, an electrician, and
            a cooling engineer. CryptoMine is our commitment to putting
            institutional hash power in the hands of everyday people.
          </p>
        </div>
      </div>
    </div>
  );
}
