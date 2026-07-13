import { createFileRoute, Link } from "@tanstack/react-router";
import { Sunrise, Sunset, Moon, BookOpen, Navigation, Utensils, Heart, Star, Shield, AlarmClock, Droplets } from "lucide-react";
import { ADHKAR } from "@/data/adhkar";

export const Route = createFileRoute("/adhkar")({
  head: () => ({
    meta: [
      { title: "الأذكار — سكينة" },
      { name: "description", content: "أذكار الصباح والمساء، النوم، الوضوء، السفر، الكرب، الرقية الشرعية وأسماء الله الحسنى." },
    ],
  }),
  component: AdhkarIndex,
});

const ICONS: Record<string, any> = {
  morning: Sunrise,
  evening: Sunset,
  sleep: Moon,
  prayer: BookOpen,
  wakeup: AlarmClock,
  wudu: Droplets,
  travel: Navigation,
  eating: Utensils,
  distress: Heart,
  names: Star,
  ruqyah: Shield,
};

const COLORS: Record<string, string> = {
  morning: "from-amber-500/80 to-orange-600/80",
  evening: "from-purple-600/80 to-indigo-700/80",
  sleep: "from-blue-700/80 to-slate-800/80",
  prayer: "gradient-primary",
  wakeup: "from-yellow-500/80 to-amber-600/80",
  wudu: "from-cyan-500/80 to-blue-600/80",
  travel: "from-emerald-600/80 to-teal-700/80",
  eating: "from-lime-500/80 to-green-600/80",
  distress: "from-rose-500/80 to-pink-600/80",
  names: "gradient-gold",
  ruqyah: "from-violet-600/80 to-purple-700/80",
};

function AdhkarIndex() {
  return (
    <div className="fade-up">
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-quran text-3xl">الأذكار</h1>
        <p className="text-sm text-muted-foreground mt-1">حصن المسلم في كل وقت — {ADHKAR.length} باباً</p>
      </header>
      <ul className="px-4 space-y-3 pb-4">
        {ADHKAR.map((cat) => {
          const Icon = ICONS[cat.slug] ?? BookOpen;
          const colorClass = COLORS[cat.slug] ?? "gradient-primary";
          return (
            <li key={cat.slug}>
              <Link
                to="/adhkar/$category"
                params={{ category: cat.slug }}
                className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft border border-border/60 transition active:scale-[0.98]"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-glow ${colorClass.startsWith("gradient") ? colorClass : `bg-gradient-to-br ${colorClass}`}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <h2 className="font-quran text-xl">{cat.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground">{cat.items.length} ذكر</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
