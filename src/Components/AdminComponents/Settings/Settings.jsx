import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import DeleteModal from "../DeleteModal/DeleteModal";
import toast from "react-hot-toast";
import UpdateTimer from "./UpdateTImer";
import { IoSettingsSharp } from "react-icons/io5";
import { MdOutlineWarning } from "react-icons/md";
import { FiSave } from "react-icons/fi";

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const selectCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer";

const Settings = () => {
  const { adminUser, setLoading } = useUser();
  const [/*timerProfits,*/ setTimerProfits] = useState([]);
  const [/*refreshData,*/ setRefreshData] = useState(false);
  const [refreshSetting, setRefreshSetting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [timerDetails, setTimerDetails] = useState(null);
  const [isMore, setIsMore] = useState(false);

  const [formData, setFormData] = useState({
    referral_deposit_bonus_status: "enabled",
    referral_deposit_bonus: "",
    trade_amount_limit: "",
    deposit_limit: "",
    withdrawal_limit: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [refreshSetting, setLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleTimerChange = (e) => {
  //   const { name, value } = e.target;
  //   setTimerData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/settings`, {
        referral_deposit_bonus_status: formData.referral_deposit_bonus_status,
        referral_deposit_bonus: formData.referral_deposit_bonus,
        trade_amount_limit: formData.trade_amount_limit,
        deposit_limit: formData.deposit_limit,
        withdrawal_limit: formData.withdrawal_limit,
      });
      toast.success("Settings saved successfully!");
      setRefreshSetting((p) => !p);
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  // const handleTimerProfitSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.post(`${API_BASE_URL}/timerprofits`, timerData);
  //     toast.success("Timer profit added successfully!");
  //     setTimerData({ timer: "", profit: "", mini_usdt: "" });
  //     setRefreshData((p) => !p);
  //   } catch {
  //     toast.error("Failed to add timer profit.");
  //   }
  // };

  const handleDelete = async (timerId) => {
    try {
      await axios.delete(`${API_BASE_URL}/timerprofits/${timerId}`);
      setTimerProfits((prev) => prev.filter((t) => t.id !== timerId));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`${API_BASE_URL}/reset`);
      toast.success("Reset successful");
    } catch {
      toast.error("Reset failed");
    }
  };

  // const openModal = (timerId) => {
  //   setSelectedTimer(timerId);
  //   setIsModalOpen(true);
  // };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTimer(null);
  };
  const confirmDelete = () => {
    if (selectedTimer) handleDelete(selectedTimer);
    closeModal();
  };
  // const openMore = (timer) => {
  //   setTimerDetails(timer);
  //   setIsMore(true);
  // };
  const closeMore = () => {
    setIsMore(false);
    setTimerDetails(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <IoSettingsSharp size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
            Settings
          </h1>
          <p className="text-gray-400 text-[12px]">
            Manage platform configuration
          </p>
        </div>
      </div>

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── General Features ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
            <IoSettingsSharp
              size={16}
              className="text-indigo-500 flex-shrink-0"
            />
            <h2 className="text-[14px] font-bold text-gray-900">
              General Features
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Referral Deposit Bonus Status">
                <select
                  name="referral_deposit_bonus_status"
                  value={formData.referral_deposit_bonus_status}
                  onChange={handleChange}
                  className={selectCls}
                  required
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </FormField>

              <FormField label="Referral Deposit Bonus (%)">
                <input
                  type="number"
                  name="referral_deposit_bonus"
                  value={formData.referral_deposit_bonus}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. 5"
                  required
                />
              </FormField>

              <FormField label="Trade Amount Limit">
                <input
                  type="number"
                  name="trade_amount_limit"
                  value={formData.trade_amount_limit}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. 1000"
                />
              </FormField>

              <FormField label="Deposit Limit">
                <input
                  type="number"
                  name="deposit_limit"
                  value={formData.deposit_limit}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. 5000"
                  required
                />
              </FormField>

              <FormField label="Withdrawal Limit">
                <input
                  type="number"
                  name="withdrawal_limit"
                  value={formData.withdrawal_limit}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. 2000"
                  required
                />
              </FormField>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
              >
                <FiSave size={14} />
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* ── Timer Profit ── */}
      </div>

      {/* ── Danger Zone (superadmin only) ── */}
      {adminUser?.role === "superadmin" && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-red-100 bg-red-50/50">
            <MdOutlineWarning
              size={17}
              className="text-red-500 flex-shrink-0"
            />
            <h2 className="text-[14px] font-bold text-red-600">Danger Zone</h2>
          </div>
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[13.5px] font-semibold text-gray-800">
                Reset All Data
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                This will permanently delete all data. This action cannot be
                undone.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-200"
            >
              Reset All Data
            </button>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Timer Profit"
        description="This action cannot be undone."
      />

      <UpdateTimer
        isOpen={isMore}
        onClose={closeMore}
        details={timerDetails}
        role={adminUser?.role}
        onUpdateSuccess={() => setRefreshData((p) => !p)}
      />
    </div>
  );
};

export default Settings;
