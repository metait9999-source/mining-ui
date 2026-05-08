import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import toast from "react-hot-toast";
import AppNav from "../Home/Navbar";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path.replace(/\\/g, "/")}`;
};

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
}) => (
  <div>
    <label
      className="block raj font-bold text-xs tracking-widest uppercase mb-2"
      style={{ color: "#475569" }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={disabled}
      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all raj font-semibold text-sm"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.02)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
        color: disabled ? "#334155" : "#f1f5f9",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  </div>
);

const Profile = (props) => {
  const { user, setLoading, refreshUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImage, setProfileImage] = useState(
    user?.profile_image ? getImageUrl(user.profile_image) : null,
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email);
    setName(user?.name);
    setProfileImage(
      user?.profile_image ? getImageUrl(user.profile_image) : null,
    );
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("documents", file);
      fd.append("user_id", user?.id);
      await axios.post(`${API_BASE_URL}/users/upload-profile-image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fresh = await refreshUser(user?.id);
      setProfileImage(getImageUrl(fresh?.profile_image));
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to upload image");
      setProfileImage(
        user?.profile_image ? getImageUrl(user.profile_image) : null,
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/users/${user?.id}`, {
        name,
        email,
      });
      await refreshUser(user?.id);
      toast.success(res?.data?.message || "Changes saved!");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const initials = (name || user?.name || "U").charAt(0).toUpperCase();

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#080810", color: "#e2e8f0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .act{transition:transform .18s,box-shadow .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        .avatar-btn:hover .avatar-overlay{opacity:1!important}
        input:focus{border-color:rgba(245,158,11,0.45)!important;box-shadow:0 0 0 3px rgba(245,158,11,0.08)!important}
        input::placeholder{color:#334155}
        input:disabled{opacity:.7}
      `}</style>

      <AppNav />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ── TWO-COL LAYOUT ── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Avatar card */}
          <div className="fup">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="h-px"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
                }}
              />

              <div className="flex flex-col items-center px-6 py-8">
                {/* Avatar */}
                <div
                  className="relative mb-5 cursor-pointer avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {/* Pulse ring */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "rgba(245,158,11,0.2)",
                      transform: "scale(1.12)",
                      filter: "blur(8px)",
                    }}
                  />

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="relative w-28 h-28 rounded-full object-cover block"
                      style={{
                        border: "3px solid rgba(245,158,11,0.4)",
                        boxShadow: "0 8px 28px rgba(245,158,11,0.25)",
                      }}
                    />
                  ) : (
                    <div
                      className="relative w-28 h-28 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#f97316)",
                        border: "3px solid rgba(245,158,11,0.4)",
                        boxShadow: "0 8px 28px rgba(245,158,11,0.25)",
                      }}
                    >
                      <span className="orb font-black text-4xl text-white">
                        {initials}
                      </span>
                    </div>
                  )}

                  {/* Camera overlay */}
                  <div
                    className="avatar-overlay absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-200"
                    style={{ background: "rgba(8,8,16,0.55)", opacity: 0 }}
                  >
                    {imageUploading ? (
                      <svg
                        className="w-8 h-8 text-white"
                        style={{ animation: "spin .8s linear infinite" }}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="3"
                        />
                        <path
                          d="M12 2a10 10 0 0110 10"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="13"
                          r="4"
                          stroke="white"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Camera badge */}
                  <div
                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#f97316)",
                      border: "2px solid #080810",
                    }}
                  >
                    {imageUploading ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ animation: "spin .8s linear infinite" }}
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="3"
                        />
                        <path
                          d="M12 2a10 10 0 0110 10"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="13"
                          r="4"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <p
                  className="orb font-black text-lg text-center mb-0.5"
                  style={{ color: "#f1f5f9" }}
                >
                  {name || user?.name || "User"}
                </p>
                <p
                  className="raj font-medium text-sm text-center mb-4"
                  style={{ color: "#475569" }}
                >
                  {email || user?.email || ""}
                </p>

                <p
                  className="raj font-medium text-xs"
                  style={{ color: "#334155" }}
                >
                  Tap photo to change
                </p>
              </div>

              {/* Quick stats */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  {
                    lbl: "Account Status",
                    val: "Active",
                    color: "#10b981",
                    bg: "rgba(16,185,129,0.12)",
                  },
                  {
                    lbl: "UID",
                    val: user?.uuid || "—",
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.1)",
                  },
                ].map((r, i, arr) => (
                  <div
                    key={r.lbl}
                    className="flex items-center justify-between px-6 py-4"
                    style={{
                      borderBottom:
                        i < arr.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <span
                      className="raj font-semibold text-sm"
                      style={{ color: "#475569" }}
                    >
                      {r.lbl}
                    </span>
                    <span
                      className="raj font-bold text-xs px-2.5 py-1 rounded-full"
                      style={{ background: r.bg, color: r.color }}
                    >
                      {r.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  padding: "16px 16px 8px",
                }}
              >
                <p
                  className="raj font-bold text-xs tracking-widest uppercase mb-3 px-2"
                  style={{ color: "#1e293b" }}
                >
                  Quick Settings
                </p>
                {[
                  { label: "2FA Security", to: "/two-factor-auth", icon: "🛡️" },
                  {
                    label: "Face Verification",
                    to: "/face-verification",
                    icon: "🤳",
                  },
                ].map((l) => (
                  <button
                    key={l.to}
                    onClick={() => navigate(l.to)}
                    className="act w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 border-none cursor-pointer text-left"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(245,158,11,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span className="text-base">{l.icon}</span>
                    <span
                      className="raj font-semibold text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      {l.label}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ml-auto"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="#334155"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Edit form */}
          <div className="lg:col-span-2 fup2">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="px-6 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-0.5 h-5 rounded-full"
                    style={{
                      background: "linear-gradient(to bottom,#f59e0b,#f97316)",
                    }}
                  />
                  <p
                    className="orb font-black text-base"
                    style={{ color: "#f1f5f9" }}
                  >
                    Edit Profile
                  </p>
                </div>
                <p
                  className="raj font-medium text-xs mt-1 ml-3.5"
                  style={{ color: "#475569" }}
                >
                  Update your personal information
                </p>
              </div>

              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="UID" value={user?.uuid} disabled />
                <InputField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <InputField
                  label="Referral UID"
                  value={user?.referral_uuid}
                  disabled
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Wallet Address"
                    value={props?.walletId}
                    disabled
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background: saving
                      ? "rgba(255,255,255,0.04)"
                      : "linear-gradient(135deg,#f59e0b,#f97316)",
                    color: saving ? "#334155" : "#080810",
                    letterSpacing: 2,
                    boxShadow: saving
                      ? "none"
                      : "0 6px 20px rgba(245,158,11,0.3)",
                    opacity: saving ? 0.7 : 1,
                    border: saving
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </div>

            {/* Info notice */}
            <div
              className="mt-4 rounded-2xl p-4 flex gap-3"
              style={{
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.1)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0 mt-0.5"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p
                className="raj font-medium text-xs leading-relaxed"
                style={{ color: "#64748b" }}
              >
                Changes to your name and email will be reflected across the
                platform. UID and wallet address cannot be changed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
