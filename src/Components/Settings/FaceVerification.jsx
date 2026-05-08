import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import { useUser } from "../../context/UserContext";
import AppNav from "../Home/Navbar";

const TIPS = [
  {
    emoji: "💡",
    title: "Good Lighting",
    desc: "Ensure your face is well lit from the front",
  },
  {
    emoji: "👁️",
    title: "Face the Camera",
    desc: "Look directly into the camera lens",
  },
  {
    emoji: "🕶️",
    title: "Remove Eyewear",
    desc: "Remove glasses or hats if possible",
  },
  {
    emoji: "😐",
    title: "Neutral Expression",
    desc: "Keep a calm, neutral expression",
  },
];

const FaceVerification = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState("intro");
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.face_image) setStep("already_verified");
  }, [user]);

  const openCamera = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isFresh = Date.now() - file.lastModified < 60000;
    if (!isFresh) {
      e.target.value = "";
      setErrorMsg(
        "Please take a live selfie using the camera, not a photo from your gallery.",
      );
      setStep("gallery_error");
      return;
    }
    setCapturedFile(file);
    setCapturedImage(URL.createObjectURL(file));
    setStep("preview");
    e.target.value = "";
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    fileInputRef.current?.click();
  };

  const submitFace = async () => {
    if (!capturedFile) return;
    setStep("uploading");
    try {
      const fd = new FormData();
      fd.append("user_id", user?.id);
      fd.append("documents", capturedFile, "face.jpg");
      await axios.post(`${API_BASE_URL}/users/face-verify`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser(user?.id);
      setStep("done");
    } catch {
      setErrorMsg("Upload failed. Please check your connection and try again.");
      setStep("error");
    }
  };

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
        @keyframes fup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        @keyframes check-draw{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}
        .fup{animation:fup .5s ease both}
        .fup2{animation:fup .5s ease both;animation-delay:.1s;opacity:0}
        .spin{animation:spin .9s linear infinite}
        .act{transition:transform .18s,box-shadow .18s}
        .act:hover{transform:translateY(-2px)}
        .act:active{transform:scale(.96)}
        .tip-row{transition:background .15s}
        .tip-row:hover{background:rgba(245,158,11,0.04)!important}
      `}</style>

      <AppNav />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="px-4 md:px-8 lg:px-16 max-w-screen-xl mx-auto">
        {/* ═══════ ALREADY VERIFIED ═══════ */}
        {step === "already_verified" && (
          <div className="mt-6 fup">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: face card */}
              <div>
                <div
                  className="relative rounded-3xl overflow-hidden mb-5"
                  style={{
                    background: "linear-gradient(135deg,#10b981,#059669)",
                  }}
                >
                  <div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      top: -60,
                      right: -60,
                      width: 200,
                      height: 200,
                      background: "rgba(255,255,255,0.08)",
                      filter: "blur(40px)",
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-center py-10 px-6">
                    <div
                      className="w-32 h-32 rounded-full mb-5 overflow-hidden border-4"
                      style={{
                        borderColor: "rgba(255,255,255,0.35)",
                        boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
                      }}
                    >
                      <img
                        src={`${API_BASE_URL}/${user.face_image}`}
                        alt="Face"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.style.background =
                            "rgba(255,255,255,0.2)";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.25)" }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12l5 5 9-9"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="orb font-black text-white text-xl">
                        Verified
                      </p>
                    </div>
                    <p
                      className="raj font-medium text-sm text-center"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      Your face has been successfully verified
                    </p>
                  </div>
                </div>

                {/* Info notice */}
                <div
                  className="rounded-2xl p-4 flex gap-3"
                  style={{
                    background: "rgba(16,185,129,0.07)",
                    border: "1px solid rgba(16,185,129,0.18)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="flex-shrink-0 mt-0.5"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p
                    className="raj font-medium text-sm leading-relaxed"
                    style={{ color: "#6ee7b7" }}
                  >
                    Your face photo has been submitted. Our team will review and
                    verify your identity shortly.
                  </p>
                </div>
              </div>

              {/* Right: status details */}
              <div>
                <div
                  className="rounded-3xl overflow-hidden mb-4"
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: "rgba(16,185,129,0.12)",
                          border: "1px solid rgba(16,185,129,0.2)",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
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
                      <div>
                        <p
                          className="orb font-black text-sm"
                          style={{ color: "#f1f5f9" }}
                        >
                          Verification Complete
                        </p>
                        <p
                          className="raj text-xs mt-0.5"
                          style={{ color: "#475569" }}
                        >
                          Identity submitted for review
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    {[
                      {
                        lbl: "Status",
                        val: "Submitted",
                        c: "#10b981",
                        bg: "rgba(16,185,129,0.12)",
                      },
                      {
                        lbl: "Method",
                        val: "Face Selfie",
                        c: "#3b82f6",
                        bg: "rgba(59,130,246,0.12)",
                      },
                      {
                        lbl: "File",
                        val: "Photo on file",
                        c: "#f59e0b",
                        bg: "rgba(245,158,11,0.12)",
                      },
                    ].map((r, i, arr) => (
                      <div
                        key={r.lbl}
                        className="flex items-center justify-between py-3.5"
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
                          className="raj font-bold text-xs px-3 py-1 rounded-full"
                          style={{ background: r.bg, color: r.c }}
                        >
                          {r.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("intro")}
                    className="act flex-1 py-3.5 rounded-2xl raj font-bold text-sm border-none cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#64748b",
                      letterSpacing: 1.5,
                    }}
                  >
                    RE-SUBMIT
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="act flex-1 py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg,#10b981,#059669)",
                      color: "white",
                      letterSpacing: 1.5,
                      boxShadow: "0 6px 20px rgba(16,185,129,0.3)",
                    }}
                  >
                    DONE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ INTRO ═══════ */}
        {step === "intro" && (
          <div className="mt-6 fup">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: hero + take selfie */}
              <div>
                <div
                  className="relative rounded-3xl overflow-hidden mb-5"
                  style={{
                    background:
                      "linear-gradient(135deg,#0f1020,#0d0d1a 55%,#140f1a)",
                    border: "1px solid rgba(245,158,11,0.14)",
                  }}
                >
                  <div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      top: -60,
                      right: -60,
                      width: 200,
                      height: 200,
                      background:
                        "radial-gradient(circle,rgba(245,158,11,.1),transparent 70%)",
                    }}
                  />
                  <div
                    className="absolute top-0 inset-x-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg,transparent,#f59e0b,#f97316,transparent)",
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center py-10 px-6">
                    <div
                      className="w-24 h-24 rounded-3xl mb-5 flex items-center justify-center"
                      style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                          stroke="#f59e0b"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3.5"
                          stroke="#f59e0b"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M8.5 9.5C9.2 8.3 10.5 7.5 12 7.5s2.8.8 3.5 2"
                          stroke="#f97316"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8.5 14.5C9.2 15.7 10.5 16.5 12 16.5s2.8-.8 3.5-2"
                          stroke="#f97316"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="orb font-black text-xl text-white mb-2">
                      Verify Your Face
                    </p>
                    <p
                      className="raj font-medium text-sm text-center"
                      style={{ color: "#64748b" }}
                    >
                      Take a live selfie to verify your identity
                    </p>
                  </div>
                </div>

                {/* Camera tip */}
                <div
                  className="rounded-2xl p-4 flex gap-3 mb-5"
                  style={{
                    background: "rgba(59,130,246,0.07)",
                    border: "1px solid rgba(59,130,246,0.15)",
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
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p
                    className="raj font-medium text-sm leading-relaxed"
                    style={{ color: "#93c5fd" }}
                  >
                    If a picker appears, select{" "}
                    <strong style={{ color: "#bfdbfe" }}>"Camera"</strong> to
                    take a live selfie.
                  </p>
                </div>

                <button
                  onClick={openCamera}
                  className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    color: "#080810",
                    letterSpacing: 2,
                    boxShadow: "0 6px 20px rgba(245,158,11,0.35)",
                  }}
                >
                  📷 TAKE SELFIE
                </button>
              </div>

              {/* Right: tips */}
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
                  <p
                    className="orb font-black text-base"
                    style={{ color: "#f1f5f9" }}
                  >
                    Before You Start
                  </p>
                </div>
                <div className="px-6 py-4">
                  {TIPS.map((tip, i) => (
                    <div
                      key={tip.title}
                      className="tip-row flex items-start gap-4 py-4 -mx-2 px-2 rounded-xl"
                      style={{
                        borderBottom:
                          i < TIPS.length - 1
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "none",
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{
                          background: "rgba(245,158,11,0.08)",
                          border: "1px solid rgba(245,158,11,0.15)",
                        }}
                      >
                        {tip.emoji}
                      </div>
                      <div>
                        <p
                          className="raj font-bold text-sm mb-0.5"
                          style={{ color: "#f1f5f9" }}
                        >
                          {tip.title}
                        </p>
                        <p
                          className="raj font-medium text-xs"
                          style={{ color: "#64748b" }}
                        >
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ GALLERY ERROR ═══════ */}
        {step === "gallery_error" && (
          <div className="mt-6 fup flex justify-center">
            <div className="w-full max-w-lg">
              <div
                className="rounded-3xl overflow-hidden mb-5"
                style={{
                  background: "#0a0a14",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <div
                  className="h-px"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,#f97316,transparent)",
                  }}
                />
                <div className="flex flex-col items-center px-6 py-10">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{
                      background: "rgba(249,115,22,0.12)",
                      border: "1px solid rgba(249,115,22,0.25)",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 9v4M12 17h.01"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p
                    className="orb font-black text-lg mb-2"
                    style={{ color: "#f1f5f9" }}
                  >
                    Live Photo Required
                  </p>
                  <p
                    className="raj font-medium text-sm text-center leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    You selected a photo from your gallery. Please take a live
                    selfie using your camera.
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 mb-5"
                style={{
                  background: "rgba(59,130,246,0.07)",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <p
                  className="raj font-bold text-sm mb-3"
                  style={{ color: "#93c5fd" }}
                >
                  How to take a live selfie:
                </p>
                {[
                  "Tap 'Try Again' below",
                  "When the picker appears, choose 'Camera'",
                  "Take a fresh selfie with your front camera",
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 raj font-black text-xs"
                      style={{
                        background: "rgba(59,130,246,0.2)",
                        color: "#60a5fa",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p
                      className="raj font-medium text-sm"
                      style={{ color: "#93c5fd" }}
                    >
                      {s}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="act flex-1 py-3.5 rounded-2xl raj font-bold text-sm border-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setStep("intro");
                  }}
                  className="act flex-1 py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    color: "#080810",
                    letterSpacing: 1.5,
                  }}
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ PREVIEW ═══════ */}
        {step === "preview" && capturedImage && (
          <div className="mt-6 fup flex justify-center">
            <div className="w-full max-w-lg">
              <div
                className="rounded-3xl overflow-hidden mb-5"
                style={{
                  background: "#0a0a14",
                  border: "1px solid rgba(245,158,11,0.14)",
                }}
              >
                <div
                  className="px-6 py-5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p
                    className="orb font-black text-base text-center"
                    style={{ color: "#f1f5f9" }}
                  >
                    Does this look good?
                  </p>
                </div>
                <div className="p-4">
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      height: "clamp(280px,60vw,460px)",
                      background: "#000",
                    }}
                  >
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover block"
                    />
                    {/* corner overlays */}
                    {[
                      "top-3 left-3",
                      "top-3 right-3",
                      "bottom-3 left-3",
                      "bottom-3 right-3",
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className={`absolute ${cls} w-8 h-8 pointer-events-none`}
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            borderTop:
                              i < 2 ? "2px solid rgba(245,158,11,0.7)" : "none",
                            borderBottom:
                              i >= 2
                                ? "2px solid rgba(245,158,11,0.7)"
                                : "none",
                            borderLeft:
                              i % 2 === 0
                                ? "2px solid rgba(245,158,11,0.7)"
                                : "none",
                            borderRight:
                              i % 2 === 1
                                ? "2px solid rgba(245,158,11,0.7)"
                                : "none",
                            borderRadius:
                              i === 0
                                ? "8px 0 0 0"
                                : i === 1
                                  ? "0 8px 0 0"
                                  : i === 2
                                    ? "0 0 0 8px"
                                    : "0 0 8px 0",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={retake}
                  className="act flex-1 py-3.5 rounded-2xl raj font-bold text-sm border-none cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                  }}
                >
                  🔄 RETAKE
                </button>
                <button
                  onClick={submitFace}
                  className="act flex-1 py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    color: "#080810",
                    letterSpacing: 1.5,
                    boxShadow: "0 6px 20px rgba(245,158,11,0.3)",
                  }}
                >
                  ✓ SUBMIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ UPLOADING ═══════ */}
        {step === "uploading" && (
          <div className="mt-16 fup flex flex-col items-center justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                boxShadow: "0 8px 28px rgba(245,158,11,0.4)",
              }}
            >
              <svg
                className="spin"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="3"
                />
                <path
                  d="M12 2a10 10 0 0110 10"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p
              className="orb font-black text-xl mb-2"
              style={{ color: "#f1f5f9" }}
            >
              Uploading...
            </p>
            <p className="raj font-medium text-sm" style={{ color: "#64748b" }}>
              Please wait while we process your photo
            </p>
          </div>
        )}

        {/* ═══════ DONE ═══════ */}
        {step === "done" && (
          <div className="mt-12 fup flex justify-center">
            <div className="w-full max-w-md text-center">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  border: "2px solid rgba(16,185,129,0.3)",
                }}
              >
                <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="26" fill="rgba(16,185,129,0.12)" />
                  <path
                    d="M16 28l9 9 17-17"
                    stroke="rgb(16,185,129)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 40,
                      strokeDashoffset: 0,
                      animation: "check-draw .5s ease both .2s",
                    }}
                  />
                </svg>
              </div>
              <p
                className="orb font-black text-2xl mb-3"
                style={{ color: "#f1f5f9" }}
              >
                Submitted!
              </p>
              <p
                className="raj font-medium text-sm leading-relaxed mb-10 px-4"
                style={{ color: "#64748b" }}
              >
                Your face photo has been submitted successfully. Our team will
                verify your identity shortly.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="act w-full py-4 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  color: "#080810",
                  letterSpacing: 2,
                  boxShadow: "0 6px 20px rgba(245,158,11,0.3)",
                }}
              >
                DONE
              </button>
            </div>
          </div>
        )}

        {/* ═══════ ERROR ═══════ */}
        {step === "error" && (
          <div className="mt-12 fup flex justify-center">
            <div className="w-full max-w-md text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "2px solid rgba(239,68,68,0.25)",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="rgb(239,68,68)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p
                className="orb font-black text-xl mb-2"
                style={{ color: "#f1f5f9" }}
              >
                Upload Failed
              </p>
              <p
                className="raj font-medium text-sm mb-10 px-4 leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {errorMsg}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="act flex-1 py-3.5 rounded-2xl raj font-bold text-sm border-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setStep("intro");
                  }}
                  className="act flex-1 py-3.5 rounded-2xl raj font-black text-sm border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    color: "#080810",
                    letterSpacing: 1.5,
                  }}
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;
