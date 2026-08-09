
// מקור אמת ל-ApiUrl בזמן ריצה: קודם window.__CONFIG (נטען מה-public/config.json),
// ואם אינו קיים – נופלים לפולבאק חכם מה-URL של הלקוח, כולל כלל IAADOM.

const iaadomAwareFallback = (): string => {
  const { protocol, hostname, port, href } = window.location;
  const hrefLower = href.toLowerCase();

  // פיתוח מקומי
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "https://localhost:44352/API";
  }

  // ברירת מחדל: אותו origin של הקליינט
  let origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;

  // כלל IAADOM:
  // אם ב-URL של הקליינט מופיע "IAADOM" (ללא רגישות לאותיות),
  // נניח שהשרת יושב על אותו host עם סיומת IAADOM (למשל app -> appIAADOM).
  if (hrefLower.includes("iaadom") && !hostname.toLowerCase().includes("iaadom")) {
    const hostWithIAADOM = `${hostname}IAADOM`;
    origin = `${protocol}//${hostWithIAADOM}${port ? `:${port}` : ""}`;
  }

  return `${origin}/API`;
};

export const AppConfig = {
  get ApiUrl(): string {
    const fromConfig = window.__CONFIG?.ApiUrl?.trim();
    if (fromConfig) return fromConfig.replace(/\/+$/, ""); // הסרת '/' בסוף
    return iaadomAwareFallback().replace(/\/+$/, "");
  },
};
