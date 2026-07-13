import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight, BookOpen, AlignJustify, Loader2 } from "lucide-react";
import { fetchSurah } from "@/lib/quran";

export const Route = createFileRoute("/quran/$id/tafsir")({
  head: ({ params }) => ({
    meta: [{ title: `تفسير سورة ${params.id} — سكينة` }],
  }),
  component: TafsirPage,
});

const TAFSIR_EDITIONS = [
  { id: "ar.muyassar",    name: "التفسير الميسّر",         lang: "ar" },
  { id: "ar.jalalayn",   name: "تفسير الجلالين",          lang: "ar" },
  { id: "ar.maududi",    name: "تفسير المودودي",           lang: "ar" },
  { id: "en.sahih",      name: "Saheeh International",    lang: "en" },
  { id: "en.yusufali",   name: "Yusuf Ali Translation",   lang: "en" },
];

interface AyahTafsir {
  numberInSurah: number;
  text: string;
  tafsir?: string;
}

async function fetchTafsir(surahNum: number, edition: string) {
  const [ayahRes, tafsirRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`).then(r => r.json()),
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${edition}`).then(r => r.json()),
  ]);
  const ayahs: any[] = ayahRes?.data?.ayahs ?? [];
  const tafsirs: any[] = tafsirRes?.data?.ayahs ?? [];
  return ayahs.map((a, i) => ({
    numberInSurah: a.numberInSurah,
    text: a.text,
    tafsir: tafsirs[i]?.text ?? "",
  })) as AyahTafsir[];
}

function TafsirPage() {
  const { id } = useParams({ from: "/quran/$id/tafsir" });
  const num = Math.max(1, Math.min(114, Number(id) || 1));
  const [edition, setEdition] = useState(TAFSIR_EDITIONS[0].id);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const { data: surahBase } = useQuery({
    queryKey: ["surah", num],
    queryFn: () => fetchSurah(num),
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tafsir", num, edition],
    queryFn: () => fetchTafsir(num, edition),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  function toggleAyah(n: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  const isExpanded = (n: number) => expandAll || expanded.has(n);

  return (
    <div className="fade-up pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/quran/$id" params={{ id: String(num) }}
            className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft shrink-0">
            <ChevronRight className="h-4 w-4 rtl:rotate-180"/>
          </Link>
          <div className="flex-1 text-center">
            <p className="font-quran text-lg">{surahBase?.surah.name ?? `سورة ${num}`}</p>
            <p className="text-[10px] text-muted-foreground">{surahBase?.surah.numberOfAyahs} آية • التفسير</p>
          </div>
          <Link to="/quran/$id" params={{ id: String(num) }}
            className="grid h-9 w-9 place-items-center rounded-2xl gradient-gold text-gold-foreground shadow-soft">
            <BookOpen className="h-4 w-4"/>
          </Link>
        </div>

        {/* Edition + expand controls */}
        <div className="flex gap-2">
          <select value={edition} onChange={e => setEdition(e.target.value)}
            className="flex-1 rounded-xl bg-card border border-border px-3 py-2 text-xs outline-none">
            {TAFSIR_EDITIONS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button onClick={() => setExpandAll(e => !e)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition shrink-0 ${expandAll ? "gradient-primary text-primary-foreground" : "bg-card border border-border"}`}>
            <AlignJustify className="h-3.5 w-3.5"/>
            {expandAll ? "طيّ الكل" : "فتح الكل"}
          </button>
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin"/>
          <p className="text-sm text-muted-foreground">يتحمّل التفسير…</p>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-3">
          {(data ?? []).map(ayah => {
            const open = isExpanded(ayah.numberInSurah);
            return (
              <div key={ayah.numberInSurah}
                className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden transition active:scale-[0.99]">
                {/* Ayah text */}
                <button onClick={() => toggleAyah(ayah.numberInSurah)}
                  className="w-full text-right p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl gradient-gold text-gold-foreground text-xs font-bold shrink-0 shadow-gold">
                      {ayah.numberInSurah}
                    </span>
                    <p className="font-quran text-xl leading-loose flex-1">{ayah.text}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-left">
                    {open ? "▲ إخفاء التفسير" : "▼ عرض التفسير"}
                  </p>
                </button>

                {/* Tafsir */}
                {open && ayah.tafsir && (
                  <div className="border-t border-border/40 bg-muted/20 px-4 py-4 fade-up">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-1 w-6 rounded-full gradient-gold"/>
                      <p className="text-[10px] font-semibold text-gold">
                        {TAFSIR_EDITIONS.find(t => t.id === edition)?.name}
                      </p>
                    </div>
                    <p className={`leading-relaxed ${edition.startsWith("ar") ? "font-quran text-base" : "text-sm"}`}
                      dir={edition.startsWith("ar") ? "rtl" : "ltr"}>
                      {ayah.tafsir}
                    </p>
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
