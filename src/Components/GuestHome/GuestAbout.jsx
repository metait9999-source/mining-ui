import React from "react";
import { useNavigate } from "react-router-dom";
import { GuestNav, GuestFooter } from "./GuestLayout";

const TEAM = [
  {
    name: "Alex Carter",
    role: "CEO & Co-Founder",
    initial: "AC",
    color: "#f59e0b",
  },
  {
    name: "Sarah Lin",
    role: "CTO & Co-Founder",
    initial: "SL",
    color: "#f97316",
  },
  {
    name: "Marcus Webb",
    role: "Head of Infrastructure",
    initial: "MW",
    color: "#a855f7",
  },
  {
    name: "Priya Sharma",
    role: "Head of Security",
    initial: "PS",
    color: "#10b981",
  },
];

const MILESTONES = [
  {
    year: "2019",
    title: "Founded",
    desc: "CryptoMine launched with 3 mining nodes in Frankfurt.",
  },
  {
    year: "2020",
    title: "Series A",
    desc: "Raised $12M to expand data center footprint globally.",
  },
  {
    year: "2021",
    title: "100K Miners",
    desc: "Reached 100,000 active miners across 80 countries.",
  },
  {
    year: "2022",
    title: "Global Expansion",
    desc: "Opened 20 new data centers across Asia and North America.",
  },
  {
    year: "2023",
    title: "$1B Mined",
    desc: "Crossed $1 billion in total mining rewards distributed.",
  },
  {
    year: "2024",
    title: "Today",
    desc: "847K+ miners. $2.4B total mined. Growing every day.",
  },
];

const GuestAbout = () => {
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
            Our Story
          </p>
          <h1
            className="font-orbitron font-black mb-5"
            style={{ fontSize: "clamp(28px,5vw,56px)" }}
          >
            Mining the Future,{" "}
            <span style={{ color: "#f59e0b" }}>Together</span>
          </h1>
          <p
            className="font-rajdhani text-base leading-relaxed"
            style={{ color: "#64748b" }}
          >
            CryptoMine was founded on one idea: make industrial-grade crypto
            mining accessible to everyone. No hardware. No expertise. Just
            results.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="px-6 md:px-10 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              color: "#f59e0b",
              title: "Our Mission",
              text: "We believe that the wealth-generating power of crypto mining should not be limited to those with the capital, space, and technical knowledge to run hardware. CryptoMine democratizes mining — giving anyone, anywhere the ability to deploy capital and earn daily returns from real blockchain infrastructure.",
            },
            {
              color: "#f97316",
              title: "Our Vision",
              text: "A world where every person has equal access to the financial tools that power the new economy. We're building the infrastructure layer that makes crypto mining as easy as opening a bank account — while delivering institutional-grade security and returns.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-8"
              style={{
                background: "#0d0d1a",
                border: `1px solid ${item.color}22`,
              }}
            >
              <div
                className="w-1 h-10 rounded-full mb-6"
                style={{ background: item.color }}
              />
              <h3
                className="font-orbitron font-black text-xl mb-4"
                style={{ color: item.color }}
              >
                {item.title}
              </h3>
              <p
                className="font-rajdhani text-base leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section
        className="px-6 md:px-10 py-10 pb-20"
        style={{
          background: "#0d0d1a",
          borderTop: "1px solid rgba(255,255,255,.05)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-3 text-center"
            style={{ color: "#f59e0b" }}
          >
            Our Journey
          </p>
          <h2
            className="font-orbitron font-black text-center mb-14"
            style={{ fontSize: "clamp(22px,3vw,36px)" }}
          >
            Milestones
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-16 top-0 bottom-0 w-px hidden md:block"
              style={{
                background:
                  "linear-gradient(to bottom,transparent,rgba(245,158,11,.3),transparent)",
              }}
            />
            <div className="flex flex-col gap-8">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-14 text-right">
                    <span
                      className="font-orbitron font-black text-sm"
                      style={{ color: "#f59e0b" }}
                    >
                      {m.year}
                    </span>
                  </div>
                  <div
                    className="hidden md:flex items-center justify-center w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{
                      background: "#f59e0b",
                      boxShadow: "0 0 10px rgba(245,158,11,.5)",
                    }}
                  />
                  <div
                    className="rounded-xl px-5 py-4 flex-1"
                    style={{
                      background: "rgba(245,158,11,.05)",
                      border: "1px solid rgba(245,158,11,.1)",
                    }}
                  >
                    <p className="font-orbitron font-bold text-sm mb-1">
                      {m.title}
                    </p>
                    <p
                      className="font-rajdhani text-sm"
                      style={{ color: "#64748b" }}
                    >
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 md:px-10 py-20 max-w-5xl mx-auto">
        <p
          className="font-rajdhani font-bold text-xs tracking-widest uppercase mb-3"
          style={{ color: "#f59e0b" }}
        >
          Leadership
        </p>
        <h2
          className="font-orbitron font-black mb-12"
          style={{ fontSize: "clamp(22px,3vw,36px)" }}
        >
          The Team
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-center"
              style={{
                background: "#0d0d1a",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-orbitron font-black text-xl"
                style={{
                  background: `${member.color}20`,
                  border: `2px solid ${member.color}50`,
                  color: member.color,
                }}
              >
                {member.initial}
              </div>
              <p className="font-orbitron font-bold text-sm mb-1">
                {member.name}
              </p>
              <p className="font-rajdhani text-xs" style={{ color: "#64748b" }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
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
          Join the CryptoMine Family
        </h3>
        <p
          className="font-rajdhani text-base mb-8 relative z-10"
          style={{ color: "#64748b" }}
        >
          847,000+ miners trust us with their earnings. Be next.
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

export default GuestAbout;
