import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
const STORAGE_KEY = "budgetsnap_v3";

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
// SVG ICONS (minimal, consistent 24x24)
// ═══════════════════════════════════════════════════════
const icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  car: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a1 1 0 00-.98.76l-1.22 5.1A1 1 0 004 14v2h1" />
      <circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
  play: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  piggy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
      <path d="M2 9.5a1 1 0 100 3" /><circle cx="13" cy="9" r=".7" fill="currentColor"/>
    </svg>
  ),
  trending: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevron: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  download: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  repeat: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

const getIcon = (id) => icons[id] || icons.star;

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateStr = (d) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
const monthLabel = (d) => new Date(d || Date.now()).toLocaleDateString("de-DE", { month: "long", year: "numeric" });

const isThisMonth = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Guten Morgen" : h < 17 ? "Guten Tag" : "Guten Abend";
};

// ═══════════════════════════════════════════════════════
// DATA PERSISTENCE
// ═══════════════════════════════════════════════════════
const getDefaultData = () => ({
  name: "",
  income: 0,
  theme: "light",
  categories: defaultCategories,
  transactions: [],
  fixedCosts: [],
  goals: [],
  pushEnabled: false,
  budgetThreshold: 80,
  wizardDone: false,
});

const normalizeData = (raw) => {
  const base = getDefaultData();
  const merged = { ...base, ...(raw || {}) };
  const income = Number(merged.income);
  const threshold = Number(merged.budgetThreshold);

  return {
    ...merged,
    theme: merged.theme === "dark" ? "dark" : "light",
    income: Number.isFinite(income) ? income : 0,
    categories: Array.isArray(merged.categories) && merged.categories.length ? merged.categories : base.categories,
    transactions: Array.isArray(merged.transactions) ? merged.transactions : [],
    fixedCosts: Array.isArray(merged.fixedCosts) ? merged.fixedCosts : [],
    goals: Array.isArray(merged.goals) ? merged.goals : [],
    pushEnabled: Boolean(merged.pushEnabled),
    budgetThreshold: Number.isFinite(threshold) ? threshold : base.budgetThreshold,
    wizardDone: Boolean(merged.wizardDone),
  };
};

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeData(JSON.parse(raw));
  } catch (e) { /* noop */ }
  return getDefaultData();
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    /* localStorage unavailable or blocked */
  }
};

// ═══════════════════════════════════════════════════════
// CSS STYLES (BEM-inspired with CSS Modules pattern)
// ═══════════════════════════════════════════════════════
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

  :root {
    --bg: #F5F0E8;
    --bg-subtle: #EDE7DB;
    --surface: rgba(255,255,255,0.55);
    --surface-hover: rgba(255,255,255,0.75);
    --surface-solid: #FFFFFF;
    --glass-border: rgba(255,255,255,0.65);
    --glass-shadow: rgba(140,120,80,0.1);
    --text-1: #1C1810;
    --text-2: #6B6155;
    --text-3: #A89E8F;
    --accent: #3D7A5F;
    --accent-soft: rgba(61,122,95,0.1);
    --accent-2: #B8860B;
    --accent-2-soft: rgba(184,134,11,0.1);
    --danger: #C0392B;
    --danger-soft: rgba(192,57,43,0.08);
    --rule: rgba(61,122,95,0.12);
    --radius-sm: 12px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --transition: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  [data-theme="dark"] {
    --bg: #0F1219;
    --bg-subtle: #161B26;
    --surface: rgba(28,35,52,0.65);
    --surface-hover: rgba(38,48,72,0.8);
    --surface-solid: #1C2334;
    --glass-border: rgba(80,110,180,0.12);
    --glass-shadow: rgba(0,0,0,0.3);
    --text-1: #ECE6D9;
    --text-2: #9A94A8;
    --text-3: #555068;
    --accent: #6EBF8B;
    --accent-soft: rgba(110,191,139,0.1);
    --accent-2: #D4A84B;
    --accent-2-soft: rgba(212,168,75,0.08);
    --danger: #E57373;
    --danger-soft: rgba(229,115,115,0.08);
    --rule: rgba(110,191,139,0.08);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  .app-root {
    font-family: 'Outfit', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text-1);
    min-height: 100dvh;
    max-width: 480px;
    margin: 0 auto;
    position: relative;
    transition: background var(--transition), color var(--transition);
    overflow-x: hidden;
  }

  /* ── GLASS ── */
  .glass {
    background: var(--surface);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: 0 8px 32px var(--glass-shadow);
    transition: all var(--transition);
  }

  .glass:hover { background: var(--surface-hover); }

  /* ── WIZARD ── */
  .wizard {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px 24px;
    background: var(--bg);
    animation: fadeIn 500ms ease both;
  }

  .wizard__step {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; width: 100%; max-width: 360px;
    animation: slideUp 400ms cubic-bezier(0.4,0,0.2,1) both;
  }

  .wizard__title {
    font-family: 'DM Serif Display', serif;
    font-size: 36px; font-weight: 400; line-height: 1.15;
    margin-bottom: 8px;
  }

  .wizard__title em { font-style: italic; color: var(--accent); }

  .wizard__sub {
    font-size: 14px; color: var(--text-2); line-height: 1.7;
    margin-bottom: 32px;
  }

  .wizard__dots {
    display: flex; gap: 8px; margin-bottom: 32px;
  }

  .wizard__dot {
    height: 6px; border-radius: 99px;
    background: var(--text-3); transition: all 400ms ease; width: 6px;
  }

  .wizard__dot--active { width: 24px; background: var(--accent); }

  .wizard__card {
    width: 100%; padding: 24px; margin-bottom: 24px;
  }

  /* ── INPUTS ── */
  .input {
    width: 100%; background: var(--surface);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid var(--glass-border);
    border-radius: var(--radius-sm); padding: 14px 16px;
    font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 500;
    color: var(--text-1); outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    caret-color: var(--accent);
  }

  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .input::placeholder { color: var(--text-3); }

  .input--amount {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid var(--glass-border);
    border-radius: var(--radius-sm); padding: 8px 16px;
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  .input--amount:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

  .input--amount__symbol {
    font-family: 'DM Serif Display', serif; font-size: 28px; font-weight: 400;
    color: var(--accent-2);
  }

  .input--amount__field {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'DM Serif Display', serif; font-size: 32px; font-weight: 400;
    color: var(--text-1); caret-color: var(--accent);
  }

  .input--amount__field::placeholder { color: var(--text-3); font-weight: 400; }

  /* ── BUTTONS ── */
  .btn {
    width: 100%; padding: 14px 16px; border-radius: var(--radius-sm); border: none;
    font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all var(--transition); letter-spacing: 0.3px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .btn:active { transform: scale(0.98); opacity: 0.9; }

  .btn--primary {
    background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #000));
    color: #fff; box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .btn--ghost {
    background: var(--surface); color: var(--text-2);
    border: 1px solid var(--glass-border);
  }

  .btn--danger { background: var(--danger-soft); color: var(--danger); }
  .btn--small { width: auto; padding: 8px 16px; font-size: 13px; }
  .btn--icon { width: 40px; height: 40px; padding: 0; border-radius: 50%; flex-shrink: 0; }

  /* ── TOPBAR ── */
  .topbar {
    padding: 56px 16px 16px; position: relative; flex-shrink: 0;
  }

  .topbar::after {
    content: ''; position: absolute; bottom: 0; left: 16px; right: 16px;
    height: 1px; background: var(--rule);
  }

  .topbar__inner { display: flex; justify-content: space-between; align-items: flex-end; }

  .topbar__greeting {
    font-size: 11px; font-weight: 600; color: var(--text-3);
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;
  }

  .topbar__title {
    font-family: 'DM Serif Display', serif; font-size: 26px;
    font-weight: 400; line-height: 1.1;
  }

  .topbar__title em { font-style: italic; color: var(--accent); }
  .topbar__actions { display: flex; gap: 8px; }

  .topbar__btn {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border); cursor: pointer;
    color: var(--text-2); transition: all var(--transition);
  }

  .topbar__btn:active { background: var(--surface-hover); }

  /* ── SCROLL AREA ── */
  .scroll {
    flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
    padding: 16px 16px calc(88px + env(safe-area-inset-bottom, 0px));
  }

  .scroll::-webkit-scrollbar { display: none; }

  /* ── HERO CARD ── */
  .hero {
    padding: 24px; margin-bottom: 16px; position: relative; overflow: hidden;
    background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-2-soft) 100%);
    border-color: color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .hero::before {
    content: '€'; position: absolute; right: -8px; top: -24px;
    font-family: 'DM Serif Display', serif; font-size: 140px; font-weight: 400;
    color: var(--accent-soft); line-height: 1; pointer-events: none; user-select: none;
  }

  .hero__eyebrow {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 2px; color: var(--text-3); margin-bottom: 8px;
  }

  .hero__amount {
    font-family: 'DM Serif Display', serif; font-size: 48px;
    font-weight: 400; line-height: 1; letter-spacing: -1px; margin-bottom: 4px;
  }

  .hero__sub { font-size: 12px; color: var(--text-3); margin-bottom: 16px; }

  .hero__stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    padding-top: 16px; border-top: 1px solid var(--rule);
  }

  .hero__stat { text-align: center; }

  .hero__stat-label {
    font-size: 9px; text-transform: uppercase; letter-spacing: 1px;
    color: var(--text-3); margin-bottom: 4px;
  }

  .hero__stat-val {
    font-family: 'DM Serif Display', serif; font-size: 18px; font-weight: 400;
  }

  /* ── COLORS ── */
  .c-pos { color: var(--accent); }
  .c-neg { color: var(--danger); }
  .c-gold { color: var(--accent-2); }

  /* ── SECTION ── */
  .section {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; padding: 0 4px;
  }

  .section__title {
    font-family: 'DM Serif Display', serif; font-size: 18px;
    font-weight: 400; font-style: italic;
  }

  .section__link {
    font-size: 12px; font-weight: 600; color: var(--accent);
    cursor: pointer; letter-spacing: 0.3px; border: none; background: none;
  }

  /* ── TRANSACTION ROW ── */
  .tx {
    display: flex; align-items: center; gap: 12px; padding: 12px 0;
    border-bottom: 1px solid var(--rule); transition: opacity var(--transition);
  }

  .tx:last-child { border-bottom: none; }

  .tx__icon {
    width: 40px; height: 40px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: white;
  }

  .tx__info { flex: 1; min-width: 0; }

  .tx__name {
    font-size: 14px; font-weight: 600; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  .tx__meta { font-size: 11px; color: var(--text-3); margin-top: 2px; }
  .tx__right { text-align: right; flex-shrink: 0; }

  .tx__amount {
    font-family: 'DM Serif Display', serif; font-size: 17px; font-weight: 400;
  }

  .tx__date { font-size: 10px; color: var(--text-3); margin-top: 2px; }

  .tx__actions {
    display: flex; gap: 4px; flex-shrink: 0;
  }

  .tx__action-btn {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: transparent; color: var(--text-3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--transition);
  }

  .tx__action-btn:hover { background: var(--danger-soft); color: var(--danger); }

  /* ── PROGRESS ── */
  .progress { background: var(--rule); border-radius: 99px; height: 6px; overflow: hidden; }

  .progress__fill {
    height: 100%; border-radius: 99px;
    transition: width 600ms cubic-bezier(0.4,0,0.2,1);
  }

  /* ── BOTTOM NAV ── */
  .nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 480px;
    background: var(--surface); backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border-top: 1px solid var(--glass-border);
    display: grid; grid-template-columns: repeat(5, 1fr);
    padding-bottom: env(safe-area-inset-bottom, 0px); z-index: 200;
  }

  .nav__item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 10px 4px 8px; cursor: pointer; gap: 4px; border: none; background: none;
    transition: all var(--transition); color: var(--text-3);
  }

  .nav__item--active { color: var(--accent); }
  .nav__item--active .nav__icon { transform: translateY(-2px); }

  .nav__icon { transition: transform var(--transition); }

  .nav__label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.4px;
    text-transform: uppercase; font-family: 'Outfit', sans-serif;
  }

  /* ── FAB ── */
  .fab {
    position: fixed; right: 20px;
    bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    width: 56px; height: 56px; border-radius: 50%; border: none;
    background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #000));
    color: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 35%, transparent);
    cursor: pointer; z-index: 190; transition: transform var(--transition);
  }

  .fab:active { transform: scale(0.9); }

  /* ── MODAL / SHEET ── */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    z-index: 300; display: flex; align-items: flex-end;
    animation: fadeIn 200ms ease both;
  }

  .sheet {
    width: 100%; max-width: 480px; margin: 0 auto;
    background: var(--bg); border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
    max-height: 90dvh; overflow-y: auto;
    animation: sheetUp 300ms cubic-bezier(0.4,0,0.2,1) both;
  }

  .sheet__handle {
    width: 40px; height: 4px; background: var(--text-3); border-radius: 99px;
    opacity: 0.35; margin: 14px auto 16px;
  }

  .sheet__title {
    font-family: 'DM Serif Display', serif; font-size: 22px;
    font-weight: 400; font-style: italic; padding: 0 24px 16px;
    border-bottom: 1px solid var(--rule);
  }

  .sheet__close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: var(--surface); color: var(--text-2); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── FORM ── */
  .form-group { padding: 16px 24px 0; }

  .form-label {
    display: block; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.5px;
    color: var(--text-3); margin-bottom: 8px;
  }

  .seg {
    display: grid; gap: 4px;
    background: color-mix(in srgb, var(--text-3) 10%, transparent);
    border-radius: var(--radius-sm); padding: 4px;
  }

  .seg--2 { grid-template-columns: 1fr 1fr; }
  .seg--3 { grid-template-columns: 1fr 1fr 1fr; }

  .seg__opt {
    padding: 10px 8px; text-align: center; font-size: 13px; font-weight: 600;
    border-radius: 8px; cursor: pointer; color: var(--text-2);
    transition: all var(--transition); border: none; background: none;
    font-family: 'Outfit', sans-serif;
  }

  .seg__opt--on {
    background: var(--surface-solid); color: var(--text-1);
    box-shadow: 0 1px 6px var(--glass-shadow);
  }

  /* ── CAT GRID ── */
  .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

  .cat-btn {
    padding: 12px 4px; border-radius: var(--radius-sm);
    border: 1.5px solid transparent;
    background: color-mix(in srgb, var(--text-3) 8%, transparent);
    text-align: center; cursor: pointer; transition: all var(--transition);
  }

  .cat-btn:active { transform: scale(0.95); }

  .cat-btn--on { border-color: var(--accent); background: var(--accent-soft); }

  .cat-btn__icon { margin-bottom: 4px; display: flex; justify-content: center; color: var(--text-2); }
  .cat-btn--on .cat-btn__icon { color: var(--accent); }

  .cat-btn__name { font-size: 9px; font-weight: 700; color: var(--text-3); line-height: 1.2; }
  .cat-btn--on .cat-btn__name { color: var(--accent); }

  /* ── TAG INPUT (Add Category) ── */
  .tag-input {
    display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
    padding: 8px 12px; border: 1.5px solid var(--glass-border);
    border-radius: var(--radius-sm); background: var(--surface);
    min-height: 48px; cursor: text;
    transition: border-color var(--transition);
  }

  .tag-input:focus-within { border-color: var(--accent); }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
    background: var(--accent-soft); color: var(--accent);
  }

  .tag__remove {
    width: 16px; height: 16px; border-radius: 50%; border: none;
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    color: var(--accent); cursor: pointer; font-size: 10px;
    display: flex; align-items: center; justify-content: center;
  }

  .tag-input__field {
    flex: 1; min-width: 80px; border: none; background: transparent; outline: none;
    font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--text-1);
  }

  .tag-input__field::placeholder { color: var(--text-3); }

  /* ── FIXED COST ROW ── */
  .fc {
    display: flex; align-items: center; gap: 12px; padding: 14px 16px;
    border-bottom: 1px solid var(--rule);
  }

  .fc:last-child { border-bottom: none; }

  .fc__icon { flex-shrink: 0; color: var(--text-2); }
  .fc__info { flex: 1; min-width: 0; }
  .fc__name { font-size: 14px; font-weight: 600; }
  .fc__due { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  .fc__amount {
    font-family: 'DM Serif Display', serif; font-size: 17px; font-weight: 400; flex-shrink: 0;
  }

  /* ── GOAL CARD ── */
  .goal-card { padding: 16px; margin-bottom: 8px; }

  .goal-card__top {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }

  .goal-card__icon { color: var(--text-2); }
  .goal-card__info { flex: 1; }
  .goal-card__name { font-size: 14px; font-weight: 600; }
  .goal-card__sub { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  .goal-card__amounts {
    font-family: 'DM Serif Display', serif; font-size: 17px;
    font-weight: 400; color: var(--accent); text-align: right;
  }

  .goal-card__foot {
    font-size: 10px; color: var(--text-3); margin-top: 8px; text-align: right;
  }

  /* ── YEAR CHART ── */
  .year-chart { display: flex; gap: 4px; align-items: flex-end; height: 80px; padding: 0 4px; }

  .year-chart__bar-wrap {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  }

  .year-chart__bar {
    width: 100%; border-radius: 4px 4px 0 0; min-height: 4px;
    transition: height 500ms cubic-bezier(0.4,0,0.2,1);
  }

  .year-chart__label {
    font-size: 8px; color: var(--text-3); font-weight: 600; text-transform: uppercase;
  }

  /* ── EMPTY STATE ── */
  .empty { text-align: center; padding: 40px 24px; }
  .empty__icon { font-size: 40px; opacity: 0.3; margin-bottom: 12px; color: var(--text-3); }
  .empty__text { font-size: 14px; color: var(--text-3); line-height: 1.6; }

  /* ── NOTIFICATION BANNER ── */
  .notif {
    padding: 12px 16px; border-radius: var(--radius-sm);
    background: var(--accent-soft); border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    margin-bottom: 16px; display: flex; align-items: center; gap: 12px;
    animation: slideDown 300ms ease both;
  }

  .notif__icon { color: var(--accent); flex-shrink: 0; }
  .notif__text { font-size: 13px; color: var(--text-2); line-height: 1.5; flex: 1; }
  .notif__text strong { color: var(--text-1); font-weight: 600; }

  /* ── SETTINGS ── */
  .settings-section { margin-bottom: 24px; }

  .settings-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--text-3); margin-bottom: 8px; padding: 0 4px;
  }

  .set-row {
    display: flex; align-items: center; gap: 16px; padding: 14px 16px;
    cursor: pointer; transition: opacity var(--transition); border: none; background: none;
    width: 100%; color: var(--text-1); font-family: 'Outfit', sans-serif; text-align: left;
  }

  .set-row:active { opacity: 0.7; }
  .set-row__icon { color: var(--text-2); flex-shrink: 0; }
  .set-row__info { flex: 1; }
  .set-row__title { font-size: 14px; font-weight: 600; }
  .set-row__sub { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  /* ── SWITCH TOGGLE ── */
  .toggle {
    width: 48px; height: 28px; border-radius: 99px; border: none; cursor: pointer;
    background: var(--text-3); position: relative; transition: background var(--transition);
    flex-shrink: 0;
  }

  .toggle--on { background: var(--accent); }

  .toggle::after {
    content: ''; position: absolute; top: 3px; left: 3px;
    width: 22px; height: 22px; border-radius: 50%; background: white;
    transition: transform var(--transition);
  }

  .toggle--on::after { transform: translateX(20px); }

  /* ── PRINT STYLES ── */
  @media print {
    .nav, .fab, .topbar__actions { display: none !important; }
    .scroll { padding-bottom: 0 !important; }
    .app-root { max-width: none; }
    .glass, .glass:hover { background: white; backdrop-filter: none; box-shadow: none; border: 1px solid #ddd; }
    body { background: white !important; }
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  /* ── RESPONSIVE ── */
  @media (min-width: 640px) {
    .hero__amount { font-size: 56px; }
    .wizard__title { font-size: 44px; }
  }

  /* ── WIZARD FC ROWS ── */
  .wiz-fc-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }

  .wiz-fc-row {
    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
    border-radius: var(--radius-sm); background: var(--surface);
    border: 1px solid var(--glass-border); transition: all var(--transition);
  }

  .wiz-fc-row__icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;
  }

  .wiz-fc-row__info { flex: 1; min-width: 0; }

  .wiz-fc-row__name {
    font-size: 13px; font-weight: 600; margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .wiz-fc-row__hint { font-size: 10px; color: var(--text-3); }

  .wiz-fc-row__input {
    width: 96px; background: color-mix(in srgb, var(--text-3) 8%, transparent);
    border: 1.5px solid var(--glass-border); border-radius: 10px;
    padding: 8px 10px; font-family: 'DM Serif Display', serif;
    font-size: 18px; font-weight: 400; color: var(--text-1);
    text-align: right; outline: none; caret-color: var(--accent);
    transition: border-color var(--transition);
  }

  .wiz-fc-row__input:focus { border-color: var(--accent); }
  .wiz-fc-row__input::placeholder { color: var(--text-3); font-weight: 400; }

  .wiz-fc-row__unit { font-size: 12px; color: var(--text-3); font-weight: 600; flex-shrink: 0; }

  .wiz-fc-row__remove {
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: transparent; color: var(--text-3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--transition); flex-shrink: 0;
  }

  .wiz-fc-row__remove:hover { background: var(--danger-soft); color: var(--danger); }

  .wiz-fc-add {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 16px; border-radius: var(--radius-sm); border: 1.5px dashed var(--glass-border);
    background: transparent; cursor: pointer; color: var(--accent);
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    width: 100%; transition: all var(--transition);
  }

  .wiz-fc-add:hover { background: var(--accent-soft); border-color: var(--accent); }

  .wiz-fc-summary {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; border-radius: var(--radius-sm);
    background: var(--accent-2-soft); margin-top: 8px;
  }

  .wiz-fc-summary__label { font-size: 12px; color: var(--text-2); font-weight: 600; }

  .wiz-fc-summary__amount {
    font-family: 'DM Serif Display', serif; font-size: 20px;
    font-weight: 400; color: var(--accent-2);
  }

  /* ── SCREEN READER ONLY ── */
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
`;

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════

/* ── Wizard ── */
function Wizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [theme, setTheme] = useState("light");
  const totalSteps = 5;

  // Fixkosten state: pre-filled with common items
  const [wizFC, setWizFC] = useState([
    { id: "wfc_1", name: "Miete", amount: "850", cat: "miete", icon: "home", color: "#E57373", yearly: false },
    { id: "wfc_2", name: "Strom / Gas", amount: "120", cat: "sonstiges", icon: "star", color: "#FFA726", yearly: false },
    { id: "wfc_3", name: "Internet", amount: "35", cat: "abos", icon: "play", color: "#5C6BC0", yearly: false },
    { id: "wfc_4", name: "Handy", amount: "30", cat: "sonstiges", icon: "star", color: "#26C6DA", yearly: false },
    { id: "wfc_5", name: "Streaming / Abos", amount: "40", cat: "abos", icon: "play", color: "#9575CD", yearly: false },
    { id: "wfc_6", name: "Versicherungen", amount: "80", cat: "versicherung", icon: "shield", color: "#42A5F5", yearly: false },
  ]);

  const [showAddFC, setShowAddFC] = useState(false);
  const [newFCName, setNewFCName] = useState("");
  const [newFCAmount, setNewFCAmount] = useState("");
  const newFCRef = useRef(null);

  const updateFCAmount = (id, val) => {
    setWizFC((prev) => prev.map((fc) => (fc.id === id ? { ...fc, amount: val } : fc)));
  };

  const removeFCRow = (id) => {
    setWizFC((prev) => prev.filter((fc) => fc.id !== id));
  };

  const addCustomFC = () => {
    if (!newFCName.trim()) return;
    const colors = ["#FFA726", "#9575CD", "#42A5F5", "#66BB6A", "#FFCA28", "#E57373"];
    setWizFC((prev) => [
      ...prev,
      {
        id: "wfc_" + Date.now(),
        name: newFCName.trim(),
        amount: newFCAmount || "0",
        cat: "sonstiges",
        icon: "star",
        color: colors[prev.length % colors.length],
        yearly: false,
      },
    ]);
    setNewFCName("");
    setNewFCAmount("");
    setShowAddFC(false);
  };

  const fcTotal = wizFC.reduce((sum, fc) => sum + (parseFloat(fc.amount) || 0), 0);
  const filledFC = wizFC.filter((fc) => parseFloat(fc.amount) > 0);

  const next = () => {
    if (step === 1 && !name.trim()) return;
    if (step === 2 && (!income || parseFloat(income) <= 0)) return;
    if (step === 3 && filledFC.length < 2) return; // mindestens 2 Angaben
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      const finalFC = wizFC
        .filter((fc) => parseFloat(fc.amount) > 0)
        .map((fc) => ({
          id: uid(),
          name: fc.name,
          amount: parseFloat(fc.amount),
          cat: fc.cat,
          yearly: fc.yearly,
          dueDay: 1,
        }));
      onComplete({
        name: name.trim(),
        income: parseFloat(income),
        pushEnabled,
        theme,
        fixedCosts: finalFC,
      });
    }
  };

  const back = () => step > 0 && setStep(step - 1);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Remaining budget preview for FC step
  const incomeNum = parseFloat(income) || 0;
  const remaining = incomeNum - fcTotal;

  return (
    <div className="wizard" role="dialog" aria-label="Einrichtungsassistent">
      <div className="wizard__dots" role="tablist" aria-label="Fortschritt">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`wizard__dot ${i <= step ? "wizard__dot--active" : ""}`}
            role="tab" aria-selected={i === step} aria-label={`Schritt ${i + 1}`} />
        ))}
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="wizard__step" key="s0">
          <div style={{ fontSize: 56, marginBottom: 24 }}>📒</div>
          <div className="wizard__title">Willkommen bei<br /><em>BudgetSnap</em></div>
          <div className="wizard__sub">Dein elegantes, persönliches Kassenbuch.<br />Privat · Offline · Einfach.</div>
          <button className="btn btn--primary" onClick={next}>Los geht's →</button>
        </div>
      )}

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="wizard__step" key="s1">
          <div style={{ fontSize: 56, marginBottom: 24 }}>👋</div>
          <div className="wizard__title">Wie darf ich<br /><em>dich nennen?</em></div>
          <div className="wizard__sub">Damit ich dich persönlich begrüßen kann.</div>
          <div className="wizard__card glass">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Dein Vorname…" autoFocus aria-label="Name"
              onKeyDown={(e) => e.key === "Enter" && next()} />
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button className="btn btn--ghost btn--small" onClick={back} aria-label="Zurück">←</button>
            <button className="btn btn--primary" onClick={next}>Weiter →</button>
          </div>
        </div>
      )}

      {/* Step 2: Income */}
      {step === 2 && (
        <div className="wizard__step" key="s2">
          <div style={{ fontSize: 56, marginBottom: 24 }}>💰</div>
          <div className="wizard__title">Hallo{name ? ` ${name}` : ""}!<br /><em>Nettoeinkommen?</em></div>
          <div className="wizard__sub">Dein monatliches Nettoeinkommen.<br />Nur lokal gespeichert.</div>
          <div className="wizard__card glass">
            <div className="input--amount">
              <span className="input--amount__symbol">€</span>
              <input className="input--amount__field" type="number" value={income}
                onChange={(e) => setIncome(e.target.value)} placeholder="0"
                inputMode="decimal" autoFocus aria-label="Monatliches Einkommen"
                onKeyDown={(e) => e.key === "Enter" && next()} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button className="btn btn--ghost btn--small" onClick={back} aria-label="Zurück">←</button>
            <button className="btn btn--primary" onClick={next}>Weiter →</button>
          </div>
        </div>
      )}

      {/* Step 3: Fixed Costs */}
      {step === 3 && (
        <div className="wizard__step" key="s3">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <div className="wizard__title">Deine monatlichen<br /><em>Fixkosten</em></div>
          <div className="wizard__sub">Passe die Beträge an oder entferne was nicht passt.<br />Mindestens 2 Angaben, damit du eine Orientierung hast.</div>

          <div className="wizard__card glass" style={{ padding: 16, maxHeight: "48dvh", overflowY: "auto" }}>
            <div className="wiz-fc-list" role="list" aria-label="Fixkosten">
              {wizFC.map((fc) => (
                <div className="wiz-fc-row" key={fc.id} role="listitem">
                  <div className="wiz-fc-row__icon" style={{ background: fc.color }}>
                    {getIcon(fc.icon)}
                  </div>
                  <div className="wiz-fc-row__info">
                    <div className="wiz-fc-row__name">{fc.name}</div>
                    <div className="wiz-fc-row__hint">monatlich</div>
                  </div>
                  <input
                    className="wiz-fc-row__input"
                    type="number"
                    inputMode="decimal"
                    value={fc.amount}
                    onChange={(e) => updateFCAmount(fc.id, e.target.value)}
                    placeholder="0"
                    aria-label={`${fc.name} Betrag`}
                  />
                  <span className="wiz-fc-row__unit">€</span>
                  <button
                    className="wiz-fc-row__remove"
                    onClick={() => removeFCRow(fc.id)}
                    aria-label={`${fc.name} entfernen`}
                  >
                    {icons.x}
                  </button>
                </div>
              ))}

              {/* Add new row */}
              {showAddFC ? (
                <div className="wiz-fc-row" style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}>
                  <div className="wiz-fc-row__icon" style={{ background: "var(--accent)" }}>
                    {icons.plus}
                  </div>
                  <input
                    ref={newFCRef}
                    className="wiz-fc-row__input"
                    style={{ flex: 1, width: "auto", textAlign: "left", fontSize: 14, fontFamily: "'Outfit', sans-serif" }}
                    value={newFCName}
                    onChange={(e) => setNewFCName(e.target.value)}
                    placeholder="Name…"
                    autoFocus
                    aria-label="Neue Fixkosten Name"
                    onKeyDown={(e) => e.key === "Enter" && newFCName.trim() && addCustomFC()}
                  />
                  <input
                    className="wiz-fc-row__input"
                    type="number"
                    inputMode="decimal"
                    value={newFCAmount}
                    onChange={(e) => setNewFCAmount(e.target.value)}
                    placeholder="0"
                    aria-label="Neue Fixkosten Betrag"
                    onKeyDown={(e) => e.key === "Enter" && addCustomFC()}
                  />
                  <span className="wiz-fc-row__unit">€</span>
                  <button
                    className="wiz-fc-row__remove"
                    onClick={() => { setShowAddFC(false); setNewFCName(""); setNewFCAmount(""); }}
                    aria-label="Abbrechen"
                    style={{ color: "var(--text-3)" }}
                  >
                    {icons.x}
                  </button>
                </div>
              ) : (
                <button className="wiz-fc-add" onClick={() => setShowAddFC(true)}>
                  {icons.plus} Weitere Fixkosten hinzufügen
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="wiz-fc-summary">
              <span className="wiz-fc-summary__label">Gesamt / Monat</span>
              <span className="wiz-fc-summary__amount">€ {fmt(fcTotal)}</span>
            </div>
            {incomeNum > 0 && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 16px", borderRadius: "var(--radius-sm)", marginTop: 8,
                background: remaining >= 0 ? "var(--accent-soft)" : "var(--danger-soft)",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>Verbleibend</span>
                <span style={{
                  fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400,
                  color: remaining >= 0 ? "var(--accent)" : "var(--danger)",
                }}>
                  € {fmt(remaining)}
                </span>
              </div>
            )}
          </div>

          {filledFC.length < 2 && (
            <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 8, fontStyle: "italic" }}>
              Bitte gib mindestens 2 Fixkosten mit Betrag an.
            </div>
          )}

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button className="btn btn--ghost btn--small" onClick={back} aria-label="Zurück">←</button>
            <button className="btn btn--primary" onClick={next} style={{ opacity: filledFC.length < 2 ? 0.5 : 1 }}>
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Push + Theme */}
      {step === 4 && (
        <div className="wizard__step" key="s4">
          <div style={{ fontSize: 56, marginBottom: 24 }}>🔔</div>
          <div className="wizard__title">Erinnerungen<br /><em>aktivieren?</em></div>
          <div className="wizard__sub">Tägliche Benachrichtigung wenn dein Budget knapp wird.</div>
          <div className="wizard__card glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Push-Reminder</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>Tägliche Budget-Erinnerung</div>
              </div>
              <button className={`toggle ${pushEnabled ? "toggle--on" : ""}`}
                onClick={() => setPushEnabled(!pushEnabled)}
                role="switch" aria-checked={pushEnabled} aria-label="Push-Benachrichtigungen" />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {[["light", "☀️", "Hell"], ["dark", "🌙", "Dunkel"]].map(([val, ico, label]) => (
                <button key={val} onClick={() => setTheme(val)}
                  style={{
                    flex: 1, padding: 16, borderRadius: "var(--radius-sm)",
                    border: theme === val ? "2px solid var(--accent)" : "2px solid var(--glass-border)",
                    background: theme === val ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer", textAlign: "center",
                  }}>
                  <span style={{ fontSize: 28, display: "block", marginBottom: 4 }}>{ico}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme === val ? "var(--accent)" : "var(--text-3)" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mini summary of what was set up */}
          <div style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "var(--surface)", marginBottom: 16, border: "1px solid var(--glass-border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-3)", marginBottom: 8 }}>Dein Setup</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: "var(--text-2)" }}>Einkommen</span>
              <span style={{ fontWeight: 600 }}>€ {fmt(parseFloat(income) || 0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: "var(--text-2)" }}>Fixkosten ({filledFC.length})</span>
              <span style={{ fontWeight: 600, color: "var(--accent-2)" }}>€ {fmt(fcTotal)}</span>
            </div>
            <div style={{ height: 1, background: "var(--rule)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-2)", fontWeight: 600 }}>Verfügbar</span>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: "var(--accent)" }}>
                € {fmt(remaining)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button className="btn btn--ghost btn--small" onClick={back} aria-label="Zurück">←</button>
            <button className="btn btn--primary" onClick={next}>Fertig 🎉</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Category Icon renderer ── */
function CatIcon({ cat, size = 40 }) {
  return (
    <div className="tx__icon" style={{ width: size, height: size, background: cat.color }} aria-hidden="true">
      {getIcon(cat.icon)}
    </div>
  );
}

/* ── Category Picker ── */
function CatPicker({ categories, selected, onSelect }) {
  return (
    <div className="cat-grid" role="radiogroup" aria-label="Kategorie wählen">
      {categories.map((c) => (
        <button key={c.id} className={`cat-btn ${selected === c.id ? "cat-btn--on" : ""}`}
          onClick={() => onSelect(c.id)} role="radio" aria-checked={selected === c.id} aria-label={c.name}>
          <div className="cat-btn__icon">{getIcon(c.icon)}</div>
          <div className="cat-btn__name">{c.name}</div>
        </button>
      ))}
    </div>
  );
}

/* ── Tag Input for Add Category ── */
function TagInput({ categories, onAdd, onRemove }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const customCats = categories.filter((c) => !defaultCategories.find((d) => d.id === c.id));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onAdd(value.trim());
      setValue("");
    }
    if (e.key === "Backspace" && !value && customCats.length > 0) {
      onRemove(customCats[customCats.length - 1].id);
    }
  };

  return (
    <div className="tag-input" onClick={() => inputRef.current?.focus()} role="group" aria-label="Eigene Kategorien">
      {customCats.map((c) => (
        <span key={c.id} className="tag">
          {icons.tag} {c.name}
          <button className="tag__remove" onClick={() => onRemove(c.id)} aria-label={`${c.name} entfernen`}>×</button>
        </span>
      ))}
      <input ref={inputRef} className="tag-input__field" value={value}
        onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown}
        placeholder={customCats.length ? "" : "Neue Kategorie + Enter"} aria-label="Kategorie hinzufügen" />
    </div>
  );
}

/* ── Notification Banner ── */
function NotifBanner({ data }) {
  const totalFC = data.fixedCosts.reduce((a, fc) => a + (fc.yearly ? fc.amount / 12 : fc.amount), 0);
  const budget = data.income - totalFC;
  const spent = data.transactions
    .filter((t) => isThisMonth(t.date) && t.type === "expense")
    .reduce((a, t) => a + t.amount, 0);
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const quote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  if (pct < data.budgetThreshold) return null;

  return (
    <div className="notif" role="alert">
      <div className="notif__icon">{icons.bell}</div>
      <div className="notif__text">
        <strong>{Math.round(pct)}% Budget verbraucht.</strong><br />
        {quote}
      </div>
    </div>
  );
}

/* ── Add Transaction Sheet ── */
function AddTxSheet({ open, onClose, data, setData }) {
  const safeCategories = Array.isArray(data.categories) && data.categories.length ? data.categories : defaultCategories;
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(safeCategories[0]?.id || "sonstiges");
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setType("expense");
    setAmount("");
    setTitle("");
    setCat(safeCategories[0]?.id || "sonstiges");
    setDate(getToday());
    setNote("");
  }, [open, safeCategories]);

  if (!open) return null;

  const save = () => {
    const amt = parseFloat(String(amount).replace(",", "."));
    if (!Number.isFinite(amt) || amt <= 0) return;
    if (!title.trim()) return;

    const selectedCat = safeCategories.some((c) => c.id === cat) ? cat : (safeCategories[0]?.id || "sonstiges");
    const nextTx = { id: uid(), type, amount: amt, title: title.trim(), date, cat: selectedCat, note: note.trim() };

    setData((prev) => {
      const prevTx = Array.isArray(prev.transactions) ? prev.transactions : [];
      const updated = { ...prev, transactions: [...prevTx, nextTx] };
      saveData(updated);
      return updated;
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-label="Buchung hinzufügen" aria-modal="true">
      <div className="sheet">
        <div className="sheet__handle" />
        <div className="sheet__title">Buchung hinzufügen</div>

        <div className="form-group">
          <label className="form-label" id="tx-type-label">Art der Buchung</label>
          <div className="seg seg--2" role="radiogroup" aria-labelledby="tx-type-label">
            <button className={`seg__opt ${type === "expense" ? "seg__opt--on" : ""}`} onClick={() => setType("expense")}
              role="radio" aria-checked={type === "expense"}>Ausgabe</button>
            <button className={`seg__opt ${type === "income" ? "seg__opt--on" : ""}`} onClick={() => setType("income")}
              role="radio" aria-checked={type === "income"}>Einnahme</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tx-amount-input">Betrag</label>
          <div className="input--amount">
            <span className="input--amount__symbol">€</span>
            <input id="tx-amount-input" className="input--amount__field" type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal" step="0.01"
              style={{ fontSize: 28 }} autoFocus />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tx-title-input">Bezeichnung</label>
          <input id="tx-title-input" className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Rewe, Tankstelle …" />
        </div>

        {type === "expense" && (
          <div className="form-group">
            <label className="form-label">Kategorie</label>
            <CatPicker categories={safeCategories} selected={cat} onSelect={setCat} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="tx-date-input">Datum</label>
          <input id="tx-date-input" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tx-note-input">Notiz (optional)</label>
          <input id="tx-note-input" className="input" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Optionale Notiz …" />
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <button className="btn btn--primary" onClick={save}>{icons.check} Speichern</button>
          <button className="btn btn--ghost" style={{ marginTop: 8 }} onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

/* ── Fixed Cost Sheet (Add/Edit) ── */
function FCSheet({ open, onClose, editItem, data, setData }) {
  const [name, setName] = useState(editItem?.name || "");
  const [amount, setAmount] = useState(editItem?.amount?.toString() || "");
  const [cat, setCat] = useState(editItem?.cat || data.categories[0]?.id || "miete");
  const [yearly, setYearly] = useState(editItem?.yearly || false);
  const [dueDay, setDueDay] = useState(editItem?.dueDay?.toString() || "1");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name); setAmount(editItem.amount.toString());
      setCat(editItem.cat); setYearly(editItem.yearly); setDueDay(editItem.dueDay.toString());
    } else {
      setName(""); setAmount(""); setCat(data.categories[0]?.id || "miete"); setYearly(false); setDueDay("1");
    }
  }, [editItem, open]);

  if (!open) return null;

  const save = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) return;
    let updated;
    if (editItem) {
      updated = {
        ...data,
        fixedCosts: data.fixedCosts.map((fc) =>
          fc.id === editItem.id ? { ...fc, name: name.trim(), amount: amt, cat, yearly, dueDay: parseInt(dueDay) || 1 } : fc
        ),
      };
    } else {
      updated = {
        ...data,
        fixedCosts: [...data.fixedCosts, { id: uid(), name: name.trim(), amount: amt, cat, yearly, dueDay: parseInt(dueDay) || 1 }],
      };
    }
    setData(updated);
    saveData(updated);
    onClose();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-label="Fixkosten bearbeiten" aria-modal="true">
      <div className="sheet">
        <div className="sheet__handle" />
        <div className="sheet__title">{editItem ? "Fixkosten bearbeiten" : "Fixkosten hinzufügen"}</div>

        <div className="form-group">
          <label className="form-label" htmlFor="fc-name">Name</label>
          <input id="fc-name" className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Miete, Netflix …" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fc-amount">Betrag</label>
          <div className="input--amount">
            <span className="input--amount__symbol">€</span>
            <input id="fc-amount" className="input--amount__field" type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0" inputMode="decimal" style={{ fontSize: 28 }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Rhythmus</label>
          <div className="seg seg--2">
            <button className={`seg__opt ${!yearly ? "seg__opt--on" : ""}`} onClick={() => setYearly(false)}>Monatlich</button>
            <button className={`seg__opt ${yearly ? "seg__opt--on" : ""}`} onClick={() => setYearly(true)}>Jährlich</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kategorie</label>
          <CatPicker categories={data.categories} selected={cat} onSelect={setCat} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fc-due">Fälligkeit (Tag)</label>
          <input id="fc-due" className="input" type="number" min="1" max="28" value={dueDay}
            onChange={(e) => setDueDay(e.target.value)} inputMode="numeric" />
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <button className="btn btn--primary" onClick={save}>{icons.check} Speichern</button>
          <button className="btn btn--ghost" style={{ marginTop: 8 }} onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

/* ── Goal Sheet ── */
function GoalSheet({ open, onClose, data, setData }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [cat, setCat] = useState("sparen");
  const saveCats = data.categories.filter((c) => ["sparen", "etf", "puffer", "sonstiges"].includes(c.id));

  if (!open) return null;

  const save = () => {
    const t = parseFloat(target);
    if (!name.trim() || !t || t <= 0) return;
    const updated = { ...data, goals: [...data.goals, { id: uid(), name: name.trim(), target: t, cat }] };
    setData(updated);
    saveData(updated);
    onClose();
    setName(""); setTarget("");
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-label="Sparziel hinzufügen" aria-modal="true">
      <div className="sheet">
        <div className="sheet__handle" />
        <div className="sheet__title">Sparziel hinzufügen</div>
        <div className="form-group">
          <label className="form-label" htmlFor="goal-name">Name</label>
          <input id="goal-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Notgroschen, Urlaub …" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="goal-target">Monatliches Ziel</label>
          <div className="input--amount">
            <span className="input--amount__symbol">€</span>
            <input id="goal-target" className="input--amount__field" type="number" value={target}
              onChange={(e) => setTarget(e.target.value)} placeholder="0" inputMode="decimal" style={{ fontSize: 28 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Kategorie</label>
          <CatPicker categories={saveCats.length ? saveCats : [data.categories.at(-1)]} selected={cat} onSelect={setCat} />
        </div>
        <div style={{ padding: "16px 24px 0" }}>
          <button className="btn btn--primary" onClick={save}>{icons.check} Speichern</button>
          <button className="btn btn--ghost" style={{ marginTop: 8 }} onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════

function HomeScreen({ data, setData, goTo, openAddTx, toggleTheme }) {
  const totalFC = useMemo(() => data.fixedCosts.reduce((a, fc) => a + (fc.yearly ? fc.amount / 12 : fc.amount), 0), [data.fixedCosts]);
  const budget = data.income - totalFC;
  const thisMonthTx = useMemo(() => data.transactions.filter((t) => isThisMonth(t.date)), [data.transactions]);
  const spent = useMemo(() => thisMonthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0), [thisMonthTx]);
  const recent = useMemo(() => [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [data.transactions]);
  const fcPct = Math.min((totalFC / Math.max(data.income, 1)) * 100, 100);

  return (
    <>
      <div className="topbar">
        <div className="topbar__inner">
          <div>
            <div className="topbar__greeting">{getGreeting()}{data.name ? `, ${data.name}` : ""}</div>
            <div className="topbar__title">Mein <em>Kassenbuch</em></div>
          </div>
          <div className="topbar__actions">
            <button className="topbar__btn" onClick={toggleTheme} aria-label="Theme umschalten">
              {data.theme === "dark" ? icons.moon : icons.sun}
            </button>
            <button className="topbar__btn" onClick={() => goTo("settings")} aria-label="Einstellungen">
              {icons.settings}
            </button>
          </div>
        </div>
      </div>

      <div className="scroll" role="main">
        <NotifBanner data={data} />

        {/* Hero Card */}
        <div className="glass hero" aria-label="Budget-Übersicht">
          <div className="hero__eyebrow">Verfügbares Budget</div>
          <div className="hero__amount">€ {fmt(budget)}</div>
          <div className="hero__sub">{monthLabel()}</div>
          <div className="hero__stats">
            <div className="hero__stat">
              <div className="hero__stat-label">Einnahmen</div>
              <div className="hero__stat-val c-pos">€{fmt(data.income)}</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-label">Fixkosten</div>
              <div className="hero__stat-val c-gold">€{fmt(totalFC)}</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-label">Ausgaben</div>
              <div className="hero__stat-val c-neg">€{fmt(spent)}</div>
            </div>
          </div>
        </div>

        {/* FC Progress */}
        <div className="glass" style={{ padding: 16, marginBottom: 16 }}>
          <div className="section" style={{ marginBottom: 8 }}>
            <div className="section__title">Fixkosten</div>
            <button className="section__link" onClick={() => goTo("fixedcosts")}>Verwalten →</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
            <span style={{ color: "var(--text-3)" }}>Monatlich</span>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: "var(--accent-2)" }}>€ {fmt(totalFC)}</span>
          </div>
          <div className="progress">
            <div className="progress__fill" style={{ width: `${fcPct}%`, background: "linear-gradient(90deg, var(--accent-2), var(--danger))" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 8, textAlign: "right" }}>{Math.round(fcPct)}% des Einkommens</div>
        </div>

        {/* Recent */}
        <div className="section">
          <div className="section__title">Letzte Buchungen</div>
          <button className="section__link" onClick={() => goTo("transactions")}>Alle →</button>
        </div>
        <div className="glass" style={{ padding: "4px 16px" }}>
          {recent.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">{icons.list}</div>
              <div className="empty__text">Noch keine Buchungen.<br />Tippe auf + um loszulegen.</div>
            </div>
          ) : (
            recent.map((t) => {
              const cat = data.categories.find((c) => c.id === t.cat) || data.categories.at(-1);
              return (
                <div className="tx" key={t.id}>
                  <CatIcon cat={cat} />
                  <div className="tx__info">
                    <div className="tx__name">{t.title}</div>
                    <div className="tx__meta">{cat.name}{t.note ? ` · ${t.note}` : ""}</div>
                  </div>
                  <div className="tx__right">
                    <div className={`tx__amount ${t.type === "expense" ? "c-neg" : "c-pos"}`}>
                      {t.type === "expense" ? "−" : "+"}€{fmt(t.amount)}
                    </div>
                    <div className="tx__date">{dateStr(t.date)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

function TransactionsScreen({ data, setData, openAddTx }) {
  const [filter, setFilter] = useState("all");
  const txs = useMemo(() => {
    let list = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filter === "expense") list = list.filter((t) => t.type === "expense");
    if (filter === "income") list = list.filter((t) => t.type === "income");
    return list;
  }, [data.transactions, filter]);

  const groups = useMemo(() => {
    const g = {};
    txs.forEach((t) => {
      const k = monthLabel(t.date);
      if (!g[k]) g[k] = [];
      g[k].push(t);
    });
    return g;
  }, [txs]);

  const del = (id) => {
    const updated = { ...data, transactions: data.transactions.filter((t) => t.id !== id) };
    setData(updated);
    saveData(updated);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar__inner">
          <div>
            <div className="topbar__greeting">Übersicht</div>
            <div className="topbar__title"><em>Buchungen</em></div>
          </div>
          <div className="topbar__actions">
            <button className="topbar__btn" onClick={openAddTx} aria-label="Buchung hinzufügen">{icons.plus}</button>
          </div>
        </div>
      </div>
      <div className="scroll">
        <div className="glass" style={{ padding: 4, marginBottom: 16 }}>
          <div className="seg seg--3" role="radiogroup" aria-label="Filter">
            {[["all", "Alle"], ["expense", "Ausgaben"], ["income", "Einnahmen"]].map(([f, label]) => (
              <button key={f} className={`seg__opt ${filter === f ? "seg__opt--on" : ""}`}
                onClick={() => setFilter(f)} role="radio" aria-checked={filter === f}>{label}</button>
            ))}
          </div>
        </div>
        {txs.length === 0 ? (
          <div className="glass" style={{ padding: 0 }}>
            <div className="empty"><div className="empty__icon">{icons.list}</div><div className="empty__text">Keine Buchungen.</div></div>
          </div>
        ) : (
          Object.entries(groups).map(([month, list]) => (
            <div key={month} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, fontStyle: "italic", color: "var(--text-3)", marginBottom: 8, padding: "0 4px" }}>
                {month}
              </div>
              <div className="glass" style={{ padding: "4px 16px" }}>
                {list.map((t) => {
                  const cat = data.categories.find((c) => c.id === t.cat) || data.categories.at(-1);
                  return (
                    <div className="tx" key={t.id}>
                      <CatIcon cat={cat} />
                      <div className="tx__info">
                        <div className="tx__name">{t.title}</div>
                        <div className="tx__meta">{cat.name}{t.note ? ` · ${t.note}` : ""}</div>
                      </div>
                      <div className="tx__right">
                        <div className={`tx__amount ${t.type === "expense" ? "c-neg" : "c-pos"}`}>
                          {t.type === "expense" ? "−" : "+"}€{fmt(t.amount)}
                        </div>
                        <div className="tx__date">{dateStr(t.date)}</div>
                      </div>
                      <div className="tx__actions">
                        <button className="tx__action-btn" onClick={() => del(t.id)} aria-label="Löschen">{icons.trash}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function SavingsScreen({ data, setData }) {
  const [goalOpen, setGoalOpen] = useState(false);
  const saveCats = ["sparen", "etf", "puffer", "sonstiges"];
  const thisMonthTx = useMemo(() => data.transactions.filter((t) => isThisMonth(t.date)), [data.transactions]);
  const saved = useMemo(() => thisMonthTx.filter((t) => saveCats.includes(t.cat)).reduce((a, t) => a + t.amount, 0), [thisMonthTx]);
  const target = useMemo(() => data.goals.reduce((a, g) => a + g.target, 0), [data.goals]);
  const pct = Math.min((saved / Math.max(target, 1)) * 100, 100);

  const months = useMemo(() => {
    const ms = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const mtx = data.transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      const sv = mtx.filter((t) => saveCats.includes(t.cat)).reduce((a, t) => a + t.amount, 0);
      ms.push({ label: d.toLocaleDateString("de-DE", { month: "short" }), value: sv });
    }
    return ms;
  }, [data.transactions]);

  const maxMonth = Math.max(...months.map((m) => m.value), 1);

  const delGoal = (id) => {
    const updated = { ...data, goals: data.goals.filter((g) => g.id !== id) };
    setData(updated); saveData(updated);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar__inner">
          <div>
            <div className="topbar__greeting">Meine Ziele</div>
            <div className="topbar__title"><em>Sparplan</em></div>
          </div>
          <div className="topbar__actions">
            <button className="topbar__btn" onClick={() => setGoalOpen(true)} aria-label="Sparziel hinzufügen">{icons.plus}</button>
          </div>
        </div>
      </div>
      <div className="scroll">
        <div className="glass hero" style={{ marginBottom: 16 }}>
          <div className="hero__eyebrow">Gespart diesen Monat</div>
          <div className="hero__amount c-pos">€ {fmt(saved)}</div>
          <div className="hero__sub">Ziel: € {fmt(target)} / Monat</div>
          <div className="progress" style={{ height: 6 }}>
            <div className="progress__fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }} />
          </div>
        </div>

        {data.goals.length === 0 ? (
          <div className="glass" style={{ padding: 0 }}>
            <div className="empty"><div className="empty__icon">{icons.trending}</div><div className="empty__text">Keine Sparziele.<br />Tippe + um eines hinzuzufügen.</div></div>
          </div>
        ) : (
          data.goals.map((g) => {
            const cat = data.categories.find((c) => c.id === g.cat) || data.categories.at(-1);
            const sv = thisMonthTx.filter((t) => t.cat === g.cat).reduce((a, t) => a + t.amount, 0);
            const p = Math.min((sv / Math.max(g.target, 1)) * 100, 100);
            const done = p >= 100;
            return (
              <div className="glass goal-card" key={g.id}>
                <div className="goal-card__top">
                  <div className="goal-card__icon"><CatIcon cat={cat} size={36} /></div>
                  <div className="goal-card__info">
                    <div className="goal-card__name">{g.name} {done ? "✅" : ""}</div>
                    <div className="goal-card__sub">Ziel: €{fmt(g.target)}/Monat</div>
                  </div>
                  <div>
                    <div className="goal-card__amounts">€{fmt(sv)}</div>
                    <button className="tx__action-btn" style={{ float: "right", marginTop: 2 }}
                      onClick={() => delGoal(g.id)} aria-label={`${g.name} löschen`}>{icons.trash}</button>
                  </div>
                </div>
                <div className="progress">
                  <div className="progress__fill" style={{ width: `${p}%`, background: done ? "var(--accent)" : cat.color }} />
                </div>
                <div className="goal-card__foot">{done ? "Ziel erreicht! 🎉" : `Noch €${fmt(Math.max(g.target - sv, 0))} bis zum Ziel`}</div>
              </div>
            );
          })
        )}

        <div className="section" style={{ marginTop: 16 }}>
          <div className="section__title">Jahresverlauf</div>
        </div>
        <div className="glass" style={{ padding: 16 }}>
          <div className="year-chart">
            {months.map((m, i) => {
              const h = Math.max((m.value / maxMonth) * 60, m.value > 0 ? 8 : 4);
              return (
                <div className="year-chart__bar-wrap" key={i}>
                  <div className="year-chart__bar" style={{
                    height: h, background: m.value > 0 ? "linear-gradient(to top, var(--accent), var(--accent-2))" : "var(--rule)"
                  }} />
                  <div className="year-chart__label">{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <GoalSheet open={goalOpen} onClose={() => setGoalOpen(false)} data={data} setData={setData} />
    </>
  );
}

function FixedCostsScreen({ data, setData }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const total = useMemo(() => data.fixedCosts.reduce((a, fc) => a + (fc.yearly ? fc.amount / 12 : fc.amount), 0), [data.fixedCosts]);
  const pct = Math.min((total / Math.max(data.income, 1)) * 100, 100);

  const del = (id) => {
    const updated = { ...data, fixedCosts: data.fixedCosts.filter((f) => f.id !== id) };
    setData(updated); saveData(updated);
  };

  const openEdit = (fc) => { setEditItem(fc); setSheetOpen(true); };
  const openNew = () => { setEditItem(null); setSheetOpen(true); };

  return (
    <>
      <div className="topbar">
        <div className="topbar__inner">
          <div>
            <div className="topbar__greeting">Monatlich</div>
            <div className="topbar__title"><em>Fixkosten</em></div>
          </div>
          <div className="topbar__actions">
            <button className="topbar__btn" onClick={openNew} aria-label="Fixkosten hinzufügen">{icons.plus}</button>
          </div>
        </div>
      </div>
      <div className="scroll">
        <div className="glass" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Gesamt / Monat</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, fontWeight: 400, color: "var(--accent-2)" }}>€ {fmt(total)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>vom Einkommen</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: "var(--danger)" }}>{Math.round(pct)}%</div>
            </div>
          </div>
          <div className="progress" style={{ marginTop: 8 }}>
            <div className="progress__fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent-2), var(--danger))" }} />
          </div>
        </div>

        <div className="glass" style={{ padding: "4px 0" }}>
          {data.fixedCosts.length === 0 ? (
            <div className="empty"><div className="empty__icon">{icons.repeat}</div><div className="empty__text">Noch keine Fixkosten.</div></div>
          ) : (
            data.fixedCosts.map((fc) => {
              const cat = data.categories.find((c) => c.id === fc.cat) || data.categories.at(-1);
              const amt = fc.yearly ? fc.amount / 12 : fc.amount;
              return (
                <div className="fc" key={fc.id}>
                  <div className="fc__icon"><CatIcon cat={cat} size={36} /></div>
                  <div className="fc__info">
                    <div className="fc__name">{fc.name}</div>
                    <div className="fc__due">Am {fc.dueDay}. · {fc.yearly ? "Jährlich (÷12)" : "Monatlich"}</div>
                  </div>
                  <div className="fc__amount">€{fmt(amt)}</div>
                  <div className="tx__actions">
                    <button className="tx__action-btn" onClick={() => openEdit(fc)} aria-label={`${fc.name} bearbeiten`}>{icons.edit}</button>
                    <button className="tx__action-btn" onClick={() => del(fc.id)} aria-label={`${fc.name} löschen`}>{icons.trash}</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <FCSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditItem(null); }}
        editItem={editItem} data={data} setData={setData} />
    </>
  );
}

function SettingsScreen({ data, setData, toggleTheme }) {
  const handleAddCategory = (name) => {
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + uid().slice(-3);
    const colors = ["#E57373", "#FFA726", "#9575CD", "#5C6BC0", "#42A5F5", "#26C6DA", "#66BB6A", "#FFCA28"];
    const color = colors[data.categories.length % colors.length];
    const updated = { ...data, categories: [...data.categories, { id, name, icon: "star", color }] };
    setData(updated); saveData(updated);
  };

  const handleRemoveCategory = (id) => {
    const updated = { ...data, categories: data.categories.filter((c) => c.id !== id) };
    setData(updated); saveData(updated);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `budgetsnap-${getToday()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const handleDelete = () => {
    if (confirm("Wirklich ALLE Daten unwiderruflich löschen?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar__inner">
          <div>
            <div className="topbar__greeting">BudgetSnap</div>
            <div className="topbar__title"><em>Einstellungen</em></div>
          </div>
        </div>
      </div>
      <div className="scroll">
        {/* Income */}
        <div className="settings-section">
          <div className="settings-label">Einkommen</div>
          <div className="glass" style={{ padding: 16 }}>
            <label className="form-label" htmlFor="set-income">Monatliches Nettoeinkommen</label>
            <div className="input--amount">
              <span className="input--amount__symbol">€</span>
              <input id="set-income" className="input--amount__field" type="number" value={data.income}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v > 0) { const u = { ...data, income: v }; setData(u); saveData(u); }
                }}
                inputMode="decimal" style={{ fontSize: 24 }} aria-label="Einkommen" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="settings-section">
          <div className="settings-label">Kategorien verwalten</div>
          <div className="glass" style={{ padding: 16 }}>
            <TagInput categories={data.categories} onAdd={handleAddCategory} onRemove={handleRemoveCategory} />
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8, fontStyle: "italic" }}>
              Tippe Enter zum Hinzufügen, Backspace zum Entfernen
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="settings-section">
          <div className="settings-label">Darstellung</div>
          <div className="glass" style={{ padding: 16 }}>
            <div className="seg seg--2">
              <button className={`seg__opt ${data.theme === "light" ? "seg__opt--on" : ""}`}
                onClick={() => { toggleTheme("light"); }}>{icons.sun} Hell</button>
              <button className={`seg__opt ${data.theme === "dark" ? "seg__opt--on" : ""}`}
                onClick={() => { toggleTheme("dark"); }}>{icons.moon} Dunkel</button>
            </div>
          </div>
        </div>

        {/* Push */}
        <div className="settings-section">
          <div className="settings-label">Benachrichtigungen</div>
          <div className="glass" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Budget-Erinnerung</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  Warnung bei &gt;{data.budgetThreshold}% verbraucht
                </div>
              </div>
              <button className={`toggle ${data.pushEnabled ? "toggle--on" : ""}`}
                onClick={() => {
                  const u = { ...data, pushEnabled: !data.pushEnabled };
                  setData(u); saveData(u);
                }}
                role="switch" aria-checked={data.pushEnabled} aria-label="Push-Benachrichtigungen" />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="settings-section">
          <div className="settings-label">Datenschutz</div>
          <div className="glass" style={{ padding: 16 }}>
            {["Alle Daten lokal auf deinem Gerät", "Keine Server, keine Cloud", "Kein Account, kein Tracking", "DSGVO-konform"].map((t) => (
              <div key={t} style={{ fontSize: 12, color: "var(--text-2)", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent)" }}>{icons.check}</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="settings-section">
          <div className="settings-label">Daten</div>
          <div className="glass" style={{ overflow: "hidden" }}>
            <button className="set-row" onClick={handleExport}>
              <div className="set-row__icon">{icons.download}</div>
              <div className="set-row__info">
                <div className="set-row__title">JSON Export</div>
                <div className="set-row__sub">Daten als JSON sichern</div>
              </div>
              <div style={{ color: "var(--text-3)" }}>{icons.chevron}</div>
            </button>
            <div style={{ height: 1, background: "var(--rule)", margin: "0 16px" }} />
            <button className="set-row" onClick={handlePrint}>
              <div className="set-row__icon">{icons.download}</div>
              <div className="set-row__info">
                <div className="set-row__title">PDF / Drucken</div>
                <div className="set-row__sub">Monatsbericht drucken</div>
              </div>
              <div style={{ color: "var(--text-3)" }}>{icons.chevron}</div>
            </button>
            <div style={{ height: 1, background: "var(--rule)", margin: "0 16px" }} />
            <button className="set-row" onClick={handleDelete} style={{ color: "var(--danger)" }}>
              <div className="set-row__icon" style={{ color: "var(--danger)" }}>{icons.trash}</div>
              <div className="set-row__info">
                <div className="set-row__title" style={{ color: "var(--danger)" }}>Alle Daten löschen</div>
                <div className="set-row__sub">Recht auf Vergessenwerden</div>
              </div>
              <div style={{ color: "var(--danger)" }}>{icons.chevron}</div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="glass" style={{ padding: 24, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400, fontStyle: "italic", marginBottom: 4 }}>BudgetSnap</div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>Version 3.0 · React + TypeScript</div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function BudgetSnap() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState("home");
  const [addTxOpen, setAddTxOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", data.theme);
  }, [data.theme]);

  const toggleTheme = useCallback((explicit) => {
    const next = explicit || (data.theme === "dark" ? "light" : "dark");
    const updated = { ...data, theme: next };
    setData(updated);
    saveData(updated);
  }, [data]);

  const goTo = useCallback((t) => setTab(t), []);

  if (!data.wizardDone) {
    return (
      <>
        <style>{styles}</style>
        <div className="app-root">
          <Wizard onComplete={(wizardData) => {
            const updated = {
              ...data,
              ...wizardData,
              wizardDone: true,
              fixedCosts: wizardData.fixedCosts && wizardData.fixedCosts.length
                ? wizardData.fixedCosts
                : [
                    { id: uid(), name: "Miete", amount: 850, cat: "miete", yearly: false, dueDay: 1 },
                    { id: uid(), name: "Abos", amount: 50, cat: "abos", yearly: false, dueDay: 1 },
                  ],
              goals: data.goals.length ? data.goals : [
                { id: uid(), name: "Notgroschen", target: 300, cat: "sparen" },
                { id: uid(), name: "ETF / Altersvorsorge", target: 150, cat: "etf" },
              ],
            };
            setData(updated);
            saveData(updated);
          }} />
        </div>
      </>
    );
  }

  const navItems = [
    { id: "home", label: "Home", icon: icons.home },
    { id: "transactions", label: "Buchungen", icon: icons.list },
    { id: "savings", label: "Sparen", icon: icons.chart },
    { id: "fixedcosts", label: "Fixkosten", icon: icons.repeat },
    { id: "settings", label: "Einst.", icon: icons.settings },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app-root">
        <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
          {tab === "home" && <HomeScreen data={data} setData={setData} goTo={goTo} openAddTx={() => setAddTxOpen(true)} toggleTheme={toggleTheme} />}
          {tab === "transactions" && <TransactionsScreen data={data} setData={setData} openAddTx={() => setAddTxOpen(true)} />}
          {tab === "savings" && <SavingsScreen data={data} setData={setData} />}
          {tab === "fixedcosts" && <FixedCostsScreen data={data} setData={setData} />}
          {tab === "settings" && <SettingsScreen data={data} setData={setData} toggleTheme={toggleTheme} />}
        </div>

        {/* Bottom Nav */}
        <nav className="nav" role="tablist" aria-label="Navigation">
          {navItems.map((n) => (
            <button key={n.id} className={`nav__item ${tab === n.id ? "nav__item--active" : ""}`}
              onClick={() => setTab(n.id)} role="tab" aria-selected={tab === n.id} aria-label={n.label}>
              <div className="nav__icon">{n.icon}</div>
              <div className="nav__label">{n.label}</div>
            </button>
          ))}
        </nav>

        {/* FAB */}
        {tab !== "settings" && (
          <button className="fab" onClick={() => setAddTxOpen(true)} aria-label="Buchung hinzufügen">
            {icons.plus}
          </button>
        )}

        {/* Add Transaction Sheet */}
        <AddTxSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} data={data} setData={setData} />

        <span className="sr-only" role="status" aria-live="polite">BudgetSnap Finanz-Tracker geladen</span>
      </div>
    </>
  );
}
