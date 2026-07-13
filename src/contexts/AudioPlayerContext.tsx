import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import type { Surah } from "@/lib/quran";
import type { Reciter } from "@/lib/quran";

export interface PlayerTrack {
  surah: Surah;
  reciter: Reciter;
  audioUrl: string;
}

interface AudioPlayerState {
  track: PlayerTrack | null;
  playing: boolean;
  loading: boolean;
  progress: number;  // seconds
  duration: number;  // seconds
  speed: number;     // 0.75 | 1 | 1.25 | 1.5 | 2
  repeat: "none" | "one" | "all";
  queue: PlayerTrack[];
  queueIndex: number;
  error: string | null;
}

interface AudioPlayerActions {
  play: (track: PlayerTrack, queue?: PlayerTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skipNext: () => void;
  skipPrev: () => void;
  setSpeed: (s: number) => void;
  setRepeat: (r: "none" | "one" | "all") => void;
  dismiss: () => void;
}

const AudioPlayerContext = createContext<(AudioPlayerState & AudioPlayerActions) | null>(null);

const PERSIST_KEY = "sakeenah:player";
const SAVE_INTERVAL = 5000;

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<AudioPlayerState>({
    track: null,
    playing: false,
    loading: false,
    progress: 0,
    duration: 0,
    speed: 1,
    repeat: "none",
    queue: [],
    queueIndex: 0,
    error: null,
  });

  // Restore last session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.track) {
          setState((s) => ({
            ...s,
            track: saved.track,
            progress: saved.progress ?? 0,
            speed: saved.speed ?? 1,
            repeat: saved.repeat ?? "none",
          }));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  const updateMediaSession = useCallback((track: PlayerTrack) => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.surah.name,
      artist: track.reciter.name,
      album: "سكينة — القرآن الكريم",
    });
  }, []);

  const playTrackAtIndex = useCallback((queue: PlayerTrack[], index: number) => {
    const track = queue[index];
    if (!track) return;
    const audio = getAudio();
    audio.src = track.audioUrl;
    audio.playbackRate = state.speed;
    audio.play().catch(() => setState((s) => ({ ...s, playing: false, loading: false, error: "تعذّر تشغيل الملف الصوتي" })));
    setState((s) => ({
      ...s,
      track,
      playing: true,
      loading: true,
      error: null,
      queue,
      queueIndex: index,
      progress: 0,
      duration: 0,
    }));
    updateMediaSession(track);
  }, [getAudio, state.speed, updateMediaSession]);

  useEffect(() => {
    const audio = getAudio();

    const onPlay = () => setState((s) => ({ ...s, playing: true, loading: false }));
    const onPause = () => setState((s) => ({ ...s, playing: false }));
    const onWaiting = () => setState((s) => ({ ...s, loading: true }));
    const onCanPlay = () => setState((s) => ({ ...s, loading: false }));
    const onDuration = () => setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onTimeUpdate = () => setState((s) => ({ ...s, progress: audio.currentTime }));
    const onError = () => setState((s) => ({ ...s, playing: false, loading: false, error: "تعذّر تحميل الملف الصوتي" }));
    const onEnded = () => {
      setState((s) => {
        if (s.repeat === "one") {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return { ...s, progress: 0 };
        }
        const nextIndex = s.queueIndex + 1;
        if (nextIndex < s.queue.length) {
          const next = s.queue[nextIndex];
          audio.src = next.audioUrl;
          audio.playbackRate = s.speed;
          audio.play().catch(() => {});
          if ("mediaSession" in navigator && next) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: next.surah.name,
              artist: next.reciter.name,
              album: "سكينة — القرآن الكريم",
            });
          }
          return { ...s, track: next, queueIndex: nextIndex, progress: 0, duration: 0, loading: true };
        }
        if (s.repeat === "all" && s.queue.length > 0) {
          const first = s.queue[0];
          audio.src = first.audioUrl;
          audio.play().catch(() => {});
          return { ...s, track: first, queueIndex: 0, progress: 0, duration: 0, loading: true };
        }
        return { ...s, playing: false, progress: 0 };
      });
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, [getAudio]);

  // MediaSession handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => { getAudio().play().catch(() => {}); });
    navigator.mediaSession.setActionHandler("pause", () => { getAudio().pause(); });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      setState((s) => {
        if (s.queueIndex > 0) {
          const idx = s.queueIndex - 1;
          const t = s.queue[idx];
          const a = getAudio();
          a.src = t.audioUrl;
          a.play().catch(() => {});
          return { ...s, track: t, queueIndex: idx, progress: 0, duration: 0 };
        }
        return s;
      });
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      setState((s) => {
        const idx = s.queueIndex + 1;
        if (idx < s.queue.length) {
          const t = s.queue[idx];
          const a = getAudio();
          a.src = t.audioUrl;
          a.play().catch(() => {});
          return { ...s, track: t, queueIndex: idx, progress: 0, duration: 0 };
        }
        return s;
      });
    });
    navigator.mediaSession.setActionHandler("seekto", (e) => {
      if (e.seekTime != null) {
        getAudio().currentTime = e.seekTime;
        setState((s) => ({ ...s, progress: e.seekTime! }));
      }
    });
  }, [getAudio]);

  // Persist state every 5s
  useEffect(() => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    saveTimerRef.current = setInterval(() => {
      setState((s) => {
        try {
          localStorage.setItem(PERSIST_KEY, JSON.stringify({
            track: s.track,
            progress: s.progress,
            speed: s.speed,
            repeat: s.repeat,
          }));
        } catch { /* quota */ }
        return s;
      });
    }, SAVE_INTERVAL);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, []);

  const actions: AudioPlayerActions = {
    play: useCallback((track, queue, startIndex) => {
      const q = queue ?? [track];
      const idx = startIndex ?? 0;
      playTrackAtIndex(q, idx);
    }, [playTrackAtIndex]),

    pause: useCallback(() => { getAudio().pause(); }, [getAudio]),

    resume: useCallback(() => { getAudio().play().catch(() => {}); }, [getAudio]),

    toggle: useCallback(() => {
      const audio = getAudio();
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    }, [getAudio]),

    seek: useCallback((seconds) => {
      const audio = getAudio();
      audio.currentTime = seconds;
      setState((s) => ({ ...s, progress: seconds }));
    }, [getAudio]),

    skipNext: useCallback(() => {
      setState((s) => {
        const idx = s.queueIndex + 1;
        if (idx < s.queue.length) {
          const t = s.queue[idx];
          const a = getAudio();
          a.src = t.audioUrl;
          a.playbackRate = s.speed;
          a.play().catch(() => {});
          return { ...s, track: t, queueIndex: idx, progress: 0, duration: 0, loading: true };
        }
        return s;
      });
    }, [getAudio]),

    skipPrev: useCallback(() => {
      setState((s) => {
        const audio = getAudio();
        if (s.progress > 3) {
          audio.currentTime = 0;
          return { ...s, progress: 0 };
        }
        const idx = s.queueIndex - 1;
        if (idx >= 0) {
          const t = s.queue[idx];
          audio.src = t.audioUrl;
          audio.playbackRate = s.speed;
          audio.play().catch(() => {});
          return { ...s, track: t, queueIndex: idx, progress: 0, duration: 0, loading: true };
        }
        return s;
      });
    }, [getAudio]),

    setSpeed: useCallback((speed) => {
      getAudio().playbackRate = speed;
      setState((s) => ({ ...s, speed }));
    }, [getAudio]),

    setRepeat: useCallback((repeat) => {
      setState((s) => ({ ...s, repeat }));
    }, []),

    dismiss: useCallback(() => {
      getAudio().pause();
      getAudio().src = "";
      setState((s) => ({ ...s, track: null, playing: false, progress: 0, duration: 0, queue: [], queueIndex: 0 }));
      try { localStorage.removeItem(PERSIST_KEY); } catch { /* */ }
    }, [getAudio]),
  };

  return (
    <AudioPlayerContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be inside AudioPlayerProvider");
  return ctx;
}
