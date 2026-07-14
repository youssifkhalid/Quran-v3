import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  User, LogOut, Star, BookOpen, Trophy, Flame, Settings,
  ChevronRight, Moon, Sun, Bell
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "الملف الشخصي — سكينة" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Local stats
  const [stats] = useState(() => {
    const wirdRaw = localStorage.getItem("sakeenah:wird");
    const khatmahRaw = localStorage.getItem("sakeenah:khatmah");
    const adhkarFavs = (() => { try { return JSON.parse(localStorage.getItem("sakeenah:hadith-favs") ?? "[]").length; } catch { return 0; } })();
    const bookmarks = (() => { try { return JSON.parse(localStorage.getItem("sakeenah:bookmarks") ?? "[]").length; } catch { return 0; } })();

    let streak = 0;
    if (wirdRaw) {
      const d = JSON.parse(wirdRaw);
      const total = d.items?.length ?? 1;
      for (let i = 0; i < 365; i++) {
        const k = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        if (!((d.logs?.[k]?.completed?.length ?? 0) >= total)) break;
        streak++;
      }
    }

    const khatmahPct = (() => {
      if (!khatmahRaw) return 0;
      const d = JSON.parse(khatmahRaw);
      return Math.round((d.pagesRead?.length ?? 0) / 604 * 100);
    })();

    return { streak, khatmahPct, adhkarFavs, bookmarks };
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function signOut() {
    await supabase.auth.signOut().catch(() => {});
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 fade-up">
        <div className="grid h-16 w-16 place-items-center rounded-3xl mb-4"
          style={{ background: "var(--g-primary)" }}>
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-quran text-2xl text-foreground">الملف الشخصي</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          سجّل دخولك للحفاظ على بياناتك ومزامنتها
        </p>
        <Link to="/auth"
          className="mt-6 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-elevated"
          style={{ background: "var(--g-primary)" }}>
          تسجيل الدخول / إنشاء حساب
        </Link>
        <Link to="/" className="mt-3 text-xs text-muted-foreground">العودة للرئيسية</Link>

        {/* Stats even without account */}
        <div className="mt-8 w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-3 text-center">إحصائياتك المحلية</p>
          <LocalStats stats={stats} />
        </div>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "مستخدم";

  return (
    <div className="fade-up pb-28 min-h-dvh">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-[2rem] px-5 pt-8 pb-10 mb-4"
        style={{ background: "var(--g-hero)" }}>
        <div className="flex flex-col items-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName}
              className="h-20 w-20 rounded-full object-cover avatar-ring" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full avatar-ring"
              style={{ background: "var(--g-primary)" }}>
              <span className="font-quran text-3xl text-white">
                {fullName.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="font-quran text-2xl text-white mt-3">{fullName}</h1>
          <p className="text-xs text-white/60 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <LocalStats stats={stats} />
      </div>

      {/* Settings Links */}
      <div className="px-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">الإعدادات</p>
        {[
          { to: "/settings", icon: Settings, label: "إعدادات التطبيق" },
          { to: "/wird", icon: Flame, label: "الورد اليومي" },
          { to: "/khatmah", icon: Trophy, label: "ختمة القرآن" },
          { to: "/bookmarks", icon: BookOpen, label: "الإشارات المرجعية" },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to as any}
            className="flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-4 shadow-soft active:scale-[0.97] transition">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm text-foreground">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
          </Link>
        ))}

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 shadow-soft active:scale-[0.97] transition mt-4"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/15 text-rose-500 shrink-0">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="text-sm text-rose-600 dark:text-rose-400">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

function LocalStats({ stats }: { stats: { streak: number; khatmahPct: number; adhkarFavs: number; bookmarks: number } }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: Flame, label: "الانتظام", value: `${stats.streak} يوم`, color: "text-orange-500" },
        { icon: Trophy, label: "الختمة", value: `${stats.khatmahPct}%`, color: "text-amber-500" },
        { icon: Star, label: "الأحاديث المحفوظة", value: stats.adhkarFavs, color: "text-blue-500" },
        { icon: BookOpen, label: "الإشارات", value: stats.bookmarks, color: "text-primary" },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="rounded-2xl bg-card border border-border/60 p-4 shadow-soft text-center">
          <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
          <p className="font-quran text-2xl text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
