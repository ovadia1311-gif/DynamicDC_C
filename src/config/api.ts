
// src/config/api.ts
import axios from "axios";

type AppConfig = {
  ApiUrl: string; // דוגמה: "https://api.mycorp.com" או "http://localhost:5000/api"
};

// נשמור את הקונפיג בזיכרון פעם אחת
let appConfig: AppConfig | null = null;

// מופע axios יחיד לכל האפליקציה
export const api = axios.create({
  // נקבע אחר-כך ב-initApiBase///
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * טוען public/config.json פעם אחת.
 * חובה לקרוא לפונקציה הזו לפני שמרנדרים את האפליקציה.
 */
export async function loadAppConfig(): Promise<void> {
  if (appConfig) return;
  // שים לב: הנתיב יחסי ל-public root
  const res = await fetch("/config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load /config.json");
  appConfig = (await res.json()) as AppConfig;
}

/**
 * מוסיף סיומת IAADOM לשם מתחם (אם צריך).
 * כלל: אם ה-Client URL כולל "iaadom" (בכל רישיות), נבנה baseURL עם סיומת "-iaadom" על ההוסט של השרת.
 * לדוגמה: https://api.mycorp.com -> https://api-iaadom.mycorp.com
 * לא נוגע ב-localhost.
 */
function applyIaadomSuffixIfNeeded(url: string): string {
  const hasIaadomOnClient =
    window.location.href.toLowerCase().includes("iaadom");

  if (!hasIaadomOnClient) return url;
  try {
    const u = new URL(url);
    const host = u.hostname; // api.mycorp.com
    // אל תיגע ב-localhost / 127.0.0.1
    if (host === "localhost" || host === "127.0.0.1") return url;

    // אם כבר יש -iaadom בהוסט, אין מה לעשות
    if (host.toLowerCase().includes("-iaadom")) return url;

    // הוסף "-iaadom" לפני הנקודה הראשונה
    const parts = host.split(".");
    if (parts.length > 1) {
      parts[0] = `${parts[0]}-iaadom`;
      u.hostname = parts.join(".");
      return u.toString().replace(/\/$/, ""); // בלי סלאש סופי
    }
    return url;
  } catch {
    // אם זה לא URL מלא (למשל "/api"), לא נוגעים
    return url;
  }
}

/**
 * אחרי שטענו קונפיג – נקבע את ה-baseURL ל-axios לפי הכללים שלנו.
 */
export function initApiBase(): void {
  if (!appConfig) {
    throw new Error("initApiBase called before loadAppConfig");
  }

  let base = appConfig.ApiUrl?.trim();

  if (!base) {
    // fallback: אותו origin + "/api"
    const origin = window.location.origin.replace(/\/$/, "");
    base = `${origin}/api`;
  }

  // כלל IAADOM
  base = applyIaadomSuffixIfNeeded(base);

  // הסרת סלאשים כפולים
  base = base.replace(/\/+$/, "");
  api.defaults.baseURL = base;

  // ---- Interceptors ----
  // טיפ: אם מקבלים 401, נשאר בדף לוגין (בלי לופים)
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        // לא נזרוק מיד redirect – נשאיר לקומפוננטה להחליט, כדי להימנע מלופ
        // אפשר להחזיר את השגיאה כרגיל:
      }
      return Promise.reject(error);
    }
  );
}
