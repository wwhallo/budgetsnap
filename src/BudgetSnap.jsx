import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const STORAGE_KEY = "budgetsnap_v3";
const SAVE_CATS = ["sparen", "etf", "puffer"];

const defaultCategories = [
  { id: "miete", name: "Miete", icon: "home", color: "#E57373" },
  { id: "essen", name: "Essen", icon: "cart", color: "#FFA726" },
  { id: "transport", name: "Transport", icon: "car", color: "#9575CD" },
  { id: "abos", name: "Abos", icon: "play", color: "#5C6BC0" },
  { id: "versicherung", name: "Versicherung", icon: "shield", color: "#42A5F5" },
  { id: "sparen", name: "Rücklage", icon: "piggy", color: "#66BB6A" },
  { id: "etf", name: "ETF", icon: "trending", color: "#00BCD4" },
  { id: "puffer", name: "Puffer", icon: "star", color: "#FFCA28" },
  { id: "sonstiges", name: "Sonstiges", icon: "star", color: "#90A4AE" },
];

const motivationalQuotes = [
  "Jeder Euro zählt auf dem Weg zur Freiheit.",
  "Kleine Schritte führen zu großen Ersparnissen.",
  "Dein zukünftiges Ich wird dir danken.",
  "Sparen ist Selbstfürsorge.",
  "Finanzielle Freiheit beginnt heute.",
  "Du bist auf dem richtigen Weg!",
  "Konsistenz schlägt Perfektion.",
];

// ═══════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════
const icons = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  cart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  car: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a1 1 0 00-.98.76l-1.22 5.1A1 1 0 004 14v2h1"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  piggy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.5a1 1 0 100 3"/><circle cx="13" cy="9" r=".7" fill="currentColor"/></svg>,
  trending: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  list: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  repeat: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  tag: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
};
const getIcon = (id) => icons[id] || icons.star;

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateStr = (d) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
const monthLabel = (d) => new Date(d || Date.now()).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
const isThisMonth = (ds) => { const d = new Date(ds), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); };
const getToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Guten Morgen" : h < 17 ? "Guten Tag" : "Guten Abend"; };

// ═══════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════
const getDefaultData = () => ({ name: "", income: 0, theme: "light", categories: defaultCategories, transactions: [], fixedCosts: [], goals: [], pushEnabled: false, budgetThreshold: 80, wizardDone: false });
const loadData = () => { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return { ...getDefaultData(), ...JSON.parse(r) }; } catch(e){ /* localStorage not available */ } return getDefaultData(); };
const saveData = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch(e){ /* localStorage not available - data lives in React state only */ } };

// ═══════════════════════════════════════════════════════
// FIX #3: SWIPE-TO-CLOSE HOOK
// ═══════════════════════════════════════════════════════
function useSwipeDown(onClose) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  const onTouchStart = useCallback((e) => {
    const el = sheetRef.current;
    if (!el) return;
    // Allow swipe from the top 80px (handle + title area)
    const rect = el.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    if (touchY > 80) return;
    startY.current = e.touches[0].clientY;
    currentY.current = 0;
    dragging.current = true;
    el.style.transition = "none";
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!dragging.current) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff < 0) return;
    currentY.current = diff;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
      sheetRef.current.style.opacity = String(Math.max(1 - diff / 400, 0.4));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = "transform 250ms ease, opacity 250ms ease";
    if (currentY.current > 80) {
      el.style.transform = "translateY(100%)";
      el.style.opacity = "0";
      setTimeout(onClose, 250);
    } else {
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }
  }, [onClose]);

  return { sheetRef, onTouchStart, onTouchMove, onTouchEnd };
}

// ═══════════════════════════════════════════════════════
// CSS — FIX #0: Whitespace (html/body overflow fix)
//        FIX #1: Wizard responsive
//        FIX #4: Date input width
//        FIX #7: Print layout
// ═══════════════════════════════════════════════════════
const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --bg: #F5F0E8; --bg-subtle: #EDE7DB;
  --surface: rgba(255,255,255,0.55); --surface-hover: rgba(255,255,255,0.75); --surface-solid: #FFF;
  --glass-border: rgba(255,255,255,0.65); --glass-shadow: rgba(140,120,80,0.1);
  --text-1: #1C1810; --text-2: #6B6155; --text-3: #A89E8F;
  --accent: #3D7A5F; --accent-soft: rgba(61,122,95,0.1);
  --accent-2: #B8860B; --accent-2-soft: rgba(184,134,11,0.1);
  --danger: #C0392B; --danger-soft: rgba(192,57,43,0.08);
  --rule: rgba(61,122,95,0.12);
  --radius-sm: 12px; --radius-md: 16px; --radius-lg: 24px;
  --transition: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
[data-theme="dark"] {
  --bg: #0F1219; --bg-subtle: #161B26;
  --surface: rgba(28,35,52,0.65); --surface-hover: rgba(38,48,72,0.8); --surface-solid: #1C2334;
  --glass-border: rgba(80,110,180,0.12); --glass-shadow: rgba(0,0,0,0.3);
  --text-1: #ECE6D9; --text-2: #9A94A8; --text-3: #555068;
  --accent: #6EBF8B; --accent-soft: rgba(110,191,139,0.1);
  --accent-2: #D4A84B; --accent-2-soft: rgba(212,168,75,0.08);
  --danger: #E57373; --danger-soft: rgba(229,115,115,0.08);
  --rule: rgba(110,191,139,0.08);
}

/* FIX #0: Kill whitespace at bottom on mobile */
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
html, body { height:100%; overflow:hidden; margin:0; padding:0; background:var(--bg); }

.app-root {
  font-family:'Outfit',-apple-system,sans-serif; background:var(--bg); color:var(--text-1);
  height:100dvh; max-width:480px; margin:0 auto; position:relative;
  transition:background var(--transition),color var(--transition); overflow:hidden;
}

.glass {
  background:var(--surface); backdrop-filter:blur(20px) saturate(140%); -webkit-backdrop-filter:blur(20px) saturate(140%);
  border:1px solid var(--glass-border); border-radius:var(--radius-md); box-shadow:0 8px 32px var(--glass-shadow); transition:all var(--transition);
}

/* ── WIZARD — FIX #1: scrollable, no overflow ── */
.wizard {
  position:fixed; inset:0; z-index:1000; display:flex; flex-direction:column; align-items:center;
  justify-content:flex-start; background:var(--bg); animation:fadeIn 500ms ease both;
  overflow-y:auto; -webkit-overflow-scrolling:touch;
  padding:max(24px, env(safe-area-inset-top,24px)) 20px max(24px, env(safe-area-inset-bottom,24px));
}
.wizard__step {
  display:flex; flex-direction:column; align-items:center; text-align:center;
  width:100%; max-width:360px; animation:slideUp 400ms cubic-bezier(0.4,0,0.2,1) both;
  margin:auto 0; flex-shrink:0;
}
.wizard__title { font-family:'DM Serif Display',serif; font-size:clamp(26px,7vw,36px); font-weight:400; line-height:1.15; margin-bottom:8px; }
.wizard__title em { font-style:italic; color:var(--accent); }
.wizard__sub { font-size:14px; color:var(--text-2); line-height:1.7; margin-bottom:20px; }
.wizard__dots { display:flex; gap:8px; margin-bottom:20px; flex-shrink:0; padding-top:8px; }
.wizard__dot { height:6px; border-radius:99px; background:var(--text-3); transition:all 400ms ease; width:6px; }
.wizard__dot--active { width:24px; background:var(--accent); }
.wizard__card { width:100%; padding:16px; margin-bottom:16px; }

/* ── INPUTS ── */
.input {
  width:100%; background:var(--surface); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border:1.5px solid var(--glass-border); border-radius:var(--radius-sm); padding:14px 16px;
  font-family:'Outfit',sans-serif; font-size:16px; font-weight:500; color:var(--text-1); outline:none;
  transition:border-color var(--transition),box-shadow var(--transition); caret-color:var(--accent);
  max-width:100%; min-width:0;
}
.input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.input::placeholder { color:var(--text-3); }

/* FIX #4: Date input constrained to container */
input[type="date"].input { -webkit-appearance:none; appearance:none; max-width:100%; width:100%; min-height:48px; }

.input--amount {
  display:flex; align-items:center; gap:8px; background:var(--surface); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border:1.5px solid var(--glass-border); border-radius:var(--radius-sm); padding:8px 16px;
  transition:border-color var(--transition),box-shadow var(--transition);
}
.input--amount:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.input--amount__symbol { font-family:'DM Serif Display',serif; font-size:28px; font-weight:400; color:var(--accent-2); flex-shrink:0; }
.input--amount__field {
  flex:1; min-width:0; background:transparent; border:none; outline:none;
  font-family:'DM Serif Display',serif; font-size:32px; font-weight:400; color:var(--text-1); caret-color:var(--accent);
}
.input--amount__field::placeholder { color:var(--text-3); font-weight:400; }

.btn {
  width:100%; padding:14px 16px; border-radius:var(--radius-sm); border:none;
  font-family:'Outfit',sans-serif; font-size:15px; font-weight:600; cursor:pointer;
  transition:all var(--transition); letter-spacing:.3px; display:flex; align-items:center; justify-content:center; gap:8px;
}
.btn:active { transform:scale(0.98); opacity:0.9; }
.btn--primary { background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#000)); color:#fff; box-shadow:0 4px 16px color-mix(in srgb,var(--accent) 30%,transparent); }
.btn--ghost { background:var(--surface); color:var(--text-2); border:1px solid var(--glass-border); }
.btn--small { width:auto; padding:8px 16px; font-size:13px; }

.topbar { padding:calc(12px + env(safe-area-inset-top,40px)) 16px 14px; position:relative; flex-shrink:0; }
.topbar::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:1px; background:var(--rule); }
.topbar__inner { display:flex; justify-content:space-between; align-items:flex-end; }
.topbar__greeting { font-size:11px; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
.topbar__title { font-family:'DM Serif Display',serif; font-size:26px; font-weight:400; line-height:1.1; }
.topbar__title em { font-style:italic; color:var(--accent); }
.topbar__actions { display:flex; gap:8px; }
.topbar__btn {
  width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:var(--surface); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border:1px solid var(--glass-border); cursor:pointer; color:var(--text-2); transition:all var(--transition);
}
.topbar__btn:active { background:var(--surface-hover); }

.scroll { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:16px 16px calc(80px + env(safe-area-inset-bottom,0px)); }
.scroll::-webkit-scrollbar { display:none; }

.hero {
  padding:24px; margin-bottom:16px; position:relative; overflow:hidden;
  background:linear-gradient(135deg,var(--accent-soft) 0%,var(--accent-2-soft) 100%);
  border-color:color-mix(in srgb,var(--accent) 20%,transparent);
}
.hero::before {
  content:'€'; position:absolute; right:-8px; top:-24px; font-family:'DM Serif Display',serif; font-size:140px; font-weight:400;
  color:var(--accent-soft); line-height:1; pointer-events:none; user-select:none;
}
.hero__eyebrow { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--text-3); margin-bottom:8px; }
.hero__amount { font-family:'DM Serif Display',serif; font-size:44px; font-weight:400; line-height:1; letter-spacing:-1px; margin-bottom:4px; }
.hero__sub { font-size:12px; color:var(--text-3); margin-bottom:16px; }
.hero__stats { display:grid; grid-template-columns:repeat(3,1fr); padding-top:16px; border-top:1px solid var(--rule); }
.hero__stat { text-align:center; }
.hero__stat-label { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:var(--text-3); margin-bottom:4px; }
.hero__stat-val { font-family:'DM Serif Display',serif; font-size:17px; font-weight:400; }
.c-pos { color:var(--accent); } .c-neg { color:var(--danger); } .c-gold { color:var(--accent-2); }

.section { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:0 4px; }
.section__title { font-family:'DM Serif Display',serif; font-size:18px; font-weight:400; font-style:italic; }
.section__link { font-size:12px; font-weight:600; color:var(--accent); cursor:pointer; border:none; background:none; }

.tx { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--rule); }
.tx:last-child { border-bottom:none; }
.tx__icon { width:40px; height:40px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:white; }
.tx__info { flex:1; min-width:0; }
.tx__name { font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tx__meta { font-size:11px; color:var(--text-3); margin-top:2px; }
.tx__right { text-align:right; flex-shrink:0; }
.tx__amount { font-family:'DM Serif Display',serif; font-size:17px; font-weight:400; }
.tx__date { font-size:10px; color:var(--text-3); margin-top:2px; }
.tx__actions { display:flex; gap:4px; flex-shrink:0; }
.tx__action-btn {
  width:28px; height:28px; border-radius:8px; border:none; background:transparent; color:var(--text-3);
  cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all var(--transition);
}
.tx__action-btn:hover { background:var(--danger-soft); color:var(--danger); }

.progress { background:var(--rule); border-radius:99px; height:6px; overflow:hidden; }
.progress__fill { height:100%; border-radius:99px; transition:width 600ms cubic-bezier(0.4,0,0.2,1); }

.nav {
  position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:480px;
  background:var(--surface); backdrop-filter:blur(24px) saturate(160%); -webkit-backdrop-filter:blur(24px) saturate(160%);
  border-top:1px solid var(--glass-border); display:grid; grid-template-columns:repeat(5,1fr);
  padding-bottom:env(safe-area-inset-bottom,0px); z-index:200;
}
.nav__item {
  display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px 4px 8px;
  cursor:pointer; gap:4px; border:none; background:none; transition:all var(--transition); color:var(--text-3);
}
.nav__item--active { color:var(--accent); }
.nav__item--active .nav__icon { transform:translateY(-2px); }
.nav__icon { transition:transform var(--transition); }
.nav__label { font-size:9px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; font-family:'Outfit',sans-serif; }

.fab {
  position:fixed; right:20px; bottom:calc(68px + env(safe-area-inset-bottom,0px));
  width:56px; height:56px; border-radius:50%; border:none;
  background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#000));
  color:#fff; display:flex; align-items:center; justify-content:center;
  box-shadow:0 8px 24px color-mix(in srgb,var(--accent) 35%,transparent); cursor:pointer; z-index:190; transition:transform var(--transition);
}
.fab:active { transform:scale(0.9); }

.overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  z-index:300; display:flex; align-items:flex-end; animation:fadeIn 200ms ease both;
}
.sheet {
  width:100%; max-width:480px; margin:0 auto; background:var(--bg); border:1px solid var(--glass-border);
  border-radius:var(--radius-lg) var(--radius-lg) 0 0; padding-bottom:calc(24px + env(safe-area-inset-bottom,0px));
  max-height:88dvh; overflow-y:auto; -webkit-overflow-scrolling:touch;
  animation:sheetUp 300ms cubic-bezier(0.4,0,0.2,1) both; will-change:transform;
  touch-action:pan-y;
}
.sheet__handle { width:40px; height:5px; background:var(--text-3); border-radius:99px; opacity:.35; margin:14px auto 16px; cursor:grab; }
.sheet__title { font-family:'DM Serif Display',serif; font-size:22px; font-weight:400; font-style:italic; padding:0 24px 16px; border-bottom:1px solid var(--rule); }

.form-group { padding:14px 24px 0; }
.form-label { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-3); margin-bottom:8px; }
.seg { display:grid; gap:4px; background:color-mix(in srgb,var(--text-3) 10%,transparent); border-radius:var(--radius-sm); padding:4px; }
.seg--2 { grid-template-columns:1fr 1fr; } .seg--3 { grid-template-columns:1fr 1fr 1fr; }
.seg__opt {
  padding:10px 8px; text-align:center; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;
  color:var(--text-2); transition:all var(--transition); border:none; background:none; font-family:'Outfit',sans-serif;
}
.seg__opt--on { background:var(--surface-solid); color:var(--text-1); box-shadow:0 1px 6px var(--glass-shadow); }

.cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.cat-btn {
  padding:12px 4px; border-radius:var(--radius-sm); border:1.5px solid transparent;
  background:color-mix(in srgb,var(--text-3) 8%,transparent); text-align:center; cursor:pointer; transition:all var(--transition);
}
.cat-btn:active { transform:scale(0.95); }
.cat-btn--on { border-color:var(--accent); background:var(--accent-soft); }
.cat-btn__icon { margin-bottom:4px; display:flex; justify-content:center; color:var(--text-2); }
.cat-btn--on .cat-btn__icon { color:var(--accent); }
.cat-btn__name { font-size:9px; font-weight:700; color:var(--text-3); line-height:1.2; }
.cat-btn--on .cat-btn__name { color:var(--accent); }

.tag-input { display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:8px 12px; border:1.5px solid var(--glass-border); border-radius:var(--radius-sm); background:var(--surface); min-height:48px; cursor:text; transition:border-color var(--transition); }
.tag-input:focus-within { border-color:var(--accent); }
.tag { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:99px; font-size:12px; font-weight:600; background:var(--accent-soft); color:var(--accent); }
.tag__remove { width:16px; height:16px; border-radius:50%; border:none; background:color-mix(in srgb,var(--accent) 20%,transparent); color:var(--accent); cursor:pointer; font-size:10px; display:flex; align-items:center; justify-content:center; }
.tag-input__field { flex:1; min-width:80px; border:none; background:transparent; outline:none; font-family:'Outfit',sans-serif; font-size:14px; color:var(--text-1); }
.tag-input__field::placeholder { color:var(--text-3); }

.fc { display:flex; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid var(--rule); }
.fc:last-child { border-bottom:none; }
.fc__info { flex:1; min-width:0; } .fc__name { font-size:14px; font-weight:600; } .fc__due { font-size:11px; color:var(--text-3); margin-top:2px; }
.fc__amount { font-family:'DM Serif Display',serif; font-size:17px; font-weight:400; flex-shrink:0; }

.goal-card { padding:16px; margin-bottom:8px; }
.goal-card__top { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.goal-card__info { flex:1; } .goal-card__name { font-size:14px; font-weight:600; } .goal-card__sub { font-size:11px; color:var(--text-3); margin-top:2px; }
.goal-card__amounts { font-family:'DM Serif Display',serif; font-size:17px; font-weight:400; color:var(--accent); text-align:right; }
.goal-card__foot { font-size:10px; color:var(--text-3); margin-top:8px; text-align:right; }

.year-chart { display:flex; gap:4px; align-items:flex-end; height:80px; padding:0 4px; }
.year-chart__bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
.year-chart__bar { width:100%; border-radius:4px 4px 0 0; min-height:4px; transition:height 500ms cubic-bezier(0.4,0,0.2,1); }
.year-chart__label { font-size:8px; color:var(--text-3); font-weight:600; text-transform:uppercase; }

.empty { text-align:center; padding:40px 24px; }
.empty__icon { font-size:40px; opacity:0.3; margin-bottom:12px; color:var(--text-3); }
.empty__text { font-size:14px; color:var(--text-3); line-height:1.6; }

.notif { padding:12px 16px; border-radius:var(--radius-sm); background:var(--accent-soft); border:1px solid color-mix(in srgb,var(--accent) 20%,transparent); margin-bottom:16px; display:flex; align-items:center; gap:12px; animation:slideDown 300ms ease both; }
.notif__icon { color:var(--accent); flex-shrink:0; } .notif__text { font-size:13px; color:var(--text-2); line-height:1.5; flex:1; }
.notif__text strong { color:var(--text-1); font-weight:600; }

.settings-section { margin-bottom:24px; }
.settings-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-3); margin-bottom:8px; padding:0 4px; }
.set-row { display:flex; align-items:center; gap:16px; padding:14px 16px; cursor:pointer; transition:opacity var(--transition); border:none; background:none; width:100%; color:var(--text-1); font-family:'Outfit',sans-serif; text-align:left; }
.set-row:active { opacity:0.7; }
.set-row__icon { color:var(--text-2); flex-shrink:0; } .set-row__info { flex:1; }
.set-row__title { font-size:14px; font-weight:600; } .set-row__sub { font-size:11px; color:var(--text-3); margin-top:2px; }
.toggle { width:48px; height:28px; border-radius:99px; border:none; cursor:pointer; background:var(--text-3); position:relative; transition:background var(--transition); flex-shrink:0; }
.toggle--on { background:var(--accent); }
.toggle::after { content:''; position:absolute; top:3px; left:3px; width:22px; height:22px; border-radius:50%; background:white; transition:transform var(--transition); }
.toggle--on::after { transform:translateX(20px); }

/* ── WIZARD FC — FIX #1: compact rows, no overflow ── */
.wiz-fc-list { display:flex; flex-direction:column; gap:6px; width:100%; }
.wiz-fc-row { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; background:var(--surface); border:1px solid var(--glass-border); min-height:44px; }
.wiz-fc-row__icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0; font-size:14px; }
.wiz-fc-row__icon svg { width:16px; height:16px; }
.wiz-fc-row__info { flex:1; min-width:0; overflow:hidden; }
.wiz-fc-row__name { font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wiz-fc-row__hint { font-size:9px; color:var(--text-3); }
.wiz-fc-row__input {
  width:72px; background:color-mix(in srgb,var(--text-3) 8%,transparent); border:1.5px solid var(--glass-border);
  border-radius:8px; padding:6px 6px; font-family:'DM Serif Display',serif; font-size:15px; font-weight:400;
  color:var(--text-1); text-align:right; outline:none; caret-color:var(--accent); flex-shrink:0;
}
.wiz-fc-row__input:focus { border-color:var(--accent); }
.wiz-fc-row__input::placeholder { color:var(--text-3); }
.wiz-fc-row__unit { font-size:11px; color:var(--text-3); font-weight:600; flex-shrink:0; }
.wiz-fc-row__remove { width:22px; height:22px; border-radius:6px; border:none; background:transparent; color:var(--text-3); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.wiz-fc-row__remove svg { width:14px; height:14px; }
.wiz-fc-add { display:flex; align-items:center; justify-content:center; gap:6px; padding:8px; border-radius:10px; border:1.5px dashed var(--glass-border); background:transparent; cursor:pointer; color:var(--accent); font-family:'Outfit',sans-serif; font-size:12px; font-weight:600; width:100%; }
.wiz-fc-summary { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:10px; background:var(--accent-2-soft); margin-top:6px; }
.wiz-fc-summary__label { font-size:11px; color:var(--text-2); font-weight:600; }
.wiz-fc-summary__amount { font-family:'DM Serif Display',serif; font-size:16px; font-weight:400; color:var(--accent-2); }

.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

/* ── FIX #7: PRINT/PDF LAYOUT ── */
.print-report { display:none; }
@media print {
  html, body { height:auto !important; overflow:visible !important; background:white !important; }
  .app-root { max-width:none; height:auto !important; overflow:visible !important; }
  .nav, .fab, .topbar__actions, .overlay, .notif { display:none !important; }
  .scroll { padding-bottom:16px !important; overflow:visible !important; height:auto !important; flex:none !important; }
  .glass { background:white !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; box-shadow:none !important; border:1px solid #ddd !important; }
  .hero { background:linear-gradient(135deg,#e8f5e9,#fff8e1) !important; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  .hero::before { display:none; }
  .topbar { padding-top:16px !important; }
  .c-pos { color:#2e7d32 !important; } .c-neg { color:#c62828 !important; } .c-gold { color:#b8860b !important; }
  .progress { background:#eee !important; }
  .progress__fill { print-color-adjust:exact; -webkit-print-color-adjust:exact; }

  .print-report {
    display:block !important; page-break-before:always; padding:32px 24px; font-family:'Outfit',sans-serif;
  }
  .print-report h2 {
    font-family:'DM Serif Display',serif; font-size:28px; font-weight:400; font-style:italic;
    text-align:center; margin-bottom:4px; color:#1C1810;
  }
  .print-report .pr-sub { text-align:center; font-size:12px; color:#888; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #3D7A5F; }
  .print-report .pr-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:24px; }
  .print-report .pr-card { padding:16px; border:1px solid #ddd; border-radius:8px; text-align:center; }
  .print-report .pr-card-label { font-size:9px; text-transform:uppercase; letter-spacing:1.5px; color:#999; margin-bottom:4px; }
  .print-report .pr-card-val { font-family:'DM Serif Display',serif; font-size:22px; }
  .print-report h3 { font-family:'DM Serif Display',serif; font-size:16px; font-weight:400; font-style:italic; margin:20px 0 8px; color:#3D7A5F; }
  .print-report table { width:100%; border-collapse:collapse; margin-bottom:8px; font-size:12px; }
  .print-report th { text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#999; padding:8px 6px; border-bottom:2px solid #ddd; }
  .print-report td { padding:7px 6px; border-bottom:1px solid #eee; }
  .print-report td:last-child { text-align:right; font-family:'DM Serif Display',serif; font-size:14px; }
  .print-report .pr-total td { font-weight:700; border-top:2px solid #ddd; border-bottom:none; }
  .print-report .pr-footer { text-align:center; font-size:9px; color:#aaa; margin-top:24px; padding-top:12px; border-top:1px solid #ddd; }
}

@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes sheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
@media (min-width:640px) { .hero__amount { font-size:56px; } .wizard__title { font-size:44px; } }
`;

// ═══════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════
function CatIcon({ cat, size = 40 }) {
  return <div className="tx__icon" style={{ width: size, height: size, background: cat.color }} aria-hidden="true">{getIcon(cat.icon)}</div>;
}

function CatPicker({ categories, selected, onSelect }) {
  return (
    <div className="cat-grid" role="radiogroup" aria-label="Kategorie wählen">
      {categories.map((c) => (
        <button key={c.id} className={`cat-btn ${selected === c.id ? "cat-btn--on" : ""}`} onClick={() => onSelect(c.id)} role="radio" aria-checked={selected === c.id} aria-label={c.name}>
          <div className="cat-btn__icon">{getIcon(c.icon)}</div>
          <div className="cat-btn__name">{c.name}</div>
        </button>
      ))}
    </div>
  );
}

function TagInput({ categories, onAdd, onRemove }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const customCats = categories.filter((c) => !defaultCategories.find((d) => d.id === c.id));
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) { e.preventDefault(); onAdd(value.trim()); setValue(""); }
    if (e.key === "Backspace" && !value && customCats.length > 0) onRemove(customCats[customCats.length - 1].id);
  };
  return (
    <div className="tag-input" onClick={() => inputRef.current?.focus()}>
      {customCats.map((c) => (
        <span key={c.id} className="tag">{icons.tag} {c.name}<button className="tag__remove" onClick={() => onRemove(c.id)}>×</button></span>
      ))}
      <input ref={inputRef} className="tag-input__field" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown}
        placeholder={customCats.length ? "" : "Neue Kategorie + Enter"} />
    </div>
  );
}

function NotifBanner({ data }) {
  const totalFC = data.fixedCosts.reduce((a, fc) => a + (fc.yearly ? fc.amount / 12 : fc.amount), 0);
  const budget = data.income - totalFC;
  const spent = data.transactions.filter(t => isThisMonth(t.date) && t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const quote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];
  if (pct < data.budgetThreshold || !data.pushEnabled) return null;
  return <div className="notif" role="alert"><div className="notif__icon">{icons.bell}</div><div className="notif__text"><strong>{Math.round(pct)}% Budget verbraucht.</strong><br/>{quote}</div></div>;
}

// ═══════════════════════════════════════════════════════
// WIZARD — FIX #2: Empty amounts, FIX #1: Responsive
// ═══════════════════════════════════════════════════════
function Wizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [theme, setTheme] = useState("light");
  const totalSteps = 5;

  const [wizFC, setWizFC] = useState([
    { id: "wfc_1", name: "Miete / Wohnung", cat: "miete", icon: "home", color: "#E57373", amount: "" },
    { id: "wfc_2", name: "Strom / Gas / Wasser", cat: "sonstiges", icon: "star", color: "#FFA726", amount: "" },
    { id: "wfc_3", name: "Internet", cat: "abos", icon: "play", color: "#5C6BC0", amount: "" },
    { id: "wfc_4", name: "Handy-Vertrag", cat: "sonstiges", icon: "star", color: "#26C6DA", amount: "" },
    { id: "wfc_5", name: "Streaming / Abos", cat: "abos", icon: "play", color: "#9575CD", amount: "" },
    { id: "wfc_6", name: "Versicherungen", cat: "versicherung", icon: "shield", color: "#42A5F5", amount: "" },
  ]);
  const [showAddFC, setShowAddFC] = useState(false);
  const [newFCName, setNewFCName] = useState("");
  const [newFCAmount, setNewFCAmount] = useState("");

  const updateFCAmount = (id, val) => setWizFC(p => p.map(fc => fc.id === id ? { ...fc, amount: val } : fc));
  const removeFCRow = (id) => setWizFC(p => p.filter(fc => fc.id !== id));
  const addCustomFC = () => {
    if (!newFCName.trim()) return;
    const colors = ["#FFA726","#9575CD","#42A5F5","#66BB6A","#FFCA28","#E57373"];
    setWizFC(p => [...p, { id: "wfc_" + Date.now(), name: newFCName.trim(), amount: newFCAmount || "", cat: "sonstiges", icon: "star", color: colors[p.length % colors.length] }]);
    setNewFCName(""); setNewFCAmount(""); setShowAddFC(false);
  };

  const fcTotal = wizFC.reduce((s, fc) => s + (parseFloat(fc.amount) || 0), 0);
  const filledFC = wizFC.filter(fc => parseFloat(fc.amount) > 0);
  const incomeNum = parseFloat(income) || 0;
  const remaining = incomeNum - fcTotal;

  const next = () => {
    if (step === 1 && !name.trim()) return;
    if (step === 2 && (!income || parseFloat(income) <= 0)) return;
    if (step === 3 && filledFC.length < 2) return;
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      const finalFC = wizFC.filter(fc => parseFloat(fc.amount) > 0).map(fc => ({
        id: uid(), name: fc.name, amount: parseFloat(fc.amount), cat: fc.cat, yearly: false, dueDay: 1,
      }));
      onComplete({ name: name.trim(), income: parseFloat(income), pushEnabled, theme, fixedCosts: finalFC });
    }
  };
  const back = () => step > 0 && setStep(step - 1);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  return (
    <div className="wizard">
      <div className="wizard__dots">{Array.from({ length: totalSteps }).map((_, i) => <div key={i} className={`wizard__dot ${i <= step ? "wizard__dot--active" : ""}`}/>)}</div>

      {step === 0 && (
        <div className="wizard__step">
          <div style={{ fontSize: 52, marginBottom: 20 }}>📒</div>
          <div className="wizard__title">Willkommen bei<br/><em>BudgetSnap</em></div>
          <div className="wizard__sub">Dein elegantes, persönliches Kassenbuch.<br/>Privat · Offline · Einfach.</div>
          <button className="btn btn--primary" onClick={next}>Los geht's →</button>
        </div>
      )}

      {step === 1 && (
        <div className="wizard__step">
          <div style={{ fontSize: 52, marginBottom: 20 }}>👋</div>
          <div className="wizard__title">Wie darf ich<br/><em>dich nennen?</em></div>
          <div className="wizard__sub">Damit ich dich persönlich begrüßen kann.</div>
          <div className="wizard__card glass"><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Dein Vorname…" autoFocus onKeyDown={e => e.key === "Enter" && next()} /></div>
          <div style={{ display:"flex", gap:8, width:"100%" }}><button className="btn btn--ghost btn--small" onClick={back}>←</button><button className="btn btn--primary" onClick={next}>Weiter →</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard__step">
          <div style={{ fontSize: 52, marginBottom: 20 }}>💰</div>
          <div className="wizard__title">Hallo{name ? ` ${name}` : ""}!<br/><em>Nettoeinkommen?</em></div>
          <div className="wizard__sub">Dein monatliches Nettoeinkommen.</div>
          <div className="wizard__card glass"><div className="input--amount"><span className="input--amount__symbol">€</span><input className="input--amount__field" type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="0" inputMode="decimal" autoFocus onKeyDown={e => e.key === "Enter" && next()} /></div></div>
          <div style={{ display:"flex", gap:8, width:"100%" }}><button className="btn btn--ghost btn--small" onClick={back}>←</button><button className="btn btn--primary" onClick={next}>Weiter →</button></div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard__step" style={{ margin:0 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
          <div className="wizard__title" style={{ fontSize: "clamp(22px,6vw,28px)" }}>Deine monatlichen<br/><em>Fixkosten</em></div>
          <div className="wizard__sub" style={{ marginBottom: 12 }}>Trage deine Beträge ein — mindestens 2 Posten.</div>
          <div className="wizard__card glass" style={{ padding: 10, maxHeight: "46vh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <div className="wiz-fc-list">
              {wizFC.map(fc => (
                <div className="wiz-fc-row" key={fc.id}>
                  <div className="wiz-fc-row__icon" style={{ background: fc.color }}>{getIcon(fc.icon)}</div>
                  <div className="wiz-fc-row__info"><div className="wiz-fc-row__name">{fc.name}</div><div className="wiz-fc-row__hint">mtl.</div></div>
                  <input className="wiz-fc-row__input" type="number" inputMode="decimal" value={fc.amount} onChange={e => updateFCAmount(fc.id, e.target.value)} placeholder="0" />
                  <span className="wiz-fc-row__unit">€</span>
                  <button className="wiz-fc-row__remove" onClick={() => removeFCRow(fc.id)}>{icons.x}</button>
                </div>
              ))}
              {showAddFC ? (
                <div className="wiz-fc-row" style={{ borderColor:"var(--accent)", background:"var(--accent-soft)" }}>
                  <div className="wiz-fc-row__icon" style={{ background:"var(--accent)" }}>{icons.plus}</div>
                  <input className="wiz-fc-row__input" style={{ flex:1, width:"auto", textAlign:"left", fontSize:12, fontFamily:"'Outfit',sans-serif" }}
                    value={newFCName} onChange={e => setNewFCName(e.target.value)} placeholder="Name…" autoFocus onKeyDown={e => e.key === "Enter" && addCustomFC()} />
                  <input className="wiz-fc-row__input" type="number" inputMode="decimal" value={newFCAmount} onChange={e => setNewFCAmount(e.target.value)} placeholder="0" onKeyDown={e => e.key === "Enter" && addCustomFC()} />
                  <span className="wiz-fc-row__unit">€</span>
                  <button className="wiz-fc-row__remove" onClick={() => { setShowAddFC(false); setNewFCName(""); setNewFCAmount(""); }}>{icons.x}</button>
                </div>
              ) : (
                <button className="wiz-fc-add" onClick={() => setShowAddFC(true)}>{icons.plus} Eigene hinzufügen</button>
              )}
            </div>
            <div className="wiz-fc-summary"><span className="wiz-fc-summary__label">Gesamt / Monat</span><span className="wiz-fc-summary__amount">€ {fmt(fcTotal)}</span></div>
            {incomeNum > 0 && <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", borderRadius:10, marginTop:6, background:remaining >= 0 ? "var(--accent-soft)" : "var(--danger-soft)" }}>
              <span style={{ fontSize:11, color:"var(--text-2)", fontWeight:600 }}>Verbleibend</span>
              <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:15, color:remaining >= 0 ? "var(--accent)" : "var(--danger)" }}>€ {fmt(remaining)}</span>
            </div>}
          </div>
          {filledFC.length < 2 && <div style={{ fontSize:12, color:"var(--danger)", marginBottom:8, fontStyle:"italic" }}>Mindestens 2 Fixkosten mit Betrag angeben.</div>}
          <div style={{ display:"flex", gap:8, width:"100%" }}><button className="btn btn--ghost btn--small" onClick={back}>←</button><button className="btn btn--primary" onClick={next} style={{ opacity:filledFC.length < 2 ? 0.5 : 1 }}>Weiter →</button></div>
        </div>
      )}

      {step === 4 && (
        <div className="wizard__step">
          <div style={{ fontSize: 52, marginBottom: 20 }}>🔔</div>
          <div className="wizard__title">Fast fertig!</div>
          <div className="wizard__sub">Noch ein paar Optionen.</div>
          <div className="wizard__card glass" style={{ padding: 20 }}>
            <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:16 }}>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, marginBottom:4 }}>Push-Reminder</div><div style={{ fontSize:12, color:"var(--text-3)" }}>Budget-Erinnerung</div></div>
              <button className={`toggle ${pushEnabled ? "toggle--on" : ""}`} onClick={() => setPushEnabled(!pushEnabled)} role="switch" aria-checked={pushEnabled} />
            </div>
            <div style={{ display:"flex", gap:12 }}>
              {[["light","☀️","Hell"],["dark","🌙","Dunkel"]].map(([v,ic,l]) => (
                <button key={v} onClick={() => setTheme(v)} style={{ flex:1, padding:14, borderRadius:"var(--radius-sm)", border:theme === v ? "2px solid var(--accent)" : "2px solid var(--glass-border)", background:theme === v ? "var(--accent-soft)" : "var(--surface)", cursor:"pointer", textAlign:"center" }}>
                  <span style={{ fontSize:24, display:"block", marginBottom:4 }}>{ic}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:theme === v ? "var(--accent)" : "var(--text-3)" }}>{l}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ width:"100%", padding:"12px 16px", borderRadius:"var(--radius-sm)", background:"var(--surface)", marginBottom:16, border:"1px solid var(--glass-border)" }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:"var(--text-3)", marginBottom:8 }}>Dein Setup</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}><span style={{ color:"var(--text-2)" }}>Einkommen</span><span style={{ fontWeight:600 }}>€ {fmt(incomeNum)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}><span style={{ color:"var(--text-2)" }}>Fixkosten ({filledFC.length})</span><span style={{ fontWeight:600, color:"var(--accent-2)" }}>€ {fmt(fcTotal)}</span></div>
            <div style={{ height:1, background:"var(--rule)", margin:"8px 0" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span style={{ fontWeight:600 }}>Verfügbar</span><span style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:"var(--accent)" }}>€ {fmt(remaining)}</span></div>
          </div>
          <div style={{ display:"flex", gap:8, width:"100%" }}><button className="btn btn--ghost btn--small" onClick={back}>←</button><button className="btn btn--primary" onClick={next}>Fertig 🎉</button></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SHEETS — FIX #3 Swipe, #4 Date, #5 Sparen, #6 Save
// UPDATED: validation alerts + touch-safe buttons + overlay touch-close
// ═══════════════════════════════════════════════════════

function AddTxSheet({ open, onClose, data, setData }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("essen");
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState("");
  const swipe = useSwipeDown(onClose);

  useEffect(() => {
    if (open) {
      setType("expense");
      setAmount("");
      setTitle("");
      setCat("essen");
      setDate(getToday());
      setNote("");
    }
  }, [open]);

  if (!open) return null;

  const expenseCats = data.categories.filter((c) => !SAVE_CATS.includes(c.id));
  const savingCats = data.categories.filter((c) => SAVE_CATS.includes(c.id));

  const save = () => {
    // Handle German comma decimals (iOS keyboard)
    const amtStr = String(amount).replace(",", ".");
    const amt = parseFloat(amtStr);

    if (isNaN(amt) || amt <= 0) {
      alert("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    if (!title.trim()) {
      alert("Bitte eine Bezeichnung eingeben.");
      return;
    }

    // Budget warning for expenses
    if (type === "expense") {
      const totalFC = data.fixedCosts.reduce(
        (a, fc) => a + (fc.yearly ? fc.amount / 12 : fc.amount),
        0
      );
      const budget = data.income - totalFC;
      const alreadySpent = data.transactions
        .filter((t) => isThisMonth(t.date) && t.type === "expense")
        .reduce((a, t) => a + t.amount, 0);
      const newTotal = alreadySpent + amt;

      if (newTotal > budget && budget > 0) {
        const over = newTotal - budget;
        if (
          !confirm(
            `⚠️ Achtung: Diese Ausgabe überschreitet dein verfügbares Budget um €${fmt(
              over
            )}!\n\nBudget: €${fmt(
              budget
            )}\nBereits ausgegeben: €${fmt(
              alreadySpent
            )}\nDiese Ausgabe: €${fmt(amt)}\n\nTrotzdem speichern?`
          )
        )
          return;
      }
    }

    const txType = type === "saving" ? "saving" : type;
    const finalCat = type === "income" ? "sonstiges" : cat;
    const tx = {
      id: uid(),
      type: txType,
      amount: amt,
      title: title.trim(),
      date,
      cat: finalCat,
      note: note.trim(),
    };

    setData((prev) => {
      const updated = { ...prev, transactions: [...prev.transactions, tx] };
      saveData(updated);
      return updated;
    });
    onClose();
  };

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchEnd={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="sheet"
        ref={swipe.sheetRef}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div className="sheet__handle" />
        <div className="sheet__title">Buchung hinzufügen</div>

        <div className="form-group">
          <label className="form-label">Art der Buchung</label>
          <div className="seg seg--3">
            {[
              ["expense", "Ausgabe"],
              ["income", "Einnahme"],
              ["saving", "Sparen"],
            ].map(([t, l]) => (
              <button
                key={t}
                className={`seg__opt ${type === t ? "seg__opt--on" : ""}`}
                onClick={() => {
                  setType(t);
                  if (t === "saving") setCat("sparen");
                  else if (t === "expense") setCat("essen");
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Betrag</label>
          <div className="input--amount">
            <span className="input--amount__symbol">€</span>
            <input
              className="input--amount__field"
              type="text"
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.,]/g, "");
                setAmount(v);
              }}
              placeholder="0,00"
              inputMode="decimal"
              style={{ fontSize: 28 }}
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bezeichnung</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === "saving"
                ? "z.B. Notgroschen, ETF …"
                : "z.B. Rewe, Tankstelle …"
            }
          />
        </div>

        {type === "expense" && (
          <div className="form-group">
            <label className="form-label">Kategorie</label>
            <CatPicker categories={expenseCats} selected={cat} onSelect={setCat} />
          </div>
        )}
        {type === "saving" && (
          <div className="form-group">
            <label className="form-label">Sparziel</label>
            <CatPicker categories={savingCats} selected={cat} onSelect={setCat} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Datum</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notiz (optional)</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optionale Notiz …"
          />
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <button
            className="btn btn--primary"
            onClick={save}
            onTouchEnd={(e) => {
              e.stopPropagation(); // Prevent interference with overlay touch handlers
              save();
            }}
          >
            {icons.check} Speichern
          </button>
          <button
            className="btn btn--ghost"
            style={{ marginTop: 8 }}
            onClick={onClose}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

function FCSheet({ open, onClose, editItem, data, setData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("miete");
  const [yearly, setYearly] = useState(false);
  const [dueDay, setDueDay] = useState("1");
  const swipe = useSwipeDown(onClose);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setAmount(editItem.amount.toString());
      setCat(editItem.cat);
      setYearly(editItem.yearly);
      setDueDay(editItem.dueDay?.toString() || "1");
    } else {
      setName("");
      setAmount("");
      setCat("miete");
      setYearly(false);
      setDueDay("1");
    }
  }, [editItem, open]);

  if (!open) return null;

  const save = () => {
    const amt = parseFloat(String(amount).replace(",", "."));

    if (!name.trim()) {
      alert("Bitte einen Namen eingeben.");
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert("Bitte einen gültigen Betrag eingeben.");
      return;
    }

    const dd = parseInt(dueDay) || 1;

    setData((prev) => {
      let updated;
      if (editItem) {
        updated = {
          ...prev,
          fixedCosts: prev.fixedCosts.map((fc) =>
            fc.id === editItem.id
              ? { ...fc, name: name.trim(), amount: amt, cat, yearly, dueDay: dd }
              : fc
          ),
        };
      } else {
        updated = {
          ...prev,
          fixedCosts: [
            ...prev.fixedCosts,
            { id: uid(), name: name.trim(), amount: amt, cat, yearly, dueDay: dd },
          ],
        };
      }
      saveData(updated);
      return updated;
    });

    onClose();
  };

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchEnd={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="sheet"
        ref={swipe.sheetRef}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div className="sheet__handle" />
        <div className="sheet__title">
          {editItem ? "Fixkosten bearbeiten" : "Fixkosten hinzufügen"}
        </div>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Miete, Netflix …"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Betrag</label>
          <div className="input--amount">
            <span className="input--amount__symbol">€</span>
            <input
              className="input--amount__field"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder="0"
              inputMode="decimal"
              style={{ fontSize: 28 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Rhythmus</label>
          <div className="seg seg--2">
            <button
              className={`seg__opt ${!yearly ? "seg__opt--on" : ""}`}
              onClick={() => setYearly(false)}
            >
              Monatlich
            </button>
            <button
              className={`seg__opt ${yearly ? "seg__opt--on" : ""}`}
              onClick={() => setYearly(true)}
            >
              Jährlich
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kategorie</label>
          <CatPicker categories={data.categories} selected={cat} onSelect={setCat} />
        </div>

        <div className="form-group">
          <label className="form-label">Fälligkeit (Tag)</label>
          <input
            className="input"
            type="number"
            min="1"
            max="28"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            inputMode="numeric"
          />
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <button
            className="btn btn--primary"
            onClick={save}
            onTouchEnd={(e) => {
              e.stopPropagation();
              save();
            }}
          >
            {icons.check} Speichern
          </button>
          <button
            className="btn btn--ghost"
            style={{ marginTop: 8 }}
            onClick={onClose}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalSheet({ open, onClose, data, setData }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [cat, setCat] = useState("sparen");
  const swipe = useSwipeDown(onClose);
  const saveCats = data.categories.filter((c) => SAVE_CATS.includes(c.id));

  if (!open) return null;

  const save = () => {
    const t = parseFloat(String(target).replace(",", "."));

    if (!name.trim()) {
      alert("Bitte einen Namen eingeben.");
      return;
    }
    if (isNaN(t) || t <= 0) {
      alert("Bitte ein gültiges Ziel eingeben.");
      return;
    }

    setData((prev) => {
      const updated = {
        ...prev,
        goals: [...prev.goals, { id: uid(), name: name.trim(), target: t, cat }],
      };
      saveData(updated);
      return updated;
    });

    onClose();
    setName("");
    setTarget("");
  };

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchEnd={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="sheet"
        ref={swipe.sheetRef}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div className="sheet__handle" />
        <div className="sheet__title">Sparziel hinzufügen</div>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Notgroschen, Urlaub …"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Monatliches Ziel</label>
          <div className="input--amount">
            <span className="input--amount__symbol">€</span>
            <input
              className="input--amount__field"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder="0"
              inputMode="decimal"
              style={{ fontSize: 28 }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kategorie</label>
          <CatPicker
            categories={saveCats.length ? saveCats : [data.categories.at(-1)]}
            selected={cat}
            onSelect={setCat}
          />
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <button
            className="btn btn--primary"
            onClick={save}
            onTouchEnd={(e) => {
              e.stopPropagation();
              save();
            }}
          >
            {icons.check} Speichern
          </button>
          <button
            className="btn btn--ghost"
            style={{ marginTop: 8 }}
            onClick={onClose}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}