import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { ChevronRight, RotateCcw, Check, Share2, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { ADHKAR } from "@/data/adhkar";
import { toast } from "sonner";

export const Route = createFileRoute("/adhkar/$category")({
  head: ({ params }) => {
    const cat = ADHKAR.find((c) => c.slug === params.category);
    return { meta: [{ title: `${cat?.title ?? "الأذكار"} — سكينة` }] };
  },
  component: AdhkarCategoryPage,
});

function AdhkarCategoryPage() {
  const { category } = useParams({ from: "/adhkar/$category" });
  const found = ADHKAR.find((c) => c.slug === category);
  if (!found) throw notFound();
  const cat = found;

  const [counts, setCounts] = useState<number[]>(() => cat.items.map(() => 0));
  const [expanded, setExpanded] = useState<boolean[]>(() => cat.items.map(() => false));

  const tap = useCallback((i: number) => {
    setCounts((prev) => {
      const next = [...prev];
      const limit = cat.items[i].count;
      if (next[i] < limit) {
        next[i] += 1;
        if (typeof navigator !== "undefined") navigator.vibrate?.(15);
      }
      return next;
    });
  }, [cat.items]);

  function reset() {
    setCounts(cat.items.map(() => 0));
    setExpanded(cat.items.map(() => false));
    toast("تمت إعادة الأذكار 🔄");
  }

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function share(text: string, virtue?: string) {
    const shareText = `${text}${virtue ? `\n\n${virtue}` : ""}\n\n— سكينة، تطبيقك الإسلامي`;
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText)
        .then(() => toast.success("تم النسخ"))
        .catch(() => {});
    }
  }

  const completed = counts.filter((c, i) => c >= cat.items[i].count).length;
  const progress = cat.items.length > 0 ? (completed / cat.items.length) * 100 : 0;
  const allDone = completed === cat.items.length && cat.items.length > 0;

  return (
    <div className="fade-up min-h-dvh">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-border/40 px-4 py-3"
        style={{ background: "color-mix(in oklab, var(--background) 90%, transparent)" }}>
        <div className="flex items-center gap-3">
          <Link
            to="/adhkar"
            className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft border border-border/60 shrink-0"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180 text-foreground" />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="font-quran text-xl text-foreground leading-none">{cat.title}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {completed}/{cat.items.length} مكتمل
            </p>
          </div>
          <button
            onClick={reset}
            className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft border border-border/60 shrink-0"
            aria-label="إعادة تعيين"
          >
            <RotateCcw className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: allDone ? "var(--g-gold)" : "var(--g-primary)",
            }}
          />
        </div>
        {allDone && (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold animate-pulse">
            ✨ اكتملت الأذكار، بارك الله فيك
          </p>
        )}
      </header>

      {/* Dhikr List */}
      <ul className="px-4 py-4 space-y-3 pb-20">
        {cat.items.map((dhikr, i) => {
          const isDone = counts[i] >= dhikr.count;
          const isExpanded = expanded[i];
          const pct = dhikr.count > 0 ? Math.min(1, counts[i] / dhikr.count) : 0;

          return (
            <li key={i}>
              <div
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isDone
                    ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-border/60 bg-card"
                }`}
              >
                {/* Tap zone */}
                <button
                  onClick={() => tap(i)}
                  className="w-full text-right p-4 active:scale-[0.98] transition-transform"
                  disabled={isDone}
                >
                  {/* Arabic Text */}
                  <p
                    className={`font-quran text-xl leading-loose ${
                      isDone ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                    }`}
                    dir="rtl"
                  >
                    {dhikr.text}
                  </p>

                  {/* Count indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="h-4 w-4" /> مكتمل
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-primary font-bold">
                          <span className="font-quran text-base">{counts[i]}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="font-quran text-base">{dhikr.count}</span>
                        </span>
                      )}
                    </div>

                    {/* Mini progress */}
                    {!isDone && dhikr.count > 1 && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(dhikr.count, 10) }).map((_, j) => (
                          <div
                            key={j}
                            className={`h-1.5 w-1.5 rounded-full transition-all ${
                              j < (counts[i] / dhikr.count) * 10
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>

                {/* Expandable virtue/source */}
                {(dhikr.virtue || dhikr.source) && (
                  <>
                    <button
                      onClick={() => toggleExpand(i)}
                      className="w-full flex items-center justify-between px-4 py-2 border-t border-border/30 text-xs text-muted-foreground hover:bg-muted/30 transition"
                    >
                      <span>{isExpanded ? "إخفاء الفضل" : "الفضل والمصدر"}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 space-y-2 fade-up">
                        {dhikr.virtue && (
                          <div className="rounded-2xl px-3 py-2.5" style={{ background: "oklch(0.82 0.13 85 / 0.12)" }}>
                            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                              ✨ {dhikr.virtue}
                            </p>
                          </div>
                        )}
                        {dhikr.source && (
                          <p className="text-xs text-muted-foreground">
                            📚 المصدر: {dhikr.source}
                          </p>
                        )}
                        <button
                          onClick={() => share(dhikr.text, dhikr.virtue)}
                          className="flex items-center gap-1.5 text-xs text-primary"
                        >
                          <Share2 className="h-3.5 w-3.5" /> مشاركة
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Share without expansion if no virtue/source */}
                {!dhikr.virtue && !dhikr.source && (
                  <div className="flex justify-end px-4 pb-3">
                    <button
                      onClick={() => share(dhikr.text)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
                    >
                      <Share2 className="h-3 w-3" /> مشاركة
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Floating completion badge */}
      {allDone && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="rounded-full px-6 py-3 text-sm font-bold text-white shadow-elevated fade-up"
            style={{ background: "var(--g-gold)" }}>
            🎉 أتممت {cat.title}
          </div>
        </div>
      )}
    </div>
  );
}
