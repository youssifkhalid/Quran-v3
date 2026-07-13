import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio, Loader2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/radio")({
  head: () => ({
    meta: [
      { title: "إذاعة القرآن الكريم — سكينة" },
      { name: "description", content: "استمع لإذاعات القرآن الكريم المباشرة من جميع أنحاء العالم." },
    ],
  }),
  component: RadioPage,
});

const STATIONS = [
  { id: "makkah",   name: "إذاعة القرآن الكريم من مكة المكرمة", country: "🇸🇦", color: "from-emerald-600 to-teal-700",   url: "https://backup.quraan.com.sa/quran_128k" },
  { id: "madinah",  name: "إذاعة القرآن من المدينة المنورة",     country: "🇸🇦", color: "from-primary/80 to-primary",     url: "https://backup.quraan.com.sa/madinah_128k" },
  { id: "egypt",    name: "إذاعة القرآن الكريم المصرية",        country: "🇪🇬", color: "from-amber-600 to-orange-700",  url: "https://rasonline.egra.gov.eg:8000/quran_aac" },
  { id: "afasy",    name: "إذاعة الشيخ مشاري العفاسي",         country: "🇰🇼", color: "from-blue-600 to-indigo-700",   url: "https://backup.quraan.com.sa/afasy" },
  { id: "sudais",   name: "إذاعة الشيخ عبدالرحمن السديس",      country: "🇸🇦", color: "from-violet-600 to-purple-700", url: "https://backup.quraan.com.sa/sudais" },
  { id: "husary",   name: "إذاعة الشيخ محمود خليل الحصري",     country: "🇪🇬", color: "from-rose-600 to-pink-700",     url: "https://backup.quraan.com.sa/husary" },
  { id: "ghamdi",   name: "إذاعة الشيخ سعد الغامدي",           country: "🇸🇦", color: "from-cyan-600 to-sky-700",      url: "https://backup.quraan.com.sa/ghamdi" },
  { id: "quranradio", name: "Quran Radio — English",            country: "🌐", color: "from-slate-600 to-gray-700",    url: "https://backup.quraan.com.sa/english" },
];

function RadioPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getAudio() {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  }

  useEffect(() => {
    const audio = getAudio();
    const onPlay = () => { setPlaying(audio.dataset.stationId ?? null); setLoading(null); };
    const onPause = () => setPlaying(null);
    const onWaiting = () => setLoading(audio.dataset.stationId ?? null);
    const onCanPlay = () => setLoading(null);
    const onError = () => { setError("تعذّر تحميل البث. جرّب إذاعة أخرى."); setLoading(null); setPlaying(null); };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  function playStation(station: typeof STATIONS[0]) {
    const audio = getAudio();
    setError(null);
    if (playing === station.id) { audio.pause(); setPlaying(null); return; }
    audio.pause();
    audio.src = station.url;
    audio.dataset.stationId = station.id;
    audio.volume = muted ? 0 : volume;
    setLoading(station.id);
    audio.play().catch(() => setError("تعذّر تشغيل البث المباشر."));
  }

  function toggleMute() {
    const audio = getAudio();
    audio.muted = !muted;
    setMuted(m => !m);
  }

  function changeVolume(v: number) {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const currentStation = STATIONS.find(s => s.id === playing);

  return (
    <div className="fade-up pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[2.5rem] gradient-hero text-primary-foreground pattern-islamic px-5 pt-8 pb-8 shadow-elevated mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-14 w-14 place-items-center rounded-3xl gradient-gold text-gold-foreground shadow-gold">
            <Radio className="h-7 w-7"/>
          </div>
          <div>
            <h1 className="font-quran text-2xl">إذاعة القرآن</h1>
            <p className="text-xs opacity-75 mt-0.5">بثٌّ مباشر • ٨ إذاعات</p>
          </div>
        </div>

        {/* Now playing */}
        {currentStation ? (
          <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 items-end h-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="wave-bar" style={{ height: `${40 + i * 12}%`, animationDelay: `${i * 0.1}s` }}/>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{currentStation.name}</p>
                <p className="text-[10px] opacity-70 mt-0.5">بثٌّ مباشر الآن</p>
              </div>
              <span className="text-lg">{currentStation.country}</span>
            </div>
            {/* Volume */}
            <div className="mt-3 flex items-center gap-3">
              <button onClick={toggleMute} className="text-white opacity-70 hover:opacity-100">
                {muted ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={e => changeVolume(Number(e.target.value))}
                className="flex-1 accent-white h-1"/>
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-70">اختر إذاعة للاستماع</p>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-4 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stations */}
      <div className="px-4 space-y-2">
        {STATIONS.map(station => {
          const isPlaying = playing === station.id;
          const isLoading = loading === station.id;
          return (
            <button key={station.id} onClick={() => playStation(station)}
              className={`w-full flex items-center gap-4 rounded-3xl p-4 border shadow-soft transition active:scale-[0.98] text-right ${isPlaying ? `bg-gradient-to-r ${station.color} text-white border-transparent shadow-elevated` : "bg-card border-border/60"}`}>
              <div className={`grid h-12 w-12 place-items-center rounded-2xl shrink-0 ${isPlaying ? "bg-white/20" : `bg-gradient-to-br ${station.color} text-white shadow-glow`}`}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> :
                 isPlaying ? <Pause className="h-5 w-5"/> :
                 <Play className="h-5 w-5 rtl:-mr-0.5"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${!isPlaying ? "" : ""}`}>{station.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm">{station.country}</span>
                  {isPlaying && <span className="text-[10px] opacity-80 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse inline-block"/> LIVE</span>}
                </div>
              </div>
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-5 shrink-0">
                  {[1,2,3].map(i => (
                    <div key={i} className="wave-bar w-1 bg-white" style={{ height: `${50 + i * 15}%`, animationDelay: `${i * 0.15}s` }}/>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
