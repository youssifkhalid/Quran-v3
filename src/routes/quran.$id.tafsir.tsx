import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, BookOpen, AlignJustify, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { fetchSurah } from "@/lib/quran";

export const Route = createFileRoute("/quran/$id/tafsir")({
  head: ({ params }) => ({
    meta: [{ title: `تفسير سورة ${params.id} — سكينة` }],
  }),
  component: TafsirPage,
});

const TAFSIR_EDITIONS = [
  { id: "ar.muyassar",  name: "التفسير الميسّر", lang: "ar" },
  { id: "ar.jalalayn",  name: "تفسير الجلالين",   lang: "ar" },
  { id: "en.sahih",     name: "Saheeh International", lang: "en" },
  { id: "en.yusufali",  name: "Yusuf Ali",         lang: "en" },
];

interface AyahData {
  numberInSurah: number;
  arabic: string;
  translation: string;
}

async function fetchTafsirData(surahNum: number, edition: string): Promise<AyahData[]> {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`),
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${edition}`),
  ]);

  if (!arabicRes.ok || !translationRes.ok) {
    throw new Error("فشل تحميل التفسير، يرجى المحاولة مرة أخرى");
  }

  const arabicJson = await arabicRes.json();
  const translationJson = await translationRes.json();

  const ayahs: any[] = arabicJson?.data?.ayahs ?? [];
  const translations: any[] = translationJson?.data?.ayahs ?? [];

  return ayahs.map((a: any, i: number) => ({
    numberInSurah: a.numberInSurah,
    arabic: a.text ?? "",
    translation: translations[i]?.text ?? "",
  }));
}

function TafsirPage() {
  const { id } = useParams({ from: "/quran/$id/tafsir" });
  const num = Math.max(1, Math.min(114, Number(id) || 1));
  const [edition, setEdition] = useState(TAFSIR_EDITIONS[0].id);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const { data: surahInfo } = useQuery({
    queryKey: ["surah-info", num],
    queryFn: () => fetchSurah(num),
    staleTime: Infinity,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tafsir", num, edition],
    queryFn: () => fetchTafsirData(num, edition),
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });

  function toggleAyah(n: number) {
    setExpandedSet(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  const isExpanded = (n: number) => expandAll || expandedSet.has(n);
  const selectedEdition = TAFSIR_EDITIONS.find(t => t.id === edition);
  const isRTL = selectedEdition?.lang === "ar";

  return (
    <div className="fade-up pb-28">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-border/40 px-4 py-3"
        style={{ background: "color-mix(in oklab, var(--background) 90%, transparent)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Link
            to="/quran/$id"
            params={{ id: String(num) }}
            className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft border border-border/60 shrink-0"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180 text-foreground" />
          </Link>
          <div className="flex-1 text-center">
            <p className="font-quran text-xl text-foreground leading-none">
              {surahInfo?.surah.name ?? `سورة ${num}`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {surahInfo?.surah.numberOfAyahs} آية • التفسير والترجمة
            </p>
          </div>
          <Link
            to="/quran/$id"
            params={{ id: String(num) }}
            className="grid h-9 w-9 place-items-center rounded-2xl border border-border/60 bg-card"
          >
            <BookOpen className="h-4 w-4 text-foreground" />
          </Link>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <select
            value={edition}
            onChange={e => { setEdition(e.target.value); setExpandedSet(new Set()); }}
            className="flex-1 rounded-xl bg-card border border-border text-foreground px-3 py-2 text-xs outline-none focus:border-primary appearance-none"
          >
            {TAFSIR_EDITIONS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setExpandAll(e => !e); setExpandedSet(new Set()); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shrink-0 border ${
              expandAll
                ? "border-primary/30 text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
            style={expandAll ? { background: "var(--g-primary)" } : {}}
          >
            <AlignJustify className="h-3.5 w-3.5" />
            {expandAll ? "طيّ الكل" : "فتح الكل"}
          </button>
        </div>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">يتحمّل التفسير…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 p-5 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {(error as Error).message}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-full px-4 py-2 text-xs font-bold text-white"
            style={{ background: "var(--g-primary)" }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Ayahs */}
      {data && (
        <div className="px-4 mt-4 space-y-2.5">
          {data.map(ayah => {
            const open = isExpanded(ayah.numberInSurah);
            return (
              <div key={ayah.numberInSurah}
                className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
                {/* Arabic text — always visible */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl text-xs font-bold shrink-0 text-amber-900 dark:text-amber-200 shadow-sm"
                      style={{ background: "var(--g-gold)" }}>
                      {ayah.numberInSurah}
                    </span>
                    <p className="font-quran text-xl leading-loose text-foreground flex-1" dir="rtl">
                      {ayah.arabic}
                    </p>
                  </div>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => toggleAyah(ayah.numberInSurah)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border/40 text-xs text-muted-foreground hover:bg-muted/30 transition"
                >
                  <span>{open ? "إخفاء الترجمة/التفسير" : "عرض الترجمة/التفسير"}</span>
                  {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {/* Translation/Tafsir */}
                {open && (
                  <div className="border-t border-border/30 px-4 py-4 bg-muted/20 fade-up">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-0.5 w-6 rounded-full" style={{ background: "var(--g-gold)" }} />
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {selectedEdition?.name}
                      </p>
                    </div>
                    {ayah.translation ? (
                      <p
                        className={`leading-relaxed text-foreground ${isRTL ? "font-quran text-lg text-right" : "text-sm text-left"}`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        {ayah.translation}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">لا يوجد تفسير لهذه الآية</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
