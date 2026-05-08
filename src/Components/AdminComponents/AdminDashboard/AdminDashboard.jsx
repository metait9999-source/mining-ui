import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";

/* ── Sparkline SVG ── */
const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => d.unique_visitors);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals);
  const w = 120,
    h = 36,
    pad = 2;
  const pts = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  });
  const fillPts = [`${pad},${h}`, ...pts, `${w - pad},${h}`].join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={pts.join(" ")}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

/* ── Bar chart ── */
const BarChart = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
        No data yet
      </div>
    );

  const reversed = [...data].reverse();
  const maxVal = Math.max(...reversed.map((d) => d.unique_visitors), 1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 120,
        padding: "0 4px",
      }}
    >
      {reversed.map((d, i) => {
        const pct = (d.unique_visitors / maxVal) * 100;
        const date = new Date(d.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        const isLast = i === reversed.length - 1;
        return (
          <div
            key={d.date}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
            title={`${d.date}: ${d.unique_visitors} unique, ${d.total_visits} total`}
          >
            <div
              style={{
                width: "100%",
                height: `${Math.max(pct, 4)}%`,
                borderRadius: "4px 4px 2px 2px",
                background: isLast
                  ? "linear-gradient(180deg,#f59e0b,#f97316)"
                  : "#fde68a",
                transition: "height 0.6s ease",
                minHeight: 4,
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: "#94a3b8",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({
  label,
  value,
  sub,
  subColor,
  color,
  icon,
  sparkData,
  delay,
}) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 20,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      animation: "fadeUp 0.5s ease both",
      animationDelay: `${delay}ms`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: color,
        borderRadius: "20px 20px 0 0",
      }}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "6px 0 2px",
            fontSize: 32,
            fontWeight: 900,
            color: "#0f172a",
            lineHeight: 1,
          }}
        >
          {value ?? <span style={{ fontSize: 18, color: "#cbd5e1" }}>—</span>}
        </p>
        {sub && (
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: subColor ?? "#94a3b8",
              fontWeight: 600,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          flexShrink: 0,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </div>
    </div>

    {sparkData && sparkData.length > 1 && (
      <div style={{ marginTop: 12 }}>
        <Sparkline data={sparkData} color={color} />
      </div>
    )}
  </div>
);

/* ── Icons ── */
const Icons = {
  users: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  eye: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  today: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  zap: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  refresh: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
};

/* ════════════════════════════════
   MAIN COMPONENT
════════════════════════════════ */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(14);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/visitors/stats?days=${days}`,
      );
      setStats(data);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to load visitor stats");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    const id = setInterval(fetchStats, 60_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const today = stats?.today;
  const daily = stats?.daily ?? [];

  const yesterday = daily.find((d) => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return d.date === y.toISOString().slice(0, 10);
  });

  const todayVsYesterday =
    today && yesterday
      ? today.unique_visitors - yesterday.unique_visitors
      : null;

  return (
    <div
      style={{
        padding: "28px 24px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .dash-row-hover:hover { background: #f8fafc !important; }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: 0.5,
            }}
          >
            Dashboard
          </h1>
          {lastUpdated && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 1,
                background: days === d ? "#fef3c7" : "#ffffff",
                color: days === d ? "#d97706" : "#64748b",
                border: days === d ? "1px solid #fcd34d" : "1px solid #e2e8f0",
                transition: "all .2s",
              }}
            >
              {d}D
            </button>
          ))}

          <button
            onClick={fetchStats}
            disabled={loading}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              cursor: "pointer",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          >
            {Icons.refresh}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 24,
            color: "#dc2626",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          delay={0}
          label="Total Unique Visitors"
          value={loading ? "..." : stats?.totalUnique?.toLocaleString()}
          sub="All time"
          color="#f59e0b"
          icon={Icons.users}
          sparkData={daily}
        />
        <StatCard
          delay={80}
          label="Today Unique"
          value={
            loading ? "..." : (today?.unique_visitors?.toLocaleString() ?? "0")
          }
          sub={
            todayVsYesterday !== null
              ? `${todayVsYesterday >= 0 ? "+" : ""}${todayVsYesterday} vs yesterday`
              : "vs yesterday"
          }
          subColor={todayVsYesterday >= 0 ? "#10b981" : "#ef4444"}
          color="#10b981"
          icon={Icons.today}
        />
        <StatCard
          delay={160}
          label="Today Total Visits"
          value={
            loading ? "..." : (today?.total_visits?.toLocaleString() ?? "0")
          }
          sub="Page loads today"
          color="#3b82f6"
          icon={Icons.eye}
        />
        <StatCard
          delay={240}
          label="Total Visits"
          value={loading ? "..." : stats?.totalVisits?.toLocaleString()}
          sub="All time page loads"
          color="#a855f7"
          icon={Icons.zap}
        />
      </div>

      {/* ── Daily chart ── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: "22px 24px",
          marginBottom: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          animation: "fadeUp 0.5s ease 0.3s both",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 3,
                height: 18,
                borderRadius: 2,
                background: "#f59e0b",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: 1,
              }}
            >
              Daily Unique Visitors
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "#94a3b8",
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            LAST {days} DAYS
          </span>
        </div>
        {loading ? (
          <div
            style={{
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Loading...
          </div>
        ) : (
          <BarChart data={daily} />
        )}
      </div>

      {/* ── Daily breakdown table ── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          animation: "fadeUp 0.5s ease 0.4s both",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 3,
              height: 18,
              borderRadius: 2,
              background: "#3b82f6",
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: 1,
            }}
          >
            Daily Breakdown
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "10px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc",
          }}
        >
          {["Date", "Unique Visitors", "Total Visits"].map((h) => (
            <span
              key={h}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              padding: "32px 24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Loading...
          </div>
        ) : daily.length === 0 ? (
          <div
            style={{
              padding: "32px 24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            No data yet
          </div>
        ) : (
          daily.map((row, i) => {
            const isToday = row.date === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={row.date}
                className="dash-row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "12px 24px",
                  borderBottom:
                    i < daily.length - 1 ? "1px solid #f1f5f9" : "none",
                  background: isToday ? "#fffbeb" : "#ffffff",
                  transition: "background .15s",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "#d97706" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {row.date}
                  {isToday && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: "#fef3c7",
                        color: "#d97706",
                        letterSpacing: 1,
                      }}
                    >
                      TODAY
                    </span>
                  )}
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}
                >
                  {row.unique_visitors.toLocaleString()}
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}
                >
                  {row.total_visits.toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
