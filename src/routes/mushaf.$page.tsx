import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronLeft, BookmarkCheck, Bookmark, Home, ZoomIn, ZoomOut } from "lucide-react";
import { fetchMushafPage } from "@/lib/quran";

export const Route = createFileRoute("/mushaf/$page")({
  head: ({ params }) => ({
    meta: [{ title: `المصحف الشريف — صفحة ${params.page} — سكينة` }],
  }),
  component: MushafPage,
});

const MUSHAF_KEY = "sakeenah:mushaf-bookmarks";
const FONT_KEY = "sakeenah:mushaf-font";
const LAST_PAGE_KEY = "sakeenah:mushaf-lastPage";

function MushafPage() {
  const { page } = useParams({ from: "/mushaf/$page" });
  const pageNum = Math.max(1, Math.min(604, Number(page) || 1));
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState(1.5);
  const [bookmarked, setBookmarked] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [jumpTarget, setJumpTarget] = useState("");

  useEffect(() => {
    const fs = localStorage.getItem(FONT_KEY);
    if (fs) setFontSize(Number(fs));
    const bm = JSON.parse(localStorage.getItem(MUSHAF_KEY) ?? "[]") as number[];
    setBookmarked(bm.includes(pageNum));
    localStorage.setItem(LAST_PAGE_KEY, String(pageNum));
  }, [pageNum]);

  const { data, isLoading } = useQuery({
    queryKey: ["mushaf", pageNum],
    queryFn: () => fetchMushafPage(pageNum),
    staleTime: Infinity,
    placeholderData: (prev) => prev,
  });

  const goTo = useCallback((p: number) => {
    const safe = Math.max(1, Math.min(604, p));
    navigate({ to: "/mushaf/$page", params: { page: String(safe) } });
  }, [navigate]);

  function toggleBookmark() {
    const bm = JSON.parse(localStorage.getItem(MUSHAF_KEY) ?? "[]") as number[];
    const next = bookmarked ? bm.filter((n) => n !== pageNum) : [...bm, pageNum];
    setBookmarked(!bookmarked);
    localStorage.setItem(MUSHAF_KEY, JSON.stringify(next));
    localStorage.setItem("sakeenah:lastRead", JSON.stringify({ page: pageNum }));
  }

  function handleFontSize(delta: number) {
    setFontSize((f) => {
      const n = Math.max(1.0, Math.min(2.8, +(f + delta).toFixed(1)));
      localStorage.setItem(FONT_KEY, String(n));
      return n;
    });
  }

  // Swipe navigation
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) { goTo(pageNum + (dx > 0 ? -1 : 1)); }
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => { window.removeEventListener("touchstart", onTouchStart); window.removeEventListener("touchend", onTouchEnd); };
  }, [pageNum, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(pageNum - 1);
      if (e.key === "ArrowLeft") goTo(pageNum + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pageNum, goTo]);

  const pct = ((pageNum - 1) / 603) * 100;

  return (
    <div className="fade-up relative min-h-[calc(100dvh-7rem)] flex flex-col" onClick={() => setShowNav((s) => !s)}>
      {/* Top bar — toggleable */}
      <div className={`sticky top-0 z-30 transition-opacity duration-300 ${showNav ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="glass border-b border-border/40 px-3 py-2.5 flex items-center gap-2">
          <Link to="/quran" onClick={(e) => e.stopPropagation()}
            className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>

          <div className="flex-1 text-center">
            <p className="text-sm font-bold">
              {data?.surahsOnPage.map((s) => s.name).join(" • ") ?? "…"}
            </p>
            <p className="text-[11px] text-muted-foreground">صفحة {pageNum} من ٦٠٤</p>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => handleFontSize(-0.2)} className="grid h-8 w-8 place-items-center rounded-xl bg-card shadow-soft">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleFontSize(0.2)} className="grid h-8 w-8 place-items-center rounded-xl bg-card shadow-soft">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={toggleBookmark} className={`grid h-9 w-9 place-items-center rounded-full shadow-soft ${bookmarked ? "gradient-gold text-gold-foreground" : "bg-card"}`}>
              {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {/* Progress */}
        <div className="h-0.5 bg-muted">
          <div className="h-full gradient-gold transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Surah headers on page */}
      {data?.surahsOnPage && data.surahsOnPage.length > 0 && (
        <div className="mx-4 mt-3 mb-1 flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {data.surahsOnPage.map((s) => (
            <Link key={s.number} to="/quran/$id" params={{ id: String(s.number) }}
              className="rounded-lg gradient-primary text-primary-foreground px-3 py-1 text-xs shadow-glow">
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {/* Quran text */}
      <article
        className="flex-1 mx-3 mt-2 mb-4 rounded-3xl border-[2px] border-gold/40 bg-card/90 p-5 shadow-elevated relative overflow-hidden"
        style={{ fontFamily: "Amiri Quran, Amiri, serif", fontSize: `${fontSize}rem`, lineHeight: 2.5, textAlign: "justify", textAlignLast: "center", direction: "rtl" }}
      >
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" style={{ width: `${75 + Math.random() * 25}%`, marginLeft: "auto" }} />
            ))}
          </div>
        ) : (
          data?.ayahs.map((a) => (
            <span key={a.number}>
              {a.numberInSurah === 1 && a.surahNumber !== 1 && a.surahNumber !== 9 && (
                <span className="block text-center my-4 text-xl" style={{ fontFamily: "Amiri Quran, serif" }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
              )}
              {a.text}
              {" "}
              <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-gold text-[11px] font-bold align-middle mx-0.5">
                {toArabicDigits(a.numberInSurah)}
              </span>
              {" "}
            </span>
          ))
        )}
      </article>

      {/* Bottom navigation */}
      <div
        className={`fixed inset-x-0 bottom-[5rem] z-30 flex items-center justify-between px-4 transition-opacity duration-300 ${showNav ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => goTo(pageNum + 1)}
          disabled={pageNum >= 604}
          className="grid h-12 w-12 place-items-center rounded-full glass shadow-elevated border border-border/40 disabled:opacity-30"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Jump to page input */}
        <div className="glass rounded-full shadow-elevated border border-border/40 flex items-center px-4 py-2 gap-2">
          <input
            type="number"
            min={1} max={604}
            placeholder={String(pageNum)}
            value={jumpTarget}
            onChange={(e) => setJumpTarget(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && jumpTarget) { goTo(Number(jumpTarget)); setJumpTarget(""); } }}
            className="w-16 bg-transparent text-sm text-center outline-none"
          />
          <button onClick={() => { if (jumpTarget) { goTo(Number(jumpTarget)); setJumpTarget(""); } }}
            className="text-xs text-primary font-semibold">
            انتقل
          </button>
        </div>

        <button
          onClick={() => goTo(pageNum - 1)}
          disabled={pageNum <= 1}
          className="grid h-12 w-12 place-items-center rounded-full glass shadow-elevated border border-border/40 disabled:opacity-30"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function toArabicDigits(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
