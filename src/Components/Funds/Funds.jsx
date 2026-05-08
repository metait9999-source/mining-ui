import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { useLocation } from "react-router";
import { API_BASE_URL } from "../../api/getApiURL";
import useFetchLatestDeposit from "../../hooks/useFetchLatestDeposit";
import { useFetchUserBalance } from "../../hooks/useFetchUserBalance";
import toast from "react-hot-toast";
import { useUpdateUserBalance } from "../../hooks/useUpdateUserBalance";
import useCryptoTradeConverter from "../../hooks/userCryptoTradeConverter";
import useSettings from "../../hooks/useSettings";
import Decimal from "decimal.js";
import { useSocketContext } from "../../context/SocketContext";
import useWallets from "../../hooks/useWallets";
import AppNav from "../Home/Navbar";

const resolveLogoSrc = (wallet) => {
  if (!wallet) return null;
  const { coin_logo, coin_symbol } = wallet;
  if (coin_logo) {
    if (coin_logo.startsWith("uploads/")) return `${API_BASE_URL}/${coin_logo}`;
    if (coin_logo.startsWith("http")) return coin_logo;
  }
  return `/assets/images/coins/${coin_symbol?.toLowerCase()}-logo.png`;
};

const CoinLogo = ({ wallet, size = 24 }) => {
  const [failed, setFailed] = useState(false);
  const src = resolveLogoSrc(wallet);
  const symbol = wallet?.coin_symbol || "";
  if (failed || !src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          background: "rgba(245,158,11,0.15)",
          border: "1px solid rgba(245,158,11,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.32,
          fontWeight: 700,
          color: "#f59e0b",
          fontFamily: "'Orbitron',sans-serif",
        }}
      >
        {symbol.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={symbol}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "contain",
        flexShrink: 0,
        background: "white",
        padding: 2,
      }}
    />
  );
};

const inputWrap = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "13px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.03)",
  transition: "border-color .2s, box-shadow .2s",
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "#475569",
  fontFamily: "'Rajdhani',sans-serif",
};

function getDepositAddress(addresses, coinId) {
  if (!addresses || !coinId) return null;
  switch (coinId) {
    case "TRX":
    case "USDT-TRC20":
      return addresses.TRX;
    case "ETH":
    case "USDT-ERC20":
      return addresses.ETH;
    case "BTC":
      return addresses.BTC;
    default:
      return null;
  }
}

const Funds = () => {
  const location = useLocation();
  const wallet = location.state?.wallet;
  const { settings } = useSettings();
  const { user, setLoading } = useUser();
  const [activeTab, setActiveTab] = useState("receive");
  const [timeLeft, setTimeLeft] = useState(null);
  const [rechargeModal, setRechargeModal] = useState(false);
  const [rechargeStep, setRechargeStep] = useState(1); // 1=enter amount, 2=verifying, 3=success/pending
  const [rechargeResult, setRechargeResult] = useState(null);
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const { socket } = useSocketContext();
  const { updateUserBalance } = useUpdateUserBalance();
  const { wallets } = useWallets(user?.id);
  const [convertAmount, setConvertAmount] = useState("");
  const [convertedResult, setConvertedResult] = useState("0.00");
  const [isConverting, setIsConverting] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  // fetch user's unique deposit addresses
  const [depositAddresses, setDepositAddresses] = useState(null);
  useEffect(() => {
    if (!user?.id) return;
    axios
      .get(`${API_BASE_URL}/users/${user.id}/deposit-addresses`)
      .then((res) => setDepositAddresses(res.data))
      .catch(() => setDepositAddresses(null));
  }, [user?.id]);

  const depositAddress = getDepositAddress(depositAddresses, wallet?.coin_id);

  const {
    data: latestDeposit,
    loading,
    refetch,
  } = useFetchLatestDeposit(user?.id, wallet?.coin_id);
  const { balance, refetch: refetchUserBalance } = useFetchUserBalance(
    user?.id,
    wallet?.coin_id,
  );
  const [localCoinBalance, setLocalCoinBalance] = useState(null);

  useEffect(() => {
    if (balance?.coin_amount !== undefined)
      setLocalCoinBalance(parseFloat(balance.coin_amount));
  }, [balance?.coin_amount]);

  const displayBalance =
    localCoinBalance ?? parseFloat(balance?.coin_amount || 0);
  const { convertUSDTToCoin } = useCryptoTradeConverter();
  const usdtWallet = wallets?.find((w) => w.coin_symbol === "USDT");
  const coinGeckoIdRef = useRef(null);
  const coinPriceRef = useRef(null);

  useEffect(() => {
    coinGeckoIdRef.current = null;
    coinPriceRef.current = null;
  }, [wallet?.coin_symbol]);

  const getConvertedAmount = useCallback(async () => {
    if (!balance?.coin_amount || !wallet?.coin_id) return;
    try {
      setAvailableBalance(
        await convertUSDTToCoin(balance.coin_amount, wallet.coin_id),
      );
    } catch {}
  }, [balance?.coin_amount, wallet?.coin_id, convertUSDTToCoin]);

  useEffect(() => {
    getConvertedAmount();
  }, [getConvertedAmount]);

  const getCoinGeckoId = async (symbol) => {
    if (!symbol) return null;
    if (symbol.toUpperCase() === "USDT") return "tether";
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${symbol}`,
      );
      const data = await res.json();
      return (
        data.coins?.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase())
          ?.id || null
      );
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      const symbol = wallet?.coin_symbol?.toUpperCase();
      if (!symbol || symbol === "USDT") {
        coinPriceRef.current = 1;
        return;
      }
      try {
        if (!coinGeckoIdRef.current)
          coinGeckoIdRef.current = await getCoinGeckoId(symbol);
        const id = coinGeckoIdRef.current;
        if (!id) return;
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
        );
        const data = await res.json();
        coinPriceRef.current = data[id]?.usd || null;
      } catch {
        coinPriceRef.current = null;
      }
    };
    if (activeTab === "convert") fetchPrice();
  }, [wallet?.coin_symbol, activeTab]);

  useEffect(() => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      setConvertedResult("0.00");
      return;
    }
    const price = coinPriceRef.current;
    setConvertedResult(
      price ? (parseFloat(convertAmount) * price).toFixed(2) : "0.00",
    );
  }, [convertAmount]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const handleCopyAddress = () => {
    const address = depositAddress;
    if (!address) {
      toast.error("No address to copy");
      return;
    }
    const copy = (txt) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy")
          ? toast.success("Address copied!")
          : toast.error("Failed");
        document.body.removeChild(ta);
      } catch {
        toast.error("Failed to copy");
      }
    };
    navigator.clipboard
      ?.writeText(address)
      .then(() => {
        toast.success("Address copied!");
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 3000);
      })
      .catch(() => copy(address)) || copy(address);
  };

  // New recharge submit — uses /deposits/request
  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter amount");
      return;
    }
    if (!depositAddress) {
      toast.error("Deposit address not loaded");
      return;
    }

    setSubmitting(true);
    setRechargeStep(2); // verifying

    try {
      const res = await axios.post(`${API_BASE_URL}/deposits/request`, {
        user_id: user.id,
        coin_id: wallet?.coin_id,
        amount: Number(amount),
      });

      setRechargeResult(res.data);
      setRechargeStep(3); // result
      refetch();

      if (res.data.status === "approved") {
        toast.success(
          `✅ ${res.data.actualAmount} ${wallet?.coin_id} credited!`,
        );
        refetchUserBalance();
      } else {
        toast("⏳ Submitted. Will credit once confirmed on-chain.", {
          icon: "🔄",
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Verification failed");
      setRechargeStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const closeRechargeModal = () => {
    setRechargeModal(false);
    setRechargeStep(1);
    setAmount("");
    setRechargeResult(null);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!withdrawAmount || !withdrawAddress) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }
    if (parseFloat(withdrawAmount) > displayBalance) {
      toast.error("Exceeds available balance");
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/withdraws`,
        {
          user_id: user.id,
          wallet_to: withdrawAddress,
          wallet_from: user?.user_wallet,
          coin_id: wallet?.coin_id,
          trans_hash: "",
          amount: withdrawAmount,
        },
        { headers: { "Content-Type": "application/json" } },
      );
      setLoading(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
      const nb =
        new Decimal(displayBalance).d[0] -
        new Decimal(parseFloat(withdrawAmount)).d[0];
      updateUserBalance(user?.id, wallet?.coin_id, nb);
    } catch (err) {
      setLoading(false);
      toast.error(err?.response?.data?.error || "Failed");
    }
  };

  const updateBalanceDirect = async (userId, coinId, newBalance) => {
    await axios.put(`${API_BASE_URL}/userbalance/${userId}/balance/${coinId}`, {
      coinAmount: newBalance,
    });
  };

  const handleConvertSubmit = async () => {
    if (user.is_frozen) {
      toast.error("Account is frozen. Contact support.");
      return;
    }
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const coinAmt = parseFloat(convertAmount);
    const price = coinPriceRef.current;
    if (!price) {
      toast.error("Price not loaded, try again");
      return;
    }
    const maxAvailable =
      coinSymbol === "USDT"
        ? displayBalance
        : parseFloat(availableBalance || 0);

    if (coinAmt > maxAvailable) {
      toast.error("Exceeds available balance");
      return;
    }
    const usdtEq = coinAmt * price;
    setIsConverting(true);
    try {
      await updateBalanceDirect(
        user.id,
        wallet?.coin_id,
        displayBalance - usdtEq,
      );
      if (usdtWallet)
        await updateBalanceDirect(
          user.id,
          usdtWallet.coin_id,
          parseFloat(usdtWallet?.coin_amount || 0) + usdtEq,
        );
      setLocalCoinBalance(displayBalance - usdtEq);
      setConvertAmount("");
      setConvertedResult("0.00");
      toast.success(
        `Converted ${coinAmt} ${coinSymbol} → ${usdtEq.toFixed(2)} USDT`,
      );
      try {
        refetchUserBalance();
      } catch {}
    } catch {
      toast.error("Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const getFormattedDeliveryTime = (ca) =>
    new Date(ca)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "");

  useEffect(() => {
    if (!latestDeposit?.created_at) return;
    const end = new Date(
      new Date(getFormattedDeliveryTime(latestDeposit.created_at)).getTime() +
        3600000,
    );
    const tick = () => {
      if (["approved", "rejected"].includes(latestDeposit?.status)) {
        setTimeLeft("");
        return;
      }
      const diff = end - new Date();
      if (diff <= 0) {
        setTimeLeft("");
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [latestDeposit]);

  useEffect(() => {
    const handler = (data) => {
      if (data?.deposit.status === "approved")
        toast.success("Deposit accepted");
      else toast.error("Deposit rejected");
      if (["approved", "rejected"].includes(data?.deposit.status)) {
        refetch();
        refetchUserBalance();
      }
    };
    socket?.on("updateDeposit", handler);
    return () => socket?.off("updateDeposit", handler);
  }, [socket, refetch, refetchUserBalance]);

  useEffect(() => {
    const handler = (data) => {
      if (data?.coin_id === wallet?.coin_id) {
        toast.success(`Deposit of ${data.amount} ${data.coin_id} approved!`);
        refetch();
        refetchUserBalance();
      }
    };
    socket?.on("depositApproved", handler);
    return () => socket?.off("depositApproved", handler);
  }, [socket, wallet?.coin_id, refetch, refetchUserBalance]);

  const coinSymbol = wallet?.coin_symbol || "BTC";
  const TABS = ["receive", "send", "convert"];
  const tabColor = { receive: "#f59e0b", send: "#10b981", convert: "#3b82f6" };
  const activeColor = tabColor[activeTab];

  // coin amount display (e.g. if USDT coin_amount IS the usd amount)
  const coinAmountDisplay = (() => {
    if (coinSymbol === "USDT") {
      return `${displayBalance.toFixed(4)} USDT`;
    }
    if (availableBalance && parseFloat(availableBalance) > 0) {
      return `${availableBalance} ${coinSymbol}`;
    }
    return `${displayBalance.toFixed(4)} ${coinSymbol}`;
  })();

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
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .iw:focus-within{border-color:rgba(245,158,11,.45)!important;box-shadow:0 0 0 3px rgba(245,158,11,.08)!important}
        .iw input{background:transparent;border:none;outline:none;color:#f1f5f9;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;width:100%}
        .iw input::placeholder{color:#334155}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
        .act{transition:transform .18s,box-shadow .18s}
        .act:hover:not(:disabled){transform:translateY(-2px)}
        .act:active:not(:disabled){transform:scale(.97)}
        .tab-pill{transition:all .2s}
        .tab-pill:hover{opacity:.85}
        .step-card{transition:all .2s}
        .step-card:hover{transform:translateX(3px)}
        .spin{animation:spin 1s linear infinite}
        .modal-in{animation:fadeIn .25s ease both}
        .slide-up{animation:slideUp .3s ease both}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* BALANCE HERO */}
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
                <div className="flex-1 min-w-0">
                  <div
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full mb-4"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.18)",
                    }}
                  >
                    <CoinLogo wallet={wallet} size={22} />
                    <span
                      className="raj font-bold text-sm tracking-widest"
                      style={{ color: "#f59e0b" }}
                    >
                      {coinSymbol}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#10b981" }}
                    />
                    <span
                      className="raj font-semibold text-xs"
                      style={{ color: "#10b981" }}
                    >
                      Active
                    </span>
                  </div>
                  <p
                    className="raj text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: "#475569" }}
                  >
                    Available Balance
                  </p>
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span
                      className="orb font-black"
                      style={{
                        fontSize: "clamp(32px,7vw,54px)",
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      ${displayBalance.toFixed(4)}
                    </span>
                    <span
                      className="raj font-bold text-base"
                      style={{ color: "#475569" }}
                    >
                      USD
                    </span>
                  </div>
                  {/* coin amount */}
                  <p
                    className="raj font-semibold text-sm mb-3"
                    style={{ color: "#f59e0b" }}
                  >
                    ≈ {coinAmountDisplay}
                  </p>
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
                      Live
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      lbl: "Balance",
                      val: `$${displayBalance.toFixed(2)}`,
                      color: "#f59e0b",
                    },
                    {
                      lbl: "In Coins",
                      val: coinAmountDisplay,
                      color: "#3b82f6",
                    },
                    { lbl: "Frozen", val: "$0.00", color: "#64748b" },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="rounded-2xl px-4 py-3"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.07)",
                        minWidth: 110,
                      }}
                    >
                      <p
                        className="orb font-black text-sm mb-0.5 truncate"
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

        {/* MAIN CONTENT */}
        <div className="mt-8 fup2">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tabs */}
            <div className="lg:w-52 flex-shrink-0">
              <div className="hidden lg:flex flex-col gap-2">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className="tab-pill flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left border-none cursor-pointer"
                    style={{
                      background:
                        activeTab === t
                          ? `rgba(${t === "receive" ? "245,158,11" : t === "send" ? "16,185,129" : "59,130,246"},0.12)`
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid ${activeTab === t ? `rgba(${t === "receive" ? "245,158,11" : t === "send" ? "16,185,129" : "59,130,246"},0.3)` : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          activeTab === t
                            ? tabColor[t]
                            : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {t === "receive" && (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2v14M5 9l7 7 7-7M3 20h18"
                            stroke={activeTab === t ? "#080810" : "#64748b"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {t === "send" && (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 22V8M5 15l7-7 7 7M3 4h18"
                            stroke={activeTab === t ? "#080810" : "#64748b"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {t === "convert" && (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M16 3h5v5M4 20L21 3M21 16v5h-5"
                            stroke={activeTab === t ? "#080810" : "#64748b"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className="raj font-bold text-sm tracking-wide capitalize"
                      style={{
                        color: activeTab === t ? tabColor[t] : "#64748b",
                      }}
                    >
                      {t === "receive"
                        ? "Receive"
                        : t === "send"
                          ? "Send"
                          : "Convert"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex lg:hidden gap-2 mb-6">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className="tab-pill flex-1 py-3 rounded-2xl font-bold text-sm border-none cursor-pointer raj capitalize"
                    style={{
                      background:
                        activeTab === t
                          ? tabColor[t]
                          : "rgba(255,255,255,0.03)",
                      color: activeTab === t ? "#080810" : "#64748b",
                      border: `1px solid ${activeTab === t ? tabColor[t] : "rgba(255,255,255,0.07)"}`,
                      letterSpacing: 1,
                    }}
                  >
                    {t === "receive"
                      ? "Receive"
                      : t === "send"
                        ? "Send"
                        : "Convert"}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel */}
            <div className="flex-1 min-w-0">
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "#0a0a14",
                  border: `1px solid rgba(${activeTab === "receive" ? "245,158,11" : activeTab === "send" ? "16,185,129" : "59,130,246"},0.14)`,
                }}
              >
                {/* Panel top bar */}
                <div
                  className="flex items-center justify-between px-6 py-5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: activeColor }}
                    />
                    <span
                      className="orb font-black text-base"
                      style={{ color: "#f1f5f9" }}
                    >
                      {activeTab === "receive"
                        ? "Deposit Funds"
                        : activeTab === "send"
                          ? "Withdrawal"
                          : "Convert Coins"}
                    </span>
                  </div>
                </div>

                {/* ══════════ RECEIVE TAB ══════════ */}
                {activeTab === "receive" && (
                  <div className="p-6 md:p-8">
                    {/* Timer */}
                    {timeLeft && (
                      <div
                        className="flex items-center gap-4 p-4 rounded-2xl mb-6"
                        style={{
                          background: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.2)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 6v6l4 2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <p
                            className="raj font-semibold text-xs mb-0.5"
                            style={{ color: "#64748b" }}
                          >
                            Verification in progress
                          </p>
                          <p
                            className="orb font-black text-xl"
                            style={{ color: "#10b981" }}
                          >
                            {timeLeft}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: address */}
                      <div>
                        <label style={labelStyle}>
                          Your Unique Deposit Address
                        </label>
                        <div
                          className="rounded-2xl p-4 mb-3"
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <p
                            className="raj font-medium text-sm mb-4 break-all leading-relaxed"
                            style={{ color: "#94a3b8" }}
                          >
                            {depositAddress ||
                              (depositAddresses === null
                                ? "Loading..."
                                : "Not available")}
                          </p>
                          <button
                            onClick={handleCopyAddress}
                            className="act w-full py-3 rounded-xl raj font-bold text-sm border-none cursor-pointer flex items-center justify-center gap-2"
                            style={{
                              background: addressCopied
                                ? "rgba(16,185,129,0.15)"
                                : "rgba(245,158,11,0.1)",
                              border: `1px solid ${addressCopied ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.2)"}`,
                              color: addressCopied ? "#10b981" : "#f59e0b",
                              letterSpacing: 1.5,
                            }}
                          >
                            {addressCopied ? (
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
                                COPIED!
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
                                  />
                                  <path
                                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  />
                                </svg>{" "}
                                COPY ADDRESS
                              </>
                            )}
                          </button>
                        </div>

                        {wallet?.wallet_network && (
                          <div
                            className="flex items-center justify-between px-4 py-3 rounded-xl mb-3"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <span
                              className="raj font-semibold text-xs"
                              style={{ color: "#475569" }}
                            >
                              Network
                            </span>
                            <span
                              className="raj font-bold text-sm"
                              style={{ color: "#f1f5f9" }}
                            >
                              {wallet.wallet_network}
                            </span>
                          </div>
                        )}

                        {/* ── HOW TO DEPOSIT STEPS ── */}
                        <div
                          className="rounded-2xl overflow-hidden"
                          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                          <div
                            className="px-4 py-3"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <p
                              className="raj font-bold text-xs tracking-widest uppercase"
                              style={{ color: "#475569" }}
                            >
                              How to Deposit
                            </p>
                          </div>
                          {[
                            {
                              num: "1",
                              text: `Copy your ${coinSymbol} address above`,
                              icon: "📋",
                              highlight: false,
                              done: addressCopied,
                            },
                            {
                              num: "2",
                              text: `Send ${coinSymbol} to that address from your wallet`,
                              icon: "📤",
                              highlight: false,
                            },
                            {
                              num: "3",
                              text: "Return here and click the button below",
                              icon: "🔔",
                              highlight: true,
                            },
                            {
                              num: "4",
                              text: "Enter the amount you sent — system will verify",
                              icon: "✅",
                              highlight: false,
                            },
                          ].map((s, i) => (
                            <div
                              key={i}
                              className="step-card flex items-center gap-3 px-4 py-3"
                              style={{
                                background: s.highlight
                                  ? "rgba(245,158,11,0.06)"
                                  : "transparent",
                                borderBottom:
                                  i < 3
                                    ? "1px solid rgba(255,255,255,0.04)"
                                    : "none",
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 raj font-black text-xs"
                                style={{
                                  background: s.done
                                    ? "#10b981"
                                    : s.highlight
                                      ? "#f59e0b"
                                      : "rgba(255,255,255,0.06)",
                                  color:
                                    s.done || s.highlight
                                      ? "#080810"
                                      : "#475569",
                                }}
                              >
                                {s.done ? "✓" : s.num}
                              </div>
                              <span
                                className="raj font-semibold text-xs flex-1"
                                style={{
                                  color: s.highlight ? "#f59e0b" : "#64748b",
                                }}
                              >
                                {s.text}
                              </span>
                              {s.highlight && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M9 18l6-6-6-6"
                                    stroke="#f59e0b"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: QR */}
                      <div className="flex flex-col items-center">
                        {depositAddress ? (
                          <>
                            <div
                              className="p-3 rounded-2xl mb-4 cursor-pointer"
                              style={{
                                background: "white",
                                boxShadow: "0 8px 32px rgba(245,158,11,0.15)",
                              }}
                              onClick={() => setQrModalVisible(true)}
                            >
                              {wallet?.wallet_qr ? (
                                <img
                                  src={`${API_BASE_URL}/${wallet.wallet_qr}`}
                                  alt={coinSymbol}
                                  style={{
                                    width: 180,
                                    height: 180,
                                    objectFit: "contain",
                                    display: "block",
                                    borderRadius: 8,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 180,
                                    height: 180,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#f8f8f8",
                                    borderRadius: 8,
                                    fontFamily: "monospace",
                                    fontSize: 9,
                                    color: "#333",
                                    padding: 8,
                                    wordBreak: "break-all",
                                    textAlign: "center",
                                  }}
                                >
                                  {depositAddress}
                                </div>
                              )}
                            </div>
                            <p
                              className="raj text-xs mb-4"
                              style={{ color: "#334155" }}
                            >
                              Tap QR to enlarge
                            </p>
                          </>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center w-full h-52 rounded-2xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px dashed rgba(255,255,255,0.08)",
                            }}
                          >
                            <p
                              className="raj text-sm"
                              style={{ color: "#334155" }}
                            >
                              Loading address...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── BIG RECHARGE BUTTON ── */}
                    <div
                      className="mt-6 pt-6"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p
                        className="raj font-semibold text-xs text-center mb-4"
                        style={{ color: "#475569" }}
                      >
                        Already sent {coinSymbol} to your address?
                      </p>
                      <button
                        onClick={() => {
                          setRechargeModal(true);
                          setRechargeStep(1);
                        }}
                        className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer flex items-center justify-center gap-3"
                        style={{
                          background: "linear-gradient(135deg,#f59e0b,#f97316)",
                          color: "#080810",
                          letterSpacing: 2,
                          boxShadow: "0 6px 24px rgba(245,158,11,0.35)",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2v14M5 9l7 7 7-7M3 20h18"
                            stroke="#080810"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        I SENT — SUBMIT RECHARGE
                      </button>
                    </div>
                  </div>
                )}

                {/* ══════════ SEND TAB ══════════ */}
                {activeTab === "send" && (
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-5">
                        <div>
                          <label style={labelStyle}>Receiving Address</label>
                          <div
                            className="iw flex items-center gap-2.5 px-4 py-3.5 rounded-2xl"
                            style={{ ...inputWrap }}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              style={{ color: "#475569", flexShrink: 0 }}
                            >
                              <path
                                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="12"
                                cy="10"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                            <input
                              type="text"
                              placeholder="Enter receiving address"
                              value={withdrawAddress}
                              onChange={(e) =>
                                setWithdrawAddress(e.target.value)
                              }
                            />
                            {withdrawAddress && (
                              <button
                                onClick={() => setWithdrawAddress("")}
                                className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded border-none cursor-pointer"
                                style={{
                                  background: "rgba(255,255,255,0.07)",
                                  color: "#64748b",
                                }}
                              >
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path
                                    d="M2 2l10 10M12 2L2 12"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label style={{ ...labelStyle, marginBottom: 0 }}>
                              Amount
                            </label>
                            <span
                              className="raj font-medium text-xs"
                              style={{ color: "#475569" }}
                            >
                              Bal: ${displayBalance.toFixed(4)}
                            </span>
                          </div>
                          <div
                            className="iw flex items-center gap-2.5 px-4 py-3.5 rounded-2xl"
                            style={{ ...inputWrap }}
                          >
                            <CoinLogo wallet={wallet} size={22} />
                            <input
                              type="number"
                              placeholder="0.00"
                              value={withdrawAmount}
                              onChange={(e) =>
                                setWithdrawAmount(e.target.value)
                              }
                              style={{ fontWeight: 700, fontSize: 16 }}
                            />
                            <span
                              className="raj font-semibold text-xs flex-shrink-0"
                              style={{ color: "#475569" }}
                            >
                              {coinSymbol}
                            </span>
                            <div
                              className="w-px h-4 flex-shrink-0"
                              style={{ background: "rgba(255,255,255,0.08)" }}
                            />
                            <button
                              onClick={() =>
                                setWithdrawAmount(balance?.coin_amount)
                              }
                              className="flex-shrink-0 raj font-bold text-xs border-none cursor-pointer act"
                              style={{ background: "none", color: "#f59e0b" }}
                            >
                              MAX
                            </button>
                          </div>
                          <p
                            className="raj text-xs mt-2"
                            style={{ color: "#334155" }}
                          >
                            Min. withdrawal: ${settings?.withdrawal_limit} USD
                          </p>
                        </div>
                        <button
                          onClick={handleWithdrawSubmit}
                          className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                          style={{
                            background:
                              "linear-gradient(135deg,#10b981,#059669)",
                            color: "white",
                            letterSpacing: 2,
                            boxShadow: "0 6px 20px rgba(16,185,129,0.3)",
                          }}
                        >
                          SEND NOW
                        </button>
                        <p
                          className="raj text-xs text-center"
                          style={{ color: "#334155" }}
                        >
                          Do not transfer funds to strangers
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <p
                          className="raj font-bold text-xs tracking-widest uppercase mb-1"
                          style={{ color: "#334155" }}
                        >
                          Withdrawal Info
                        </p>
                        {[
                          {
                            lbl: "Network",
                            val: wallet?.wallet_network || "—",
                          },
                          { lbl: "Currency", val: coinSymbol },
                          {
                            lbl: "Min. Amount",
                            val: `$${settings?.withdrawal_limit || 0}`,
                          },
                          { lbl: "Processing", val: "Instant" },
                        ].map((r) => (
                          <div
                            key={r.lbl}
                            className="flex items-center justify-between px-4 py-3 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <span
                              className="raj font-semibold text-xs"
                              style={{ color: "#475569" }}
                            >
                              {r.lbl}
                            </span>
                            <span
                              className="raj font-bold text-sm"
                              style={{ color: "#f1f5f9" }}
                            >
                              {r.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════ CONVERT TAB ══════════ */}
                {activeTab === "convert" && (
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label style={{ ...labelStyle, marginBottom: 0 }}>
                              From
                            </label>
                            <span
                              className="raj font-medium text-xs"
                              style={{ color: "#475569" }}
                            >
                              {availableBalance || "0.00"} {coinSymbol}{" "}
                              available
                            </span>
                          </div>
                          <div
                            className="iw flex items-center gap-3 px-4 py-4 rounded-2xl"
                            style={{ ...inputWrap }}
                          >
                            <CoinLogo wallet={wallet} size={26} />
                            <span
                              className="orb font-black text-sm flex-shrink-0"
                              style={{ color: "#f59e0b" }}
                            >
                              {coinSymbol}
                            </span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={convertAmount}
                              onChange={(e) => setConvertAmount(e.target.value)}
                              style={{
                                flex: 1,
                                textAlign: "right",
                                fontWeight: 700,
                                fontSize: 18,
                              }}
                            />
                            <button
                              onClick={() => {
                                const maxVal =
                                  coinSymbol === "USDT"
                                    ? String(displayBalance)
                                    : String(availableBalance || "0");
                                setConvertAmount(maxVal);
                              }}
                              className="raj font-bold text-xs border-none cursor-pointer act flex-shrink-0"
                              style={{ background: "none", color: "#f59e0b" }}
                            >
                              MAX
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg,#f59e0b,#f97316)",
                              boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M8 3v10M5 10l3 3 3-3"
                                stroke="#080810"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>To (USDT)</label>
                          <div
                            className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <CoinLogo
                              wallet={
                                wallets?.find(
                                  (w) => w.coin_symbol === "USDT",
                                ) || { coin_symbol: "USDT" }
                              }
                              size={26}
                            />
                            <span
                              className="orb font-black text-sm flex-shrink-0"
                              style={{ color: "#64748b" }}
                            >
                              USDT
                            </span>
                            <span
                              className="flex-1 text-right orb font-black text-lg"
                              style={{
                                color:
                                  convertedResult !== "0.00"
                                    ? "#10b981"
                                    : "#334155",
                              }}
                            >
                              {convertedResult}
                            </span>
                          </div>
                          <p
                            className="raj text-xs mt-2"
                            style={{ color: "#334155" }}
                          >
                            Fee: 0.3% · You receive:{" "}
                            <span style={{ color: "#10b981" }}>
                              {convertAmount
                                ? (parseFloat(convertedResult) * 0.997).toFixed(
                                    4,
                                  )
                                : "0.0000"}{" "}
                              USDT
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={handleConvertSubmit}
                          disabled={isConverting}
                          className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                          style={{
                            background:
                              "linear-gradient(135deg,#3b82f6,#6366f1)",
                            color: "white",
                            letterSpacing: 2,
                            boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
                            opacity: isConverting ? 0.65 : 1,
                            cursor: isConverting ? "not-allowed" : "pointer",
                          }}
                        >
                          {isConverting
                            ? "CONVERTING…"
                            : `CONVERT ${coinSymbol} → USDT`}
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        <p
                          className="raj font-bold text-xs tracking-widest uppercase mb-1"
                          style={{ color: "#334155" }}
                        >
                          Conversion Info
                        </p>
                        {[
                          { lbl: "From", val: coinSymbol },
                          { lbl: "To", val: "USDT" },
                          { lbl: "Rate", val: "Market Rate" },
                          { lbl: "Fee", val: "0.3%" },
                          { lbl: "Speed", val: "Instant" },
                        ].map((r) => (
                          <div
                            key={r.lbl}
                            className="flex items-center justify-between px-4 py-3 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <span
                              className="raj font-semibold text-xs"
                              style={{ color: "#475569" }}
                            >
                              {r.lbl}
                            </span>
                            <span
                              className="raj font-bold text-sm"
                              style={{ color: "#f1f5f9" }}
                            >
                              {r.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ RECHARGE MODAL ══════════ */}
      {rechargeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeRechargeModal}
        >
          <div
            className="modal-in relative w-full md:max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{
              background: "#0d0d1a",
              border: "1px solid rgba(245,158,11,0.2)",
              maxHeight: "95vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* handle — mobile */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#1e293b" }}
              />
            </div>
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
              }}
            />

            {/* ── STEP 1: Enter amount ── */}
            {rechargeStep === 1 && (
              <div className="p-6 slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2v14M5 9l7 7 7-7M3 20h18"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="orb font-black text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        Submit Recharge
                      </p>
                      <p className="raj text-xs" style={{ color: "#475569" }}>
                        Step 1 of 2 — Enter amount
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeRechargeModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 2l10 10M12 2L2 12"
                        stroke="#64748b"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Deposit info */}
                <div className="flex flex-col gap-2 mb-5">
                  {[
                    { lbl: "Coin", val: wallet?.coin_symbol },
                    { lbl: "Network", val: wallet?.wallet_network },
                    {
                      lbl: "Your Address",
                      val: depositAddress
                        ? `${depositAddress.slice(0, 12)}...${depositAddress.slice(-8)}`
                        : "Loading...",
                    },
                  ].map((r) => (
                    <div
                      key={r.lbl}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span
                        className="raj font-semibold text-xs"
                        style={{ color: "#475569" }}
                      >
                        {r.lbl}
                      </span>
                      <span
                        className="raj font-bold text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Amount input */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <label style={labelStyle}>Amount You Sent</label>
                    <span className="raj text-xs" style={{ color: "#475569" }}>
                      Min: ${settings?.deposit_limit || 0}
                    </span>
                  </div>
                  <div
                    className="iw flex items-center gap-3 px-4 py-4 rounded-2xl"
                    style={{
                      ...inputWrap,
                      borderColor: "rgba(245,158,11,0.2)",
                    }}
                  >
                    <CoinLogo wallet={wallet} size={22} />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        flex: 1,
                        fontWeight: 700,
                        fontSize: 20,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#f1f5f9",
                        fontFamily: "'Rajdhani',sans-serif",
                      }}
                    />
                    <span
                      className="raj font-bold text-sm flex-shrink-0"
                      style={{ color: "#f59e0b" }}
                    >
                      {coinSymbol}
                    </span>
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p
                      className="raj text-xs mt-2 text-center"
                      style={{ color: "#10b981" }}
                    >
                      ≈ ${parseFloat(amount).toFixed(2)} USD
                    </p>
                  )}
                </div>

                {/* Warning */}
                <div
                  className="my-4 p-3 rounded-xl flex items-start gap-2"
                  style={{
                    background: "rgba(245,158,11,0.05)",
                    border: "1px solid rgba(245,158,11,0.12)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <p
                    className="raj font-medium text-xs leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    Make sure you have already sent {coinSymbol} to your deposit
                    address. The system will verify your transaction on-chain
                    automatically.
                  </p>
                </div>

                <button
                  onClick={handleRechargeSubmit}
                  disabled={submitting || !amount}
                  className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background:
                      !amount || parseFloat(amount) <= 0
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg,#f59e0b,#f97316)",
                    color:
                      !amount || parseFloat(amount) <= 0
                        ? "#334155"
                        : "#080810",
                    letterSpacing: 2,
                    boxShadow:
                      !amount || parseFloat(amount) <= 0
                        ? "none"
                        : "0 6px 20px rgba(245,158,11,0.3)",
                    cursor:
                      !amount || parseFloat(amount) <= 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  VERIFY & SUBMIT
                </button>
              </div>
            )}

            {/* ── STEP 2: Verifying ── */}
            {rechargeStep === 2 && (
              <div
                className="p-8 flex flex-col items-center justify-center slide-up"
                style={{ minHeight: 300 }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "2px solid rgba(245,158,11,0.3)",
                  }}
                >
                  <svg
                    className="spin"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="rgba(245,158,11,0.2)"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M12 2a10 10 0 0110 10"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p
                  className="orb font-black text-base mb-2"
                  style={{ color: "#f1f5f9" }}
                >
                  Verifying On-Chain
                </p>
                <p
                  className="raj font-semibold text-sm text-center"
                  style={{ color: "#475569" }}
                >
                  Checking your {coinSymbol} transaction on the blockchain...
                </p>
                <p className="raj text-xs mt-3" style={{ color: "#334155" }}>
                  This may take a few seconds
                </p>
              </div>
            )}

            {/* ── STEP 3: Result ── */}
            {rechargeStep === 3 && rechargeResult && (
              <div className="p-6 slide-up">
                <div className="flex flex-col items-center mb-6">
                  {rechargeResult.status === "approved" ? (
                    <>
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{
                          background: "rgba(16,185,129,0.12)",
                          border: "2px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p
                        className="orb font-black text-lg mb-1"
                        style={{ color: "#10b981" }}
                      >
                        Deposit Approved!
                      </p>
                      <p
                        className="raj font-semibold text-sm"
                        style={{ color: "#64748b" }}
                      >
                        Your balance has been credited
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{
                          background: "rgba(245,158,11,0.12)",
                          border: "2px solid rgba(245,158,11,0.3)",
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
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
                      </div>
                      <p
                        className="orb font-black text-lg mb-1"
                        style={{ color: "#f59e0b" }}
                      >
                        Pending Confirmation
                      </p>
                      <p
                        className="raj font-semibold text-sm text-center"
                        style={{ color: "#64748b" }}
                      >
                        Transaction not yet confirmed. Will credit automatically
                        once detected.
                      </p>
                    </>
                  )}
                </div>

                {/* Result details */}
                <div className="flex flex-col gap-2 mb-6">
                  {rechargeResult.status === "approved" && (
                    <>
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{
                          background: "rgba(16,185,129,0.06)",
                          border: "1px solid rgba(16,185,129,0.15)",
                        }}
                      >
                        <span
                          className="raj font-semibold text-xs"
                          style={{ color: "#475569" }}
                        >
                          Amount Credited
                        </span>
                        <span
                          className="raj font-black text-sm"
                          style={{ color: "#10b981" }}
                        >
                          {rechargeResult.actualAmount} {coinSymbol}
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <span
                          className="raj font-semibold text-xs"
                          style={{ color: "#475569" }}
                        >
                          TX Hash
                        </span>
                        <span
                          className="raj font-medium text-xs"
                          style={{ color: "#64748b" }}
                        >
                          {rechargeResult.txHash
                            ? `${rechargeResult.txHash.slice(0, 10)}...${rechargeResult.txHash.slice(-6)}`
                            : "—"}
                        </span>
                      </div>
                    </>
                  )}
                  {rechargeResult.status === "pending_verification" && (
                    <div
                      className="px-4 py-3 rounded-xl text-center"
                      style={{
                        background: "rgba(245,158,11,0.05)",
                        border: "1px solid rgba(245,158,11,0.12)",
                      }}
                    >
                      <p
                        className="raj font-medium text-xs"
                        style={{ color: "#64748b" }}
                      >
                        The system checks every 30 seconds. You'll be notified
                        when your deposit is confirmed.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={closeRechargeModal}
                  className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#f1f5f9",
                    letterSpacing: 2,
                  }}
                >
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ QR FULLSCREEN ══════════ */}
      {qrModalVisible && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setQrModalVisible(false)}
        >
          <button
            onClick={() => setQrModalVisible(false)}
            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border-none cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p
            className="raj font-semibold text-sm mb-5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Long press to save
          </p>
          <div
            className="p-4 rounded-3xl"
            style={{
              background: "white",
              boxShadow: "0 16px 64px rgba(245,158,11,0.25)",
            }}
          >
            {wallet?.wallet_qr ? (
              <img
                src={`${API_BASE_URL}/${wallet?.wallet_qr}`}
                alt={coinSymbol}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(72vw,300px)",
                  height: "min(72vw,300px)",
                  borderRadius: 12,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(72vw,300px)",
                  height: "min(72vw,300px)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#333",
                  padding: 16,
                  wordBreak: "break-all",
                  textAlign: "center",
                }}
              >
                {depositAddress}
              </div>
            )}
          </div>
          <p
            className="raj text-xs mt-5"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Tap outside to close
          </p>
        </div>
      )}
    </div>
  );
};

export default Funds;
