import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sunrise, Sunset, Moon, BookOpen, Navigation, Utensils,
  Heart, Star, Shield, AlarmClock, Droplets, Sparkles
} from "lucide-react";
import { ADHKAR } from "@/data/adhkar";

export const Route = createFileRoute("/adhkar/")({
  head: () => ({
    meta: [
      { title: "الأذكار — سكينة" },
      { name: "description", content: "أذكار الصباح والمساء، النوم، الوضوء، السفر، الكرب، الرقية الشرعية وأسماء الله الحسنى." },
    ],
  }),
  component: AdhkarIndex,
});

const ICONS: Record<string, any> = {
  morning:  Sunrise,
  evening:  Sunset,
  sleep:    Moon,
  prayer:   BookOpen,
  wakeup:   AlarmClock,
  wudu:     Droplets,
  travel:   Navigation,
  eating:   Utensils,
  distress: Heart,
  names:    Star,
  ruqyah:   Shield,
  general:  Sparkles,
};

const COLORS: Record<string, string> = {
  morning:  "from-amber-500 to-orange-600",
  evening:  "from-purple-600 to-indigo-700",
  sleep:    "from-blue-700 to-slate-800",
  prayer:   "from-emerald-600 to-teal-700",
  wakeup:   "from-yellow-500 to-amber-600",
  wudu:     "from-cyan-500 to-blue-600",
  travel:   "from-emerald-600 to-teal-700",
  eating:   "from-lime-500 to-green-600",
  distress: "from-rose-500 to-pink-600",
  names:    "from-amber-500 to-yellow-600",
  ruqyah:   "from-violet-600 to-purple-700",
  general:  "from-primary/80 to-primary",
};

function AdhkarIndex() {
  return (
    <div className="fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-[2rem] px-5 pt-8 pb-8 shadow-elevated mb-2"
        style={{ background: "var(--g-hero)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative">
          <h1 className="font-quran text-4xl text-white">الأذكار</h1>
          <p className="text-sm text-white/70 mt-2">حصن المسلم — {ADHKAR.length} بابًا من الأذكار الثابتة</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-xs bg-white/15 text-white rounded-full px-3 py-1">أذكار الصباح والمساء</span>
            <span className="text-xs bg-white/15 text-white rounded-full px-3 py-1">أذكار النوم</span>
            <span className="text-xs bg-white/15 text-white rounded-full px-3 py-1">أسماء الله الحسنى</span>
          </div>
        </div>
      </div>

      <ul className="px-4 py-4 space-y-2.5 pb-8">
        {ADHKAR.map((cat) => {
          const Icon = ICONS[cat.slug] ?? BookOpen;
          const color = COLORS[cat.slug] ?? "from-primary/80 to-primary";
          return (
            <li key={cat.slug}>
              <Link
                to="/adhkar/$category"
                params={{ category: cat.slug }}
                className="flex items-center gap-4 rounded-3xl bg-card dark:bg-card p-4 shadow-soft border border-border/60 transition active:scale-[0.97] hover:border-primary/30 hover:shadow-elevated group"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-quran text-xl text-foreground">{cat.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.subtitle}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-bold text-primary">{cat.items.length}</span>
                  <span className="text-[9px] text-muted-foreground">ذكر</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
