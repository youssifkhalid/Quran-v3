import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  BookOpen, Compass, MoonStar, Sparkles, Calculator,
  ChevronLeft, Search, Bookmark, Trophy, Map, Settings,
  BookMarked, Bot, Heart, Radio, Moon, BookOpenCheck,
  Flame, Star, CalendarDays, Mic2, 
} from "lucide-react";
import { fetchDailyAyah } from "@/lib/quran";
import { fetchPrayerTimes, fetchHijriToday, getNextPrayer, PRAYER_NAMES_AR } from "@/lib/islamic";
import { useGeolocation } from "@/lib/geo";
import { DAILY_HADITH, DAILY_DUA } from "@/data/adhkar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سكينة — تطبيقك الإسلامي الشامل" },
      { name: "description", content: "القرآن الكريم، مواقيت الصلاة، الأذكار، AI إسلامي، الختمة، الورد اليومي والمزيد." },
    ],
  }),
  component: Home,
});

function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    const cached = typeof window !== "undefined" && localStorage.getItem("coords");
    if (cached) setCoords(JSON.parse(cached));
    useGeolocation().then((c) => {
      if (c) { setCoords(c); localStorage.setItem("coords", JSON.stringify(c)); }
    });
  }, []);

  const ayah   = useQuery({ queryKey: ["daily-ayah"], queryFn: fetchDailyAyah, staleTime: 1000 * 60 * 60 });
  const prayer = useQuery({
    queryKey: ["prayer", coords?.lat, coords?.lng],
    queryFn:  () => fetchPrayerTimes(coords!.lat, coords!.lng),
    enabled:  !!coords, staleTime: 1000 * 60 * 30,
  });
  const hijri = useQuery({ queryKey: ["hijri"], queryFn: fetchHijriToday, staleTime: 1000 * 60 * 60 * 6 });

  const next = prayer.data ? getNextPrayer(prayer.data.timings) : null;
  const hadith = DAILY_HADITH[new Date().getDate() % DAILY_HADITH.length];
  const dua    = DAILY_DUA[new Date().getDate() % DAILY_DUA.length];

  const wirdProgress = (() => {
    try {
      const raw = localStorage.getItem("sakeenah:wird");
      if (!raw) return null;
      const d = JSON.parse(raw);
      const today = new Date().toISOString().slice(0,10);
      const log = d.logs?.[today];
      const total = d.items?.length ?? 0;
      const done  = log?.completed?.length ?? 0;
      return { done, total, pct: total ? Math.round((done/total)*100) : 0 };
    } catch { return null; }
  })();

  const khatmahPct = (() => {
    try { const r = localStorage.getItem("sakeenah:khatmah"); return r ? Math.round((JSON.parse(r).pagesRead.length / 604) * 100) : null; } catch { return null; }
  })();
  const lastRead = (() => { try { return JSON.parse(localStorage.getItem("sakeenah:lastRead") ?? "null"); } catch { return null; } })();
  const prayedToday = (() => { try { const t=new Date().toISOString().slice(0,10); return (JSON.parse(localStorage.getItem("sakeenah:prayer-tracker")??"{}")[t]??[]).length; } catch { return 0; } })();
  const streak = (() => { try { const raw=localStorage.getItem("sakeenah:wird"); if(!raw)return 0; const d=JSON.parse(raw); let s=0; const today=new Date(); for(let i=0;i<365;i++){ const k=new Date(today.getTime()-i*86400000).toISOString().slice(0,10); if(!(d.logs?.[k]?.completed?.length >= (d.items?.length??1)))break; s++; } return s; } catch { return 0; } })();

  return (
    <div className="fade-up">
      {/* ── HERO PRAYER SECTION ── */}
      <header className="relative overflow-hidden rounded-b-[2.5rem] gradient-hero text-primary-foreground pattern-islamic px-5 pt-8 pb-10 shadow-elevated">
        <div aria-hidden className="absolute inset-0 opacity-20" style={{background:"radial-gradient(circle at 70% 20%, var(--gold) 0%, transparent 50%)"}}/>
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs opacity-75">السلام عليكم</p>
              <p className="font-quran text-lg mt-0.5">
                {hijri.data ? `${hijri.data.day} ${hijri.data.month.ar} ${hijri.data.year}هـ` : "—"}
              </p>
            </div>
            <Link to="/settings"
              className="flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5 text-[10px] backdrop-blur">
              <Settings className="h-3 w-3"/>
              {hijri.data?.weekday?.ar ?? "الإعدادات"}
            </Link>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] opacity-60">الصلاة القادمة</p>
            <h1 className="font-quran text-5xl mt-1 text-gradient-gold">
              {next ? PRAYER_NAMES_AR[next.name] : coords ? "…" : "فعّل الموقع"}
            </h1>
            {next && (
              <>
                <p className="mt-1.5 text-sm opacity-90">بعد {next.in}</p>
                <p className="mt-1 text-3xl font-light tracking-widest">{next.at.toTimeString().slice(0,5)}</p>
              </>
            )}
          </div>

          {/* 5 prayers strip */}
          <div className="mt-5 grid grid-cols-5 gap-1.5 rounded-2xl bg-black/20 backdrop-blur p-2">
            {prayer.data
              ? (["Fajr","Dhuhr","Asr","Maghrib","Isha"] as const).map(k => (
                  <Link to="/prayer" key={k}
                    className={`flex flex-col items-center rounded-xl py-2 text-center transition active:scale-95 ${next?.name===k?"gradient-gold text-gold-foreground shadow-gold":""}`}>
                    <span className="text-[9px] opacity-80">{PRAYER_NAMES_AR[k]}</span>
                    <span className="text-xs font-bold mt-0.5">{prayer.data.timings[k].slice(0,5)}</span>
                  </Link>
                ))
              : Array.from({length:5}).map((_,i) => <div key={i} className="h-12 rounded-xl bg-white/10 animate-pulse"/>)
            }
          </div>
        </div>
      </header>

      {/* ── STATS STRIP ── */}
      {(prayedToday > 0 || wirdProgress || streak > 1) && (
        <section className="mx-4 mt-4 grid grid-cols-3 gap-2">
          <Link to="/prayer" className="rounded-2xl bg-card border border-border/60 shadow-soft p-3 text-center active:scale-95 transition">
            <p className="font-quran text-xl text-primary">{prayedToday}<span className="text-xs">/٥</span></p>
            <p className="text-[9px] text-muted-foreground mt-0.5">صلوات اليوم</p>
          </Link>
          {wirdProgress ? (
            <Link to="/wird" className="rounded-2xl bg-card border border-border/60 shadow-soft p-3 text-center active:scale-95 transition">
              <p className="font-quran text-xl text-gold">{wirdProgress.pct}%</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">الورد اليومي</p>
            </Link>
          ) : (
            <Link to="/khatmah" className="rounded-2xl bg-card border border-border/60 shadow-soft p-3 text-center active:scale-95 transition">
              <p className="font-quran text-xl text-gold">{khatmahPct !== null ? `${khatmahPct}%` : "ختمة"}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{khatmahPct !== null ? "تقدم الختمة" : "ابدأ ختمتك"}</p>
            </Link>
          )}
          <Link to="/wird" className="rounded-2xl bg-card border border-border/60 shadow-soft p-3 text-center active:scale-95 transition">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-orange-500"/>
              <p className="font-quran text-xl">{streak}</p>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">يوم انتظام</p>
          </Link>
        </section>
      )}

      {/* ── PRIMARY QUICK ACTIONS ── */}
      <section className="px-4 mt-5">
        <p className="text-xs font-semibold text-muted-foreground mb-2.5">الأكثر استخداماً</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { to: "/quran",   icon: BookOpen,   label: "القرآن",    gradient: "gradient-primary" },
            { to: "/qibla",   icon: Compass,    label: "القبلة",    gradient: "gradient-gold"    },
            { to: "/adhkar",  icon: Sparkles,   label: "الأذكار",   gradient: "gradient-primary" },
            { to: "/tasbeeh", icon: Calculator, label: "المسبحة",   gradient: "gradient-gold"    },
          ].map(({ to, icon: Icon, label, gradient }) => (
            <Link key={to} to={to as any}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border/40 p-3 shadow-soft active:scale-90 transition">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${gradient} text-primary-foreground shadow-glow`}>
                <Icon className="h-5 w-5"/>
              </span>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AI CHAT BANNER ── */}
      <section className="mx-4 mt-5">
        <Link to="/ai-chat"
          className="flex items-center gap-4 rounded-3xl gradient-primary text-primary-foreground p-5 shadow-elevated active:scale-[0.98] transition overflow-hidden relative">
          <div aria-hidden className="absolute inset-0 opacity-20" style={{background:"radial-gradient(circle at 20% 50%, var(--gold) 0%, transparent 60%)"}}/>
          <div className="relative grid h-14 w-14 place-items-center rounded-3xl bg-gold/30 shrink-0">
            <Bot className="h-7 w-7"/>
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse"/>
          </div>
          <div className="relative flex-1 min-w-0">
            <p className="font-bold text-base">المساعد الإسلامي AI</p>
            <p className="text-xs opacity-80 mt-0.5">اسأل عن الفقه والحديث والتفسير • مع المصادر</p>
          </div>
          <ChevronLeft className="relative h-5 w-5 opacity-70 shrink-0 rtl:rotate-180"/>
        </Link>
      </section>

      {/* ── CONTINUE READING ── */}
      {lastRead && (
        <section className="mx-4 mt-4">
          <Link to="/quran/$id" params={{ id: String(lastRead.surah ?? 1) }}
            className="flex items-center gap-3 rounded-3xl bg-card border border-gold/30 p-4 shadow-soft active:scale-[0.98] transition">
            <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-gold-foreground shadow-gold shrink-0">
              <BookMarked className="h-5 w-5"/>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">متابعة القراءة</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">سورة {lastRead.surah} — آية {lastRead.ayah}</p>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground rtl:rotate-180 shrink-0"/>
          </Link>
        </section>
      )}

      {/* ── SECONDARY TOOLS GRID ── */}
      <section className="px-4 mt-5">
        <p className="text-xs font-semibold text-muted-foreground mb-2.5">اكتشف المزيد</p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { to: "/prayer",   icon: MoonStar,     label: "الصلاة"         },
            { to: "/hadith",   icon: BookOpen,      label: "الحديث"         },
            { to: "/dua",      icon: Heart,         label: "الأدعية"        },
            { to: "/khatmah",  icon: Trophy,        label: "ختمة"           },
            { to: "/wird",     icon: Star,          label: "الورد"          },
            { to: "/fasting",  icon: Moon,          label: "الصيام"         },
            { to: "/calendar", icon: CalendarDays,  label: "التقويم"        },
            { to: "/names",    icon: Star,           label: "الأسماء" },
            { to: "/radio",    icon: Radio,         label: "إذاعة القرآن"   },
            { to: "/reciters", icon: Mic2,          label: "الشيوخ"         },
            { to: "/search",   icon: Search,        label: "بحث شامل"       },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to as any}
              className="flex items-center gap-2.5 rounded-2xl bg-card border border-border/40 p-3 shadow-soft active:scale-95 transition">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="h-4 w-4"/>
              </span>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── DAILY AYAH ── */}
      <section className="mx-4 mt-6 rounded-3xl bg-card border border-border/60 shadow-soft p-5 relative overflow-hidden">
        <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl"/>
        <div className="flex items-center gap-2 mb-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl gradient-gold text-gold-foreground">
            <MoonStar className="h-4 w-4"/>
          </span>
          <h2 className="text-sm font-semibold">آية اليوم</h2>
          <span className="mr-auto text-[10px] text-muted-foreground">{ayah.data?.reference}</span>
        </div>
        <p className="font-quran text-xl leading-loose">
          {ayah.isLoading ? <span className="block h-16 shimmer"/> : ayah.data?.ayah}
        </p>
        <button onClick={() => {
          const t = `${ayah.data?.ayah}\n\n— ${ayah.data?.reference}\n\nسكينة، تطبيقك الإسلامي`;
          if (navigator.share) navigator.share({ text: t }).catch(() => {});
        }} className="mt-2 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          مشاركة الآية
        </button>
      </section>

      {/* ── HADITH OF DAY ── */}
      <section className="mx-4 mt-4 rounded-3xl gradient-primary text-primary-foreground p-5 shadow-elevated relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-10" style={{background:"radial-gradient(circle at 80% 20%, white 0%, transparent 50%)"}}/>
        <div className="flex items-center gap-2 mb-3 relative">
          <BookOpen className="h-4 w-4"/>
          <h2 className="text-sm font-semibold opacity-90">حديث اليوم</h2>
        </div>
        <p className="font-quran text-lg leading-loose relative">«{hadith.text}»</p>
        <p className="text-xs opacity-70 mt-2 relative">{hadith.source}</p>
        <Link to="/hadith" className="mt-3 inline-flex items-center gap-1 text-xs opacity-80 hover:opacity-100 relative">
          مكتبة الحديث ←
        </Link>
      </section>

      {/* ── DUA OF DAY ── */}
      <section className="mx-4 mt-4 mb-6 rounded-3xl bg-card border border-gold/25 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold/15 text-gold">🤲</span>
          <h2 className="text-sm font-semibold">دعاء اليوم</h2>
        </div>
        <p className="font-quran text-xl leading-loose">{dua}</p>
      </section>
    </div>
  );
}
