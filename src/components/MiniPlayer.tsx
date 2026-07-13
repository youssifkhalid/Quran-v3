import { Link } from "@tanstack/react-router";
import { Play, Pause, SkipBack, SkipForward, X, Loader2 } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

function fmt(s: number) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const { track, playing, loading, progress, duration, toggle, skipNext, skipPrev, seek, dismiss } = useAudioPlayer();

  if (!track) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-[5.5rem] z-40 px-3 pointer-events-none">
      <div className="mx-auto max-w-screen-sm pointer-events-auto rounded-2xl glass shadow-elevated border border-border/40 overflow-hidden">
        {/* Progress bar */}
        <div
          className="h-0.5 bg-muted cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = 1 - (e.clientX - rect.left) / rect.width;
            seek(duration * Math.max(0, Math.min(1, pct)));
          }}
        >
          <div className="h-full gradient-gold transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center gap-2 px-3 py-2">
          {/* Track info */}
          <Link
            to="/reciters/$id"
            params={{ id: track.reciter.id }}
            className="flex-1 min-w-0 text-right"
          >
            <p className="font-quran text-base leading-none truncate">{track.surah.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{track.reciter.name} • {fmt(progress)} / {fmt(duration)}</p>
          </Link>

          {/* Controls */}
          <button onClick={skipNext} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft" aria-label="التالية">
            <SkipForward className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
          <button
            onClick={toggle}
            className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow"
            aria-label={playing ? "إيقاف" : "تشغيل"}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 rtl:-mr-0.5" />
            )}
          </button>
          <button onClick={skipPrev} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft" aria-label="السابقة">
            <SkipBack className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
          <button onClick={dismiss} className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft" aria-label="إغلاق">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
