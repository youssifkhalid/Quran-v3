import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight, Search, Play, Pause, Mic2, Download } from "lucide-react";
import { fetchSurahs, fuzzyScore, reciterSupportsSurah, surahAudioUrlForReciter, type Surah } from "@/lib/quran";
import { fetchReciters } from "@/lib/reciters.functions";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

export const Route = createFileRoute("/reciters/$id")({
  head: () => ({
    meta: [
      { title: "تلاوة الشيخ — القرآن الكريم — سكينة" },
      { name: "description", content: "اختر سورة واستمع لتلاوتها كاملة بصوت الشيخ المختار." },
    ],
  }),
  component: ReciterPage,
});

function ReciterPage() {
  const { id } = useParams({ from: "/reciters/$id" });
  const recitersQ = useQuery({ queryKey: ["reciters-v2"], queryFn: fetchReciters, staleTime: 1000 * 60 * 60 });
  const reciter = useMemo(() => recitersQ.data?.find((r) => r.id === id), [id, recitersQ.data]);
  const { data: surahs, isLoading } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahs, staleTime: Infinity });
  const [q, setQ] = useState("");

  const player = useAudioPlayer();

  const filtered = useMemo(() => {
    const list = (surahs ?? []).filter((s) => !reciter || reciterSupportsSurah(reciter, s.number));
    if (!q.trim()) return list;
    return list
      .map((s) => ({ s, score: Math.max(fuzzyScore(q, s.name), fuzzyScore(q, s.englishName), String(s.number) === q.trim() ? 1 : 0) }))
      .filter((x) => x.score > 0.55)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
  }, [surahs, q, reciter]);

  function buildTrack(s: Surah) {
    if (!reciter) return null;
    return {
      surah: s,
      reciter,
      audioUrl: surahAudioUrlForReciter(reciter, s.number),
    };
  }

  function playAll(startSurah: Surah) {
    if (!reciter) return;
    const queue = filtered.map((s) => ({
      surah: s,
      reciter: reciter!,
      audioUrl: surahAudioUrlForReciter(reciter!, s.number),
    }));
    const startIndex = filtered.findIndex((s) => s.number === startSurah.number);
    player.play(queue[startIndex] ?? queue[0], queue, startIndex >= 0 ? startIndex : 0);
  }

  function toggleSurah(s: Surah) {
    const track = buildTrack(s);
    if (!track) return;
    const isCurrent = player.track?.surah.number === s.number && player.track?.reciter.id === reciter?.id;
    if (isCurrent) {
      player.toggle();
    } else {
      playAll(s);
    }
  }

  if (!reciter && recitersQ.isLoading) {
    return <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-2xl" />)}</div>;
  }

  if (!reciter) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">القارئ غير موجود</p>
        <Link to="/reciters" className="mt-4 inline-block text-primary underline">العودة للقائمة</Link>
      </div>
    );
  }

  return (
    <div className="fade-up pb-40">
      <header className="sticky top-0 z-30 glass border-b border-border/40 px-3 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <Link to="/reciters" className="grid h-9 w-9 place-items-center rounded-full bg-card shadow-soft">
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="font-quran text-lg leading-none truncate">{reciter.name}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{reciter.style ?? "قراءة"} • {toArabic(reciter.totalSurahs ?? 114)} سورة</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full gradient-gold text-gold-foreground shadow-soft">
          <Mic2 className="h-4 w-4" />
        </span>
      </header>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            placeholder="ابحث عن سورة…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
          />
          {q && <button onClick={() => setQ("")} className="text-xs text-muted-foreground shrink-0">مسح</button>}
        </div>
      </div>

      {/* Surah list */}
      <ul className="px-3 mt-3 space-y-1.5">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <li key={i} className="h-16 mx-1 rounded-2xl skeleton" />)
        ) : filtered.length === 0 ? (
          <li className="text-center text-sm text-muted-foreground py-10">لا توجد نتائج</li>
        ) : (
          filtered.map((s) => {
            const isCurrent = player.track?.surah.number === s.number && player.track?.reciter.id === reciter.id;
            const isPlaying = isCurrent && player.playing;
            return (
              <li key={s.number}>
                <button
                  onClick={() => toggleSurah(s)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-3 shadow-soft transition active:scale-[0.98] ${
                    isCurrent ? "gradient-primary text-primary-foreground" : "bg-card hover:bg-surface-elevated"
                  }`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${isCurrent ? "bg-gold/25" : "bg-gold/10 text-gold"}`}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 rtl:-mr-0.5" />}
                  </span>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-quran text-xl truncate">{s.name}</span>
                      <span className={`text-[10px] shrink-0 ${isCurrent ? "opacity-80" : "text-muted-foreground"}`}>{s.number}</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isCurrent ? "opacity-80" : "text-muted-foreground"}`}>
                      {s.revelationType === "Meccan" ? "مكية" : "مدنية"} • {s.numberOfAyahs} آية
                    </p>
                  </div>
                  <a
                    href={surahAudioUrlForReciter(reciter, s.number)}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className={`grid h-9 w-9 place-items-center rounded-full ${isCurrent ? "bg-gold/25" : "bg-muted/50"}`}
                    aria-label="تحميل"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function toArabic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
