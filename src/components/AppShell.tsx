import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen, Home, MoonStar, Sparkles, Bot, Search,
  Compass, Calculator, BookMarked, Trophy, Map,
  Settings, Heart, Star, CalendarDays, Mic2,
  Radio, Moon, Flame
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { MiniPlayer } from "@/components/MiniPlayer";

/* ─── Navigation config ─── */
const PRIMARY_NAV = [
  { to: "/",        icon: Home,     label: "الرئيسية", kbd: "H" },
  { to: "/quran",   icon: BookOpen, label: "القرآن",   kbd: "Q" },
  { to: "/ai-chat", icon: Bot,      label: "مساعد AI", kbd: "A", badge: true },
  { to: "/prayer",  icon: MoonStar, label: "الصلاة",   kbd: "P" },
  { to: "/adhkar",  icon: Sparkles, label: "الأذكار",  kbd: "D" },
] as const;

const SECONDARY_NAV = [
  { group: "قرآن وذكر",    items: [
    { to: "/search",    icon: Search,      label: "البحث الشامل",    kbd: "K" },
    { to: "/hadith",    icon: BookOpen,    label: "مكتبة الحديث"         },
    { to: "/dua",       icon: Heart,       label: "الأدعية"              },
    { to: "/tasbeeh",   icon: Star,        label: "المسبحة"              },
    { to: "/radio",     icon: Radio,       label: "إذاعة القرآن"         },
    { to: "/reciters",  icon: Mic2,        label: "الشيوخ والقراء"       },
  ]},
  { group: "عبادة وتخطيط", items: [
    { to: "/wird",      icon: Flame,       label: "الورد اليومي"         },
    { to: "/khatmah",   icon: Trophy,      label: "ختمة القرآن"          },
    { to: "/fasting",   icon: Moon,        label: "تتبّع الصيام"         },
    { to: "/rakaat",    icon: Calculator,  label: "عداد الركعات"         },
    { to: "/qibla",     icon: Compass,     label: "القبلة"               },
    { to: "/bookmarks", icon: BookMarked,  label: "الإشارات"             },
  ]},
  { group: "أدوات",         items: [
    { to: "/calendar",  icon: CalendarDays, label: "التقويم الهجري"     },
    { to: "/names",     icon: Star,         label: "أسماء إسلامية"      },
    { to: "/tools",     icon: Map,          label: "أدوات إسلامية"      },
    { to: "/settings",  icon: Settings,     label: "الإعدادات"           },
  ]},
] as const;

/* ─── Keyboard shortcuts ─── */
function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (inInput) return;
      if ((e.metaKey || e.ctrlKey)) {
        const map: Record<string, string> = { k:"/search", q:"/quran", a:"/ai-chat", p:"/prayer", h:"/", d:"/adhkar" };
        if (map[e.key]) { e.preventDefault(); window.location.href = map[e.key]; }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

/* ─── Responsive hook ─── */
function useIsDesktop() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setOk(mq.matches);
    mq.addEventListener("change", e => setOk(e.matches));
    return () => mq.removeEventListener("change", () => {});
  }, []);
  return ok;
}

/* ─── Sidebar NavItem ─── */
function SideNavItem({ to, icon: Icon, label, kbd, badge, active }: {
  to: string; icon: any; label: string; kbd?: string; badge?: boolean; active: boolean;
}) {
  return (
    <Link to={to as any}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group ${
        active
          ? "gradient-primary text-primary-foreground shadow-glow font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-primary/6"
      }`}
      aria-current={active ? "page" : undefined}>
      <span className={`grid h-7 w-7 place-items-center rounded-xl shrink-0 transition-all ${
        active ? "bg-white/20" : "bg-card group-hover:bg-primary/10 group-hover:text-primary"
      }`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 leading-none">{label}</span>
      {badge && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
      {kbd && !active && (
        <span className="hidden xl:flex kbd shrink-0">⌘{kbd}</span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  useKeyboardShortcuts();

  const isActive = (to: string) => to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <AudioPlayerProvider>
      <div className="relative min-h-dvh bg-background text-foreground">
        {/* Ambient gradient background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{
          background: `
            radial-gradient(ellipse 80% 45% at 50% -10%,
              color-mix(in oklab, var(--primary-glow) 18%, transparent), transparent 70%),
            radial-gradient(ellipse 40% 30% at 90% 90%,
              color-mix(in oklab, var(--gold) 6%, transparent), transparent 55%),
            radial-gradient(ellipse 30% 20% at 5% 60%,
              color-mix(in oklab, var(--primary) 4%, transparent), transparent 50%)
          `
        }} />

        {/* ─── Layout ─── */}
        <div className="md:flex md:min-h-dvh">

          {/* ══ DESKTOP / TABLET SIDEBAR ══ */}
          <aside className="hidden md:flex md:flex-col w-[220px] lg:w-[248px] xl:w-[272px] shrink-0
            sticky top-0 h-dvh border-l border-border/30 overflow-y-auto scroll-area
            bg-background/80 backdrop-blur-2xl z-40">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 px-5 pt-6 pb-5">
              <div className="relative grid h-11 w-11 place-items-center rounded-[14px] gradient-primary text-primary-foreground shadow-glow">
                <span className="font-quran text-2xl leading-none">س</span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div>
                <p className="font-quran text-xl leading-none">سكينة</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">تطبيقك الإسلامي الشامل</p>
              </div>
            </Link>

            {/* Primary nav */}
            <div className="px-3 space-y-0.5 mb-1">
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">رئيسي</p>
              {PRIMARY_NAV.map(nav => (
                <SideNavItem key={nav.to} {...nav} badge={"badge" in nav ? nav.badge : false} active={isActive(nav.to)} />
              ))}
            </div>

            {/* Secondary nav groups */}
            {SECONDARY_NAV.map(group => (
              <div key={group.group} className="px-3 mt-3 mb-1 space-y-0.5">
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">{group.group}</p>
                {(group.items as any[]).map((nav: any) => (
                  <SideNavItem key={nav.to} {...nav} badge={false} active={isActive(nav.to)} />
                ))}
              </div>
            ))}

            {/* Kbd shortcuts hint */}
            <div className="mt-auto mx-3 mb-5">
              <div className="rounded-2xl bg-card border border-border/60 p-3 space-y-2">
                <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">اختصارات</p>
                {[
                  ["⌘K","بحث"],["⌘Q","قرآن"],["⌘A","AI"],["⌘P","صلاة"],
                ].map(([key,lbl]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{lbl}</span>
                    <span className="kbd">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ══ MAIN CONTENT ══ */}
          <main className="flex-1 min-w-0 md:overflow-y-auto md:h-dvh scroll-area">
            <div className="mx-auto w-full max-w-2xl pb-36 md:pb-10 pt-[env(safe-area-inset-top)] md:pt-0">
              {children}
            </div>
          </main>

        </div>

        {/* ── Global MiniPlayer ── */}
        <MiniPlayer />

        {/* ══ MOBILE BOTTOM NAV ══ */}
        <nav aria-label="التنقل" className="md:hidden fixed inset-x-0 bottom-0 z-50
          px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1">
          <div className="flex items-end justify-between rounded-[22px] glass shadow-elevated px-1.5 py-1.5">
            {PRIMARY_NAV.map(({ to, icon: Icon, label, badge }: any) => {
              const active = isActive(to);
              const isCenter = to === "/ai-chat";
              return (
                <Link key={to} to={to}
                  className="group relative flex flex-1 flex-col items-center gap-0.5 touch-manipulation"
                  aria-current={active ? "page" : undefined}>
                  <span className={`relative grid place-items-center rounded-2xl
                    transition-all duration-300
                    ${isCenter
                      ? `h-12 w-12 -translate-y-2.5 shadow-elevated ${active ? "gradient-gold text-gold-foreground shadow-gold" : "gradient-primary text-primary-foreground shadow-glow"}`
                      : `h-10 w-10 ${active ? "gradient-primary text-primary-foreground shadow-glow scale-110 -translate-y-1" : "text-muted-foreground/70"}`
                    }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
                    <Icon className={`transition-all ${isCenter ? "h-5 w-5" : active ? "h-[19px] w-[19px]" : "h-[17px] w-[17px]"}`}
                      strokeWidth={active ? 2.5 : 2} />
                    {badge && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />}
                    {active && !isCenter && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gold" />}
                  </span>
                  <span className={`text-[9px] leading-none font-medium transition-colors ${active ? "text-foreground font-bold" : "text-muted-foreground/60"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── FAB: quick search on mobile ── */}
        <button
          onClick={() => window.location.href = "/search"}
          className="md:hidden fixed bottom-[5.5rem] left-3 z-40
            h-12 w-12 rounded-2xl gradient-gold text-gold-foreground shadow-gold
            grid place-items-center transition-all active:scale-90 hover:scale-105"
          aria-label="بحث سريع">
          <Search className="h-5 w-5" />
        </button>

      </div>
    </AudioPlayerProvider>
  );
}
