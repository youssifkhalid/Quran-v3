// AlQuran.cloud client — light wrappers
export interface Surah {
  number: number;
  name: string;             // Arabic
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;            // mushaf-wide
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  audio?: string;
  audioSecondary?: string[];
}

export interface Reciter {
  id: string;          // app-safe identifier
  name: string;        // Arabic name
  style?: string;      // مرتل / مجود / معلم / رواية
  source?: "alquran" | "mp3quran" | "quranicaudio";
  edition?: string;
  reciterId?: number;
  moshafId?: number;
  server?: string;
  totalSurahs?: number;
  surahList?: number[];
  letter?: string;
}

export const QURAN_AUDIO_RECITERS: Reciter[] = [
  { id: "ar.alafasy", edition: "ar.alafasy", source: "alquran", name: "مشاري العفاسي", style: "مرتل", totalSurahs: 114 },
  { id: "ar.abdulbasitmurattal", edition: "ar.abdulbasitmurattal", source: "alquran", name: "عبد الباسط عبد الصمد المرتل", style: "مرتل", totalSurahs: 114 },
  { id: "ar.abdurrahmaansudais", edition: "ar.abdurrahmaansudais", source: "alquran", name: "عبد الرحمن السديس", style: "مرتل", totalSurahs: 114 },
  { id: "ar.mahermuaiqly", edition: "ar.mahermuaiqly", source: "alquran", name: "ماهر المعيقلي", style: "مرتل", totalSurahs: 114 },
  { id: "ar.minshawi", edition: "ar.minshawi", source: "alquran", name: "محمد صديق المنشاوي", style: "مرتل", totalSurahs: 114 },
  { id: "ar.husary", edition: "ar.husary", source: "alquran", name: "محمود خليل الحصري", style: "مرتل", totalSurahs: 114 },
  { id: "ar.hudhaify", edition: "ar.hudhaify", source: "alquran", name: "علي الحذيفي", style: "مرتل", totalSurahs: 114 },
  { id: "ar.shaatree", edition: "ar.shaatree", source: "alquran", name: "أبو بكر الشاطري", style: "مرتل", totalSurahs: 114 },
  { id: "ar.abdullahbasfar", edition: "ar.abdullahbasfar", source: "alquran", name: "عبد الله بصفر", style: "مرتل", totalSurahs: 114 },
  { id: "ar.abdulsamad", edition: "ar.abdulsamad", source: "alquran", name: "عبد الباسط عبد الصمد", style: "مرتل", totalSurahs: 114 },
  { id: "ar.ahmedajamy", edition: "ar.ahmedajamy", source: "alquran", name: "أحمد بن علي العجمي", style: "مرتل", totalSurahs: 114 },
  { id: "ar.hanirifai", edition: "ar.hanirifai", source: "alquran", name: "هاني الرفاعي", style: "مرتل", totalSurahs: 114 },
  { id: "ar.husarymujawwad", edition: "ar.husarymujawwad", source: "alquran", name: "محمود خليل الحصري", style: "مجود", totalSurahs: 114 },
  { id: "ar.ibrahimakhbar", edition: "ar.ibrahimakhbar", source: "alquran", name: "إبراهيم الأخضر", style: "مرتل", totalSurahs: 114 },
  { id: "ar.minshawimujawwad", edition: "ar.minshawimujawwad", source: "alquran", name: "محمد صديق المنشاوي", style: "مجود", totalSurahs: 114 },
  { id: "ar.muhammadayyoub", edition: "ar.muhammadayyoub", source: "alquran", name: "محمد أيوب", style: "مرتل", totalSurahs: 114 },
  { id: "ar.muhammadjibreel", edition: "ar.muhammadjibreel", source: "alquran", name: "محمد جبريل", style: "مرتل", totalSurahs: 114 },
  { id: "ar.saoodshuraym", edition: "ar.saoodshuraym", source: "alquran", name: "سعود الشريم", style: "مرتل", totalSurahs: 114 },
  { id: "ar.aymanswoaid", edition: "ar.aymanswoaid", source: "alquran", name: "أيمن سويد", style: "مرتل", totalSurahs: 114 },
];

export const RECITERS = QURAN_AUDIO_RECITERS;

const BASE = "https://api.alquran.cloud/v1";

export async function fetchSurahs(): Promise<Surah[]> {
  const r = await fetch(`${BASE}/surah`);
  const j = await r.json();
  return j.data;
}

export async function fetchSurah(num: number): Promise<{ surah: Surah; ayahs: Ayah[] }> {
  const r = await fetch(`${BASE}/surah/${num}/quran-uthmani`);
  const j = await r.json();
  const d = j.data;
  return {
    surah: {
      number: d.number,
      name: d.name,
      englishName: d.englishName,
      englishNameTranslation: d.englishNameTranslation,
      numberOfAyahs: d.numberOfAyahs,
      revelationType: d.revelationType,
    },
    ayahs: d.ayahs,
  };
}

export async function fetchSurahAudio(num: number, edition: string): Promise<Ayah[]> {
  const r = await fetch(`${BASE}/surah/${num}/${edition}`);
  const j = await r.json();
  return j.data.ayahs;
}

export async function fetchReciters(): Promise<Reciter[]> {
  try {
    const [mp3Response, editionsResponse] = await Promise.allSettled([
      fetch("https://www.mp3quran.net/api/v3/reciters?language=ar"),
      fetch(`${BASE}/edition?format=audio&language=ar`),
    ]);

    const mp3Reciters: Reciter[] = [];
    if (mp3Response.status === "fulfilled" && mp3Response.value.ok) {
      const payload = await mp3Response.value.json();
      for (const reader of payload.reciters ?? []) {
        for (const moshaf of reader.moshaf ?? []) {
          const surahList = String(moshaf.surah_list ?? "")
            .split(",")
            .map((n) => Number(n))
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);
          mp3Reciters.push({
            id: `mp3-${reader.id}-${moshaf.id}`,
            source: "mp3quran",
            name: reader.name,
            letter: reader.letter,
            style: moshaf.name,
            reciterId: Number(reader.id),
            moshafId: Number(moshaf.id),
            server: String(moshaf.server ?? ""),
            totalSurahs: Number(moshaf.surah_total) || surahList.length,
            surahList,
          });
        }
      }
    }

    const editionReciters: Reciter[] = [];
    if (editionsResponse.status === "fulfilled" && editionsResponse.value.ok) {
      const payload = await editionsResponse.value.json();
      for (const edition of payload.data ?? []) {
        editionReciters.push({
          id: `alquran-${edition.identifier}`,
          source: "alquran",
          edition: edition.identifier,
          name: edition.name,
          style: edition.type === "versebyverse" ? "آية بآية" : "تلاوة",
          totalSurahs: 114,
        });
      }
    }

    const all = [...mp3Reciters, ...editionReciters].filter((r) => r.name && (r.server || r.edition));
    if (!all.length) return QURAN_AUDIO_RECITERS;
    return all.sort((a, b) => {
      const full = Number((b.totalSurahs ?? 0) >= 114) - Number((a.totalSurahs ?? 0) >= 114);
      if (full) return full;
      return (b.totalSurahs ?? 0) - (a.totalSurahs ?? 0) || a.name.localeCompare(b.name, "ar");
    });
  } catch {
    return QURAN_AUDIO_RECITERS;
  }
}

export function reciterSupportsSurah(reciter: Reciter, surah: number) {
  if (!reciter.surahList?.length) return true;
  return reciter.surahList.includes(surah);
}

export function surahAudioUrlForReciter(reciter: Reciter, surah: number) {
  if (reciter.source === "mp3quran" && reciter.server) {
    const base = reciter.server.endsWith("/") ? reciter.server : `${reciter.server}/`;
    return `${base}${String(surah).padStart(3, "0")}.mp3`;
  }
  if (reciter.source === "quranicaudio" && reciter.server) {
    const base = reciter.server.endsWith("/") ? reciter.server : `${reciter.server}/`;
    return `${base}${String(surah).padStart(3, "0")}.mp3`;
  }
  const edition = reciter.edition ?? reciter.id.replace(/^alquran-/, "");
  return `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${surah}.mp3`;
}

export interface MushafPageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
}

export async function fetchMushafPage(page: number): Promise<{
  page: number;
  ayahs: MushafPageAyah[];
  surahsOnPage: { number: number; name: string; firstAyah: number }[];
}> {
  const r = await fetch(`${BASE}/page/${page}/quran-uthmani`);
  const j = await r.json();
  const ayahs = (j.data.ayahs || []).map((a: any): MushafPageAyah => ({
    number: a.number,
    text: a.text,
    numberInSurah: a.numberInSurah,
    surahNumber: a.surah.number,
    surahName: a.surah.name,
  }));
  const surahsOnPage: { number: number; name: string; firstAyah: number }[] = [];
  for (const a of ayahs) {
    if (!surahsOnPage.length || surahsOnPage[surahsOnPage.length - 1].number !== a.surahNumber) {
      surahsOnPage.push({ number: a.surahNumber, name: a.surahName, firstAyah: a.numberInSurah });
    }
  }
  return { page, ayahs, surahsOnPage };
}

// First mushaf page number for each surah (Madani mushaf, 604 pages)
export const SURAH_START_PAGE: Record<number, number> = {
  1:1,2:2,3:50,4:77,5:106,6:128,7:151,8:177,9:187,10:208,11:221,12:235,13:249,14:255,15:262,16:267,17:282,18:293,19:305,20:312,21:322,22:332,23:342,24:350,25:359,26:367,27:377,28:385,29:396,30:404,31:411,32:415,33:418,34:428,35:434,36:440,37:446,38:453,39:458,40:467,41:477,42:483,43:489,44:496,45:499,46:502,47:507,48:511,49:515,50:518,51:520,52:523,53:526,54:528,55:531,56:534,57:537,58:542,59:545,60:549,61:551,62:553,63:554,64:556,65:558,66:560,67:562,68:564,69:566,70:568,71:570,72:572,73:574,74:575,75:577,76:578,77:580,78:582,79:583,80:585,81:586,82:587,83:587,84:589,85:590,86:591,87:591,88:592,89:593,90:594,91:595,92:595,93:596,94:596,95:597,96:597,97:598,98:598,99:599,100:599,101:600,102:600,103:601,104:601,105:601,106:602,107:602,108:602,109:603,110:603,111:603,112:604,113:604,114:604,
};

export async function fetchDailyAyah(): Promise<{ ayah: string; surah: string; reference: string }> {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const day = Math.floor(diff / 86400000);
  const ayahNum = ((day * 53) % 6236) + 1;
  const r = await fetch(`${BASE}/ayah/${ayahNum}/quran-uthmani`);
  const j = await r.json();
  const d = j.data;
  return {
    ayah: d.text,
    surah: d.surah.name,
    reference: `${d.surah.name} — آية ${d.numberInSurah}`,
  };
}

// === Fuzzy Arabic search ===
export function normalizeArabic(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // diacritics + tatweel
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

export function fuzzyScore(query: string, target: string): number {
  const q = normalizeArabic(query);
  const t = normalizeArabic(target);
  if (!q) return 1;
  if (t.includes(q)) return 1 - (t.indexOf(q) / Math.max(t.length, 1)) * 0.1;
  const d = levenshtein(q, t);
  const max = Math.max(q.length, t.length);
  const sim = 1 - d / max;
  // partial match: best window
  if (t.length > q.length) {
    let best = sim;
    for (let i = 0; i <= t.length - q.length; i++) {
      const w = t.slice(i, i + q.length);
      const dd = levenshtein(q, w);
      const s = 1 - dd / q.length;
      if (s > best) best = s;
    }
    return best;
  }
  return sim;
}
