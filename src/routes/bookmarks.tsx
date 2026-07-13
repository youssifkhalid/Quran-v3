import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BookmarkCheck, Trash2, BookOpen, ChevronRight } from "lucide-react";
import { fetchSurahs } from "@/lib/quran";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "الإشارات المرجعية — سكينة" },
      { name: "description", content: "آياتك المحفوظة ومتابعة القراءة." },
    ],
  }),
  component: BookmarksPage,
});

const BOOKMARK_KEY = "sakeenah:bookmarks";
const LAST_READ_KEY = "sakeenah:lastRead";

interface Bookmark {
  ayahNumber: number;   // global mushaf number
  surahNum: number;
  ayahInSurah: number;
}

function BookmarksPage() {
  const [bookmarkNums, setBookmarkNums] = useState<number[]>([]);
  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (raw) setBookmarkNums(JSON.parse(raw));
    const lr = localStorage.getItem(LAST_READ_KEY);
    if (lr) setLastRead(JSON.parse(lr));
  }, []);

  const { data: surahs } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahs, staleTime: Infinity });

  function removeBookmark(num: number) {
    const next = bookmarkNums.filter((n) => n !== num);
    setBookmarkNums(next);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  }

  function clearAll() {
    if (!confirm("حذف جميع الإشارات؟")) return;
    setBookmarkNums([]);
    localStorage.removeItem(BOOKMARK_KEY);
  }

  // Compute surah/ayah from global ayah number
  function getSurahForAyah(globalNum: number): { surahNum: number; ayahInSurah: number } | null {
    if (!surahs) return null;
    let cumul = 0;
    for (const s of surahs) {
      if (globalNum <= cumul + s.numberOfAyahs) {
        return { surahNum: s.number, ayahInSurah: globalNum - cumul };
      }
      cumul += s.numberOfAyahs;
    }
    return null;
  }

  const enriched = bookmarkNums.map((num) => {
    const info = getSurahForAyah(num);
    const surahObj = info ? surahs?.find((s) => s.number === info.surahNum) : null;
    return { num, info, surahObj };
  });

  // Group by surah
  const grouped: Record<string, typeof enriched> = {};
  for (const b of enriched) {
    const key = String(b.info?.surahNum ?? "?");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(b);
  }

  return (
    <div className="fade-up pb-8">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-quran text-3xl">الإشارات المرجعية</h1>
          <p className="text-sm text-muted-foreground mt-1">{bookmarkNums.length} إشارة محفوظة</p>
        </div>
        {bookmarkNums.length > 0 && (
          <button onClick={clearAll} className="text-xs text-destructive flex items-center gap-1">
            <Trash2 className="h-3.5 w-3.5" /> مسح الكل
          </button>
        )}
      </header>

      {/* Last read */}
      {lastRead && (
        <div className="mx-4 mb-4">
          <Link
            to="/quran/$id"
            params={{ id: String(lastRead.surah) }}
            className="flex items-center gap-3 rounded-2xl gradient-primary text-primary-foreground p-4 shadow-elevated active:scale-[0.98] transition"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">متابعة القراءة</p>
              <p className="text-[11px] opacity-80">
                {surahs?.find((s) => s.number === lastRead.surah)?.name ?? `سورة ${lastRead.surah}`} — آية {lastRead.ayah}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 opacity-70 rtl:rotate-180" />
          </Link>
        </div>
      )}

      {bookmarkNums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <BookmarkCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="font-quran text-xl text-muted-foreground">لا توجد إشارات بعد</p>
          <p className="text-sm text-muted-foreground mt-2">اضغط على رقم الآية أثناء القراءة لحفظها</p>
          <Link to="/quran" className="mt-6 rounded-full gradient-primary text-primary-foreground px-6 py-2.5 text-sm shadow-elevated">
            ابدأ القراءة
          </Link>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {Object.entries(grouped).map(([surahKey, items]) => {
            const surahObj = items[0]?.surahObj;
            return (
              <div key={surahKey} className="rounded-3xl bg-card shadow-soft border border-border/60 overflow-hidden">
                <div className="px-4 py-3 gradient-primary text-primary-foreground flex items-center justify-between">
                  <span className="font-quran text-lg">{surahObj?.name ?? `سورة ${surahKey}`}</span>
                  <span className="text-xs opacity-75">{items.length} إشارة</span>
                </div>
                <ul className="divide-y divide-border/40">
                  {items.sort((a, b) => (a.info?.ayahInSurah ?? 0) - (b.info?.ayahInSurah ?? 0)).map(({ num, info }) => (
                    <li key={num} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg gradient-gold text-gold-foreground text-xs font-bold">
                          {info?.ayahInSurah ?? "—"}
                        </span>
                        <Link
                          to="/quran/$id"
                          params={{ id: String(info?.surahNum ?? 1) }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          آية {info?.ayahInSurah}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeBookmark(num)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
