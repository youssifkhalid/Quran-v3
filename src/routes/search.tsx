import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, BookOpen, Sparkles, Mic2, X } from "lucide-react";
import { fetchSurahs, fuzzyScore } from "@/lib/quran";
import { ADHKAR } from "@/data/adhkar";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "البحث — سكينة" },
      { name: "description", content: "ابحث في القرآن الكريم والأذكار والقراء." },
    ],
  }),
  component: SearchPage,
});

type ResultType = "surah" | "adhkar" | "dhikr";
interface Result {
  type: ResultType;
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
  score: number;
}

function SearchPage() {
  const [q, setQ] = useState("");
  const { data: surahs } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahs, staleTime: Infinity });

  const results = useMemo((): Result[] => {
    if (!q.trim() || q.trim().length < 2) return [];
    const out: Result[] = [];

    // Surah search
    for (const s of surahs ?? []) {
      const scoreAr = fuzzyScore(q, s.name);
      const scoreEn = fuzzyScore(q, s.englishName);
      const scoreTr = fuzzyScore(q, s.englishNameTranslation);
      const scoreNum = String(s.number) === q.trim() ? 1 : 0;
      const score = Math.max(scoreAr, scoreEn, scoreTr, scoreNum);
      if (score > 0.55) {
        out.push({
          type: "surah",
          title: s.name,
          subtitle: `${s.englishName} • ${s.numberOfAyahs} آية • ${s.revelationType === "Meccan" ? "مكية" : "مدنية"}`,
          to: "/quran/$id",
          params: { id: String(s.number) },
          score,
        });
      }
    }

    // Adhkar category search
    for (const cat of ADHKAR) {
      const scoreCat = Math.max(fuzzyScore(q, cat.title), fuzzyScore(q, cat.subtitle));
      if (scoreCat > 0.5) {
        out.push({
          type: "adhkar",
          title: cat.title,
          subtitle: `${cat.subtitle} • ${cat.items.length} ذكر`,
          to: "/adhkar/$category",
          params: { category: cat.slug },
          score: scoreCat,
        });
      }
      // Individual dhikr text search
      for (const d of cat.items) {
        const scoreD = fuzzyScore(q, d.text);
        if (scoreD > 0.65) {
          out.push({
            type: "dhikr",
            title: d.text.slice(0, 60) + (d.text.length > 60 ? "…" : ""),
            subtitle: `${cat.title}${d.virtue ? " — " + d.virtue.slice(0, 40) : ""}`,
            to: "/adhkar/$category",
            params: { category: cat.slug },
            score: scoreD,
          });
        }
      }
    }

    return out.sort((a, b) => b.score - a.score).slice(0, 30);
  }, [q, surahs]);

  const surahResults = results.filter(r => r.type === "surah");
  const adhkarResults = results.filter(r => r.type === "adhkar" || r.type === "dhikr");

  return (
    <div className="fade-up">
      <header className="sticky top-0 z-30 glass border-b border-border/40 px-4 py-3">
        <h1 className="font-quran text-xl mb-3">البحث الشامل</h1>
        <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            placeholder="ابحث في القرآن والأذكار… (عربي أو إنجليزي)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Empty state */}
      {!q.trim() && (
        <div className="px-4 mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">ابحث في:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "١١٤ سورة قرآنية", icon: BookOpen, to: "/quran" },
              { label: "أذكار وأدعية", icon: Sparkles, to: "/adhkar" },
              { label: "الشيوخ والقراء", icon: Mic2, to: "/reciters" },
            ].map(({ label, icon: Icon, to }) => (
              <Link key={to} to={to as any}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft border border-border/60 active:scale-[0.98] transition">
                <span className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {q.trim().length >= 2 && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-16">لا توجد نتائج لـ «{q}»</p>
      )}

      {surahResults.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" /> سور القرآن الكريم
          </h2>
          <ul className="space-y-1.5">
            {surahResults.map((r, i) => (
              <li key={i}>
                <Link
                  to={r.to as any}
                  params={r.params}
                  className="flex items-center gap-3 rounded-2xl bg-card hover:bg-surface-elevated p-3 shadow-soft border border-border/40 transition active:scale-[0.98]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-gold text-gold-foreground text-xs font-bold">
                    {r.params?.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-quran text-xl truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.subtitle}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {adhkarResults.length > 0 && (
        <section className="px-4 mt-4 mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> الأذكار والأدعية
          </h2>
          <ul className="space-y-1.5">
            {adhkarResults.map((r, i) => (
              <li key={i}>
                <Link
                  to={r.to as any}
                  params={r.params}
                  className="flex items-center gap-3 rounded-2xl bg-card hover:bg-surface-elevated p-3 shadow-soft border border-border/40 transition active:scale-[0.98]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-quran text-base truncate leading-snug">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.subtitle}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
