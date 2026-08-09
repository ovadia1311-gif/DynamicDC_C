
// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter } from "react-router-dom";
import { loadAppConfig, initApiBase } from "./config/api";

const rootEl = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootEl);

// אתחול לפני רינדור – אין render עד שה-baseURL מוכן
(async () => {
  try {
    await loadAppConfig(); // קורא public/config.json
    initApiBase();         // קובע axios.defaults.baseURL כולל כלל IAADOM
  } catch (e) {
    console.error("Bootstrap failed:", e);
    // אפשר להציג Splash שגיאה למשתמש אם תרצה
  } finally {
    root.render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    reportWebVitals();
  }
})();
