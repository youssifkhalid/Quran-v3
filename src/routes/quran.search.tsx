import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, BookOpen, ChevronRight, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/quran/search")({
  head: () => ({
    meta: [
      { title: "البحث في القرآن الكريم — سكينة" },
      { name: "description", content: "ابحث في آيات القرآن الكريم بالكلمة أو الجملة." },
    ],
  }),
  component: QuranSearchPage,
});

interface AyahResult {
  number: number;
  text: string;
  numberInSurah: number;
  surah: { number: number; name: string; englishName: string; numberOfAyahs: number };
  page: number;
  juz: number;
}

async function searchQuran(query: string): Promise<AyahResult[]> {
  if (!query.trim()) return [];
  const r = await fetch(
    `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar`
  );
  const j = await r.json();
  if (j.code !== 200) throw new Error("Search failed");
  return (j.data?.matches ?? []).slice(0, 50);
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  // Simple highlight: split on first rough match
  const normalized = query.replace(/[\u064B-\u065F]/g, "").trim();
  if (!normalized) return text;
  try {
    const re = new RegExp(`(${normalized})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) =>
      re.test(p) ? <mark key={i} className="bg-gold/30 text-foreground rounded px-0.5">{p}</mark> : p
    );
  } catch {
    return text;
  }
}

function QuranSearchPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quran-search", submitted],
    queryFn: () => searchQuran(submitted),
    enabled: submitted.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  function submit() {
    if (q.trim().length >= 2) setSubmitted(q.trim());
  }

  // Sample searches
  const EXAMPLES = ["الرحمن الرحيم", "ولا تحزن", "اصبر", "الجنة", "التوبة", "الصلاة"];

  return (
    <div className="fade-up pb-6">
      <header className="sticky top-0 z-30 glass border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/quran" className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft shrink-0">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <h1 className="font-quran text-xl">البحث في القرآن</h1>
        </div>

        <div className="flex gap-2 mt-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft focus-within:border-primary/50 transition">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="ابحث في الآيات… (لا يقل عن ٢ حروف)"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none"
              dir="rtl"
            />
            {q && (
              <button onClick={() => { setQ(""); setSubmitted(""); inputRef.current?.focus(); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={submit}
            disabled={q.trim().length < 2}
            className="rounded-2xl gradient-primary text-primary-foreground px-5 text-sm font-bold shadow-glow disabled:opacity-40 transition"
          >
            بحث
          </button>
        </div>
      </header>

      {/* Empty / suggestions */}
      {!submitted && (
        <div className="px-4 pt-6">
          <p className="text-xs text-muted-foreground mb-3">أمثلة على البحث:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setQ(ex); setSubmitted(ex); }}
                className="rounded-full bg-card border border-border px-4 py-2 text-sm font-quran shadow-soft hover:border-primary/30 transition"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-3xl gradient-primary text-primary-foreground p-5 shadow-elevated">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-bold text-sm">٦٢٣٦ آية</span>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              ابحث بكلمة، جزء آية، أو موضوع. النتائج تشمل السورة ورقم الآية والصفحة.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">يبحث في ٦٢٣٦ آية…</p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="mx-4 mt-6 rounded-2xl bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">تعذّر البحث</p>
            <p className="text-xs text-muted-foreground mt-1">تحقق من الاتصال بالإنترنت وحاول مرة أخرى.</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">
              {data.length === 0 ? "لا توجد نتائج" : `${data.length} نتيجة`}
              {submitted && <span className="text-muted-foreground font-normal"> لـ «{submitted}»</span>}
            </p>
            {data.length === 50 && (
              <span className="text-xs text-muted-foreground">أول ٥٠ نتيجة</span>
            )}
          </div>

          {data.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-quran text-xl text-muted-foreground">لم يُعثر على نتائج</p>
              <p className="text-sm text-muted-foreground mt-2">جرّب كلمة أخرى أو أقل تفصيلاً</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.map((ayah) => (
                <li key={ayah.number}>
                  <Link
                    to="/quran/$id"
                    params={{ id: String(ayah.surah.number) }}
                    className="block rounded-3xl bg-card border border-border/60 p-4 shadow-soft hover:border-primary/30 transition active:scale-[0.99]"
                    onClick={() => {
                      // Save last read
                      try {
                        localStorage.setItem("sakeenah:lastRead", JSON.stringify({
                          surah: ayah.surah.number,
                          ayah: ayah.numberInSurah,
                        }));
                      } catch {}
                    }}
                  >
                    {/* Surah badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-xl gradient-gold text-gold-foreground text-xs font-bold shadow-gold">
                          {ayah.surah.number}
                        </span>
                        <div>
                          <span className="font-quran text-base">{ayah.surah.name}</span>
                          <span className="text-muted-foreground text-xs"> • {ayah.surah.englishName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">آية {ayah.numberInSurah}</span>
                        <span className="text-[10px] text-muted-foreground block">جزء {ayah.juz} • ص {ayah.page}</span>
                      </div>
                    </div>

                    {/* Ayah text */}
                    <p
                      className="font-quran text-xl leading-loose text-right"
                      dir="rtl"
                    >
                      {highlightText(ayah.text, submitted)}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                      <BookOpen className="h-3 w-3" />
                      <span>اقرأ السورة كاملة</span>
                      <ChevronRight className="h-3 w-3 rtl:rotate-180 mr-auto" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
