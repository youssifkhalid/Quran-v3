import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Trash2, CheckCircle2, Circle, Flame, Trophy, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wird")({
  head: () => ({
    meta: [
      { title: "الورد اليومي — سكينة" },
      { name: "description", content: "خطط ورْدَك اليومي من القرآن والأذكار وتتبّع التزامك." },
    ],
  }),
  component: WirdPage,
});

const WIRD_KEY = "sakeenah:wird";
const STREAK_KEY = "sakeenah:wird-streak";

interface WirdItem {
  id: string;
  type: "quran" | "adhkar" | "hadith" | "prayer" | "custom";
  label: string;
  target: number;
  unit: string;
  icon: string;
}

interface DayLog {
  date: string;
  completed: string[];
  progress: Record<string, number>;
}

const PRESET_ITEMS: WirdItem[] = [
  { id: "quran-pages", type: "quran",  label: "قراءة القرآن",      target: 2,   unit: "صفحة",   icon: "📖" },
  { id: "fajr",        type: "prayer", label: "صلاة الفجر",         target: 1,   unit: "صلاة",   icon: "🌅" },
  { id: "morning-dhikr",type:"adhkar", label: "أذكار الصباح",       target: 1,   unit: "ختمة",   icon: "☀️" },
  { id: "evening-dhikr",type:"adhkar", label: "أذكار المساء",       target: 1,   unit: "ختمة",   icon: "🌙" },
  { id: "tasbih-100",  type: "adhkar", label: "تسبيح ١٠٠",          target: 100, unit: "مرة",    icon: "📿" },
  { id: "istighfar",   type: "adhkar", label: "الاستغفار",           target: 100, unit: "مرة",    icon: "🤲" },
  { id: "salawat",     type: "adhkar", label: "الصلاة على النبي ﷺ", target: 100, unit: "مرة",    icon: "💚" },
  { id: "quran-surah", type: "quran",  label: "سورة الكهف",          target: 1,   unit: "سورة",   icon: "📖" },
  { id: "hadith-read", type: "hadith", label: "قراءة حديث",          target: 3,   unit: "أحاديث", icon: "📚" },
  { id: "dua-qunut",   type: "adhkar", label: "دعاء القنوت",         target: 1,   unit: "مرة",    icon: "🌟" },
  { id: "surah-mulk",  type: "quran",  label: "سورة الملك",           target: 1,   unit: "مرة",    icon: "👑" },
  { id: "surah-sajda", type: "quran",  label: "سورة السجدة",          target: 1,   unit: "مرة",    icon: "📿" },
];

const WIRD_TYPES = [
  { type: "quran",   color: "from-emerald-500 to-teal-600",   label: "قرآن"   },
  { type: "adhkar",  color: "from-amber-500 to-orange-600",   label: "أذكار"  },
  { type: "prayer",  color: "from-primary/80 to-primary",     label: "صلاة"   },
  { type: "hadith",  color: "from-blue-500 to-indigo-600",    label: "حديث"   },
  { type: "custom",  color: "from-purple-500 to-pink-600",    label: "مخصص"   },
];

function getColorClass(type: string) {
  return WIRD_TYPES.find(t => t.type === type)?.color ?? "gradient-primary";
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

function calcStreak(logs: Record<string, DayLog>, totalItems: number): number {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10);
    const log = logs[key];
    if (!log || log.completed.length < totalItems) break;
    streak++;
  }
  return streak;
}

function WirdPage() {
  const [items, setItems] = useState<WirdItem[]>([]);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [tab, setTab] = useState<"today" | "setup" | "streak">("today");
  const [adding, setAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customTarget, setCustomTarget] = useState(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIRD_KEY);
      if (raw) { const d = JSON.parse(raw); setItems(d.items ?? []); setLogs(d.logs ?? {}); }
      else { setItems(PRESET_ITEMS.slice(0, 5)); }
    } catch {}
  }, []);

  function persist(newItems: WirdItem[], newLogs: Record<string, DayLog>) {
    localStorage.setItem(WIRD_KEY, JSON.stringify({ items: newItems, logs: newLogs }));
  }

  const today = logs[todayKey()] ?? { date: todayKey(), completed: [], progress: {} };
  const completedToday = today.completed.length;
  const totalItems = items.length;
  const pct = totalItems ? Math.round((completedToday / totalItems) * 100) : 0;
  const streak = useMemo(() => calcStreak(logs, totalItems), [logs, totalItems]);
  const allDone = completedToday >= totalItems && totalItems > 0;

  function toggleItem(id: string) {
    const newLog = { ...today };
    if (newLog.completed.includes(id)) {
      newLog.completed = newLog.completed.filter(c => c !== id);
    } else {
      newLog.completed = [...newLog.completed, id];
      if (typeof navigator !== "undefined") navigator.vibrate?.(18);
    }
    const newLogs = { ...logs, [todayKey()]: newLog };
    setLogs(newLogs);
    persist(items, newLogs);
    if (newLog.completed.length === totalItems && totalItems > 0) {
      toast.success("🎉 أتممت ورْدَك اليوم! بارك الله فيك", { duration: 4000 });
    }
  }

  function addPreset(preset: WirdItem) {
    if (items.find(i => i.id === preset.id)) return;
    const newItems = [...items, preset];
    setItems(newItems); persist(newItems, logs);
    toast.success(`أضيف: ${preset.label}`);
  }

  function addCustom() {
    if (!customLabel.trim()) return;
    const item: WirdItem = {
      id: `custom-${Date.now()}`, type: "custom",
      label: customLabel.trim(), target: customTarget, unit: "مرة", icon: "⭐"
    };
    const newItems = [...items, item];
    setItems(newItems); persist(newItems, logs);
    setCustomLabel(""); setCustomTarget(1); setAdding(false);
    toast.success("أضيف بند مخصص");
  }

  function removeItem(id: string) {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems); persist(newItems, logs);
  }

  function resetToday() {
    const newLogs = { ...logs, [todayKey()]: { date: todayKey(), completed: [], progress: {} } };
    setLogs(newLogs); persist(items, newLogs);
  }

  // Last 14 days for streak view
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const log = logs[key];
    const count = log?.completed.length ?? 0;
    const isToday = i === 13;
    return { key, d, count, isToday };
  });

  return (
    <div className="fade-up min-h-[calc(100dvh-5rem)] pb-8">
      {/* Hero */}
      <div className={`relative overflow-hidden rounded-b-[2.5rem] px-5 pt-8 pb-8 shadow-elevated mb-4 ${allDone ? "gradient-gold" : "gradient-hero"} text-primary-foreground pattern-islamic`}>
        <div className="relative text-center">
          {allDone
            ? <><Trophy className="h-12 w-12 mx-auto mb-2" /><p className="font-quran text-2xl">أتممت ورْدَك اليوم!</p></>
            : <>
                <p className="text-xs opacity-75 mb-1">ورْدُك اليومي</p>
                <div className="relative inline-flex">
                  <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={2*Math.PI*50}
                      strokeDashoffset={2*Math.PI*50*(1-pct/100)}
                      style={{transition:"stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)"}}/>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <span className="font-quran text-3xl">{pct}%</span>
                      <span className="block text-[10px] opacity-70">{completedToday}/{totalItems}</span>
                    </div>
                  </div>
                </div>
              </>
          }
          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-300"/><span>{streak} يوم متتالي</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 gap-2 mb-4">
        {([["today","اليوم"],["setup","إعداد الورد"],["streak","السجل"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition ${tab===k?"gradient-primary text-primary-foreground shadow-glow":"bg-card border border-border text-muted-foreground"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {tab === "today" && (
        <div className="px-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold">{new Date().toLocaleDateString("ar",{weekday:"long",day:"numeric",month:"long"})}</p>
            {completedToday > 0 && (
              <button onClick={resetToday} className="text-xs text-muted-foreground flex items-center gap-1">
                <RotateCcw className="h-3 w-3"/> إعادة
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-30"/>
              <p className="font-quran text-lg">لا يوجد ورد بعد</p>
              <p className="text-sm mt-2">اذهب لـ «إعداد الورد» لإضافة بنود</p>
              <button onClick={() => setTab("setup")}
                className="mt-4 rounded-full gradient-primary text-primary-foreground px-6 py-2 text-sm shadow-elevated">
                إعداد الورد
              </button>
            </div>
          ) : items.map(item => {
            const done = today.completed.includes(item.id);
            return (
              <button key={item.id} onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-4 rounded-3xl p-4 shadow-soft border transition active:scale-[0.98] text-right ${done?"bg-primary/5 border-primary/25":"bg-card border-border/60"}`}>
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${getColorClass(item.type)} text-white text-xl shrink-0 shadow-glow`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.target} {item.unit}</p>
                </div>
                {done
                  ? <CheckCircle2 className="h-6 w-6 text-primary shrink-0"/>
                  : <Circle className="h-6 w-6 text-muted-foreground/40 shrink-0"/>
                }
              </button>
            );
          })}
        </div>
      )}

      {/* SETUP TAB */}
      {tab === "setup" && (
        <div className="px-4 space-y-4">
          <h2 className="font-semibold text-sm">بنود وردك الحالية</h2>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-3 shadow-soft">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.target} {item.unit}</p>
              </div>
              <button onClick={() => removeItem(item.id)} className="grid h-8 w-8 place-items-center rounded-xl bg-destructive/10 text-destructive shrink-0">
                <Trash2 className="h-3.5 w-3.5"/>
              </button>
            </div>
          ))}

          <div className="rounded-3xl bg-card border border-border/60 p-4 shadow-soft">
            <p className="text-sm font-semibold mb-3">أضف من الأورد المقترحة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_ITEMS.filter(p => !items.find(i => i.id === p.id)).map(p => (
                <button key={p.id} onClick={() => addPreset(p)}
                  className="flex items-center gap-2 rounded-2xl bg-muted/50 border border-border p-3 text-right hover:border-primary/30 transition active:scale-95">
                  <span className="text-xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground">{p.target} {p.unit}</p>
                  </div>
                  <Plus className="h-4 w-4 text-primary shrink-0"/>
                </button>
              ))}
            </div>
          </div>

          {/* Custom item */}
          <div className="rounded-3xl bg-card border border-border/60 p-4 shadow-soft">
            <button onClick={() => setAdding(a => !a)}
              className="flex items-center gap-2 text-sm font-semibold text-primary w-full">
              <Plus className="h-4 w-4"/> أضف بنداً مخصصاً
            </button>
            {adding && (
              <div className="mt-3 space-y-2 fade-up">
                <input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                  placeholder="اسم البند…"
                  className="w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"/>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground shrink-0">الهدف:</span>
                  <input type="number" min={1} value={customTarget} onChange={e => setCustomTarget(Number(e.target.value))}
                    className="w-20 rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm outline-none"/>
                  <span className="text-xs text-muted-foreground">مرة</span>
                </div>
                <button onClick={addCustom}
                  className="w-full rounded-xl gradient-primary text-primary-foreground py-2.5 text-sm font-bold shadow-glow">
                  إضافة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STREAK TAB */}
      {tab === "streak" && (
        <div className="px-4">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "الانتظام الحالي", value: `${streak} يوم`, Icon: Flame },
              { label: "أيام مكتملة", value: Object.values(logs).filter(l => l.completed.length >= totalItems).length, Icon: CheckCircle2 },
              { label: "بنود وردك", value: totalItems, Icon: Star },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-2xl bg-card border border-border/60 shadow-soft p-4 text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1"/>
                <p className="font-quran text-xl">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold mb-3">آخر ١٤ يوماً</p>
          <div className="grid grid-cols-7 gap-1.5">
            {last14.map(({ key, d, count, isToday }) => {
              const done = totalItems > 0 && count >= totalItems;
              const partial = count > 0 && count < totalItems;
              return (
                <div key={key} className={`rounded-xl p-2 text-center border transition ${
                  done    ? "gradient-primary text-primary-foreground border-transparent" :
                  partial ? "bg-primary/15 border-primary/20 text-foreground" :
                  isToday ? "border-2 border-primary bg-card text-foreground" :
                  "bg-muted/40 border-transparent text-muted-foreground"
                }`}>
                  <p className="text-[9px]">{d.toLocaleDateString("ar",{weekday:"narrow"})}</p>
                  <p className="text-xs font-bold mt-0.5">{done ? "✓" : count || "—"}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3 text-[10px] text-muted-foreground">
            <span className="flex gap-1 items-center"><span className="h-3 w-3 rounded gradient-primary inline-block"/>مكتمل</span>
            <span className="flex gap-1 items-center"><span className="h-3 w-3 rounded bg-primary/15 inline-block"/>جزئي</span>
            <span className="flex gap-1 items-center"><span className="h-3 w-3 rounded bg-muted inline-block"/>لم يكتمل</span>
          </div>
        </div>
      )}
    </div>
  );
}
