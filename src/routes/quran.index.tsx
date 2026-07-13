import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import { Search, BookOpen, Sparkles, Mic2, Trophy, Grid2X2, List, X } from "lucide-react";
import { fetchSurahs, fuzzyScore, SURAH_START_PAGE } from "@/lib/quran";

export const Route = createFileRoute("/quran/")({
  head: () => ({
    meta: [
      { title: "القرآن الكريم — سكينة" },
      { name: "description", content: "تصفح القرآن الكريم برسم عثماني — ١١٤ سورة مع بحث ذكي وتلاوات لكبار القراء." },
    ],
  }),
  component: QuranIndex,
});

type View = "list" | "grid";

function QuranIndex() {
  const { data, isLoading } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahs, staleTime: Infinity });
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("list");
  const [juzFilter, setJuzFilter] = useState<number | null>(null);

  // Khatmah progress
  const [khatmahPct, setKhatmahPct] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sakeenah:khatmah");
      if (raw) {
        const k = JSON.parse(raw);
        setKhatmahPct(Math.round((k.pagesRead.length / 604) * 100));
      }
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!q.trim()) return list;
    const scored = list.map((s) => {
      const scoreAr = fuzzyScore(q, s.name);
      const scoreEn = fuzzyScore(q, s.englishName);
      const scoreTr = fuzzyScore(q, s.englishNameTranslation);
      const scoreNum = String(s.number) === q.trim() ? 1 : 0;
      return { s, score: Math.max(scoreAr, scoreEn, scoreTr, scoreNum) };
    });
    return scored
      .filter((x) => x.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
  }, [data, q]);

  return (
    <div className="fade-up">
      <header className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-quran text-3xl">القرآن الكريم</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(v => v === "list" ? "grid" : "list")}
              className="grid h-9 w-9 place-items-center rounded-xl bg-card shadow-soft border border-border"
              aria-label="تبديل العرض"
            >
              {view === "list" ? <Grid2X2 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">١١٤ سورة • رسم عثماني • بحث ذكي</p>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            placeholder="ابحث: البقرة, Baqarah, التين…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="مسح">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {/* Quick nav cards */}
      {!q && (
        <div className="px-4 grid grid-cols-2 gap-3 mb-4">
          <Link to="/mushaf/$page" params={{ page: "1" }}
            className="flex items-center gap-3 rounded-2xl gradient-primary text-primary-foreground p-4 shadow-elevated active:scale-[0.98] transition">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 shrink-0">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">المصحف الشريف</p>
              <p className="text-[11px] opacity-80">صفحة بصفحة — ٦٠٤ صفحة</p>
            </div>
          </Link>
          <Link to="/reciters"
            className="flex items-center gap-3 rounded-2xl bg-card border border-gold/30 p-4 shadow-soft active:scale-[0.98] transition">
            <span className="grid h-10 w-10 place-items-center rounded-xl gradient-gold text-gold-foreground shrink-0">
              <Mic2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">الشيوخ والقراء</p>
              <p className="text-[11px] text-muted-foreground">٥٠٠+ قارئ</p>
            </div>
          </Link>

          <Link to="/quran/search"
            className="flex items-center gap-3 rounded-2xl gradient-gold text-gold-foreground p-4 shadow-gold active:scale-[0.98] transition">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 shrink-0">
              <Search className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">بحث في الآيات</p>
              <p className="text-[11px] opacity-80">٦٢٣٦ آية</p>
            </div>
          </Link>

          <Link to="/khatmah"
            className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 shadow-soft active:scale-[0.98] transition">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Trophy className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">ختمة القرآن</p>
              <p className="text-[11px] text-muted-foreground">
                {khatmahPct !== null ? `${khatmahPct}% مكتمل` : "ابدأ ختمتك"}
              </p>
            </div>
          </Link>

          <LastReadCard />
        </div>
      )}

      {/* Surah list */}
      {view === "list" ? (
        <ul className="px-3 space-y-1.5 pb-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <li key={i} className="h-16 mx-1 rounded-2xl skeleton" />
              ))
            : filtered.length === 0
              ? <li className="text-center text-sm text-muted-foreground py-10">لا توجد نتائج لـ «{q}»</li>
              : filtered.map((s) => (
                  <li key={s.number}>
                    <Link
                      to="/quran/$id"
                      params={{ id: String(s.number) }}
                      className="flex items-center gap-3 rounded-2xl bg-card hover:bg-surface-elevated p-3 shadow-soft border border-border/40 transition active:scale-[0.98]"
                    >
                      <span className="relative grid h-12 w-12 shrink-0 place-items-center text-primary">
                        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full text-gold" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M20 2 L36 12 L36 28 L20 38 L4 28 L4 12 Z" />
                          <path d="M20 8 L31 14 L31 26 L20 32 L9 26 L9 14 Z" opacity="0.4" />
                        </svg>
                        <span className="relative text-[13px] font-bold">{s.number}</span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-quran text-xl truncate">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 truncate max-w-[80px]">{s.englishName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded ${s.revelationType === "Meccan" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-blue-500/10 text-blue-700 dark:text-blue-300"}`}>
                            {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                          </span>
                          <span>•</span>
                          <span>{s.numberOfAyahs} آية</span>
                          <span>•</span>
                          <span>ص {SURAH_START_PAGE[s.number]}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
        </ul>
      ) : (
        // Grid view
        <div className="px-3 grid grid-cols-3 gap-2 pb-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)
            : filtered.map((s) => (
                <Link
                  key={s.number}
                  to="/quran/$id"
                  params={{ id: String(s.number) }}
                  className="relative flex flex-col items-center justify-center rounded-2xl bg-card border border-border/40 p-3 shadow-soft text-center active:scale-95 transition"
                >
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-primary">{s.number}</span>
                  <span className="font-quran text-xl mt-2 leading-tight">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{s.numberOfAyahs} آية</span>
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}

function LastReadCard() {
  const [last, setLast] = useState<{ surah: number; ayah: number } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sakeenah:lastRead");
      if (raw) setLast(JSON.parse(raw));
    } catch {}
  }, []);

  if (!last) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 shadow-soft">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold shrink-0">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">ابدأ رحلتك</p>
          <p className="text-[11px] text-muted-foreground">اختر سورة للقراءة</p>
        </div>
      </div>
    );
  }
  return (
    <Link to="/quran/$id" params={{ id: String(last.surah) }}
      className="flex items-center gap-3 rounded-2xl bg-card border border-gold/30 p-4 shadow-soft active:scale-[0.98] transition">
      <span className="grid h-10 w-10 place-items-center rounded-xl gradient-gold text-gold-foreground shrink-0">
        <BookOpen className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold">متابعة القراءة</p>
        <p className="text-[11px] text-muted-foreground">سورة {last.surah} • آية {last.ayah}</p>
      </div>
    </Link>
  );
}
