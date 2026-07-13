import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Mic2, Search, SlidersHorizontal, X, Star } from "lucide-react";
import { fetchReciters } from "@/lib/reciters.functions";
import { fuzzyScore } from "@/lib/quran";

export const Route = createFileRoute("/reciters/")({
  head: () => ({
    meta: [
      { title: "الشيوخ والقراء — سكينة" },
      { name: "description", content: "استمع لتلاوات من أكثر من ٥٠٠ قارئ بأصوات عذبة وروايات متعددة." },
    ],
  }),
  component: RecitersIndex,
});

const STYLES = ["الكل", "مرتل", "مجود", "معلم", "آية بآية"];
const QUICK = [
  { id: "mp3-1-10", name: "مشاري العفاسي", style: "مرتل" },
  { id: "mp3-3-2", name: "عبد الباسط عبد الصمد", style: "مرتل" },
  { id: "mp3-4-7", name: "محمود خليل الحصري", style: "مجود" },
  { id: "mp3-2-3", name: "عبد الرحمن السديس", style: "مرتل" },
  { id: "mp3-5-4", name: "ماهر المعيقلي", style: "مرتل" },
  { id: "mp3-6-5", name: "سعود الشريم", style: "مرتل" },
];

function RecitersIndex() {
  const { data: reciters = [], isLoading } = useQuery({
    queryKey: ["reciters-v2"],
    queryFn: fetchReciters,
    staleTime: 1000 * 60 * 60,
  });

  const [q, setQ] = useState("");
  const [style, setStyle] = useState("الكل");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "surahs">("surahs");

  const filtered = useMemo(() => {
    let list = reciters;
    if (style !== "الكل") list = list.filter((r) => r.style?.includes(style.slice(0, 3)));
    if (q.trim()) {
      list = list
        .map((r) => ({ r, score: Math.max(fuzzyScore(q, r.name), String(r.totalSurahs ?? 0).includes(q) ? 0.8 : 0) }))
        .filter((x) => x.score > 0.5)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.r);
    } else {
      if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ar"));
      else list = [...list].sort((a, b) => (b.totalSurahs ?? 0) - (a.totalSurahs ?? 0));
    }
    return list.slice(0, 100);
  }, [reciters, q, style, sortBy]);

  return (
    <div className="fade-up">
      <header className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-quran text-3xl">الشيوخ والقراء</h1>
          <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded-full border border-border">
            {isLoading ? "…" : `${reciters.length}+ قارئ`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">روايات حفص وورش وشعبة وغيرها</p>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              placeholder="ابحث عن قارئ…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none"
            />
            {q && <button onClick={() => setQ("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`grid h-12 w-12 place-items-center rounded-2xl shadow-soft border transition ${showFilters ? "gradient-primary text-primary-foreground border-transparent" : "bg-card border-border"}`}
            aria-label="فلاتر"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 rounded-2xl bg-card border border-border p-3 space-y-3 fade-up">
            <div>
              <p className="text-xs text-muted-foreground mb-2">نوع التلاوة</p>
              <div className="flex gap-2 flex-wrap">
                {STYLES.map((s) => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${style === s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">ترتيب حسب</p>
              <div className="flex gap-2">
                <button onClick={() => setSortBy("surahs")}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${sortBy === "surahs" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  الأكثر سوراً
                </button>
                <button onClick={() => setSortBy("name")}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${sortBy === "name" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  أبجدي
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Featured reciters */}
      {!q && !isLoading && (
        <div className="px-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Star className="h-3 w-3" /> أبرز القراء
          </p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filtered.slice(0, 8).map((r) => (
              <Link key={r.id} to="/reciters/$id" params={{ id: r.id }}
                className="shrink-0 flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-3 w-24 text-center active:scale-95 transition shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-primary-foreground text-lg font-bold">
                  {r.name.slice(0, 1)}
                </div>
                <p className="text-[10px] leading-tight line-clamp-2">{r.name}</p>
                <span className="text-[9px] text-muted-foreground">{r.totalSurahs ?? "—"} سورة</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Full list */}
      <ul className="px-3 space-y-1.5 pb-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <li key={i} className="h-16 skeleton rounded-2xl mx-1" />)
          : filtered.length === 0
            ? <li className="text-center text-sm text-muted-foreground py-12">لا توجد نتائج</li>
            : filtered.map((r) => (
                <li key={r.id}>
                  <Link to="/reciters/$id" params={{ id: r.id }}
                    className="flex items-center gap-3 rounded-2xl bg-card border border-border/40 p-3.5 shadow-soft transition active:scale-[0.98]">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground text-lg font-bold shadow-glow">
                      {r.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-quran text-lg truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {r.style ?? "تلاوة"} {r.totalSurahs ? `• ${r.totalSurahs} سورة` : ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Mic2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
      </ul>
    </div>
  );
}
