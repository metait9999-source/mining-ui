import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../api/getApiURL";
import { FaWallet } from "react-icons/fa";
import { FiSave, FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import { MdOutlineQrCode2 } from "react-icons/md";

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const readonlyCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed select-none";

const selectCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer";

const FormField = ({ label, children, locked }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
      {label}
      {locked && (
        <span className="text-[10px] font-semibold text-gray-300 normal-case tracking-normal">
          (locked)
        </span>
      )}
    </label>
    {children}
  </div>
);

const ImageUploadField = ({
  label,
  icon: Icon,
  previewSrc,
  inputName,
  accept = "image/*",
  required = false,
  onChange,
  onClear,
}) => (
  <FormField label={label}>
    {previewSrc ? (
      <div className="relative w-full rounded-xl border border-indigo-200 bg-indigo-50/30 overflow-hidden">
        <img
          src={previewSrc}
          alt={label}
          className="w-full h-36 object-contain p-2"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
        >
          <FiX size={12} />
        </button>
        <p className="text-center text-[11px] text-indigo-500 font-medium pb-2">
          Click × to replace
        </p>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-2 w-full h-36 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-400 transition-all">
        <Icon size={24} className="opacity-60" />
        <span className="text-[12px] font-medium">Click to upload</span>
        <span className="text-[11px] text-gray-300">PNG, JPG, WEBP</span>
        <input
          type="file"
          name={inputName}
          onChange={onChange}
          accept={accept}
          required={required}
          className="hidden"
        />
      </label>
    )}
  </FormField>
);

const EditWallet = () => {
  const location = useLocation();
  const existingWallet = location.state.wallet;
  const navigate = useNavigate();

  const resolveLogoPreview = (coinLogo) => {
    if (!coinLogo) return null;
    if (coinLogo.startsWith("uploads/")) return `${API_BASE_URL}/${coinLogo}`;
    return coinLogo;
  };

  const [logoPreview, setLogoPreview] = useState(
    resolveLogoPreview(existingWallet.coin_logo),
  );
  const [qrPreview, setQrPreview] = useState(
    existingWallet.wallet_qr
      ? `${API_BASE_URL}/${existingWallet.wallet_qr}`
      : null,
  );

  const [formData, setFormData] = useState({
    wallet_address: existingWallet.wallet_address,
    coin_logo: existingWallet.coin_logo,
    wallet_qr: existingWallet.wallet_qr,
    status: existingWallet.status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, coin_logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, wallet_qr: file }));
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("coin_id", existingWallet.coin_id);
      payload.append("coin_name", existingWallet.coin_name);
      payload.append("coin_symbol", existingWallet.coin_symbol);
      payload.append("wallet_network", existingWallet.wallet_network);
      payload.append("wallet_address", formData.wallet_address);
      payload.append("status", formData.status);

      if (formData.coin_logo instanceof File) {
        payload.append("coin_logo", formData.coin_logo);
      } else if (formData.coin_logo) {
        payload.append("coin_logo", formData.coin_logo);
      }

      if (formData.wallet_qr instanceof File) {
        payload.append("wallet_qr", formData.wallet_qr);
      } else if (formData.wallet_qr) {
        payload.append("wallet_qr", formData.wallet_qr);
      }

      await axios.put(`${API_BASE_URL}/wallets/${existingWallet.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Wallet updated successfully");
      navigate("/panel/wallets");
    } catch {
      toast.error("Failed to update wallet");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate("/panel/wallets")}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <FiArrowLeft size={15} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <FaWallet size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
            Edit Wallet
          </h1>
          <p className="text-gray-400 text-[12px]">
            Update wallet configuration
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <FaWallet size={15} className="text-indigo-500" />
            <h2 className="text-[14px] font-bold text-gray-900">
              Wallet Details
            </h2>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {existingWallet.coin_symbol}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* ── Locked info banner ── */}
          <div className="flex items-center gap-2 mb-5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-amber-400 text-[13px]">🔒</span>
            <p className="text-[12px] text-amber-600 font-medium">
              Coin details are locked. Only address, images, and status can be
              changed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Locked fields */}
            <FormField label="Coin Name" locked>
              <div className={readonlyCls}>{existingWallet.coin_name}</div>
            </FormField>

            <FormField label="Coin Symbol" locked>
              <div className={readonlyCls}>{existingWallet.coin_symbol}</div>
            </FormField>

            <FormField label="Wallet Network" locked>
              <div className={readonlyCls}>{existingWallet.wallet_network}</div>
            </FormField>

            {/* Status — editable */}
            <FormField label="Status">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>

            {/* Wallet Address — editable, full width */}
            <div className="sm:col-span-2">
              <FormField label="Wallet Address">
                <input
                  type="text"
                  name="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleChange}
                  placeholder="Enter wallet address"
                  required
                  className={inputCls}
                />
              </FormField>
            </div>

            {/* Coin Logo — editable */}
            <ImageUploadField
              label="Coin Logo"
              icon={FiUpload}
              previewSrc={logoPreview}
              inputName="coin_logo"
              onChange={handleLogoChange}
              onClear={() => {
                setLogoPreview(null);
                setFormData((p) => ({ ...p, coin_logo: "" }));
              }}
            />

            {/* Wallet QR — editable */}
            <ImageUploadField
              label="Wallet QR Code"
              icon={MdOutlineQrCode2}
              previewSrc={qrPreview}
              inputName="wallet_qr"
              accept="image/*"
              onChange={handleQrChange}
              onClear={() => {
                setQrPreview(null);
                setFormData((p) => ({ ...p, wallet_qr: null }));
              }}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
            >
              <FiSave size={14} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWallet;
