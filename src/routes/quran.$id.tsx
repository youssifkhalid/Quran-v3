import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, BookmarkCheck, Play, Pause, BookOpen, Volume2, Share2, Type, ChevronDown, ChevronUp } from "lucide-react";
import { fetchSurah, fetchSurahAudio, QURAN_AUDIO_RECITERS, SURAH_START_PAGE } from "@/lib/quran";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

export const Route = createFileRoute("/quran/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `سورة ${params.id} — سكينة` },
      { name: "description", content: "اقرأ السورة برسم عثماني مع تلاوات لكبار القراء." },
    ],
  }),
  component: SurahPage,
});

const BOOKMARK_KEY = "sakeenah:bookmarks";
const RECITER_KEY = "sakeenah:reciter";
const FONT_SIZE_KEY = "sakeenah:quran-font-size";

function SurahPage() {
  const { id } = useParams({ from: "/quran/$id" });
  const num = Number(id);
  const safeNum = Number.isFinite(num) && num >= 1 && num <= 114 ? num : 1;

  const { data, isLoading } = useQuery({
    queryKey: ["surah", safeNum],
    queryFn: () => fetchSurah(safeNum),
    staleTime: Infinity,
  });

  const [reciter, setReciter] = useState<string>(QURAN_AUDIO_RECITERS[0].id);
  useEffect(() => {
    const r = typeof window !== "undefined" && localStorage.getItem(RECITER_KEY);
    if (r) setReciter(r);
    const fs = typeof window !== "undefined" && localStorage.getItem(FONT_SIZE_KEY);
    if (fs) setFontSize(Number(fs));
  }, []);
  useEffect(() => { if (reciter) localStorage.setItem(RECITER_KEY, reciter); }, [reciter]);

  const [fontSize, setFontSize] = useState(1.6);
  useEffect(() => { localStorage.setItem(FONT_SIZE_KEY, String(fontSize)); }, [fontSize]);

  const audioQ = useQuery({
    queryKey: ["surah-audio", safeNum, reciter],
    queryFn: () => fetchSurahAudio(safeNum, reciter),
    staleTime: Infinity,
  });

  const player = useAudioPlayer();

  // Build track list for global player
  const tracks = useMemo(() => {
    if (!audioQ.data || !data) return [];
    const reciterInfo = QURAN_AUDIO_RECITERS.find((r) => r.id === reciter);
    if (!reciterInfo) return [];
    return audioQ.data.map((ayah) => ({
      surah: data.surah,
      reciter: reciterInfo,
      audioUrl: ayah.audio ?? "",
    }));
  }, [audioQ.data, data, reciter]);

  function playAyah(idx: number) {
    if (!tracks[idx] || !tracks[idx].audioUrl) return;
    player.play(tracks[idx], tracks, idx);
  }

  const isSurahPlaying = player.track?.surah.number === safeNum && player.playing;
  const currentAyahIdx = player.track?.surah.number === safeNum
    ? tracks.findIndex((t) => t.audioUrl === player.track?.audioUrl)
    : -1;

  const [bookmarks, setBookmarks] = useState<number[]>([]);
  useEffect(() => {
    const raw = typeof window !== "undefined" && localStorage.getItem(BOOKMARK_KEY);
    if (raw) setBookmarks(JSON.parse(raw));
  }, []);
  function toggleBookmark(ayahNumber: number) {
    setBookmarks((prev) => {
      const next = prev.includes(ayahNumber) ? prev.filter((n) => n !== ayahNumber) : [...prev, ayahNumber];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      localStorage.setItem("sakeenah:lastRead", JSON.stringify({ surah: safeNum, ayah: ayahNumber }));
      return next;
    });
  }

  function shareAyah(text: string, ref: string) {
    const shareText = `${text}\n\n— ${ref}\n\nسكينة، تطبيقك الإسلامي`;
    if (navigator.share) navigator.share({ text: shareText }).catch(() => {});
    else navigator.clipboard?.writeText(shareText).catch(() => {});
  }

  const reciterInfo = useMemo(() => QURAN_AUDIO_RECITERS.find((r) => r.id === reciter), [reciter]);
  const startPage = SURAH_START_PAGE[safeNum] ?? 1;

  function toggleSurahPlay() {
    if (isSurahPlaying) {
      player.pause();
    } else if (player.track?.surah.number === safeNum) {
      player.resume();
    } else {
      playAyah(0);
    }
  }

  return (
    <div className="fade-up pb-32">
      <header className="sticky top-0 z-30 glass border-b border-border/40 px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <Link to="/quran" className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft">
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="font-quran text-xl leading-none truncate">{data?.surah.name ?? "…"}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {data ? `${data.surah.numberOfAyahs} آية • ${data.surah.revelationType === "Meccan" ? "مكية" : "مدنية"}` : "—"}
          </p>
        </div>
        <Link to="/mushaf/$page" params={{ page: String(startPage) }}
          className="grid h-9 w-9 place-items-center rounded-full gradient-gold text-gold-foreground shadow-soft"
          aria-label="عرض في المصحف">
          <BookOpen className="h-4 w-4" />
        </Link>
        <Link to="/quran/$id/tafsir" params={{ id: String(safeNum) }}
          className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft"
          aria-label="التفسير">
          <span className="text-xs font-bold text-primary">تفسير</span>
        </Link>
      </header>

      {/* Reciter + font controls */}
      <div className="mx-4 mt-4 rounded-2xl bg-card border border-border shadow-soft p-3 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground">
          <Volume2 className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground">القارئ</p>
          <select
            value={reciter}
            onChange={(e) => { setReciter(e.target.value); player.dismiss(); }}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          >
            {QURAN_AUDIO_RECITERS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}{r.style ? ` — ${r.style}` : ""}</option>
            ))}
          </select>
        </div>
        {/* Font size */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button onClick={() => setFontSize((f) => Math.min(2.4, +(f + 0.1).toFixed(1)))} className="grid h-7 w-7 place-items-center rounded-lg bg-muted">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <Type className="h-3.5 w-3.5 text-muted-foreground" />
          <button onClick={() => setFontSize((f) => Math.max(1.0, +(f - 0.1).toFixed(1)))} className="grid h-7 w-7 place-items-center rounded-lg bg-muted">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Play/Pause */}
        <button
          onClick={toggleSurahPlay}
          disabled={audioQ.isLoading}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow disabled:opacity-50"
          aria-label={isSurahPlaying ? "إيقاف" : "تشغيل"}
        >
          {isSurahPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 rtl:-mr-0.5" />}
        </button>
      </div>

      {/* Basmala */}
      {safeNum !== 1 && safeNum !== 9 && (
        <div className="mx-4 mt-4 rounded-3xl gradient-primary text-primary-foreground p-6 text-center shadow-elevated relative overflow-hidden">
          <div className="absolute inset-x-0 -top-12 mx-auto h-24 w-24 rounded-full bg-gold/30 blur-2xl" />
          <p className="font-quran text-2xl relative">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        </div>
      )}

      <article className="mx-3 mt-4 rounded-3xl border-[3px] border-gold/50 bg-card/80 p-4 shadow-elevated">
        <div className="mb-4 rounded-xl gradient-primary px-4 py-2 text-center text-primary-foreground shadow-soft">
          <p className="font-quran text-xl">{data?.surah.name ?? "سورة"}</p>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        ) : (
          <div
            className="font-quran text-foreground"
            style={{ fontSize: `${fontSize}rem`, lineHeight: 2.4, textAlign: "justify", textAlignLast: "center" }}
          >
            {data?.ayahs.map((a, idx) => {
              const isBookmarked = bookmarks.includes(a.number);
              const isCurrent = currentAyahIdx === idx;
              return (
                <span key={a.number} className={`inline transition-colors rounded-md ${isCurrent ? "bg-gold/20" : ""}`}>
                  <span
                    onClick={() => playAyah(idx)}
                    className="cursor-pointer"
                  >
                    {a.text}
                  </span>
                  {" "}
                  <button
                    onClick={() => toggleBookmark(a.number)}
                    className="inline-flex items-center align-middle"
                    aria-label={isBookmarked ? "إزالة الإشارة" : "إضافة إشارة"}
                  >
                    <span className="relative inline-grid h-9 w-9 place-items-center mx-1 align-middle">
                      <svg viewBox="0 0 40 40" className={`absolute inset-0 h-full w-full ${isBookmarked ? "text-gold" : "text-primary/50"}`}
                        fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 2 L36 12 L36 28 L20 38 L4 28 L4 12 Z" />
                      </svg>
                      <span className="relative font-sans text-[12px] font-bold text-primary">
                        {toArabicDigits(a.numberInSurah)}
                      </span>
                    </span>
                  </button>
                  {/* Share button per ayah (small) */}
                  <button
                    onClick={() => shareAyah(a.text, `${data.surah.name} — آية ${a.numberInSurah}`)}
                    className="inline-flex align-middle opacity-30 hover:opacity-70 transition-opacity"
                    aria-label="مشاركة الآية"
                  >
                    <Share2 className="h-3.5 w-3.5 inline" />
                  </button>
                  {" "}
                </span>
              );
            })}
          </div>
        )}
      </article>

      {bookmarks.length > 0 && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-2xl bg-gold/10 border border-gold/30 px-4 py-3 text-sm">
          <BookmarkCheck className="h-4 w-4 text-gold" />
          <span>{bookmarks.length} إشارة محفوظة</span>
        </div>
      )}
    </div>
  );
}

function toArabicDigits(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
