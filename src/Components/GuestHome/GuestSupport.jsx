import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GuestNav, GuestFooter } from "./GuestLayout";

const FAQS = [
  {
    q: "How does cloud mining work?",
    a: "You deposit USDT into a mining plan. We allocate real hashing power to your account from our physical hardware. Your daily earnings are credited automatically based on the plan's daily rate.",
  },
  {
    q: "When will I receive my daily earnings?",
    a: "Earnings are credited to your account balance every 24 hours from the time your plan activates. You can withdraw at any time with no waiting period.",
  },
  {
    q: "What happens at the end of a plan?",
    a: "At plan maturity, your principal deposit is automatically returned to your account balance alongside your final day's earnings. You can then re-invest or withdraw.",
  },
  {
    q: "Is my deposit safe?",
    a: "Principal funds are held in cold storage multi-sig wallets and never used for operational expenses. Your deposit is always fully backed and returned at maturity.",
  },
  {
    q: "How do I withdraw my earnings?",
    a: "Go to the Funds section in your dashboard, enter the amount and your wallet address, and confirm. Withdrawals are processed within minutes.",
  },
  {
    q: "Can I have multiple plans active?",
    a: "Yes — you can activate as many plans as you like simultaneously. Each plan runs independently with its own earnings and maturity date.",
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: "#0d0d1a",
        border: `1px solid ${open ? "rgba(245,158,11,.25)" : "rgba(255,255,255,.06)"}`,
      }}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-transparent border-none cursor-pointer"
        onClick={() => setOpen((p) => !p)}
      >
        <span
          className="font-rajdhani font-bold text-base pr-4"
          style={{ color: open ? "#f59e0b" : "#e2e8f0" }}
        >
          {q}
        </span>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300"
          style={{
            background: open ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.05)",
            color: open ? "#f59e0b" : "#64748b",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p
            className="font-rajdhani text-sm leading-relaxed"
            style={{ color: "#64748b" }}
          >
            {a}
          </p>
        </div>
      )}
    </div>
  );
};

const GuestSupport = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <GuestNav />

      {/* Hero */}
      <div
        className="relative px-6 md:px-10 py-24 text-center overflow-hidden"
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
        <div className="relative z-10 max-w-2xl mx-auto animate-fade-up">
          <p
            className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-4"
            style={{ color: "#f59e0b" }}
          >
            Help Center
          </p>
          <h1
            className="font-orbitron font-black mb-5"
            style={{ fontSize: "clamp(28px,5vw,54px)" }}
          >
            How Can We <span style={{ color: "#f59e0b" }}>Help You?</span>
          </h1>
          <p
            className="font-rajdhani text-base leading-relaxed"
            style={{ color: "#64748b" }}
          >
            Our support team is available 24/7. Find answers below or reach out
            directly.
          </p>
        </div>
      </div>

      {/* Contact cards */}
      <section className="px-6 md:px-10 py-16 max-w-5xl mx-auto">
        <p
          className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-8 text-center"
          style={{ color: "#f59e0b" }}
        >
          Contact Us
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            {
              color: "#25d366",
              bg: "linear-gradient(135deg,#25d366,#128c7e)",
              title: "WhatsApp",
              desc: "Message us instantly",
              sub: "Avg. response: ~2 min",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path
                    d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.845L.057 23.884l6.166-1.617A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.942 0-3.761-.523-5.319-1.435l-.381-.226-3.942 1.033 1.052-3.833-.249-.394A9.793 9.793 0 012.182 12c0-5.415 4.403-9.818 9.818-9.818 5.415 0 9.818 4.403 9.818 9.818 0 5.415-4.403 9.818-9.818 9.818z"
                    fill="rgba(255,255,255,0.3)"
                  />
                </svg>
              ),
              action: () =>
                window.__whatsapp && (window.location.href = window.__whatsapp),
              btnText: "OPEN WHATSAPP",
            },
            {
              color: "#229ed9",
              bg: "linear-gradient(135deg,#229ed9,#1a7fbf)",
              title: "Telegram",
              desc: "Chat via Telegram",
              sub: "Avg. response: ~5 min",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.829.941z" />
                </svg>
              ),
              action: () =>
                window.__telegram && (window.location.href = window.__telegram),
              btnText: "OPEN TELEGRAM",
            },
            {
              color: "#6366f1",
              bg: "linear-gradient(135deg,#6366f1,#a855f7)",
              title: "Live Chat",
              desc: "Chat with our team",
              sub: "Available 24/7",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    fill="rgba(255,255,255,.2)"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="10" r="1.2" fill="white" />
                  <circle cx="12" cy="10" r="1.2" fill="white" />
                  <circle cx="16" cy="10" r="1.2" fill="white" />
                </svg>
              ),
              action: () => navigate("/login"),
              btnText: "START CHAT",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 flex flex-col items-center text-center"
              style={{
                background: "#0d0d1a",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: card.bg,
                  boxShadow: `0 8px 24px ${card.color}40`,
                }}
              >
                {card.icon}
              </div>
              <p className="font-orbitron font-bold text-base mb-1">
                {card.title}
              </p>
              <p className=" mb-1" style={{ color: "#94a3b8" }}>
                {card.desc}
              </p>
              <p className=" text-xs mb-7" style={{ color: "white" }}>
                {card.sub}
              </p>
              <button
                onClick={card.action}
                className="w-full py-3 rounded-xl font-rajdhani font-bold tracking-widest text-xs cursor-pointer border-none transition-all duration-200 btn-primary"
                style={{ background: card.bg, color: "white" }}
              >
                {card.btnText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <p
          className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-4 text-center"
          style={{ color: "#f59e0b" }}
        >
          FAQ
        </p>
        <h2
          className="font-orbitron font-black text-center mb-10"
          style={{ fontSize: "clamp(22px,3vw,36px)" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3 max-w-3xl mx-auto">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} {...faq} />
          ))}
        </div>
      </section>

      {/* Still need help */}
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
          Still have questions?
        </h3>
        <p
          className="font-rajdhani text-base mb-8 relative z-10"
          style={{ color: "#64748b" }}
        >
          Create a free account to access our full support dashboard and live
          chat.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="font-rajdhani font-bold tracking-widest px-10 py-4 rounded-xl border-none cursor-pointer btn-primary transition-all duration-200 relative z-10"
          style={{
            background: "linear-gradient(135deg,#f59e0b,#f97316)",
            color: "#080810",
            fontSize: 15,
          }}
        >
          CREATE FREE ACCOUNT
        </button>
      </div>

      <GuestFooter />
    </div>
  );
};

export default GuestSupport;
