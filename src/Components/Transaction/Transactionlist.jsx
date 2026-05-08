import React, { useState } from "react";

export const STATUS = {
  approved: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    label: "Approved",
  },
  pending: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    label: "Pending",
  },
  rejected: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    label: "Rejected",
  },
};

export const fmt = (createdAt) =>
  new Date(createdAt)
    .toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");

export const StatusBadge = ({ status }) => {
  const s = STATUS[status?.toLowerCase()] || STATUS.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full raj font-bold text-xs"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
};

const TransactionList = ({
  items,
  type,
  emptyLabel,
  openTransactionHistory,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const PER_PAGE = 10;

  const filtered = items.filter((o) =>
    o?.coin_symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const isDeposit = type === "deposit";
  const accentColor = isDeposit ? "#10b981" : "#f59e0b";

  return (
    <div>
      {/* Search + count row */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center gap-2.5 flex-1 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="flex-shrink-0"
          >
            <circle cx="7" cy="7" r="5" stroke="#334155" strokeWidth="1.5" />
            <path
              d="M11 11l3 3"
              stroke="#334155"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by coin symbol…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 bg-transparent outline-none border-none raj font-semibold text-sm"
            style={{ color: "#f1f5f9" }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="flex-shrink-0 bg-transparent border-none cursor-pointer"
              style={{ color: "#334155" }}
            >
              ✕
            </button>
          )}
        </div>
        <div
          className="flex-shrink-0 px-3 py-2 rounded-xl raj font-bold text-xs"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}25`,
            color: accentColor,
          }}
        >
          {filtered.length} records
        </div>
      </div>

      {/* Table header — desktop */}
      {current.length > 0 && (
        <div
          className="hidden md:grid grid-cols-12 px-5 py-3 mb-1 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            className="col-span-4 raj font-bold text-xs tracking-widest uppercase"
            style={{ color: "#334155" }}
          >
            Asset
          </span>
          <span
            className="col-span-3 raj font-bold text-xs tracking-widest uppercase"
            style={{ color: "#334155" }}
          >
            Date
          </span>
          {isDeposit && (
            <span
              className="col-span-2 text-right raj font-bold text-xs tracking-widest uppercase"
              style={{ color: "#334155" }}
            >
              Amount
            </span>
          )}
          <span
            className={`${isDeposit ? "col-span-2" : "col-span-4"} text-right raj font-bold text-xs tracking-widest uppercase`}
            style={{ color: "#334155" }}
          >
            Status
          </span>
          <span className="col-span-1" />
        </div>
      )}

      {/* Rows */}
      {current.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "#1e293b" }}
            >
              {isDeposit ? (
                <>
                  <path
                    d="M12 3v14M5 10l7 7 7-7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 21h18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M12 21V7M5 14l7-7 7 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 3h18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>
          <div className="text-center">
            <p
              className="orb font-black text-sm mb-1.5"
              style={{ color: "#334155" }}
            >
              {emptyLabel}
            </p>
            <p className="raj font-medium text-xs" style={{ color: "#1e293b" }}>
              {searchTerm
                ? "Try a different search term"
                : `Your ${type} history will appear here`}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "#0a0a14",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {current.map((order, idx) => {
            return (
              <button
                key={order.id}
                onClick={() => openTransactionHistory(order)}
                className="w-full text-left transition-colors duration-150"
                style={{
                  borderBottom:
                    idx < current.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  background: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(245,158,11,0.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 items-center px-5 py-4">
                  {/* Asset */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: "rgba(245,158,11,0.08)",
                          transform: "scale(1.3)",
                          filter: "blur(4px)",
                        }}
                      />
                      <img
                        src={`/assets/images/coins/${order?.coin_symbol?.toLowerCase()}-logo.png`}
                        alt={order.coin_symbol}
                        className="relative w-10 h-10 rounded-full object-contain"
                        style={{ background: "white", padding: 2 }}
                        onError={(e) => {
                          e.target.style.background = "rgba(245,158,11,0.1)";
                        }}
                      />
                    </div>
                    <div>
                      <p
                        className="raj font-bold text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        {order.coin_symbol} Wallet
                      </p>
                      <p
                        className="raj text-xs mt-0.5"
                        style={{ color: "#475569" }}
                      >
                        {isDeposit ? "Deposit" : "Withdrawal"}
                      </p>
                    </div>
                  </div>
                  {/* Date */}
                  <div className="col-span-3">
                    <p
                      className="raj font-medium text-sm"
                      style={{ color: "#64748b" }}
                    >
                      {fmt(order.created_at)}
                    </p>
                  </div>
                  {/* Amount — deposit only */}
                  {isDeposit && (
                    <div className="col-span-2 text-right">
                      <p
                        className="raj font-bold text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        {parseFloat(order.amount).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {/* Status */}
                  <div
                    className={`${isDeposit ? "col-span-2" : "col-span-4"} text-right`}
                  >
                    <StatusBadge status={order.status} />
                  </div>
                  {/* Arrow */}
                  <div className="col-span-1 flex justify-end">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(245,158,11,0.06)",
                        border: "1px solid rgba(245,158,11,0.1)",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
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
                </div>

                {/* Mobile row */}
                <div className="md:hidden flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: "rgba(245,158,11,0.08)",
                          transform: "scale(1.25)",
                          filter: "blur(4px)",
                        }}
                      />
                      <img
                        src={`/assets/images/coins/${order?.coin_symbol?.toLowerCase()}-logo.png`}
                        alt={order.coin_symbol}
                        className="relative w-10 h-10 rounded-full object-contain"
                        style={{ background: "white", padding: 2 }}
                        onError={(e) => {
                          e.target.style.background = "rgba(245,158,11,0.1)";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="raj font-bold text-sm truncate"
                        style={{ color: "#f1f5f9" }}
                      >
                        {order.coin_symbol} Wallet
                      </p>
                      <p
                        className="raj text-xs mt-0.5"
                        style={{ color: "#475569" }}
                      >
                        {fmt(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                    {isDeposit && (
                      <p
                        className="raj font-bold text-sm"
                        style={{ color: "#f1f5f9" }}
                      >
                        {parseFloat(order.amount).toFixed(2)}
                      </p>
                    )}
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-1">
          <p className="raj font-medium text-xs" style={{ color: "#334155" }}>
            Showing {(currentPage - 1) * PER_PAGE + 1}–
            {Math.min(currentPage * PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 border-none cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#f1f5f9",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                typeof p === "string" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-9 h-9 flex items-center justify-center raj text-sm"
                    style={{ color: "#334155" }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center raj font-bold text-sm border-none cursor-pointer transition-all"
                    style={{
                      background:
                        currentPage === p
                          ? "linear-gradient(135deg,#f59e0b,#f97316)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${currentPage === p ? "transparent" : "rgba(255,255,255,0.07)"}`,
                      color: currentPage === p ? "#080810" : "#64748b",
                    }}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 border-none cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#f1f5f9",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
