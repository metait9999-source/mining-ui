import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useWallets from "../../hooks/useWallets";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import { MdVerified } from "react-icons/md";
import AppNav from "../Home/Navbar";

const resolveLogoSrc = (wallet) => {
  const { coin_logo, coin_symbol } = wallet;
  if (coin_logo) {
    if (coin_logo.startsWith("uploads/")) return `${API_BASE_URL}/${coin_logo}`;
    if (coin_logo.startsWith("http")) return coin_logo;
  }
  return `/assets/images/coins/${coin_symbol.toLowerCase()}-logo.png`;
};

const EyeOpen = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

function Account() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { wallets } = useWallets(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [coinValues, setCoinValues] = useState({});
  const [balanceVisible, setBalanceVisible] = useState(
    () => user?.balance_visible === 1 || user?.balance_visible === true,
  );
  const convertedRef = useRef(false);

  const COINLORE_IDS = {
    BTC: 90,
    ETH: 80,
    TRX: 87,
    USDT: 518,
    "USDT-TRC20": 518,
    "USDT-ERC20": 518,
    BNB: 2710,
    XRP: 58,
    SOL: 48543,
  };

  useEffect(() => {
    if (!wallets?.length) return;
    if (convertedRef.current) return;
    convertedRef.current = true;

    const fetchConvertedValues = async () => {
      const result = {};
      for (const w of wallets) {
        try {
          const symbol = w.coin_symbol?.toUpperCase();

          // USDT variants — no conversion needed
          if (
            ["USDT", "USDT-TRC20", "USDT-ERC20"].includes(symbol) ||
            ["USDT", "USDT-TRC20", "USDT-ERC20"].includes(w.coin_id)
          ) {
            result[w.coin_id] = parseFloat(w.coin_amount || 0).toFixed(4);
            continue;
          }

          // Get coinlore ID
          const coinloreId = COINLORE_IDS[symbol] || COINLORE_IDS[w.coin_id];
          if (!coinloreId) {
            result[w.coin_id] = parseFloat(w.coin_amount || 0).toFixed(4);
            continue;
          }

          // Fetch price
          const res = await fetch(
            `https://api.coinlore.net/api/ticker/?id=${coinloreId}`,
          );
          const data = await res.json();
          const price = parseFloat(data?.[0]?.price_usd || 0);

          if (price > 0) {
            // USD amount ÷ coin price = coin amount
            const coinAmount = parseFloat(w.coin_amount || 0) / price;
            result[w.coin_id] = coinAmount.toFixed(8);
          } else {
            result[w.coin_id] = "0.00000000";
          }
        } catch {
          result[w.coin_id] = "0.00000000";
        }
      }
      setCoinValues(result);
    };

    fetchConvertedValues();
  }, [wallets?.length]);

  const toggleBalance = async () => {
    const next = !balanceVisible;
    setBalanceVisible(next);
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}/balance-visibility`, {
        balance_visible: next ? 1 : 0,
      });
      setUser?.((p) => ({ ...p, balance_visible: next ? 1 : 0 }));
    } catch {
      setBalanceVisible(!next);
    }
  };

  const totalBalance =
    wallets?.reduce((s, w) => s + parseFloat(w.coin_amount || 0), 0) ?? 0;
  const filtered = wallets?.filter((w) =>
    w.coin_symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const activeCount =
    wallets?.filter((w) => parseFloat(w.coin_amount) > 0).length ?? 0;

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb { font-family:'Orbitron',sans-serif !important; }
        .raj { font-family:'Rajdhani',sans-serif !important; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(1.6);opacity:0} }
        @keyframes fup { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fup  { animation:fup .5s ease both; }
        .fup2 { animation:fup .5s ease both; animation-delay:.1s; opacity:0; }
        .fup3 { animation:fup .5s ease both; animation-delay:.2s; opacity:0; }
        .wrow { transition:background .15s,transform .15s; }
        .wrow:hover { background:rgba(245,158,11,0.04) !important; transform:translateX(4px); }
        .act-btn { transition:transform .18s,box-shadow .18s; }
        .act-btn:hover { transform:translateY(-2px); }
        .act-btn:active { transform:scale(.95); }
        .chip { transition:transform .2s,border-color .2s; }
        .chip:hover { transform:translateY(-2px); border-color:rgba(245,158,11,.3) !important; }
        input[type=search]::-webkit-search-cancel-button { display:none; }
        ::placeholder { color:#334155; }
      `}</style>

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
                bottom: -60,
                left: -60,
                width: 200,
                height: 200,
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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <p
                    className="raj text-xs font-bold tracking-widest uppercase mb-3"
                    style={{ color: "#475569" }}
                  >
                    Total Portfolio Value
                  </p>

                  <div
                    className="flex items-baseline gap-2.5 mb-4"
                    style={{
                      filter: balanceVisible ? "none" : "blur(12px)",
                      transition: "filter .3s",
                      userSelect: balanceVisible ? "text" : "none",
                    }}
                  >
                    <span
                      className="orb font-black"
                      style={{
                        fontSize: "clamp(34px,7vw,58px)",
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      ${totalBalance.toFixed(2)}
                    </span>
                    <span
                      className="raj font-bold text-lg"
                      style={{ color: "#475569" }}
                    >
                      USDT
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
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
                        Live Balance
                      </span>
                    </div>
                    <button
                      onClick={toggleBalance}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none cursor-pointer raj font-semibold text-xs tracking-wide act-btn"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#64748b",
                      }}
                    >
                      {balanceVisible ? <EyeOpen /> : <EyeOff />}
                      {balanceVisible ? "Hide" : "Show"}
                    </button>
                    {user?.name && (
                      <span
                        className="raj text-xs font-medium"
                        style={{ color: "#334155" }}
                      >
                        · {user.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:items-end">
                  <div className="flex gap-3">
                    {[
                      {
                        lbl: "Wallets",
                        val: wallets?.length ?? 0,
                        color: "#f59e0b",
                      },
                      { lbl: "Active", val: activeCount, color: "#10b981" },
                      {
                        lbl: "Currency",
                        val: `${wallets?.length ?? 0}`,
                        color: "#3b82f6",
                      },
                    ].map((s) => (
                      <div
                        key={s.lbl}
                        className="chip rounded-2xl px-4 py-3 text-center flex-1 lg:flex-none"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          minWidth: 80,
                        }}
                      >
                        <p
                          className="orb font-black"
                          style={{
                            fontSize: "clamp(15px,4vw,22px)",
                            color: s.color,
                          }}
                        >
                          {s.val}
                        </p>
                        <p
                          className="raj font-semibold text-xs mt-0.5"
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
        </div>

        {/* ════════════ WALLET TABLE ════════════ */}
        <div className="mt-8 fup2">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-0.5 h-5 rounded-full"
                style={{
                  background: "linear-gradient(to bottom,#f59e0b,#f97316)",
                }}
              />
              <span
                className="font-black tracking-wider orb"
                style={{ fontSize: "clamp(13px,3.5vw,16px)", color: "#f1f5f9" }}
              >
                My Wallets
              </span>
              {wallets?.length > 0 && (
                <span
                  className="raj font-bold text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: "#f59e0b",
                  }}
                >
                  {wallets.length}
                </span>
              )}
            </div>

            {/* Search */}
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                minWidth: 200,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="5"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 11l3 3"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                placeholder="Search coin..."
                className="bg-transparent outline-none raj font-semibold text-sm flex-1"
                style={{ color: "#f1f5f9", caretColor: "#f59e0b" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table shell */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Column headers — desktop only */}
            <div
              className="hidden md:grid grid-cols-12 px-6 py-3"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <span
                className="col-span-5 raj font-bold text-xs tracking-widest uppercase"
                style={{ color: "#334155" }}
              >
                Asset
              </span>
              <span
                className="col-span-3 text-right raj font-bold text-xs tracking-widest uppercase"
                style={{ color: "#334155" }}
              >
                Balance (USDT)
              </span>
              <span
                className="col-span-3 text-right raj font-bold text-xs tracking-widest uppercase"
                style={{ color: "#334155" }}
              >
                Coin Amount
              </span>
              <span className="col-span-1" />
            </div>

            {/* Rows */}
            {filtered?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <p
                  className="raj font-semibold text-sm"
                  style={{ color: "#334155" }}
                >
                  No wallets match your search
                </p>
              </div>
            ) : (
              filtered?.map((wallet, idx) => (
                <Link
                  key={wallet.id}
                  to="/funds"
                  state={{ wallet, coinAmount: coinValues[wallet.coin_id] }}
                  className="wrow flex md:grid md:grid-cols-12 items-center px-5 md:px-6 py-4 md:py-5 no-underline gap-4 md:gap-0"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  {/* Asset */}
                  <div className="flex items-center gap-3.5 md:col-span-5 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          transform: "scale(1.3)",
                          filter: "blur(5px)",
                        }}
                      />
                      <img
                        className="relative rounded-full object-contain"
                        style={{
                          width: 44,
                          height: 44,
                          background: "white",
                          padding: 3,
                          flexShrink: 0,
                        }}
                        src={resolveLogoSrc(wallet)}
                        alt={wallet.coin_symbol}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        style={{
                          display: "none",
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f59e0b",
                          fontWeight: 700,
                          fontSize: 13,
                          fontFamily: "'Orbitron',sans-serif",
                        }}
                      >
                        {wallet.coin_symbol?.slice(0, 2)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="raj font-bold truncate"
                          style={{ color: "#f1f5f9", fontSize: 15 }}
                        >
                          {wallet.coin_symbol}
                        </span>
                        <MdVerified
                          size={13}
                          style={{ color: "#1877F2", flexShrink: 0 }}
                        />
                      </div>
                      <p
                        className="raj font-medium text-xs truncate"
                        style={{ color: "#475569" }}
                      >
                        {wallet.coin_name}
                      </p>
                    </div>
                  </div>

                  {/* Balance USDT */}
                  <div className="md:col-span-3 md:text-right flex-shrink-0">
                    <p
                      className="raj font-bold"
                      style={{ color: "#f1f5f9", fontSize: 15 }}
                    >
                      {balanceVisible
                        ? `$${parseFloat(wallet.coin_amount || 0).toFixed(4)}`
                        : "$••••"}
                    </p>
                    <p
                      className="raj font-medium text-xs md:hidden"
                      style={{ color: "#475569" }}
                    >
                      USDT Balance
                    </p>
                  </div>

                  {/* Coin amount — desktop column, mobile hidden */}
                  {/* Coin amount — desktop column, mobile hidden */}
                  <div className="hidden md:block md:col-span-3 text-right">
                    <p
                      className="raj font-medium"
                      style={{ color: "#64748b", fontSize: 14 }}
                    >
                      {balanceVisible
                        ? (() => {
                            const coinAmt = coinValues[wallet.coin_id];

                            if (wallet.coin_symbol === "USDT") {
                              return `${parseFloat(wallet.coin_amount || 0).toFixed(4)} USDT`;
                            }
                            return `${coinAmt !== undefined && coinAmt !== null ? coinAmt : "0.0000"} ${wallet.coin_symbol}`;
                          })()
                        : `•••• ${wallet.coin_symbol}`}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="md:col-span-1 flex justify-end">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(245,158,11,0.06)",
                        border: "1px solid rgba(245,158,11,0.1)",
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* ════════════ SUPPORT BANNER ════════════ */}
        <div className="mt-8 mb-4 fup3">
          <div
            className="rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: "rgba(245,158,11,.04)",
              border: "1px solid rgba(245,158,11,.1)",
            }}
          >
            <div>
              <p className="orb font-black text-sm text-white mb-1">
                Need Help?
              </p>
              <p
                className="raj font-medium text-xs"
                style={{ color: "#475569" }}
              >
                24/7 support via Live Chat · WhatsApp · Telegram
              </p>
            </div>
            <button
              onClick={() => navigate("/live-chat")}
              className="act-btn flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs border-none cursor-pointer raj flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "#080810",
                letterSpacing: 2,
              }}
            >
              CONTACT US
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
