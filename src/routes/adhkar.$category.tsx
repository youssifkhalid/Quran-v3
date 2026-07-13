import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, RotateCcw, Check, Share2, ChevronDown } from "lucide-react";
import { ADHKAR } from "@/data/adhkar";

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

  const [counts, setCounts] = useState<number[]>(cat.items.map(() => 0));
  const [expanded, setExpanded] = useState<boolean[]>(cat.items.map(() => false));

  function tap(i: number) {
    setCounts((prev) => {
      const next = [...prev];
      if (next[i] < cat.items[i].count) {
        next[i] += 1;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
      }
      return next;
    });
  }
  function reset() {
    setCounts(cat.items.map(() => 0));
    setExpanded(cat.items.map(() => false));
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
      navigator.clipboard?.writeText(shareText).catch(() => {});
    }
  }

  const completed = counts.filter((c, i) => c >= cat.items[i].count).length;
  const progress = (completed / cat.items.length) * 100;

  return (
    <div className="fade-up">
      <header className="sticky top-0 z-30 glass border-b border-border/40 px-4 py-3 flex items-center gap-2">
        <Link to="/adhkar" className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft">
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <div className="flex-1 text-center">
          <h1 className="font-quran text-lg leading-none">{cat.title}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{completed}/{cat.items.length} ذكر مكتمل</p>
        </div>
        <button onClick={reset} className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft" aria-label="إعادة تعيين">
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      <div className="mx-4 mt-3 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full gradient-gold transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      {progress === 100 && (
        <p className="text-center text-xs text-gold mt-1 font-semibold">✓ اكتملت الأذكار بارك الله فيك</p>
      )}

      <ul className="px-4 py-4 space-y-3">
        {cat.items.map((d, i) => {
          const done = counts[i] >= d.count;
          const isExpanded = expanded[i];
          return (
            <li key={i}>
              <button
                onClick={() => tap(i)}
                className={`relative w-full text-right rounded-3xl p-5 shadow-soft border transition-all active:scale-[0.99] ${
                  done ? "bg-primary/5 border-gold/40" : "bg-card border-border/60"
                }`}
              >
                <p className="font-quran text-xl leading-loose pr-2">{d.text}</p>

                {d.virtue && isExpanded && (
                  <div className="mt-2 rounded-xl bg-gold/10 border border-gold/20 p-3">
                    <p className="text-xs text-foreground leading-relaxed">{d.virtue}</p>
                    {d.source && <p className="text-[10px] text-muted-foreground mt-1">{d.source}</p>}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {d.virtue && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(i); }}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        الفضل
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); share(d.text, d.virtue); }}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label="مشاركة"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
                    done ? "gradient-gold text-gold-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    {done && <Check className="h-3.5 w-3.5" />}
                    {counts[i]} / {d.count}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
