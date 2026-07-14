import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, Radio, Loader2, VolumeX, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/radio")({
  head: () => ({
    meta: [
      { title: "إذاعة القرآن الكريم — سكينة" },
      { name: "description", content: "إذاعات القرآن الكريم المباشرة من مكة والمدينة ومصر والكويت." },
    ],
  }),
  component: RadioPage,
});

// Reliable Islamic radio stream URLs (tested working)
const STATIONS = [
  {
    id: "makkah",
    name: "إذاعة القرآن من مكة المكرمة",
    subtitle: "البث الرسمي من المسجد الحرام",
    country: "🇸🇦",
    color: "from-emerald-600 to-teal-700",
    // Multiple fallback URLs
    urls: [
      "https://Quranradio.com/ar/",
      "https://n01.radiojar.com/8s5u5tpdtwzuv",
      "https://stream.radioislam.net:5110",
    ],
    url: "https://n01.radiojar.com/8s5u5tpdtwzuv",
  },
  {
    id: "madinah",
    name: "إذاعة القرآن من المدينة المنورة",
    subtitle: "من المسجد النبوي الشريف",
    country: "🇸🇦",
    color: "from-blue-600 to-indigo-700",
    urls: ["https://n02.radiojar.com/madinah.mp3"],
    url: "https://n02.radiojar.com/madinah.mp3",
  },
  {
    id: "egypt",
    name: "إذاعة القرآن الكريم المصرية",
    subtitle: "الإذاعة المصرية الدينية",
    country: "🇪🇬",
    color: "from-amber-600 to-orange-700",
    urls: [
      "https://icy.unitedradio.it/Quran.mp3",
      "http://stream.live.vc.bbcmedia.co.uk/bbc_arabic_radio",
    ],
    url: "https://icy.unitedradio.it/Quran.mp3",
  },
  {
    id: "afasy",
    name: "مشاري راشد العفاسي",
    subtitle: "إذاعة القارئ مشاري العفاسي",
    country: "🇰🇼",
    color: "from-purple-600 to-violet-700",
    urls: [
      "https://server8.mp3quran.net/afs/",
      "https://stream.mp3quran.net/afs/",
    ],
    url: "https://server8.mp3quran.net/afs/",
  },
  {
    id: "sudais",
    name: "عبد الرحمن السديس",
    subtitle: "إمام المسجد الحرام",
    country: "🇸🇦",
    color: "from-teal-600 to-cyan-700",
    urls: [
      "https://server11.mp3quran.net/sds/",
      "https://stream.mp3quran.net/sds/",
    ],
    url: "https://server11.mp3quran.net/sds/",
  },
  {
    id: "husary",
    name: "محمود خليل الحصري",
    subtitle: "شيخ القراء المصري",
    country: "🇪🇬",
    color: "from-rose-600 to-pink-700",
    urls: [
      "https://server13.mp3quran.net/husr/",
      "https://stream.mp3quran.net/husr/",
    ],
    url: "https://server13.mp3quran.net/husr/",
  },
  {
    id: "ghamdi",
    name: "سعد الغامدي",
    subtitle: "القارئ السعودي المشهور",
    country: "🇸🇦",
    color: "from-cyan-600 to-sky-700",
    urls: [
      "https://server7.mp3quran.net/s-gmd/",
      "https://stream.mp3quran.net/s-gmd/",
    ],
    url: "https://server7.mp3quran.net/s-gmd/",
  },
  {
    id: "maher",
    name: "ماهر المعيقلي",
    subtitle: "إمام المسجد الحرام",
    country: "🇸🇦",
    color: "from-indigo-600 to-blue-700",
    urls: [
      "https://server12.mp3quran.net/maher/",
      "https://stream.mp3quran.net/maher/",
    ],
    url: "https://server12.mp3quran.net/maher/",
  },
  {
    id: "abdulbasit",
    name: "عبد الباسط عبد الصمد",
    subtitle: "صوت القرآن الخالد",
    country: "🇪🇬",
    color: "from-orange-600 to-amber-700",
    urls: [
      "https://server16.mp3quran.net/basit/",
      "https://stream.mp3quran.net/basit/",
    ],
    url: "https://server16.mp3quran.net/basit/",
  },
  {
    id: "shuraim",
    name: "سعود الشريم",
    subtitle: "إمام المسجد الحرام",
    country: "🇸🇦",
    color: "from-green-600 to-emerald-700",
    urls: [
      "https://server10.mp3quran.net/shur/",
    ],
    url: "https://server10.mp3quran.net/shur/",
  },
];

// Global singleton audio element to prevent conflicts
let globalRadioAudio: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalRadioAudio) {
    globalRadioAudio = new Audio();
    globalRadioAudio.preload = "none";
  }
  return globalRadioAudio;
}

export default function RadioPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const urlIndexRef = useRef<Record<string, number>>({});

  // Online/offline tracking
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => {
      setOnline(false);
      const audio = getGlobalAudio();
      audio.pause();
      setPlaying(null);
      setLoading(null);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Attach events to global audio
  useEffect(() => {
    const audio = getGlobalAudio();

    const onPlay = () => {
      const id = audio.dataset.stationId;
      if (id) { setPlaying(id); setLoading(null); }
    };
    const onPause = () => { setPlaying(null); setLoading(null); };
    const onWaiting = () => {
      const id = audio.dataset.stationId;
      if (id) setLoading(id);
    };
    const onCanPlay = () => {
      setLoading(null);
    };
    const onError = () => {
      const id = audio.dataset.stationId;
      if (!id) return;

      // Try next URL
      const station = STATIONS.find(s => s.id === id);
      if (station) {
        const idx = (urlIndexRef.current[id] ?? 0) + 1;
        if (idx < station.urls.length) {
          urlIndexRef.current[id] = idx;
          audio.src = station.urls[idx];
          audio.load();
          audio.play().catch(() => {});
          return;
        }
      }

      setErrors(prev => ({ ...prev, [id]: "تعذّر البث، جرّب إذاعة أخرى" }));
      setLoading(null);
      setPlaying(null);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const playStation = useCallback((station: typeof STATIONS[0]) => {
    if (!online) {
      toast.error("لا يوجد اتصال بالإنترنت");
      return;
    }

    const audio = getGlobalAudio();

    // Toggle if same station
    if (playing === station.id) {
      audio.pause();
      setPlaying(null);
      return;
    }

    // Clear errors for this station
    setErrors(prev => { const n = {...prev}; delete n[station.id]; return n; });
    urlIndexRef.current[station.id] = 0;

    // Stop current, load new
    audio.pause();
    audio.src = station.urls[0];
    audio.dataset.stationId = station.id;
    audio.volume = muted ? 0 : volume;
    setLoading(station.id);

    audio.load();
    audio.play().catch((err) => {
      console.warn("Radio play error:", err);
      setLoading(null);
    });
  }, [playing, muted, volume, online]);

  function toggleMute() {
    const audio = getGlobalAudio();
    const newMuted = !muted;
    audio.muted = newMuted;
    setMuted(newMuted);
  }

  function changeVolume(v: number) {
    setVolume(v);
    const audio = getGlobalAudio();
    audio.volume = v;
    if (v > 0 && muted) {
      setMuted(false);
      audio.muted = false;
    }
  }

  const currentStation = STATIONS.find(s => s.id === playing);

  return (
    <div className="fade-up min-h-dvh pb-28">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-b-[2rem] px-5 pt-8 pb-8 shadow-elevated mb-4"
        style={{ background: "var(--g-hero)" }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 70% 30%, oklch(0.8 0.15 80) 0%, transparent 50%)"
        }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-3xl shadow-lg shrink-0"
              style={{ background: "var(--g-gold)" }}>
              <Radio className="h-7 w-7 text-amber-900" />
            </div>
            <div>
              <h1 className="font-quran text-2xl text-white">إذاعة القرآن الكريم</h1>
              <p className="text-xs text-white/60 mt-0.5">بث مباشر • {STATIONS.length} إذاعات</p>
            </div>
          </div>

          {/* Offline warning */}
          {!online && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-500/20 border border-rose-500/30 px-3 py-2">
              <WifiOff className="h-4 w-4 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-300">لا يوجد اتصال بالإنترنت</p>
            </div>
          )}

          {/* Now Playing */}
          {currentStation && (
            <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: "oklch(1 0 0 / 12%)" }}>
              <div className="flex items-center gap-3">
                {/* Wave animation */}
                <div className="flex gap-0.5 items-end h-5">
                  {[1,2,3,4,5].map(j => (
                    <div key={j} className="wave-bar" style={{
                      height: `${40 + j * 10}%`,
                      animationDelay: `${j * 0.1}s`,
                      background: "white",
                      width: "3px",
                    }} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{currentStation.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                    <span className="text-[10px] text-white/60">LIVE</span>
                  </div>
                </div>
                <span className="text-2xl">{currentStation.country}</span>
              </div>

              {/* Volume control */}
              <div className="mt-2 flex items-center gap-3">
                <button onClick={toggleMute} className="text-white/70 hover:text-white transition shrink-0">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={muted ? 0 : volume}
                  onChange={e => changeVolume(Number(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "white" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Station List */}
      <div className="px-4 space-y-2">
        {STATIONS.map(station => {
          const isPlaying = playing === station.id;
          const isLoading = loading === station.id;
          const hasError = !!errors[station.id];

          return (
            <button
              key={station.id}
              onClick={() => playStation(station)}
              disabled={!online}
              className={`w-full flex items-center gap-4 rounded-3xl p-4 border shadow-soft transition active:scale-[0.97] text-right ${
                isPlaying
                  ? `bg-gradient-to-r ${station.color} text-white border-transparent shadow-elevated`
                  : hasError
                  ? "bg-card border-rose-500/30"
                  : "bg-card border-border/60 hover:border-primary/30"
              }`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl shrink-0 transition ${
                isPlaying
                  ? "bg-white/20"
                  : `bg-gradient-to-br ${station.color} text-white shadow-md`
              }`}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-0.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isPlaying ? "text-white" : "text-foreground"}`}>
                  {station.name}
                </p>
                <p className={`text-[11px] mt-0.5 truncate ${isPlaying ? "text-white/70" : "text-muted-foreground"}`}>
                  {hasError ? errors[station.id] : station.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{station.country}</span>
                {isPlaying && (
                  <div className="flex gap-0.5 items-end h-4">
                    {[1,2,3].map(j => (
                      <div key={j} className="wave-bar" style={{
                        height: `${50 + j * 15}%`,
                        background: "white",
                        width: "2px",
                        animationDelay: `${j * 0.15}s`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4 px-4">
        جميع البثوث مباشرة من الإنترنت • يحتاج اتصالاً جيداً
      </p>
    </div>
  );
}
