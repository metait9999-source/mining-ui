import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import {
  IoSend,
  IoClose,
  IoImageOutline,
  IoChevronDown,
} from "react-icons/io5";
import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { useUser } from "../../context/UserContext";
import useGetAllConversation from "../../hooks/useGetAllConversion";
import useGetMessages from "../../hooks/useGetMessages";
import useConversation from "../../zustand/useConversion";
import useListenMessages from "../../hooks/useListenMessages";
import useTyping from "../utils/useTyping";
import { RiAdminFill } from "react-icons/ri";
import AppNav from "../Home/Navbar";

const ChatComponent = () => {
  const { user } = useUser();
  const { data } = useGetAllConversation(user?.id);

  const {
    selectedConversation,
    setSelectedConversation,
    setMessages,
    typingUsers,
  } = useConversation();
  const { messages } = useGetMessages();
  useListenMessages();

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [messageStatus, setMessageStatus] = useState(1);
  const [refreshStatus, setRefreshStatus] = useState(false);
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [rootFaqs, setRootFaqs] = useState([]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const conversationId = selectedConversation?.conversation_id;
  const isTyping = typingUsers?.[String(conversationId)];
  const isBlocked = messageStatus === 0;
  const hasMessages = messages && messages.length > 0;

  const { emitTyping, emitStopTyping } = useTyping({
    recipientId: 0,
    conversationId,
    senderName: user?.name || "User",
  });

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/chat-faqs/root`)
      .then((r) => setRootFaqs(r.data || []))
      .catch((e) => console.error("FAQs:", e));
  }, []);

  const scrollToBottom = (smooth = true) =>
    chatEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  useEffect(() => {
    if (data) setSelectedConversation(data[0]);
  }, [data, setSelectedConversation]);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${user.id}`);
        const d = await res.json();
        setMessageStatus(d.message_status);
      } catch {}
    })();
  }, [user, refreshStatus]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };
  const removeFile = () => {
    setFile(null);
    setFilePreview("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    if (sending) return;
    setSending(true);
    emitStopTyping();
    try {
      const fd = new FormData();
      fd.append("userId", user?.id);
      fd.append("recipientId", 0);
      fd.append("messageText", message);
      fd.append("senderType", "user");
      if (file) fd.append("documents", file);
      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);
      if (res.data && !selectedConversation) setSelectedConversation(res.data);
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
      setFile(null);
      setFilePreview("");
      setRefreshStatus((p) => !p);
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFaqSelect = async (faq) => {
    if (sending) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("userId", user?.id);
      fd.append("recipientId", 0);
      fd.append("messageText", faq.question);
      fd.append("senderType", "user");
      fd.append("faq_id", faq.id);
      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);
      if (res.data && !selectedConversation) setSelectedConversation(res.data);
      const childRes = await axios.get(
        `${API_BASE_URL}/chat-faqs/${faq.id}/children`,
      );
      const { parent, children } = childRes.data;
      const safeChildren = Array.isArray(children) ? children : [];
      const botReply = {
        id: `bot-${Date.now()}`,
        sender_id: null,
        sender_type: "admin",
        message_text: parent?.answer ?? "",
        faq_options: safeChildren.length > 0 ? safeChildren : null,
        created_at: new Date().toISOString(),
        conversation_id: res.data?.conversation_id,
      };
      setMessages((prev) => [...prev, res.data, botReply]);
      setRefreshStatus((p) => !p);
    } catch (err) {
      console.error("FAQ error:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    const hours = differenceInHours(new Date(), date);
    return hours >= 1
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, "hh:mm a");
  };

  const initials = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", background: "#080810", color: "#e2e8f0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .orb{font-family:'Orbitron',sans-serif!important}
        .raj{font-family:'Rajdhani',sans-serif!important}
        @keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .msg-new{animation:msgIn .2s ease-out}
        .faq-chip{transition:all .15s}
        .faq-chip:hover{background:rgba(245,158,11,0.12)!important;border-color:rgba(245,158,11,0.35)!important;transform:translateY(-1px)}
        .send-btn:not(:disabled):hover{transform:scale(1.06);box-shadow:0 6px 20px rgba(245,158,11,0.45)!important}
        .send-btn:not(:disabled):active{transform:scale(.94)}
        .attach-btn:hover{background:rgba(255,255,255,0.08)!important;border-color:rgba(255,255,255,0.15)!important}
        .chat-scroll::-webkit-scrollbar{width:3px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:3px}
        .input-area:focus-within{border-color:rgba(245,158,11,0.4)!important;box-shadow:0 0 0 3px rgba(245,158,11,0.07)!important}
        textarea::placeholder{color:#334155}
        textarea{caret-color:#f59e0b}
      `}</style>

      <div className="flex-shrink-0">
        <AppNav />
      </div>

      <div
        className="flex-1 flex overflow-hidden px-4 md:px-8 lg:px-16 pb-4"
        style={{ maxWidth: "100%", margin: "0 auto", width: "100%" }}
      >
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full lg:max-w-none">
          {/* Chat header bar */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-t-2xl mt-4 flex-shrink-0"
            style={{
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.07)",
              borderBottom: "none",
            }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    fill="rgba(8,8,16,0.3)"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                style={{ background: "#10b981", borderColor: "#0a0a14" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="orb font-black text-sm"
                style={{ color: "#f1f5f9" }}
              >
                Support Chat
              </p>
              <p
                className="raj font-medium text-xs"
                style={{ color: "#10b981" }}
              >
                Online · Typically replies in minutes
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <div className="relative w-1.5 h-1.5 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "#10b981",
                    animation: "pulse-ring 2s ease-out infinite",
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10b981" }}
                />
              </div>
              <span
                className="raj font-bold text-xs"
                style={{ color: "#10b981" }}
              >
                LIVE
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="chat-scroll flex-1 overflow-y-auto relative"
            style={{
              background: "#080810",
              border: "1px solid rgba(255,255,255,0.06)",
              borderTop: "none",
              borderBottom: "none",
            }}
          >
            <div className="p-4 flex flex-col gap-0.5 min-h-full">
              {hasMessages ? (
                <>
                  {messages.map((msg, index) => {
                    const isMe = msg.sender_id === user?.id;
                    const prevMsg = messages[index - 1];
                    const showTime =
                      !prevMsg ||
                      differenceInHours(
                        new Date(msg.created_at),
                        new Date(prevMsg.created_at),
                      ) >= 1;

                    let faqOptions = null;
                    if (msg.faq_options) {
                      try {
                        const p =
                          typeof msg.faq_options === "string"
                            ? JSON.parse(msg.faq_options)
                            : msg.faq_options;
                        if (Array.isArray(p)) faqOptions = p;
                      } catch {}
                    }

                    return (
                      <div key={msg.id || index} className="msg-new">
                        {showTime && (
                          <div className="flex justify-center my-4">
                            <span
                              className="raj font-semibold text-xs px-4 py-1 rounded-full"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                color: "#334155",
                              }}
                            >
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 mb-1 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {/* Admin avatar */}
                          {!isMe && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg,#0f1020,#1e293b)",
                                border: "1px solid rgba(245,158,11,0.2)",
                              }}
                            >
                              <RiAdminFill size={16} color="#f59e0b" />
                            </div>
                          )}

                          <div
                            className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                          >
                            {msg.message_text && (
                              <div
                                className="px-4 py-2.5"
                                style={{
                                  borderRadius: 18,
                                  borderBottomRightRadius: isMe ? 4 : 18,
                                  borderBottomLeftRadius: isMe ? 18 : 4,
                                  background: isMe
                                    ? "linear-gradient(135deg,#92400e,#f59e0b)"
                                    : "#0f0f1f",
                                  color: "#f1f5f9",
                                  fontSize: 14,
                                  lineHeight: 1.55,
                                  wordBreak: "break-word",
                                  border: isMe
                                    ? "none"
                                    : "1px solid rgba(255,255,255,0.08)",
                                  boxShadow: isMe
                                    ? "0 4px 14px rgba(245,158,11,0.2)"
                                    : "0 1px 4px rgba(0,0,0,0.4)",
                                }}
                              >
                                {msg.message_text}
                              </div>
                            )}

                            {msg.message_image && (
                              <img
                                src={`${API_BASE_URL}/${msg.message_image}`}
                                alt="attachment"
                                onClick={() =>
                                  setSelectedImage(
                                    `${API_BASE_URL}/${msg.message_image}`,
                                  )
                                }
                                className="rounded-2xl cursor-pointer transition-opacity hover:opacity-85"
                                style={{
                                  maxWidth: 220,
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              />
                            )}

                            {faqOptions && faqOptions.length > 0 && (
                              <div className="flex flex-col gap-1.5 mt-1 w-full">
                                {faqOptions.map((faq) => (
                                  <button
                                    key={faq.id}
                                    onClick={() => handleFaqSelect(faq)}
                                    disabled={sending}
                                    className="faq-chip text-left px-4 py-2.5 rounded-2xl raj font-semibold text-sm border-none cursor-pointer"
                                    style={{
                                      background: "rgba(245,158,11,0.07)",
                                      border: "1px solid rgba(245,158,11,0.2)",
                                      color: "#f59e0b",
                                      opacity: sending ? 0.5 : 1,
                                    }}
                                  >
                                    💬 {faq.question}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Read receipt */}
                            {isMe && (
                              <span
                                className="raj font-semibold text-xs px-1"
                                style={{
                                  color: msg.seen
                                    ? "#f59e0b"
                                    : "rgba(255,255,255,0.2)",
                                }}
                              >
                                {msg.seen
                                  ? `✓✓ Read${msg.seen_at ? ` ${format(new Date(msg.seen_at), "hh:mm a")}` : ""}`
                                  : "✓ Sent"}
                              </span>
                            )}
                          </div>

                          {/* User avatar */}
                          {isMe && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 orb font-black text-sm"
                              style={{
                                background:
                                  "linear-gradient(135deg,#f59e0b,#f97316)",
                                color: "#080810",
                              }}
                            >
                              {initials}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-end gap-2 mb-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg,#0f1020,#1e293b)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <RiAdminFill size={16} color="#f59e0b" />
                      </div>
                      <div
                        className="px-4 py-3 rounded-2xl flex gap-1.5"
                        style={{
                          background: "#0f0f1f",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderBottomLeftRadius: 4,
                        }}
                      >
                        {[0, 0.2, 0.4].map((d, i) => (
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full inline-block"
                            style={{
                              background: "rgba(255,255,255,0.35)",
                              animation: `typingBounce 1.2s infinite ease-in-out ${d}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <div
                  className="flex flex-col items-center justify-center flex-1 py-12 px-4 text-center"
                  style={{ minHeight: "60vh" }}
                >
                  <div
                    className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#f97316)",
                      boxShadow: "0 8px 28px rgba(245,158,11,0.35)",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                        fill="rgba(8,8,16,0.3)"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p
                    className="orb font-black text-xl mb-2"
                    style={{ color: "#f1f5f9" }}
                  >
                    Hi {user?.name || "there"} 👋
                  </p>
                  <p
                    className="raj font-medium text-sm max-w-xs mx-auto mb-8 leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    How can we help you today? Choose a topic or send us a
                    message.
                  </p>

                  {rootFaqs.length > 0 && (
                    <div className="w-full max-w-sm">
                      <p
                        className="raj font-bold text-xs tracking-widest uppercase mb-3 text-left"
                        style={{ color: "#334155" }}
                      >
                        Quick Help
                      </p>
                      <div className="flex flex-col gap-2">
                        {rootFaqs.map((faq) => (
                          <button
                            key={faq.id}
                            onClick={() => handleFaqSelect(faq)}
                            disabled={sending}
                            className="faq-chip flex items-center gap-3 px-4 py-3 rounded-2xl text-left border-none cursor-pointer"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)",
                              color: "#f1f5f9",
                              opacity: sending ? 0.5 : 1,
                            }}
                          >
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                              style={{
                                background: "rgba(245,158,11,0.1)",
                                border: "1px solid rgba(245,158,11,0.2)",
                              }}
                            >
                              💬
                            </span>
                            <span className="raj font-semibold text-sm">
                              {faq.question}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Scroll to bottom */}
            {showScrollBtn && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all hover:scale-110"
                style={{
                  background: "#0f0f1f",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f59e0b",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                <IoChevronDown size={16} />
              </button>
            )}
          </div>

          {/* Input area */}
          {isBlocked ? (
            <div
              className="flex-shrink-0 px-4 py-3 text-center rounded-b-2xl"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.18)",
                borderTop: "none",
              }}
            >
              <p
                className="raj font-semibold text-sm"
                style={{ color: "#fca5a5" }}
              >
                🚫 Your account has been blocked from sending messages
              </p>
            </div>
          ) : (
            <div
              className="flex-shrink-0 p-3 rounded-b-2xl"
              style={{
                background: "#0a0a14",
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: "1px solid rgba(245,158,11,0.08)",
              }}
            >
              {/* File preview */}
              {filePreview && (
                <div
                  className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={filePreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="raj font-semibold text-xs truncate"
                      style={{ color: "#94a3b8" }}
                    >
                      {file?.name}
                    </p>
                    <p
                      className="raj text-xs mt-0.5"
                      style={{ color: "#334155" }}
                    >
                      Ready to send
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#64748b",
                    }}
                  >
                    <IoClose size={13} />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                {/* Attach */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="attach-btn flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#475569",
                  }}
                >
                  <IoImageOutline size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Text input */}
                <div
                  className="input-area flex-1 rounded-2xl px-4 py-2.5 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      emitTyping();
                    }}
                    onBlur={emitStopTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    rows={1}
                    className="w-full bg-transparent border-none outline-none raj font-medium text-sm resize-none"
                    style={{
                      color: "#f1f5f9",
                      lineHeight: 1.5,
                      maxHeight: 110,
                      fontFamily: "'Rajdhani',sans-serif",
                    }}
                  />
                </div>

                {/* Send */}
                <button
                  onClick={sendMessage}
                  disabled={sending || (!message.trim() && !file)}
                  className="send-btn flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-none transition-all"
                  style={{
                    background:
                      message.trim() || file
                        ? "linear-gradient(135deg,#f59e0b,#f97316)"
                        : "rgba(255,255,255,0.04)",
                    cursor:
                      sending || (!message.trim() && !file)
                        ? "not-allowed"
                        : "pointer",
                    opacity: sending || (!message.trim() && !file) ? 0.4 : 1,
                    boxShadow:
                      message.trim() || file
                        ? "0 4px 14px rgba(245,158,11,0.35)"
                        : "none",
                    border: "none",
                    color: message.trim() || file ? "#080810" : "#475569",
                  }}
                >
                  {sending ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ animation: "spin .8s linear infinite" }}
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
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <IoSend size={15} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full image viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 raj font-semibold text-sm border-none cursor-pointer bg-transparent"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <IoClose size={16} /> Close
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full rounded-2xl block"
              style={{
                maxHeight: "80vh",
                objectFit: "contain",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
