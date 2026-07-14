import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen, Home, MoonStar, Sparkles, Bot, Search,
  User, Mic2, Radio, Settings, ChevronLeft, Star,
  CalendarDays, BookMarked, Compass, Trophy, Heart,
  Menu, X
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { MiniPlayer } from "@/components/MiniPlayer";

const BOTTOM_NAV = [
  { to: "/",        icon: Home,     label: "الرئيسية" },
  { to: "/quran",   icon: BookOpen, label: "القرآن"    },
  { to: "/ai-chat", icon: Bot,      label: "AI"        },
  { to: "/prayer",  icon: MoonStar, label: "الصلاة"    },
  { to: "/adhkar",  icon: Sparkles, label: "الأذكار"   },
] as const;

const ALL_PAGES = [
  { to: "/",          icon: Home,        label: "الرئيسية"       },
  { to: "/quran",     icon: BookOpen,    label: "القرآن الكريم"  },
  { to: "/prayer",    icon: MoonStar,    label: "مواقيت الصلاة"  },
  { to: "/adhkar",    icon: Sparkles,    label: "الأذكار"        },
  { to: "/ai-chat",   icon: Bot,         label: "المساعد AI"     },
  { to: "/search",    icon: Search,      label: "بحث"            },
  { to: "/reciters",  icon: Mic2,        label: "القراء"          },
  { to: "/radio",     icon: Radio,       label: "إذاعة القرآن"   },
  { to: "/hadith",    icon: BookOpen,    label: "الحديث"          },
  { to: "/dua",       icon: Heart,       label: "الأدعية"         },
  { to: "/khatmah",   icon: Trophy,      label: "ختمة القرآن"    },
  { to: "/qibla",     icon: Compass,     label: "القبلة"          },
  { to: "/calendar",  icon: CalendarDays,label: "التقويم"         },
  { to: "/bookmarks", icon: BookMarked,  label: "الإشارات"       },
  { to: "/names",     icon: Star,        label: "الأسماء"         },
  { to: "/wird",      icon: Star,        label: "الورد اليومي"   },
  { to: "/profile",   icon: User,        label: "الملف الشخصي"   },
  { to: "/settings",  icon: Settings,    label: "الإعدادات"      },
] as const;

function useIsActive(to: string, pathname: string) {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

// Keyboard shortcuts handler
function useKeyboardShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); window.location.href = "/search"; }
      if ((e.metaKey || e.ctrlKey) && e.key === "q") { e.preventDefault(); window.location.href = "/quran"; }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  useKeyboardShortcuts();

  return (
    <AudioPlayerProvider>
      <div className="relative min-h-dvh" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {/* Ambient bg gradient */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 80% 35% at 50% -5%,
                color-mix(in oklab, var(--primary-glow) 14%, transparent), transparent 70%),
              radial-gradient(ellipse 35% 25% at 85% 90%,
                color-mix(in oklab, var(--gold) 5%, transparent), transparent 55%)
            `,
          }}
        />

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:flex fixed top-0 right-0 h-dvh w-64 flex-col border-l border-border/40 z-30"
          style={{ background: "color-mix(in oklab, var(--background) 92%, transparent)", backdropFilter: "blur(20px)" }}>
          {/* Logo */}
          <div className="px-5 pt-6 pb-5 border-b border-border/30">
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl shadow-elevated"
                style={{ background: "var(--g-primary)" }}>
                <span className="font-quran text-xl text-white">س</span>
              </div>
              <div>
                <p className="font-quran text-xl text-foreground">سكينة</p>
                <p className="text-[10px] text-muted-foreground">تطبيقك الإسلامي</p>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {ALL_PAGES.map(({ to, icon: Icon, label }) => {
              const active = useIsActive(to, pathname);
              return (
                <Link key={to} to={to as any}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition ${
                    active
                      ? "text-white font-semibold shadow-soft"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                  style={active ? { background: "var(--g-primary)" } : {}}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom: settings link */}
          <div className="px-3 pb-4 border-t border-border/30 pt-3">
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-foreground hover:bg-muted/50 transition">
              <User className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </Link>
          </div>
        </aside>

        {/* Main area — offset for desktop sidebar */}
        <main className="md:mr-64 min-h-dvh pb-24 md:pb-0">
          {children}
        </main>

        {/* ── Full-screen mobile menu ── */}
        {menuOpen && (
          <div className="fixed inset-0 z-[60] fade-up"
            style={{ background: "var(--background)" }}>
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl"
                  style={{ background: "var(--g-primary)" }}>
                  <span className="font-quran text-lg text-white">س</span>
                </div>
                <span className="font-quran text-xl text-foreground">سكينة</span>
              </div>
              <button onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted">
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100dvh-5rem)] px-4 py-4">
              <div className="grid grid-cols-3 gap-2.5">
                {ALL_PAGES.map(({ to, icon: Icon, label }) => {
                  const active = useIsActive(to, pathname);
                  return (
                    <Link key={to} to={to as any}
                      onClick={() => setMenuOpen(false)}
                      className={`flex flex-col items-center gap-2 rounded-2xl p-3 border text-center transition active:scale-95 ${
                        active
                          ? "border-primary/30 text-white"
                          : "border-border/60 bg-card text-foreground"
                      }`}
                      style={active ? { background: "var(--g-primary)" } : {}}>
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium leading-tight">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MiniPlayer ── */}
        <MiniPlayer />

        {/* ── Mobile Bottom Navigation ── */}
        <nav aria-label="التنقل الرئيسي"
          className="md:hidden fixed inset-x-0 bottom-0 z-50 glass-nav pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
          <div className="flex items-center justify-around px-2">
            {BOTTOM_NAV.map(({ to, icon: Icon, label }) => {
              const active = useIsActive(to, pathname);
              const isCenter = to === "/ai-chat";
              return (
                <Link key={to} to={to}
                  className="flex flex-col items-center gap-0.5 flex-1 py-1"
                  aria-current={active ? "page" : undefined}>
                  <span className={`relative grid place-items-center rounded-2xl transition-all duration-300 ${
                    isCenter
                      ? `-translate-y-3 h-12 w-12 text-white shadow-elevated ${active ? "" : ""}`
                      : `h-9 w-9 ${active ? "text-primary" : "text-muted-foreground"}`
                  }`}
                  style={isCenter ? { background: active ? "var(--g-gold)" : "var(--g-primary)" } : {}}
                  >
                    <Icon className={isCenter ? "h-5 w-5" : active ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]"}
                      strokeWidth={active || isCenter ? 2.5 : 2} />
                    {to === "/ai-chat" && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 animate-pulse"
                        style={{ borderColor: "var(--background)" }} />
                    )}
                  </span>
                  {!isCenter && (
                    <span className={`text-[9px] font-medium leading-none transition-colors ${
                      active ? "text-primary font-bold" : "text-muted-foreground"
                    }`}>
                      {label}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Menu toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center gap-0.5 flex-1 py-1">
              <span className="grid h-9 w-9 place-items-center rounded-2xl text-muted-foreground">
                <Menu className="h-[17px] w-[17px]" strokeWidth={2} />
              </span>
              <span className="text-[9px] text-muted-foreground">المزيد</span>
            </button>
          </div>
        </nav>
      </div>
    </AudioPlayerProvider>
  );
}
