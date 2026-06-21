"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { recogniseFood } from "../actions";
import type {
  Goals,
  Entry,
  Food,
  BuiltinFood,
  Totals,
  MacroKey,
} from "../types";

/* ------------------------------------------------------------------ *
 *  MAKAN — a calorie tracker built around Malaysian food.
 *  Photo recognition runs through a Server Action (key stays server-side).
 * ------------------------------------------------------------------ */

const GOAL_DEFAULT: Goals = { calories: 2450, protein: 140, carbs: 300, fat: 70 };

const CATS = ["Local", "Mamak", "Fast Food", "Drinks", "Snack"];

const BUILTIN: BuiltinFood[] = (
  [
    { name: "Nasi Lemak", cat: "Local", emoji: "🍚", kcal: 494, p: 14, c: 80, f: 15, serving: "1 plate" },
    { name: "Nasi Lemak Ayam Goreng", cat: "Local", emoji: "🍗", kcal: 720, p: 38, c: 82, f: 28, serving: "1 plate" },
    { name: "Nasi Goreng Kampung", cat: "Local", emoji: "🍚", kcal: 636, p: 20, c: 88, f: 22, serving: "1 plate" },
    { name: "Nasi Goreng Ayam", cat: "Local", emoji: "🍚", kcal: 650, p: 26, c: 85, f: 22, serving: "1 plate" },
    { name: "Nasi Kandar (ayam + sayur)", cat: "Local", emoji: "🍛", kcal: 880, p: 42, c: 95, f: 35, serving: "1 plate" },
    { name: "Nasi Campur", cat: "Local", emoji: "🍛", kcal: 700, p: 28, c: 85, f: 28, serving: "1 plate" },
    { name: "Nasi Ayam (Chicken Rice)", cat: "Local", emoji: "🍗", kcal: 607, p: 30, c: 70, f: 22, serving: "1 plate" },
    { name: "Char Siew Rice", cat: "Local", emoji: "🍚", kcal: 600, p: 28, c: 78, f: 20, serving: "1 plate" },
    { name: "Banana Leaf Rice", cat: "Local", emoji: "🍛", kcal: 715, p: 20, c: 100, f: 26, serving: "1 set" },
    { name: "Char Kway Teow", cat: "Local", emoji: "🍜", kcal: 744, p: 24, c: 80, f: 35, serving: "1 plate" },
    { name: "Wantan Mee", cat: "Local", emoji: "🍜", kcal: 512, p: 22, c: 70, f: 15, serving: "1 plate" },
    { name: "Curry Laksa", cat: "Local", emoji: "🍲", kcal: 590, p: 20, c: 60, f: 30, serving: "1 bowl" },
    { name: "Asam Laksa", cat: "Local", emoji: "🍲", kcal: 400, p: 18, c: 62, f: 8, serving: "1 bowl" },
    { name: "Bak Kut Teh", cat: "Local", emoji: "🍲", kcal: 480, p: 35, c: 12, f: 30, serving: "1 set" },
    { name: "Mee Goreng Mamak", cat: "Mamak", emoji: "🍜", kcal: 660, p: 18, c: 90, f: 24, serving: "1 plate" },
    { name: "Maggi Goreng", cat: "Mamak", emoji: "🍜", kcal: 600, p: 18, c: 78, f: 24, serving: "1 plate" },
    { name: "Roti Canai", cat: "Mamak", emoji: "🫓", kcal: 301, p: 7, c: 40, f: 12, serving: "1 pc" },
    { name: "Roti Telur", cat: "Mamak", emoji: "🫓", kcal: 390, p: 12, c: 44, f: 18, serving: "1 pc" },
    { name: "Capati", cat: "Mamak", emoji: "🫓", kcal: 240, p: 7, c: 40, f: 6, serving: "1 pc" },
    { name: "Thosai", cat: "Mamak", emoji: "🫓", kcal: 170, p: 4, c: 33, f: 3, serving: "1 pc" },
    { name: "Murtabak Ayam", cat: "Mamak", emoji: "🫓", kcal: 511, p: 24, c: 50, f: 24, serving: "1 pc" },
    { name: "Roti John", cat: "Mamak", emoji: "🥖", kcal: 500, p: 22, c: 45, f: 26, serving: "1 pc" },
    { name: "Satay Ayam", cat: "Mamak", emoji: "🍢", kcal: 54, p: 5, c: 2, f: 3, serving: "1 stick" },
    { name: "Ayam Goreng McD", cat: "Fast Food", emoji: "🍗", kcal: 280, p: 18, c: 12, f: 18, serving: "1 pc" },
    { name: "McChicken", cat: "Fast Food", emoji: "🍔", kcal: 400, p: 14, c: 40, f: 20, serving: "1 burger" },
    { name: "Big Mac", cat: "Fast Food", emoji: "🍔", kcal: 540, p: 25, c: 45, f: 28, serving: "1 burger" },
    { name: "Spicy Chicken McDeluxe", cat: "Fast Food", emoji: "🍔", kcal: 543, p: 27, c: 46, f: 29, serving: "1 burger" },
    { name: "McD Fries (Medium)", cat: "Fast Food", emoji: "🍟", kcal: 337, p: 4, c: 44, f: 16, serving: "medium" },
    { name: "Filet-O-Fish", cat: "Fast Food", emoji: "🍔", kcal: 329, p: 15, c: 39, f: 13, serving: "1 burger" },
    { name: "KFC Original Chicken", cat: "Fast Food", emoji: "🍗", kcal: 280, p: 20, c: 8, f: 18, serving: "1 pc" },
    { name: "KFC Zinger Burger", cat: "Fast Food", emoji: "🍔", kcal: 450, p: 23, c: 44, f: 20, serving: "1 burger" },
    { name: "KFC Cheezy Wedges", cat: "Fast Food", emoji: "🍟", kcal: 290, p: 6, c: 30, f: 16, serving: "1 reg" },
    { name: "Marrybrown Fried Chicken", cat: "Fast Food", emoji: "🍗", kcal: 290, p: 19, c: 10, f: 19, serving: "1 pc" },
    { name: "Texas Chicken", cat: "Fast Food", emoji: "🍗", kcal: 300, p: 20, c: 11, f: 20, serving: "1 pc" },
    { name: "A&W Coney Dog", cat: "Fast Food", emoji: "🌭", kcal: 340, p: 12, c: 30, f: 19, serving: "1 pc" },
    { name: "Pizza Hut Slice", cat: "Fast Food", emoji: "🍕", kcal: 270, p: 11, c: 30, f: 11, serving: "1 slice" },
    { name: 'Subway Chicken 6"', cat: "Fast Food", emoji: "🥪", kcal: 350, p: 24, c: 46, f: 8, serving: "6-inch" },
    { name: "Teh Tarik", cat: "Drinks", emoji: "🥤", kcal: 130, p: 3, c: 20, f: 4, serving: "1 glass" },
    { name: "Kopi O", cat: "Drinks", emoji: "☕", kcal: 60, p: 0, c: 15, f: 0, serving: "1 glass" },
    { name: "Milo Ais", cat: "Drinks", emoji: "🥤", kcal: 180, p: 5, c: 30, f: 5, serving: "1 glass" },
    { name: "Teh O Ais Limau", cat: "Drinks", emoji: "🥤", kcal: 90, p: 0, c: 22, f: 0, serving: "1 glass" },
    { name: "Sirap Bandung", cat: "Drinks", emoji: "🥤", kcal: 200, p: 3, c: 38, f: 5, serving: "1 glass" },
    { name: "Cendol", cat: "Snack", emoji: "🍧", kcal: 280, p: 3, c: 45, f: 10, serving: "1 bowl" },
    { name: "Ais Kacang (ABC)", cat: "Snack", emoji: "🍧", kcal: 300, p: 4, c: 55, f: 8, serving: "1 bowl" },
    { name: "Kuih (assorted)", cat: "Snack", emoji: "🍡", kcal: 120, p: 1, c: 20, f: 4, serving: "1 pc" },
    { name: "Pisang Goreng", cat: "Snack", emoji: "🍌", kcal: 180, p: 2, c: 26, f: 8, serving: "1 pc" },
    { name: "Apam Balik", cat: "Snack", emoji: "🥞", kcal: 350, p: 6, c: 50, f: 14, serving: "1 pc" },
    { name: "Karipap (Curry Puff)", cat: "Snack", emoji: "🥟", kcal: 130, p: 3, c: 15, f: 7, serving: "1 pc" },
  ] as Omit<BuiltinFood, "id">[]
).map((x, i) => ({ id: "b" + i, ...x }));

/* ----------------------------- storage ---------------------------- */
const store = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const v = window.localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode */
    }
  },
};

/* ----------------------------- helpers ---------------------------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const r0 = (n: number) => Math.round(n);
const uid = () => Math.random().toString(36).slice(2, 9);

function prettyDate(d: Date): string {
  const today = toKey(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (toKey(d) === today) return "Today";
  if (toKey(d) === toKey(y)) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** Downscale a photo client-side -> smaller upload, faster recog, and HEIC->JPEG. */
function resizeImage(file: File, max = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > height && width > max) {
        height = (height * max) / width;
        width = max;
      } else if (height > max) {
        width = (width * max) / height;
        height = max;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = url;
  });
}

/* ----------------------------- styles ----------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap');

.mk * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
.mk {
  --paper:#FBF8F1; --paper2:#F4EEE1; --card:#FFFFFF;
  --ink:#231F1A; --soft:#857B6E; --line:#EAE2D2;
  --pandan:#157F58; --pandan-d:#0E5C40; --pandan-s:#DBEBDF;
  --turmeric:#E0A33C; --clay:#C8663F; --sambal:#D23B2A;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink);
  background:var(--paper); position:relative; width:100%; min-height:100%;
  max-width:480px; margin:0 auto; overflow:hidden;
  -webkit-font-smoothing:antialiased;
}
.mk-scroll { height:100%; min-height:100dvh; overflow-y:auto; padding-bottom:108px; }
.disp { font-family:'Bricolage Grotesque',sans-serif; font-feature-settings:"tnum"; }
.tnum { font-variant-numeric: tabular-nums; }

.hd { position:sticky; top:0; z-index:20; background:rgba(251,248,241,.86);
  backdrop-filter:blur(12px); border-bottom:1px solid var(--line);
  padding:calc(14px + env(safe-area-inset-top,0px)) 18px 12px; }
.hd-row { display:flex; align-items:center; justify-content:space-between; }
.brand { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:22px;
  letter-spacing:-.02em; display:flex; align-items:center; gap:7px; }
.brand .dot { width:9px; height:9px; border-radius:3px; background:var(--pandan); transform:rotate(45deg); }
.gear { width:38px; height:38px; border-radius:11px; border:1px solid var(--line);
  background:var(--card); display:grid; place-items:center; cursor:pointer; font-size:16px; }
.gear:active { transform:scale(.94); }

.datenav { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:12px; }
.datenav button { width:30px; height:30px; border-radius:9px; border:1px solid var(--line);
  background:var(--card); cursor:pointer; color:var(--soft); font-size:15px; display:grid; place-items:center; }
.datenav button:disabled { opacity:.3; cursor:default; }
.datenav .lbl { font-weight:700; font-size:15px; min-width:118px; text-align:center; }

.hero { padding:26px 18px 6px; display:flex; flex-direction:column; align-items:center; }
.ringwrap { position:relative; width:236px; height:236px; }
.ringwrap .center { position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; }
.bignum { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:58px;
  line-height:1; letter-spacing:-.03em; font-variant-numeric:tabular-nums; }
.biglbl { font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--soft);
  margin-top:8px; font-weight:600; }
.eaten-row { display:flex; gap:26px; margin-top:20px; }
.eaten-row .cell { text-align:center; }
.eaten-row .v { font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:19px;
  font-variant-numeric:tabular-nums; }
.eaten-row .k { font-size:11px; color:var(--soft); letter-spacing:.08em; text-transform:uppercase;
  margin-top:3px; font-weight:600; }
.eaten-row .sep { width:1px; background:var(--line); }

.macros { padding:22px 18px 4px; display:flex; flex-direction:column; gap:16px; }
.macro .top { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:7px; }
.macro .nm { font-weight:700; font-size:14px; display:flex; align-items:center; gap:7px; }
.macro .nm .tag { width:9px; height:9px; border-radius:3px; }
.macro .amt { font-size:13px; color:var(--soft); font-variant-numeric:tabular-nums; font-weight:600; }
.macro .amt b { color:var(--ink); font-weight:700; }
.bar { height:9px; border-radius:6px; background:var(--paper2); overflow:hidden; }
.bar > span { display:block; height:100%; border-radius:6px; transition:width .45s cubic-bezier(.4,0,.2,1); }
.macro.hero-macro .nm { font-size:15px; }
.checkmark { color:var(--pandan); font-size:12px; }

.shead { display:flex; align-items:center; justify-content:space-between; padding:26px 20px 10px; }
.shead h3 { font-size:12px; letter-spacing:.13em; text-transform:uppercase; color:var(--soft); font-weight:700; }
.shead .ct { font-size:12px; color:var(--soft); font-weight:600; font-variant-numeric:tabular-nums; }

.list { padding:0 14px; display:flex; flex-direction:column; gap:8px; }
.frow { display:flex; align-items:center; gap:12px; background:var(--card);
  border:1px solid var(--line); border-radius:16px; padding:12px 14px; cursor:pointer; }
.frow:active { transform:scale(.985); }
.frow .em { font-size:23px; width:34px; text-align:center; flex-shrink:0; }
.frow .mid { flex:1; min-width:0; }
.frow .nm { font-weight:600; font-size:14.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.frow .sub { font-size:12px; color:var(--soft); margin-top:2px; font-variant-numeric:tabular-nums; }
.frow .kc { text-align:right; flex-shrink:0; }
.frow .kc .n { font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:16px;
  font-variant-numeric:tabular-nums; }
.frow .kc .u { font-size:10px; color:var(--soft); letter-spacing:.05em; }

.empty { text-align:center; padding:34px 30px; color:var(--soft); }
.empty .big { font-size:34px; margin-bottom:10px; }
.empty .t { font-weight:700; color:var(--ink); font-size:15px; }
.empty .d { font-size:13px; margin-top:5px; line-height:1.5; }

.nav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:480px;
  z-index:30; display:flex; align-items:flex-end; justify-content:space-around;
  background:rgba(251,248,241,.9); backdrop-filter:blur(14px);
  border-top:1px solid var(--line); padding:10px 24px calc(14px + env(safe-area-inset-bottom,0px)); }
.nav .tab { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;
  color:var(--soft); font-size:11px; font-weight:600; flex:1; }
.nav .tab.on { color:var(--pandan); }
.nav .tab .ic { font-size:21px; }
.add-fab { width:60px; height:60px; border-radius:20px; background:var(--pandan);
  color:#fff; border:none; display:grid; place-items:center; cursor:pointer;
  box-shadow:0 8px 20px -6px rgba(21,127,88,.6); margin-top:-22px; flex-shrink:0;
  font-size:30px; font-weight:300; transition:transform .15s; }
.add-fab:active { transform:scale(.92); }

.scrim { position:fixed; inset:0; background:rgba(35,31,26,.42); z-index:40;
  display:flex; align-items:flex-end; justify-content:center; animation:fade .2s; }
@keyframes fade { from{opacity:0} to{opacity:1} }
.sheet { width:100%; max-width:480px; background:var(--paper); border-radius:26px 26px 0 0;
  max-height:92dvh; display:flex; flex-direction:column; animation:rise .26s cubic-bezier(.2,.8,.2,1); }
@keyframes rise { from{transform:translateY(100%)} to{transform:translateY(0)} }
.sheet-grab { width:38px; height:4px; border-radius:3px; background:var(--line); margin:10px auto 4px; }
.sheet-hd { display:flex; align-items:center; justify-content:space-between; padding:8px 18px 12px; }
.sheet-hd h2 { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:20px; letter-spacing:-.02em; }
.sheet-hd .x { width:34px; height:34px; border-radius:10px; border:1px solid var(--line);
  background:var(--card); display:grid; place-items:center; cursor:pointer; font-size:15px; color:var(--soft); }
.sheet-body { overflow-y:auto; padding:0 18px 26px; }

.seg { display:flex; gap:4px; background:var(--paper2); border-radius:13px; padding:4px; margin:0 18px 16px; }
.seg button { flex:1; border:none; background:transparent; padding:9px 0; border-radius:10px;
  font-weight:600; font-size:13px; color:var(--soft); cursor:pointer; font-family:inherit; }
.seg button.on { background:var(--card); color:var(--ink); box-shadow:0 1px 4px rgba(0,0,0,.06); }

.preview { width:100%; border-radius:18px; max-height:230px; object-fit:cover; }
.scanning { display:flex; flex-direction:column; align-items:center; gap:14px; padding:22px; }
.spinner { width:34px; height:34px; border-radius:50%; border:3px solid var(--pandan-s);
  border-top-color:var(--pandan); animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg) } }

.field { margin-bottom:13px; }
.field label { display:block; font-size:12px; font-weight:600; color:var(--soft); margin-bottom:6px; letter-spacing:.02em; }
.field input { width:100%; border:1px solid var(--line); background:var(--card); border-radius:13px;
  padding:13px 14px; font-size:15px; font-family:inherit; color:var(--ink); outline:none; }
.field input:focus { border-color:var(--pandan); }
.macro3 { display:flex; gap:9px; }
.macro3 .field { flex:1; }

.search-input { width:100%; border:1px solid var(--line); background:var(--card); border-radius:14px;
  padding:13px 14px 13px 40px; font-size:15px; font-family:inherit; outline:none; }
.search-wrap { position:relative; margin-bottom:12px; }
.search-wrap .si { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--soft); }
.chips { display:flex; gap:7px; overflow-x:auto; padding-bottom:4px; margin-bottom:12px; }
.chips::-webkit-scrollbar { display:none; }
.chip { white-space:nowrap; border:1px solid var(--line); background:var(--card); border-radius:99px;
  padding:7px 14px; font-size:13px; font-weight:600; color:var(--soft); cursor:pointer; }
.chip.on { background:var(--ink); color:var(--paper); border-color:var(--ink); }

.stepper { display:flex; align-items:center; gap:0; border:1px solid var(--line);
  border-radius:12px; overflow:hidden; background:var(--card); }
.stepper button { width:42px; height:42px; border:none; background:transparent; font-size:20px;
  cursor:pointer; color:var(--pandan); font-weight:600; }
.stepper button:active { background:var(--paper2); }
.stepper .val { min-width:60px; text-align:center; font-weight:700; font-variant-numeric:tabular-nums; font-size:15px; }

.recog-card { background:var(--card); border:1px solid var(--line); border-radius:16px; padding:14px; margin-bottom:10px; }
.recog-card .top { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.recog-card .nm { font-weight:700; font-size:15px; }
.recog-card .por { font-size:12px; color:var(--soft); margin-top:2px; }
.recog-card .mline { display:flex; gap:14px; margin-top:10px; font-size:12px; color:var(--soft); font-variant-numeric:tabular-nums; }
.recog-card .mline b { color:var(--ink); }
.recog-card .ctrl { display:flex; align-items:center; justify-content:space-between; margin-top:12px; }

.btn { width:100%; border:none; border-radius:15px; padding:15px; font-size:15px; font-weight:700;
  font-family:inherit; cursor:pointer; background:var(--pandan); color:#fff; }
.btn:active { transform:scale(.985); }
.btn.ghost { background:var(--card); color:var(--ink); border:1px solid var(--line); }
.btn.sm { padding:11px; font-size:14px; border-radius:12px; }
.btn.danger { background:transparent; color:var(--sambal); border:1px solid var(--line); }

.stat-grid { display:flex; gap:10px; padding:4px 18px 16px; }
.stat { flex:1; background:var(--card); border:1px solid var(--line); border-radius:16px; padding:14px; }
.stat .v { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:24px; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.stat .k { font-size:11px; color:var(--soft); letter-spacing:.06em; text-transform:uppercase; margin-top:3px; font-weight:600; }
.chart { padding:8px 18px 4px; }
.chart-bars { display:flex; align-items:flex-end; gap:8px; height:150px; padding-top:10px; }
.chart-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; height:100%; justify-content:flex-end; }
.chart-col .stack { width:100%; max-width:30px; border-radius:7px 7px 4px 4px; transition:height .4s; min-height:3px; }
.chart-col .dl { font-size:11px; color:var(--soft); font-weight:600; }
.toast { position:fixed; bottom:120px; left:50%; transform:translateX(-50%); background:var(--ink);
  color:var(--paper); padding:11px 20px; border-radius:99px; font-size:13.5px; font-weight:600;
  z-index:60; animation:rise .25s; max-width:90%; }
.note { font-size:12px; color:var(--soft); line-height:1.5; text-align:center; padding:6px 10px 0; }

.src-row { display:flex; gap:10px; }
.src { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
  border:2px dashed var(--line); border-radius:18px; padding:22px 10px; background:var(--card);
  cursor:pointer; text-align:center; }
.src:active { background:var(--paper2); }
.src .ic { font-size:30px; }
.src .t { font-weight:700; font-size:14px; margin-top:3px; }
.src .d { font-size:11.5px; color:var(--soft); line-height:1.4; }

.rev { background:var(--card); border:1px solid var(--line); border-radius:18px; padding:14px; margin-bottom:11px; }
.rev .head { display:flex; align-items:flex-start; gap:10px; }
.rev .nm-input { flex:1; border:none; background:transparent; font-weight:700; font-size:15.5px;
  font-family:inherit; color:var(--ink); outline:none; padding:2px 0; border-bottom:1px solid transparent; }
.rev .nm-input:focus { border-bottom-color:var(--pandan); }
.rev .grams { display:flex; align-items:center; justify-content:space-between; gap:8px;
  background:var(--pandan-s); border-radius:12px; padding:10px 13px; margin-top:11px; }
.rev .grams .gl { font-size:13px; color:var(--pandan-d); font-weight:700; }
.rev .grams .gin { display:flex; align-items:center; gap:5px; }
.rev .grams input { width:64px; border:none; background:var(--card); border-radius:9px; padding:8px 9px;
  font-weight:700; font-size:15px; text-align:right; outline:none; font-variant-numeric:tabular-nums;
  font-family:inherit; color:var(--ink); }
.rev .grams .unit { font-size:13px; color:var(--pandan-d); font-weight:700; }
.rev-macros { display:flex; gap:7px; margin-top:11px; }
.rev-macros .m { flex:1; background:var(--paper2); border-radius:11px; padding:8px 6px; text-align:center; }
.rev-macros .m label { display:block; font-size:9.5px; color:var(--soft); font-weight:700;
  letter-spacing:.05em; text-transform:uppercase; margin-bottom:4px; }
.rev-macros .m input { width:100%; border:none; background:transparent; text-align:center; font-weight:700;
  font-size:15px; font-variant-numeric:tabular-nums; outline:none; font-family:'Bricolage Grotesque',sans-serif; color:var(--ink); }
.rev-macros .m.kc input { color:var(--pandan-d); }
.rev-notes { margin-top:10px; }
.rev-notes input { width:100%; border:1px solid var(--line); border-radius:11px; padding:10px 12px;
  font-size:13.5px; font-family:inherit; outline:none; background:var(--paper); color:var(--ink); }
.rev-notes input:focus { border-color:var(--pandan); }
.rev .foot { display:flex; gap:8px; margin-top:12px; align-items:center; }
.rev .conf { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em;
  padding:4px 8px; border-radius:7px; flex-shrink:0; }
`;

/* ----------------------------- Ring ------------------------------- */
function Ring({ pct, over }: { pct: number; over: boolean }) {
  const R = 104,
    C = 2 * Math.PI * R;
  const p = Math.max(0, Math.min(1, pct));
  const color = over ? "var(--sambal)" : "var(--pandan)";
  return (
    <svg width="236" height="236" viewBox="0 0 236 236" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="118" cy="118" r={R} fill="none" stroke="var(--paper2)" strokeWidth="18" />
      <circle
        cx="118"
        cy="118"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - p)}
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.4,0,.2,1), stroke .3s" }}
      />
    </svg>
  );
}

/* --------------------------- MacroBar ----------------------------- */
function MacroBar({
  name,
  value,
  goal,
  color,
  hero,
}: {
  name: string;
  value: number;
  goal: number;
  color: string;
  hero?: boolean;
}) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const done = value >= goal && goal > 0;
  return (
    <div className={"macro" + (hero ? " hero-macro" : "")}>
      <div className="top">
        <span className="nm">
          <span className="tag" style={{ background: color }} />
          {name}
          {done && <span className="checkmark">✓</span>}
        </span>
        <span className="amt">
          <b>{r0(value)}</b> / {goal}g
        </span>
      </div>
      <div className="bar">
        <span style={{ width: pct * 100 + "%", background: color }} />
      </div>
    </div>
  );
}

/* --------------------------- Stepper ------------------------------ */
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(0.5, +(value - 0.5).toFixed(1)))}>−</button>
      <span className="val tnum">{value}×</span>
      <button onClick={() => onChange(+(value + 0.5).toFixed(1))}>+</button>
    </div>
  );
}

/* ============================== APP =============================== */
export default function Makan() {
  const [ready, setReady] = useState(false);
  const [goals, setGoals] = useState<Goals>(GOAL_DEFAULT);
  const [logs, setLogs] = useState<Record<string, Entry[]>>({});
  const [date, setDate] = useState<Date>(new Date());
  const [tab, setTab] = useState<"today" | "history">("today");
  const [addOpen, setAddOpen] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [toast, setToast] = useState("");

  const dk = toKey(date);
  const isToday = dk === toKey(new Date());
  const today = logs[dk] || [];

  /* load + register service worker */
  useEffect(() => {
    const g = store.get<Goals>("goals");
    if (g) setGoals(g);
    const k = toKey(new Date());
    setLogs((p) => ({ ...p, [k]: store.get<Entry[]>("log:" + k) || [] }));
    setReady(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  /* lazy-load a day when navigated */
  useEffect(() => {
    setLogs((p) => (p[dk] === undefined ? { ...p, [dk]: store.get<Entry[]>("log:" + dk) || [] } : p));
  }, [dk]);

  const flash = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1600);
  }, []);

  const saveDay = useCallback((key: string, arr: Entry[]) => {
    setLogs((p) => ({ ...p, [key]: arr }));
    store.set("log:" + key, arr);
  }, []);

  const addFood = useCallback(
    (food: Food, quietLabel?: string) => {
      const entry: Entry = {
        id: uid(),
        name: food.name,
        emoji: food.emoji || "🍽️",
        kcal: r0(food.kcal),
        p: r0(food.p),
        c: r0(food.c),
        f: r0(food.f),
        portion: food.portion || "1 serving",
        notes: food.notes || "",
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
      const arr = [...(logs[dk] || []), entry];
      saveDay(dk, arr);
      flash(quietLabel || `Added ${food.name}`);
    },
    [logs, dk, saveDay, flash]
  );

  const removeFood = useCallback(
    (id: string) => {
      saveDay(dk, (logs[dk] || []).filter((e) => e.id !== id));
    },
    [logs, dk, saveDay]
  );

  const updateFood = useCallback(
    (id: string, patch: Partial<Entry>) => {
      saveDay(dk, (logs[dk] || []).map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [logs, dk, saveDay]
  );

  const saveGoals = useCallback((g: Goals) => {
    setGoals(g);
    store.set("goals", g);
  }, []);

  const totals: Totals = today.reduce<Totals>(
    (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  const remaining = goals.calories - totals.kcal;
  const over = remaining < 0;

  if (!ready) {
    return (
      <div className="mk">
        <style>{CSS}</style>
        <div className="mk-scroll" style={{ display: "grid", placeItems: "center", height: "100dvh" }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="mk">
      <style>{CSS}</style>
      <div className="mk-scroll">
        <div className="hd">
          <div className="hd-row">
            <div className="brand">
              <span className="dot" />
              Makan
            </div>
            <div className="gear" onClick={() => setSetOpen(true)}>
              ⚙
            </div>
          </div>
          <div className="datenav">
            <button
              onClick={() =>
                setDate((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() - 1);
                  return n;
                })
              }
            >
              ‹
            </button>
            <span className="lbl">{prettyDate(date)}</span>
            <button
              disabled={isToday}
              onClick={() =>
                setDate((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() + 1);
                  return n;
                })
              }
            >
              ›
            </button>
          </div>
        </div>

        {tab === "today" ? (
          <TodayScreen
            totals={totals}
            goals={goals}
            remaining={remaining}
            over={over}
            today={today}
            onEdit={setEditing}
          />
        ) : (
          <HistoryScreen logs={logs} goals={goals} setLogs={setLogs} />
        )}
      </div>

      <div className="nav">
        <div className={"tab" + (tab === "today" ? " on" : "")} onClick={() => setTab("today")}>
          <span className="ic">◎</span>Today
        </div>
        <button className="add-fab" onClick={() => setAddOpen(true)}>
          +
        </button>
        <div className={"tab" + (tab === "history" ? " on" : "")} onClick={() => setTab("history")}>
          <span className="ic">▤</span>Insights
        </div>
      </div>

      {addOpen && <AddSheet onClose={() => setAddOpen(false)} onAdd={(f, l) => addFood(f, l)} />}
      {setOpen && (
        <SettingsSheet goals={goals} onSave={saveGoals} onClose={() => setSetOpen(false)} flash={flash} />
      )}
      {editing && (
        <EditSheet
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateFood(editing.id, patch);
            setEditing(null);
          }}
          onDelete={() => {
            removeFood(editing.id);
            setEditing(null);
            flash("Removed");
          }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* --------------------------- Today -------------------------------- */
function TodayScreen({
  totals,
  goals,
  remaining,
  over,
  today,
  onEdit,
}: {
  totals: Totals;
  goals: Goals;
  remaining: number;
  over: boolean;
  today: Entry[];
  onEdit: (e: Entry) => void;
}) {
  const pct = goals.calories > 0 ? totals.kcal / goals.calories : 0;
  return (
    <>
      <div className="hero">
        <div className="ringwrap">
          <Ring pct={pct} over={over} />
          <div className="center">
            <div className="bignum" style={over ? { color: "var(--sambal)" } : undefined}>
              {over ? "+" + r0(-remaining) : r0(remaining)}
            </div>
            <div className="biglbl">{over ? "over budget" : "kcal left"}</div>
          </div>
        </div>
        <div className="eaten-row">
          <div className="cell">
            <div className="v tnum">{r0(totals.kcal)}</div>
            <div className="k">Eaten</div>
          </div>
          <div className="sep" />
          <div className="cell">
            <div className="v tnum">{goals.calories}</div>
            <div className="k">Goal</div>
          </div>
        </div>
      </div>

      <div className="macros">
        <MacroBar name="Protein" value={totals.p} goal={goals.protein} color="var(--pandan)" hero />
        <MacroBar name="Carbs" value={totals.c} goal={goals.carbs} color="var(--turmeric)" />
        <MacroBar name="Fat" value={totals.f} goal={goals.fat} color="var(--clay)" />
      </div>

      <div className="shead">
        <h3>Logged today</h3>
        <span className="ct">
          {today.length} item{today.length === 1 ? "" : "s"}
        </span>
      </div>

      {today.length === 0 ? (
        <div className="empty">
          <div className="big">🍃</div>
          <div className="t">Nothing logged yet</div>
          <div className="d">Snap a photo of your makan or search the local menu to get started.</div>
        </div>
      ) : (
        <div className="list">
          {today.map((e) => (
            <div className="frow" key={e.id} onClick={() => onEdit(e)}>
              <span className="em">{e.emoji}</span>
              <div className="mid">
                <div className="nm">{e.name}</div>
                <div className="sub">
                  {e.portion} · {e.time} · P{e.p} C{e.c} F{e.f}
                </div>
                {e.notes ? (
                  <div className="sub" style={{ fontStyle: "italic" }}>
                    “{e.notes}”
                  </div>
                ) : null}
              </div>
              <div className="kc">
                <span className="n tnum">{e.kcal}</span>
                <div className="u">kcal</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* --------------------------- Add Sheet ---------------------------- */
function AddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (f: Food, label?: string) => void }) {
  const [mode, setMode] = useState<"scan" | "search" | "manual">("scan");
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-hd">
          <h2>Add food</h2>
          <div className="x" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="seg">
          <button className={mode === "scan" ? "on" : ""} onClick={() => setMode("scan")}>
            Snap
          </button>
          <button className={mode === "search" ? "on" : ""} onClick={() => setMode("search")}>
            Search
          </button>
          <button className={mode === "manual" ? "on" : ""} onClick={() => setMode("manual")}>
            Manual
          </button>
        </div>
        <div className="sheet-body">
          {mode === "scan" && <ScanTab onAdd={onAdd} />}
          {mode === "search" && <SearchTab onAdd={onAdd} />}
          {mode === "manual" && <ManualTab onAdd={onAdd} onDone={onClose} />}
        </div>
      </div>
    </div>
  );
}

/* ---- Scan ---- */
interface ReviewItem {
  _id: number;
  name: string;
  portion: string;
  confidence?: string;
  baseGrams: number | null;
  grams: string;
  base: { kcal: number; p: number; c: number; f: number };
  ov: Partial<Record<MacroKey, string>>;
  notes: string;
}

function ScanTab({ onAdd }: { onAdd: (f: Food) => void }) {
  const [img, setImg] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "empty" | "error">("idle");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const galleryRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setImg(null);
    setState("idle");
    setItems([]);
    setAdded({});
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setState("loading");
    try {
      const dataUrl = await resizeImage(file);
      setImg(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const found = await recogniseFood(base64, "image/jpeg");
      setItems(
        found.map((x, i) => {
          const g = Number(x.est_grams) > 0 ? Number(x.est_grams) : null;
          return {
            _id: i,
            name: x.name,
            portion: x.portion || "1 serving",
            confidence: x.confidence,
            baseGrams: g,
            grams: g != null ? String(g) : "",
            base: { kcal: +x.calories || 0, p: +x.protein || 0, c: +x.carbs || 0, f: +x.fat || 0 },
            ov: {},
            notes: "",
          };
        })
      );
      setState(found.length ? "done" : "empty");
    } catch {
      setState("error");
    }
  };

  const valOf = (it: ReviewItem, key: MacroKey): string => {
    const o = it.ov[key];
    if (o != null) return o;
    const ratio =
      it.baseGrams && it.grams !== "" && Number(it.grams) > 0 ? Number(it.grams) / it.baseGrams : 1;
    return String(r0(it.base[key] * ratio));
  };

  const patch = (id: number, fn: (x: ReviewItem) => ReviewItem) =>
    setItems((p) => p.map((x) => (x._id === id ? fn(x) : x)));

  const addItem = (it: ReviewItem) => {
    const grams = it.grams !== "" ? Number(it.grams) : null;
    onAdd({
      name: (it.name || "Food").trim(),
      emoji: "📸",
      kcal: +valOf(it, "kcal") || 0,
      p: +valOf(it, "p") || 0,
      c: +valOf(it, "c") || 0,
      f: +valOf(it, "f") || 0,
      portion: grams ? grams + "g" : it.portion,
      notes: it.notes.trim(),
    });
    setAdded((p) => ({ ...p, [it._id]: true }));
  };

  const fields: [MacroKey, string][] = [
    ["kcal", "Kcal"],
    ["p", "Protein"],
    ["c", "Carbs"],
    ["f", "Fat"],
  ];

  return (
    <div>
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPick} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={onPick}
      />

      {!img && state !== "loading" && (
        <div className="src-row">
          <div className="src" onClick={() => galleryRef.current?.click()}>
            <span className="ic">🖼️</span>
            <div className="t">From gallery</div>
            <div className="d">Pick a food photo you already took</div>
          </div>
          <div className="src" onClick={() => cameraRef.current?.click()}>
            <span className="ic">📷</span>
            <div className="t">Take photo</div>
            <div className="d">Snap your makan right now</div>
          </div>
        </div>
      )}

      {img && <img src={img} className="preview" alt="your food" style={{ marginTop: 4, marginBottom: 14 }} />}

      {state === "loading" && (
        <div className="scanning">
          <div className="spinner" />
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--soft)" }}>Reading your plate…</div>
        </div>
      )}

      {state === "error" && (
        <div className="empty">
          <div className="t">Couldn&apos;t read that</div>
          <div className="d">Check your connection and try again, or add it manually.</div>
          <button className="btn ghost sm" style={{ marginTop: 14 }} onClick={reset}>
            Try another photo
          </button>
        </div>
      )}

      {state === "empty" && (
        <div className="empty">
          <div className="t">No food spotted</div>
          <div className="d">Try a clearer, closer shot of the dish.</div>
          <button className="btn ghost sm" style={{ marginTop: 14 }} onClick={reset}>
            Try another photo
          </button>
        </div>
      )}

      {state === "done" && (
        <div>
          <p className="note" style={{ paddingTop: 0, marginBottom: 12 }}>
            Estimated below — set the real weight to rescale, edit any number, or add a note.
          </p>
          {items.map((it) => {
            const cColor =
              it.confidence === "high" ? "var(--pandan-s)" : it.confidence === "low" ? "#F6E0DB" : "#F4EAD3";
            const cText =
              it.confidence === "high"
                ? "var(--pandan-d)"
                : it.confidence === "low"
                ? "var(--sambal)"
                : "var(--turmeric)";
            return (
              <div className="rev" key={it._id}>
                <div className="head">
                  <input
                    className="nm-input"
                    value={it.name}
                    onChange={(e) => patch(it._id, (x) => ({ ...x, name: e.target.value }))}
                  />
                  {it.confidence && (
                    <span className="conf" style={{ background: cColor, color: cText }}>
                      {it.confidence}
                    </span>
                  )}
                </div>

                <div className="grams">
                  <span className="gl">Weight</span>
                  <div className="gin">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={it.baseGrams ? "" : "—"}
                      value={it.grams}
                      onChange={(e) => patch(it._id, (x) => ({ ...x, grams: e.target.value, ov: {} }))}
                    />
                    <span className="unit">g</span>
                  </div>
                </div>

                <div className="rev-macros">
                  {fields.map(([k, lbl]) => (
                    <div className={"m" + (k === "kcal" ? " kc" : "")} key={k}>
                      <label>{lbl}</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={valOf(it, k)}
                        onChange={(e) =>
                          patch(it._id, (x) => ({ ...x, ov: { ...x.ov, [k]: e.target.value } }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="rev-notes">
                  <input
                    placeholder="Add a note (e.g. extra sambal, no rice)…"
                    value={it.notes}
                    onChange={(e) => patch(it._id, (x) => ({ ...x, notes: e.target.value }))}
                  />
                </div>

                <div className="foot">
                  <button
                    className="btn sm"
                    style={added[it._id] ? { background: "var(--pandan-d)" } : undefined}
                    onClick={() => addItem(it)}
                  >
                    {added[it._id] ? "Added ✓ — add again" : "Add to today"}
                  </button>
                </div>
              </div>
            );
          })}
          <button className="btn ghost sm" style={{ marginTop: 2 }} onClick={reset}>
            Use another photo
          </button>
        </div>
      )}
    </div>
  );
}

/* ---- Search ---- */
function SearchTab({ onAdd }: { onAdd: (f: Food) => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sel, setSel] = useState<BuiltinFood | null>(null);
  const [mult, setMult] = useState(1);

  const filtered = BUILTIN.filter(
    (f) => (cat === "All" || f.cat === cat) && f.name.toLowerCase().includes(q.toLowerCase())
  );

  if (sel) {
    return (
      <div>
        <div className="recog-card">
          <div className="top">
            <div>
              <div className="nm">
                {sel.emoji} {sel.name}
              </div>
              <div className="por">
                {sel.serving} · {sel.cat}
              </div>
            </div>
          </div>
          <div className="mline">
            <span>
              <b className="tnum">{r0(sel.kcal * mult)}</b> kcal
            </span>
            <span>
              P <b className="tnum">{r0(sel.p * mult)}</b>
            </span>
            <span>
              C <b className="tnum">{r0(sel.c * mult)}</b>
            </span>
            <span>
              F <b className="tnum">{r0(sel.f * mult)}</b>
            </span>
          </div>
          <div className="ctrl">
            <Stepper value={mult} onChange={setMult} />
          </div>
        </div>
        <button
          className="btn"
          onClick={() => {
            onAdd({
              name: sel.name,
              emoji: sel.emoji,
              kcal: sel.kcal * mult,
              p: sel.p * mult,
              c: sel.c * mult,
              f: sel.f * mult,
              portion: (mult !== 1 ? mult + "× " : "") + sel.serving,
            });
            setSel(null);
            setMult(1);
            setQ("");
          }}
        >
          Add to today
        </button>
        <button
          className="btn ghost sm"
          style={{ marginTop: 8 }}
          onClick={() => {
            setSel(null);
            setMult(1);
          }}
        >
          Back to search
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="search-wrap">
        <span className="si">⌕</span>
        <input
          className="search-input"
          placeholder="Search nasi lemak, KFC, teh tarik…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div className="chips">
        {["All", ...CATS].map((c) => (
          <div key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>
            {c}
          </div>
        ))}
      </div>
      <div className="list" style={{ padding: 0 }}>
        {filtered.length === 0 && (
          <div className="empty">
            <div className="d">No match. Try the Manual tab to add it yourself.</div>
          </div>
        )}
        {filtered.map((f) => (
          <div
            className="frow"
            key={f.id}
            onClick={() => {
              setSel(f);
              setMult(1);
            }}
          >
            <span className="em">{f.emoji}</span>
            <div className="mid">
              <div className="nm">{f.name}</div>
              <div className="sub">
                {f.serving} · P{f.p} C{f.c} F{f.f}
              </div>
            </div>
            <div className="kc">
              <span className="n tnum">{f.kcal}</span>
              <div className="u">kcal</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Manual ---- */
function ManualTab({ onAdd, onDone }: { onAdd: (f: Food) => void; onDone: () => void }) {
  const [v, setV] = useState({ name: "", kcal: "", p: "", c: "", f: "", portion: "" });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const ok = v.name.trim() !== "" && v.kcal !== "";
  return (
    <div>
      <div className="field">
        <label>Food name</label>
        <input value={v.name} onChange={set("name")} placeholder="e.g. Nasi kerabu" />
      </div>
      <div className="field">
        <label>Portion (optional)</label>
        <input value={v.portion} onChange={set("portion")} placeholder="1 plate" />
      </div>
      <div className="field">
        <label>Calories (kcal)</label>
        <input type="number" inputMode="numeric" value={v.kcal} onChange={set("kcal")} placeholder="0" />
      </div>
      <div className="macro3">
        <div className="field">
          <label>Protein</label>
          <input type="number" inputMode="numeric" value={v.p} onChange={set("p")} placeholder="0" />
        </div>
        <div className="field">
          <label>Carbs</label>
          <input type="number" inputMode="numeric" value={v.c} onChange={set("c")} placeholder="0" />
        </div>
        <div className="field">
          <label>Fat</label>
          <input type="number" inputMode="numeric" value={v.f} onChange={set("f")} placeholder="0" />
        </div>
      </div>
      <button
        className="btn"
        disabled={!ok}
        style={!ok ? { opacity: 0.45 } : undefined}
        onClick={() => {
          onAdd({
            name: v.name.trim(),
            emoji: "🍽️",
            kcal: +v.kcal || 0,
            p: +v.p || 0,
            c: +v.c || 0,
            f: +v.f || 0,
            portion: v.portion.trim() || "1 serving",
          });
          onDone();
        }}
      >
        Add to today
      </button>
    </div>
  );
}

/* --------------------------- Edit Sheet --------------------------- */
function EditSheet({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: Entry;
  onClose: () => void;
  onSave: (patch: Partial<Entry>) => void;
  onDelete: () => void;
}) {
  const base = { kcal: entry.kcal, p: entry.p, c: entry.c, f: entry.f };
  const [mult, setMult] = useState(1);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-hd">
          <h2>
            {entry.emoji} {entry.name}
          </h2>
          <div className="x" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="sheet-body">
          <div className="recog-card">
            <div className="por" style={{ marginBottom: 6 }}>
              {entry.portion} · logged {entry.time}
            </div>
            <div className="mline">
              <span>
                <b className="tnum">{r0(base.kcal * mult)}</b> kcal
              </span>
              <span>
                P <b className="tnum">{r0(base.p * mult)}</b>
              </span>
              <span>
                C <b className="tnum">{r0(base.c * mult)}</b>
              </span>
              <span>
                F <b className="tnum">{r0(base.f * mult)}</b>
              </span>
            </div>
            <div className="ctrl">
              <span style={{ fontSize: 13, color: "var(--soft)", fontWeight: 600 }}>Adjust portion</span>
              <Stepper value={mult} onChange={setMult} />
            </div>
          </div>
          <button
            className="btn"
            onClick={() =>
              onSave({
                kcal: r0(base.kcal * mult),
                p: r0(base.p * mult),
                c: r0(base.c * mult),
                f: r0(base.f * mult),
                portion: (mult !== 1 ? mult + "× " : "") + entry.portion.replace(/^[\d.]+× /, ""),
              })
            }
          >
            Save changes
          </button>
          <button className="btn danger sm" style={{ marginTop: 9 }} onClick={onDelete}>
            Remove from log
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Settings ----------------------------- */
function SettingsSheet({
  goals,
  onSave,
  onClose,
  flash,
}: {
  goals: Goals;
  onSave: (g: Goals) => void;
  onClose: () => void;
  flash: (m: string) => void;
}) {
  const [g, setG] = useState<Goals>(goals);
  const set = (k: keyof Goals) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setG((p) => ({ ...p, [k]: +e.target.value || 0 }));
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-hd">
          <h2>Daily goals</h2>
          <div className="x" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="sheet-body">
          <div className="field">
            <label>Calories (kcal)</label>
            <input type="number" inputMode="numeric" value={g.calories} onChange={set("calories")} />
          </div>
          <div className="macro3">
            <div className="field">
              <label>Protein (g)</label>
              <input type="number" inputMode="numeric" value={g.protein} onChange={set("protein")} />
            </div>
            <div className="field">
              <label>Carbs (g)</label>
              <input type="number" inputMode="numeric" value={g.carbs} onChange={set("carbs")} />
            </div>
            <div className="field">
              <label>Fat (g)</label>
              <input type="number" inputMode="numeric" value={g.fat} onChange={set("fat")} />
            </div>
          </div>
          <p className="note" style={{ textAlign: "left", padding: "2px 2px 14px" }}>
            From {g.protein}g protein, {g.carbs}g carbs and {g.fat}g fat that&apos;s about{" "}
            {g.protein * 4 + g.carbs * 4 + g.fat * 9} kcal across macros.
          </p>
          <button
            className="btn"
            onClick={() => {
              onSave(g);
              flash("Goals saved");
              onClose();
            }}
          >
            Save goals
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- History ------------------------------ */
function HistoryScreen({
  logs,
  goals,
  setLogs,
}: {
  logs: Record<string, Entry[]>;
  goals: Goals;
  setLogs: React.Dispatch<React.SetStateAction<Record<string, Entry[]>>>;
}) {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  useEffect(() => {
    const updates: Record<string, Entry[]> = {};
    for (const d of days) {
      const k = toKey(d);
      if (logs[k] === undefined) updates[k] = store.get<Entry[]>("log:" + k) || [];
    }
    if (Object.keys(updates).length) setLogs((p) => ({ ...p, ...updates }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dayData = days.map((d) => {
    const arr = logs[toKey(d)] || [];
    const t = arr.reduce(
      (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p }),
      { kcal: 0, p: 0 }
    );
    return { d, kcal: t.kcal, p: t.p, has: arr.length > 0 };
  });

  const logged = dayData.filter((x) => x.has);
  const avgKcal = logged.length ? r0(logged.reduce((a, x) => a + x.kcal, 0) / logged.length) : 0;
  const avgP = logged.length ? r0(logged.reduce((a, x) => a + x.p, 0) / logged.length) : 0;
  const onTarget = dayData.filter(
    (x) => x.has && Math.abs(x.kcal - goals.calories) <= goals.calories * 0.1
  ).length;

  const maxBar = Math.max(goals.calories, ...dayData.map((x) => x.kcal), 1);

  return (
    <div>
      <div className="shead">
        <h3>Last 7 days</h3>
      </div>
      <div className="chart">
        <div className="chart-bars">
          {dayData.map((x, i) => {
            const h = (x.kcal / maxBar) * 100;
            const over = x.kcal > goals.calories;
            const isToday = toKey(x.d) === toKey(new Date());
            return (
              <div className="chart-col" key={i}>
                <div
                  className="stack"
                  style={{
                    height: (x.has ? Math.max(h, 4) : 3) + "%",
                    background: !x.has ? "var(--paper2)" : over ? "var(--sambal)" : "var(--pandan)",
                    opacity: x.has ? 1 : 0.6,
                  }}
                />
                <div className="dl" style={isToday ? { color: "var(--pandan)", fontWeight: 700 } : undefined}>
                  {x.d.toLocaleDateString("en-GB", { weekday: "short" })[0]}
                </div>
              </div>
            );
          })}
        </div>
        <p className="note" style={{ textAlign: "left", paddingTop: 12 }}>
          Bars show daily calories. Green is within budget, red is over your {goals.calories} kcal goal.
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="v tnum">{avgKcal || "—"}</div>
          <div className="k">Avg kcal</div>
        </div>
        <div className="stat">
          <div className="v tnum">{avgP || "—"}</div>
          <div className="k">Avg protein</div>
        </div>
        <div className="stat">
          <div className="v tnum">{onTarget}</div>
          <div className="k">On-target days</div>
        </div>
      </div>

      {logged.length === 0 && (
        <div className="empty">
          <div className="big">📊</div>
          <div className="t">No history yet</div>
          <div className="d">Log a few days and your trends will show up here.</div>
        </div>
      )}
    </div>
  );
}
