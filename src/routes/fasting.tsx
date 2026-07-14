import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Moon, CheckCircle2, Circle, Trophy, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/fasting")({
  head: () => ({
    meta: [
      { title: "صيام رمضان — سكينة" },
      { name: "description", content: "تتبّع صيام شهر رمضان المبارك يومًا بيوم." },
    ],
  }),
  component: FastingPage,
});

const KEY = "sakeenah:fasting";

export default function FastingPage() {
  const [fasted, setFasted] = useState<Record<string, boolean>>({});
  const [suhoor, setSuhoor] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState(30);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setFasted(d.fasted ?? {});
        setSuhoor(d.suhoor ?? {});
        setDays(d.days ?? 30);
      }
    } catch {}
  }, []);

  function persist(f: typeof fasted, s: typeof suhoor, d: number) {
    localStorage.setItem(KEY, JSON.stringify({ fasted: f, suhoor: s, days: d }));
  }

  function toggleFast(day: number) {
    const key = `r${day}`;
    const newF = { ...fasted, [key]: !fasted[key] };
    setFasted(newF);
    persist(newF, suhoor, days);
    if (!fasted[key]) {
      navigator.vibrate?.(15);
      const done = Object.values(newF).filter(Boolean).length;
      if (done === days) toast.success("🎉 أتممت صيام رمضان! تقبّل الله منك");
    }
  }

  function toggleSuhoor(day: number) {
    const key = `s${day}`;
    const newS = { ...suhoor, [key]: !suhoor[key] };
    setSuhoor(newS);
    persist(fasted, newS, days);
  }

  const fastedCount = Array.from({ length: days }, (_, i) => fasted[`r${i + 1}`]).filter(Boolean).length;
  const suhoorCount = Array.from({ length: days }, (_, i) => suhoor[`s${i + 1}`]).filter(Boolean).length;
  const pct = Math.round((fastedCount / days) * 100);

  return (
    <div className="fade-up pb-28">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[2rem] px-5 pt-8 pb-8 mb-4 shadow-elevated"
        style={{ background: "var(--g-hero)" }}>
        <h1 className="font-quran text-3xl text-white">صيام رمضان</h1>
        <p className="text-xs text-white/60 mt-1">تتبّع صيامك يوماً بيوم في شهر رمضان المبارك</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "صُمتها", value: fastedCount },
            { label: "مع السحور", value: suhoorCount },
            { label: "نسبة الإكمال", value: `${pct}%` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl py-2.5 px-2" style={{ background: "oklch(1 0 0 / 12%)" }}>
              <p className="font-quran text-2xl text-white">{value}</p>
              <p className="text-[10px] text-white/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 15%)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--g-gold)" }} />
        </div>
      </div>

      {/* Days count selector */}
      <div className="flex items-center justify-between px-4 mb-4">
        <p className="text-sm font-semibold text-foreground">أيام رمضان</p>
        <div className="flex gap-2">
          {[29, 30].map(d => (
            <button key={d} onClick={() => { setDays(d); persist(fasted, suhoor, d); }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                days === d
                  ? "text-white"
                  : "bg-card border border-border text-foreground"
              }`}
              style={days === d ? { background: "var(--g-primary)" } : {}}>
              {d} يوم
            </button>
          ))}
        </div>
      </div>

      {/* Completion trophy */}
      {fastedCount === days && (
        <div className="mx-4 mb-4 rounded-3xl p-5 text-center text-white"
          style={{ background: "var(--g-gold)" }}>
          <Trophy className="h-10 w-10 mx-auto mb-2 text-amber-900" />
          <p className="font-quran text-2xl text-amber-900">تقبّل الله صيامك!</p>
          <p className="text-sm text-amber-800/80 mt-1">اللهم تقبّل منا صيامنا وقيامنا</p>
        </div>
      )}

      {/* Days Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">اضغط على اليوم لتسجيل الصيام</p>
          <div className="flex gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded" style={{ background: "var(--g-primary)" }} /> صام</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-400/50" /> مع سحور</span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const hasFasted = !!fasted[`r${day}`];
            const hasSuhoor = !!suhoor[`s${day}`];
            return (
              <div key={day} className={`rounded-2xl overflow-hidden border transition ${
                hasFasted ? "border-primary/30" : "border-border/40"
              }`}>
                <button
                  onClick={() => toggleFast(day)}
                  className={`w-full py-3 text-center text-sm font-bold transition active:scale-90 ${
                    hasFasted ? "text-white" : "bg-card text-foreground"
                  }`}
                  style={hasFasted ? { background: "var(--g-primary)" } : {}}>
                  <span className="font-quran text-base">{day}</span>
                  {hasFasted && <div className="text-[8px] mt-0.5 opacity-80">✓</div>}
                </button>
                <button
                  onClick={() => toggleSuhoor(day)}
                  title="سحور"
                  className={`w-full py-1 text-[10px] text-center border-t transition ${
                    hasSuhoor
                      ? "bg-amber-400/20 text-amber-600 dark:text-amber-400 border-amber-400/20"
                      : "bg-muted/20 text-muted-foreground border-border/30"
                  }`}>
                  {hasSuhoor ? <Moon className="h-2.5 w-2.5 mx-auto" /> : <Sun className="h-2.5 w-2.5 mx-auto opacity-30" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hadith about fasting */}
      <div className="mx-4 mt-6 rounded-3xl p-5 border border-border/60 bg-card shadow-soft">
        <p className="font-quran text-xl text-foreground leading-loose" dir="rtl">
          «الصِّيَامُ جُنَّةٌ، فَإِذَا كَانَ يَوْمُ صَوْمِ أَحَدِكُمْ فَلَا يَرْفُثْ وَلَا يَصْخَبْ»
        </p>
        <p className="text-xs text-muted-foreground mt-2">متفق عليه</p>
      </div>
    </div>
  );
}
