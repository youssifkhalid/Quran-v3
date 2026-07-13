import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RotateCcw, ChevronDown, Plus, Trophy, History } from "lucide-react";

export const Route = createFileRoute("/tasbeeh")({
  head: () => ({
    meta: [
      { title: "المسبحة — سكينة" },
      { name: "description", content: "مسبحة رقمية أنيقة مع اهتزاز وتتبع الجلسات." },
    ],
  }),
  component: TasbeehPage,
});

const DHIKR_OPTIONS = [
  { text: "سُبْحَانَ اللَّهِ", color: "from-emerald-500 to-teal-600" },
  { text: "الْحَمْدُ لِلَّهِ", color: "from-amber-500 to-orange-600" },
  { text: "اللَّهُ أَكْبَرُ", color: "from-sky-500 to-blue-600" },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ", color: "from-violet-500 to-purple-600" },
  { text: "أَسْتَغْفِرُ اللَّهَ", color: "from-rose-500 to-pink-600" },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", color: "from-lime-500 to-green-600" },
  { text: "سُبْحَانَ اللَّهِ الْعَظِيمِ", color: "from-cyan-500 to-blue-600" },
  { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", color: "from-indigo-500 to-purple-600" },
];

const TARGETS = [33, 99, 100, 500, 1000];
const STATE_KEY = "sakeenah:tasbeeh";
const HISTORY_KEY = "sakeenah:tasbeeh-history";

interface TasbeehSession {
  dhikr: string;
  total: number;
  date: string;
}

function TasbeehPage() {
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(33);
  const [dhikrIdx, setDhikrIdx] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tab, setTab] = useState<"counter" | "history">("counter");
  const [history, setHistory] = useState<TasbeehSession[]>([]);
  const [customDhikr, setCustomDhikr] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const dhikr = DHIKR_OPTIONS[dhikrIdx]?.text ?? "سُبْحَانَ اللَّهِ";

  useEffect(() => {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      setCount(s.count ?? 0);
      setRound(s.round ?? 0);
      setTarget(s.target ?? 33);
      setDhikrIdx(s.dhikrIdx ?? 0);
    }
    const hist = localStorage.getItem(HISTORY_KEY);
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ count, round, target, dhikrIdx }));
  }, [count, round, target, dhikrIdx]);

  function tap() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(18);
    setCount((c) => {
      const n = c + 1;
      if (n >= target) {
        const newRound = round + 1;
        setRound(newRound);
        if ("vibrate" in navigator) navigator.vibrate?.([40, 60, 80]);
        // Save completed round to history
        const session: TasbeehSession = { dhikr, total: target, date: new Date().toISOString() };
        setHistory((prev) => {
          const updated = [session, ...prev].slice(0, 50);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          return updated;
        });
        return 0;
      }
      return n;
    });
  }

  function resetCounter() {
    setCount(0);
    setRound(0);
  }

  const progress = (count / target) * 100;
  const ROOT = 110;
  const C = 2 * Math.PI * ROOT;
  const selected = DHIKR_OPTIONS[dhikrIdx];
  const totalEver = history.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="fade-up min-h-[calc(100dvh-7rem)] flex flex-col">
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-quran text-3xl">المسبحة</h1>
        <p className="text-sm text-muted-foreground mt-1">اذكر الله ذكراً كثيراً</p>
      </header>

      {/* Tabs */}
      <div className="flex px-4 mt-3 gap-2">
        {[
          { key: "counter", label: "العداد" },
          { key: "history", label: "السجل" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${tab === key ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "counter" && (
        <>
          {/* Dhikr selector */}
          <div className="px-4 mt-4">
            <button
              onClick={() => setPickerOpen((o) => !o)}
              className="w-full flex items-center justify-between rounded-2xl bg-card border border-border px-5 py-4 shadow-soft"
            >
              <span className="font-quran text-xl">{dhikr}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
            </button>
            {pickerOpen && (
              <div className="mt-2 rounded-2xl bg-card border border-border shadow-elevated overflow-hidden fade-up">
                {DHIKR_OPTIONS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => { setDhikrIdx(i); setPickerOpen(false); setCount(0); }}
                    className={`w-full text-right px-5 py-3.5 font-quran text-lg border-b border-border/40 last:border-0 hover:bg-surface-elevated transition ${i === dhikrIdx ? "bg-primary/5 text-primary font-bold" : ""}`}
                  >
                    {d.text}
                  </button>
                ))}
                <button
                  onClick={() => { setShowCustom(true); setPickerOpen(false); }}
                  className="w-full text-right px-5 py-3.5 text-sm text-muted-foreground flex items-center gap-2 hover:bg-surface-elevated transition"
                >
                  <Plus className="h-4 w-4" /> أضف ذكراً مخصصاً
                </button>
              </div>
            )}
          </div>

          {showCustom && (
            <div className="px-4 mt-2 fade-up">
              <div className="flex gap-2">
                <input
                  placeholder="اكتب الذكر هنا…"
                  value={customDhikr}
                  onChange={(e) => setCustomDhikr(e.target.value)}
                  className="flex-1 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-quran outline-none focus:border-primary"
                  dir="rtl"
                />
                <button
                  onClick={() => {
                    if (customDhikr.trim()) {
                      DHIKR_OPTIONS.push({ text: customDhikr.trim(), color: "from-primary/70 to-primary" });
                      setDhikrIdx(DHIKR_OPTIONS.length - 1);
                      setCustomDhikr("");
                      setShowCustom(false);
                      setCount(0);
                    }
                  }}
                  className="rounded-xl gradient-primary text-primary-foreground px-4 py-2.5 text-sm"
                >
                  حفظ
                </button>
              </div>
            </div>
          )}

          {/* Counter ring */}
          <div className="flex-1 grid place-items-center px-6 py-6">
            <button
              onClick={tap}
              className="relative active:scale-95 transition-transform select-none"
              aria-label="تسبيح"
            >
              <svg viewBox="0 0 260 260" className="h-72 w-72 -rotate-90">
                <defs>
                  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.74 0.13 80)" />
                    <stop offset="100%" stopColor="oklch(0.52 0.13 162)" />
                  </linearGradient>
                </defs>
                <circle cx="130" cy="130" r={ROOT} fill="none" className="stroke-muted" strokeWidth="10" />
                <circle
                  cx="130" cy="130" r={ROOT} fill="none"
                  stroke="url(#ring)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C - (C * progress) / 100}
                  style={{ transition: "stroke-dashoffset 200ms cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className={`grid place-items-center rounded-full h-48 w-48 bg-gradient-to-br ${selected?.color ?? "gradient-primary"} text-white shadow-glow`}>
                  <span className="text-6xl font-light tabular-nums">{count}</span>
                  <span className="text-xs opacity-75 -mt-1">من {target}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Targets + round */}
          <div className="px-5 pb-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">الجولات: <b className="text-foreground">{round}</b></span>
              <button onClick={resetCounter} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> صفّر
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTarget(t); setCount(0); }}
                  className={`rounded-xl py-2.5 text-xs font-bold transition ${t === target ? "gradient-gold text-gold-foreground shadow-gold" : "bg-card border border-border text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="px-4 mt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">المجموع الكلي</p>
              <p className="font-quran text-3xl text-gradient-gold">{toArabic(totalEver)}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-gold-foreground shadow-gold">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground text-sm">
              <History className="h-12 w-12 mb-3 opacity-30" />
              <p>لا توجد جلسات بعد</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((s, i) => (
                <li key={i} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-soft border border-border/60">
                  <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground text-xs font-bold shrink-0">
                    {toArabic(s.total)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-quran text-base truncate">{s.dhikr}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(s.date).toLocaleDateString("ar", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function toArabic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
