import { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/getApiURL";

function collectFingerprint() {
  try {
    return [
      navigator.language,
      navigator.hardwareConcurrency,
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.platform,
      !!navigator.cookieEnabled,
      window.devicePixelRatio,
    ].join("|");
  } catch {
    return "unknown";
  }
}

const SESSION_KEY = "vt_tracked";

export function useVisitorTrack() {
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const extra = collectFingerprint();

    axios
      .post(`${API_BASE_URL}/visitors/track`, { extra })
      .then(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
      })
      .catch(() => {
        // Silently fail — never break the UI for analytics
      });
  }, []);
}
