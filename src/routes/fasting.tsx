import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Moon, Sun, CheckCircle2, Circle, Trophy, CalendarDays, Droplet, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/fasting")({
  head: () => ({
    meta: [
      { title: "تتبّع الصيام — سكينة" },
      { name: "description", content: "تتبّع صيامك في رمضان والأيام المسنونة مع إحصائياتك." },
    ],
  }),
  component: FastingPage,
});

const KEY = "sakeenah:fasting";

const VOLUNTARY_DAYS = [
  { id: "mon", label: "الاثنين",   desc: "صيام الاثنين — سنة نبوية", icon: "📅" },
  { id: "thu", label: "الخميس",   desc: "صيام الخميس — سنة نبوية",  icon: "📅" },
  { id: "ayam-bid-1", label: "١٣ من الشهر", desc: "الأيام البيض الثلاثة",   icon: "🌕" },
  { id: "ayam-bid-2", label: "١٤ من الشهر", desc: "الأيام البيض الثلاثة",   icon: "🌕" },
  { id: "ayam-bid-3", label: "١٥ من الشهر", desc: "الأيام البيض الثلاثة",   icon: "🌕" },
  { id: "ashura",     label: "عاشوراء ١٠ محرم",  desc: "يكفّر سنة",   icon: "⭐" },
  { id: "arafah",     label: "عرفة ٩ ذو الحجة", desc: "يكفّر سنتين", icon: "🌟" },
  { id: "shawwal-1",  label: "ست من شوال ١", desc: "كصيام الدهر مع رمضان", icon: "💚" },
  { id: "shawwal-2",  label: "ست من شوال ٢", desc: "", icon: "💚" },
  { id: "shawwal-3",  label: "ست من شوال ٣", desc: "", icon: "💚" },
  { id: "shawwal-4",  label: "ست من شوال ٤", desc: "", icon: "💚" },
  { id: "shawwal-5",  label: "ست من شوال ٥", desc: "", icon: "💚" },
  { id: "shawwal-6",  label: "ست من شوال ٦", desc: "", icon: "💚" },
];

type Mode = "ramadan" | "voluntary";

function todayKey() { return new Date().toISOString().slice(0, 10); }

function FastingPage() {
  const [mode, setMode] = useState<Mode>("ramadan");
  const [fasted, setFasted] = useState<Record<string, boolean>>({});
  const [suhoor, setSuhoor] = useState<Record<string, boolean>>({});
  const [intention, setIntention] = useState(false);
  const [voluntaryDone, setVoluntaryDone] = useState<Set<string>>(new Set());
  const [ramadanDays, setRamadanDays] = useState(30);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setFasted(d.fasted ?? {});
        setSuhoor(d.suhoor ?? {});
        setVoluntaryDone(new Set(d.voluntaryDone ?? []));
        setRamadanDays(d.ramadanDays ?? 30);
      }
    } catch {}
  }, []);

  function persist(f: typeof fasted, s: typeof suhoor, v: Set<string>) {
    localStorage.setItem(KEY, JSON.stringify({ fasted: f, suhoor: s, voluntaryDone: [...v], ramadanDays }));
  }

  // Ramadan grid
  const days = Array.from({ length: ramadanDays }, (_, i) => i + 1);
  const fastedCount = Object.values(fasted).filter(Boolean).length;

  function toggleDay(day: number) {
    const key = `ramadan-${day}`;
    const newF = { ...fasted, [key]: !fasted[key] };
    setFasted(newF); persist(newF, suhoor, voluntaryDone);
    if (!fasted[key]) navigator.vibrate?.(18);
    if (fastedCount + 1 === ramadanDays && !fasted[key]) {
      toast.success("🎉 أتممت صيام الشهر كاملاً! تقبّل الله صيامك", { duration: 5000 });
    }
  }

  function toggleSuhoor(day: number) {
    const key = `suhoor-${day}`;
    const newS = { ...suhoor, [key]: !suhoor[key] };
    setSuhoor(newS); persist(fasted, newS, voluntaryDone);
  }

  function toggleVoluntary(id: string) {
    const next = new Set(voluntaryDone);
    next.has(id) ? next.delete(id) : next.add(id);
    setVoluntaryDone(next); persist(fasted, suhoor, next);
    if (!voluntaryDone.has(id)) toast.success("بارك الله في صيامك ✨");
  }

  const todayNum = (() => {
    // estimate — in a real app this would come from the Hijri calendar
    return new Date().getDate() % ramadanDays || ramadanDays;
  })();

  return (
    <div className="fade-up pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[2.5rem] gradient-hero text-primary-foreground pattern-islamic px-5 pt-8 pb-6 shadow-elevated mb-4">
        <h1 className="font-quran heading-page">تتبّع الصيام</h1>
        <p className="text-sm opacity-80 mt-1">رمضان والأيام المسنونة</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "أيام صُمتها", value: fastedCount },
            { label: "متبقية", value: ramadanDays - fastedCount },
            { label: "مع السحور", value: Object.values(suhoor).filter(Boolean).length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white/10 backdrop-blur py-2.5">
              <p className="font-quran text-2xl">{value}</p>
              <p className="text-[10px] opacity-75">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 gap-2 mb-4">
        {([["ramadan","رمضان"],["voluntary","التطوع"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setMode(k)}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition ${mode===k?"gradient-primary text-primary-foreground shadow-glow":"bg-card border border-border text-muted-foreground"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* RAMADAN MODE */}
      {mode === "ramadan" && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">شبكة الصيام</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>عدد الأيام:</span>
              <select value={ramadanDays} onChange={e => setRamadanDays(Number(e.target.value))}
                className="bg-card border border-border rounded-lg px-2 py-1 text-xs outline-none">
                <option value={29}>٢٩</option>
                <option value={30}>٣٠</option>
              </select>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted mb-4 overflow-hidden">
            <div className="h-full gradient-gold transition-all duration-500"
              style={{ width: `${(fastedCount / ramadanDays) * 100}%` }}/>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
            {days.map(day => {
              const fKey = `ramadan-${day}`;
              const sKey = `suhoor-${day}`;
              const done = !!fasted[fKey];
              const hasSuhoor = !!suhoor[sKey];
              const isToday = day === todayNum;
              return (
                <div key={day} className={`rounded-2xl overflow-hidden border transition ${
                  done ? "border-primary/30" : isToday ? "border-2 border-primary" : "border-border/40"
                }`}>
                  <button onClick={() => toggleDay(day)}
                    className={`w-full py-2.5 text-center transition active:scale-90 ${
                      done ? "gradient-primary text-primary-foreground" : "bg-card"
                    }`}>
                    <span className="font-quran text-base font-bold">{day}</span>
                    {done && <div className="text-[8px] mt-0.5 opacity-80">✓</div>}
                  </button>
                  <button onClick={() => toggleSuhoor(day)}
                    title="سحور"
                    className={`w-full py-1 text-center text-[10px] transition border-t ${
                      hasSuhoor ? "bg-gold/20 text-gold border-gold/20" : "bg-muted/30 text-muted-foreground border-border/30"
                    }`}>
                    {hasSuhoor ? "🌙" : "—"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
            <span className="flex gap-1 items-center"><span className="h-3 w-3 rounded gradient-primary inline-block"/>صام</span>
            <span className="flex gap-1 items-center"><span className="h-3 w-3 rounded bg-gold/30 inline-block"/>مع سحور</span>
          </div>

          {fastedCount === ramadanDays && (
            <div className="mt-4 rounded-3xl gradient-gold text-gold-foreground p-5 text-center shadow-gold">
              <Trophy className="h-10 w-10 mx-auto mb-2"/>
              <p className="font-quran text-2xl">تقبّل الله صيامك!</p>
              <p className="text-sm opacity-80 mt-1">اللهم تقبّل منا صيامنا وقيامنا</p>
            </div>
          )}
        </div>
      )}

      {/* VOLUNTARY MODE */}
      {mode === "voluntary" && (
        <div className="px-4 space-y-2">
          <div className="rounded-2xl bg-gold/10 border border-gold/20 p-4 mb-3">
            <p className="text-sm font-quran">«الصِّيَامُ جُنَّةٌ» — رواه البخاري ومسلم</p>
          </div>
          {VOLUNTARY_DAYS.map(d => {
            const done = voluntaryDone.has(d.id);
            return (
              <button key={d.id} onClick={() => toggleVoluntary(d.id)}
                className={`w-full flex items-center gap-4 rounded-3xl p-4 border shadow-soft transition active:scale-[0.98] text-right ${done ? "gradient-primary text-primary-foreground border-transparent" : "bg-card border-border/60"}`}>
                <span className="text-2xl">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{d.label}</p>
                  {d.desc && <p className={`text-[11px] mt-0.5 ${done ? "opacity-80" : "text-muted-foreground"}`}>{d.desc}</p>}
                </div>
                {done ? <CheckCircle2 className="h-6 w-6 shrink-0"/> : <Circle className="h-6 w-6 shrink-0 opacity-40"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
