import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { BookOpen, RotateCcw, Trophy, TrendingUp, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/khatmah")({
  head: () => ({
    meta: [
      { title: "ختمة القرآن — سكينة" },
      { name: "description", content: "خطط لختمة القرآن الكريم وتابع تقدمك يوماً بيوم." },
    ],
  }),
  component: KhatmahPage,
});

const KEY = "sakeenah:khatmah";
const TOTAL_PAGES = 604;

interface KhatmahState {
  startDate: string;      // ISO date
  targetDays: number;     // 30 | 60 | 90 | 365
  pagesRead: number[];    // array of page numbers read
  dailyGoal: number;      // pages per day
}

const PRESETS = [
  { label: "شهر", days: 30, pagesPerDay: 20 },
  { label: "شهران", days: 60, pagesPerDay: 10 },
  { label: "٣ أشهر", days: 90, pagesPerDay: 7 },
  { label: "سنة", days: 365, pagesPerDay: 2 },
];

function KhatmahPage() {
  const [state, setState] = useState<KhatmahState | null>(null);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      setState(JSON.parse(raw));
    } else {
      setSetup(true);
    }
  }, []);

  function save(s: KhatmahState) {
    setState(s);
    localStorage.setItem(KEY, JSON.stringify(s));
    setSetup(false);
  }

  function markPage(page: number) {
    if (!state) return;
    const updated = state.pagesRead.includes(page)
      ? state.pagesRead.filter((p) => p !== page)
      : [...state.pagesRead, page];
    const next = { ...state, pagesRead: updated };
    setState(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
  }

  function reset() {
    if (!confirm("إعادة تعيين الختمة؟")) return;
    setState(null);
    localStorage.removeItem(KEY);
    setSetup(true);
  }

  const stats = useMemo(() => {
    if (!state) return null;
    const read = state.pagesRead.length;
    const pct = (read / TOTAL_PAGES) * 100;
    const start = new Date(state.startDate);
    const daysPassed = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000));
    const daysLeft = Math.max(0, state.targetDays - daysPassed);
    const pagesLeft = TOTAL_PAGES - read;
    const neededPerDay = daysLeft > 0 ? Math.ceil(pagesLeft / daysLeft) : pagesLeft;
    const todayPages = Math.ceil(daysPassed * state.dailyGoal) - read;
    return { read, pct, daysPassed, daysLeft, neededPerDay, todayPages: Math.max(0, todayPages) };
  }, [state]);

  // Today's pages to read
  const todayRange = useMemo(() => {
    if (!state || !stats) return [];
    const dayNum = stats.daysPassed;
    const start = (dayNum - 1) * state.dailyGoal + 1;
    const end = Math.min(TOTAL_PAGES, dayNum * state.dailyGoal);
    return Array.from({ length: end - start + 1 }, (_, i) => Math.floor(start + i));
  }, [state, stats]);

  if (setup) {
    return <SetupKhatmah onSave={save} />;
  }

  if (!state || !stats) return null;

  const completed = state.pagesRead.length === TOTAL_PAGES;

  return (
    <div className="fade-up pb-6">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-quran text-3xl">ختمة القرآن</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {toArabic(stats.read)} من {toArabic(TOTAL_PAGES)} صفحة
          </p>
        </div>
        <button onClick={reset} className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
        </button>
      </header>

      {/* Progress ring */}
      <div className="flex justify-center my-4">
        <div className="relative">
          <svg viewBox="0 0 200 200" className="h-48 w-48 -rotate-90">
            <circle cx="100" cy="100" r="80" fill="none" className="stroke-muted" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="80" fill="none"
              stroke="url(#kGrad)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - stats.pct / 100)}
              style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)" }}
            />
            <defs>
              <linearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.13 85)" />
                <stop offset="100%" stopColor="oklch(0.52 0.13 162)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {completed ? (
              <Trophy className="h-10 w-10 text-gold" />
            ) : (
              <>
                <span className="font-quran text-3xl text-gradient-gold">{Math.round(stats.pct)}%</span>
                <span className="text-xs text-muted-foreground mt-1">مكتمل</span>
              </>
            )}
          </div>
        </div>
      </div>

      {completed && (
        <div className="mx-4 mb-4 rounded-3xl gradient-gold text-gold-foreground p-5 text-center shadow-elevated">
          <Trophy className="h-8 w-8 mx-auto mb-2" />
          <p className="font-quran text-2xl">تقبّل الله ختمتك</p>
          <p className="text-sm opacity-80 mt-1">اللهم اجعل القرآن ربيع قلبنا</p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mx-4 mb-4">
        {[
          { label: "صفحات اليوم", value: toArabic(stats.todayPages), Icon: BookOpen },
          { label: "باقي الأيام", value: toArabic(stats.daysLeft), Icon: CalendarDays },
          { label: "وتيرة مطلوبة", value: `${toArabic(stats.neededPerDay)}/يوم`, Icon: TrendingUp },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl bg-card p-3 shadow-soft border border-border/60 text-center">
            <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="font-quran text-lg">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's pages */}
      {todayRange.length > 0 && (
        <div className="mx-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">صفحات اليوم</h2>
          <div className="grid grid-cols-5 gap-2">
            {todayRange.map((page) => {
              const done = state.pagesRead.includes(page);
              return (
                <button
                  key={page}
                  onClick={() => markPage(page)}
                  className={`rounded-xl py-3 text-sm font-bold transition active:scale-95 ${done ? "gradient-gold text-gold-foreground" : "bg-card border border-border shadow-soft"}`}
                >
                  {toArabic(page)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mini heatmap — all pages */}
      <div className="mx-4">
        <h2 className="text-sm font-semibold mb-2">خريطة التقدم (٦٠٤ صفحة)</h2>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(30, 1fr)" }}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
            const page = i + 1;
            const done = state.pagesRead.includes(page);
            const isToday = todayRange.includes(page);
            return (
              <div
                key={page}
                onClick={() => markPage(page)}
                title={`صفحة ${page}`}
                className={`aspect-square rounded-[2px] cursor-pointer transition ${
                  done ? "bg-primary" :
                  isToday ? "bg-gold/60" :
                  "bg-muted"
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" /> مقروء</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gold/60 inline-block" /> اليوم</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-muted inline-block border border-border" /> لم يُقرأ</span>
        </div>
      </div>
    </div>
  );
}

function SetupKhatmah({ onSave }: { onSave: (s: KhatmahState) => void }) {
  const [preset, setPreset] = useState(0);

  function start() {
    const p = PRESETS[preset];
    onSave({
      startDate: new Date().toISOString().slice(0, 10),
      targetDays: p.days,
      pagesRead: [],
      dailyGoal: p.pagesPerDay,
    });
  }

  return (
    <div className="fade-up px-5 pt-10">
      <div className="text-center mb-8">
        <div className="grid h-20 w-20 place-items-center rounded-full gradient-gold text-gold-foreground shadow-gold mx-auto mb-4">
          <BookOpen className="h-9 w-9" />
        </div>
        <h1 className="font-quran text-3xl">ابدأ ختمتك</h1>
        <p className="text-sm text-muted-foreground mt-2">اختر الهدف وسيتولى التطبيق التخطيط</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setPreset(i)}
            className={`rounded-2xl p-4 text-right transition border ${preset === i ? "gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-card border-border shadow-soft"}`}
          >
            <p className="font-quran text-2xl">{p.label}</p>
            <p className={`text-xs mt-1 ${preset === i ? "opacity-80" : "text-muted-foreground"}`}>{p.pagesPerDay} صفحة يومياً</p>
          </button>
        ))}
      </div>

      <button onClick={start} className="w-full rounded-2xl gradient-gold text-gold-foreground py-4 font-quran text-xl shadow-gold active:scale-[0.98] transition">
        ابدأ الختمة بإذن الله
      </button>
    </div>
  );
}

function toArabic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
