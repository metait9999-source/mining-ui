import React, { useState } from "react";
import useWallets from "../../../hooks/useWallets";
import { useUpdateUserBalance } from "../../../hooks/useUpdateUserBalance";
import { IoClose } from "react-icons/io5";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiEdit2, FiCheck } from "react-icons/fi";

const BalanceModal = ({ isOpen, onClose, details }) => {
  const { wallets, refetch } = useWallets(details?.id);
  const { updateUserBalance } = useUpdateUserBalance();
  const [editingId, setEditingId] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [savingId, setSavingId] = useState(null);

  const handleSave = async (wallet) => {
    if (!newAmount || isNaN(newAmount)) return;
    setSavingId(wallet.id);
    try {
      await updateUserBalance(
        details?.id,
        wallet.coin_id,
        parseFloat(newAmount),
      );
      setEditingId(null);
      setNewAmount("");
      refetch?.(); // refresh wallets after update if supported
    } catch {
      console.error("Error updating balance");
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewAmount("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdOutlineAccountBalanceWallet size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Balance Details
              </h2>
              <p className="text-[11px] text-gray-400">UID: {details?.uuid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* Wallet address */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            Wallet Address
          </p>
          <p className="text-[12.5px] font-mono text-gray-700 break-all">
            {details?.user_wallet}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[400px] p-5">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "Logo",
                    "Name",
                    "Symbol",
                    "Balance (USD)",
                    "Total Deposit",
                    "Total Withdraw",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wallets?.map((wallet) => (
                  <tr
                    key={wallet.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Logo */}
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={`/assets/images/coins/${wallet.coin_symbol?.toLowerCase()}-logo.png`}
                          alt={wallet.coin_symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {wallet?.coin_name}
                    </td>

                    {/* Symbol */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {wallet?.coin_symbol}
                      </span>
                    </td>

                    {/* Balance (USD) — editable */}
                    <td className="px-4 py-3">
                      {editingId === wallet.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave(wallet);
                              if (e.key === "Escape") handleCancel();
                            }}
                            className="w-28 px-2 py-1 text-[12px] border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSave(wallet)}
                            disabled={savingId === wallet.id}
                            className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors flex-shrink-0 disabled:opacity-50"
                          >
                            {savingId === wallet.id ? (
                              <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiCheck size={11} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(wallet.id);
                            setNewAmount(wallet.coin_amount ?? "");
                          }}
                          className="flex items-center gap-1.5 text-[12px] text-gray-700 hover:text-indigo-600 group"
                        >
                          <span>
                            ${parseFloat(wallet.coin_amount ?? 0).toFixed(2)}
                          </span>
                          <FiEdit2
                            size={11}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500"
                          />
                        </button>
                      )}
                    </td>

                    {/* Total Deposit */}
                    <td className="px-4 py-3 text-gray-600">
                      {wallet?.total_deposits}
                    </td>

                    {/* Total Withdraw */}
                    <td className="px-4 py-3 text-gray-600">
                      {wallet?.total_withdrawals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;
