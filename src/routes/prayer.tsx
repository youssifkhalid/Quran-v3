import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Circle, ChevronLeft, ChevronRight, CalendarDays, Bell, BellOff } from "lucide-react";
import { fetchPrayerTimes, getNextPrayer, PRAYER_NAMES_AR, type PrayerTimes } from "@/lib/islamic";
import { useGeolocation } from "@/lib/geo";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "مواقيت الصلاة — سكينة" },
      { name: "description", content: "مواقيت الصلاة الدقيقة حسب موقعك مع العدّ التنازلي وتتبع الصلوات." },
    ],
  }),
  component: PrayerPage,
});

const TRACKER_KEY = "sakeenah:prayer-tracker";
const NOTIF_KEY = "sakeenah:prayer-notif";

type PrayerKey = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
const FIVE_PRAYERS: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function PrayerPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [showMonthly, setShowMonthly] = useState(false);
  const [tab, setTab] = useState<"today" | "tracker" | "monthly">("today");

  useEffect(() => {
    const cached = typeof window !== "undefined" && localStorage.getItem("coords");
    if (cached) setCoords(JSON.parse(cached));
    useGeolocation().then((c) => {
      if (c) { setCoords(c); localStorage.setItem("coords", JSON.stringify(c)); }
    });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["prayer", coords?.lat, coords?.lng],
    queryFn: () => fetchPrayerTimes(coords!.lat, coords!.lng),
    enabled: !!coords,
    staleTime: 1000 * 60 * 30,
  });

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  // Prayer tracker
  const [prayed, setPrayed] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const raw = typeof window !== "undefined" && localStorage.getItem(TRACKER_KEY);
    if (raw) setPrayed(JSON.parse(raw));
  }, []);

  function togglePrayed(prayer: string) {
    const today = getTodayKey();
    setPrayed((prev) => {
      const todayList = prev[today] ?? [];
      const updated = todayList.includes(prayer)
        ? todayList.filter((p) => p !== prayer)
        : [...todayList, prayer];
      const next = { ...prev, [today]: updated };
      localStorage.setItem(TRACKER_KEY, JSON.stringify(next));
      return next;
    });
  }

  const todayPrayed = prayed[getTodayKey()] ?? [];

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(false);
  useEffect(() => {
    const n = localStorage.getItem(NOTIF_KEY);
    if (n === "true") setNotifEnabled(true);
  }, []);

  async function toggleNotif() {
    if (!notifEnabled) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifEnabled(true);
        localStorage.setItem(NOTIF_KEY, "true");
      }
    } else {
      setNotifEnabled(false);
      localStorage.setItem(NOTIF_KEY, "false");
    }
  }

  const next = data ? getNextPrayer(data.timings) : null;

  // Monthly dates (current month)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <div className="fade-up">
      <header className="relative overflow-hidden rounded-b-[2.5rem] gradient-hero text-primary-foreground pattern-islamic px-5 pt-8 pb-10 shadow-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs opacity-80">
            <MapPin className="h-3.5 w-3.5" />
            <span>{coords ? `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°` : "بانتظار الموقع…"}</span>
          </div>
          <button onClick={toggleNotif} className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100">
            {notifEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs opacity-75">الصلاة القادمة</p>
          <h1 className="font-quran text-6xl mt-1 text-gradient-gold">
            {next ? PRAYER_NAMES_AR[next.name] : "—"}
          </h1>
          {next && (
            <>
              <p className="mt-2 text-sm opacity-90">بعد {countdown(next.at)}</p>
              <p className="mt-1 text-3xl font-light tracking-wide">
                {next.at.toTimeString().slice(0, 5)}
              </p>
            </>
          )}
        </div>

        {/* Prayer strip */}
        <div className="mt-4 grid grid-cols-5 gap-1.5 rounded-2xl glass-dark p-2">
          {data
            ? (["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map((k) => (
                <div key={k} className={`flex flex-col items-center rounded-xl py-2 text-center ${next?.name === k ? "gradient-gold text-gold-foreground" : ""}`}>
                  <span className="text-[10px] opacity-80">{PRAYER_NAMES_AR[k]}</span>
                  <span className="text-xs font-bold mt-0.5">{data.timings[k].slice(0, 5)}</span>
                </div>
              ))
            : Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl skeleton opacity-30" />)}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex mx-4 mt-4 gap-2">
        {([
          { key: "today", label: "اليوم" },
          { key: "tracker", label: "المتابعة" },
          { key: "monthly", label: "جدول شهري" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${tab === key ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Today tab */}
      {tab === "today" && (
        <ul className="px-4 mt-4 space-y-2">
          {isLoading || !data
            ? Array.from({ length: 6 }).map((_, i) => <li key={i} className="h-16 rounded-2xl skeleton" />)
            : (["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map((k) => {
                const active = next?.name === k;
                return (
                  <li
                    key={k}
                    className={`flex items-center justify-between rounded-2xl p-4 shadow-soft transition ${
                      active ? "gradient-gold text-gold-foreground shadow-gold" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-foreground/10" : "bg-primary/10 text-primary"}`}>
                        <PrayerIcon name={k} />
                      </span>
                      <div>
                        <p className="font-quran text-lg leading-none">{PRAYER_NAMES_AR[k]}</p>
                        {active && <p className="text-[11px] mt-1 opacity-80">الصلاة القادمة</p>}
                      </div>
                    </div>
                    <span className="font-mono text-lg">{data.timings[k].slice(0, 5)}</span>
                  </li>
                );
              })}
        </ul>
      )}

      {/* Tracker tab */}
      {tab === "tracker" && (
        <div className="px-4 mt-4">
          <p className="text-sm text-muted-foreground mb-3">صلوات اليوم — {todayPrayed.length}/{FIVE_PRAYERS.length}</p>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
            <div className="h-full gradient-gold transition-all" style={{ width: `${(todayPrayed.length / 5) * 100}%` }} />
          </div>
          <ul className="space-y-2">
            {FIVE_PRAYERS.map((k) => {
              const done = todayPrayed.includes(k);
              return (
                <li key={k}>
                  <button
                    onClick={() => togglePrayed(k)}
                    className={`w-full flex items-center gap-4 rounded-2xl p-4 shadow-soft transition active:scale-[0.98] ${done ? "bg-primary/5 border border-primary/20" : "bg-card"}`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 text-right">
                      <p className="font-quran text-xl">{PRAYER_NAMES_AR[k]}</p>
                      {data && <p className="text-xs text-muted-foreground mt-0.5">{data.timings[k].slice(0, 5)}</p>}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {done ? "✓ صليت" : "لم تُصَلَّ"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Weekly history */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-3">الأسبوع الماضي</p>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().slice(0, 10);
                const count = (prayed[key] ?? []).length;
                const isToday = i === 6;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {d.toLocaleDateString("ar", { weekday: "narrow" })}
                    </span>
                    <div className={`h-10 w-full rounded-lg flex items-center justify-center text-xs font-bold ${
                      isToday ? "border-2 border-primary" : ""
                    } ${
                      count === 5 ? "gradient-primary text-primary-foreground" :
                      count >= 3 ? "bg-primary/30 text-primary" :
                      count > 0 ? "bg-primary/10 text-muted-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {count}/5
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Monthly tab */}
      {tab === "monthly" && (
        <div className="px-4 mt-4">
          <p className="text-center text-sm font-semibold mb-3">
            {now.toLocaleDateString("ar", { month: "long", year: "numeric" })}
          </p>
          {!data ? (
            <p className="text-center text-sm text-muted-foreground py-6">يرجى تفعيل الموقع لعرض الجدول</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-right py-2 pr-2">اليوم</th>
                    {FIVE_PRAYERS.map((k) => <th key={k} className="text-center py-2 px-1">{PRAYER_NAMES_AR[k]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(7, daysInMonth) }).map((_, i) => {
                    const isToday = i + 1 === now.getDate();
                    return (
                      <tr key={i} className={`border-t border-border/40 ${isToday ? "bg-primary/5 font-bold" : ""}`}>
                        <td className="py-2 pr-2 text-right">{i + 1}</td>
                        {FIVE_PRAYERS.map((k) => (
                          <td key={k} className="text-center py-2 px-1">
                            {data.timings[k].slice(0, 5)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-center text-xs text-muted-foreground mt-3 opacity-60">* مواقيت اليوم فقط — متاح عبر API</p>
            </div>
          )}
        </div>
      )}

      {tick === -1 && null}
    </div>
  );
}

function PrayerIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    Fajr: "🌅", Sunrise: "☀️", Dhuhr: "🌞", Asr: "🌤️", Maghrib: "🌆", Isha: "🌙",
  };
  return <span className="text-base">{icons[name] ?? "•"}</span>;
}

function countdown(at: Date): string {
  const ms = Math.max(0, at.getTime() - Date.now());
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
const pad = (n: number) => String(n).padStart(2, "0");
