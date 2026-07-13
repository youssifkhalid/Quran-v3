import { createServerFn } from "@tanstack/react-start";
import type { Reciter } from "./quran";

export const fetchReciters = createServerFn({ method: "GET" }).handler(async (): Promise<Reciter[]> => {
  const toSurahList = (value: unknown) =>
    String(value ?? "")
      .split(",")
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);

  const [mp3Response, editionsResponse, quranicResponse] = await Promise.allSettled([
    fetch("https://www.mp3quran.net/api/v3/reciters?language=ar"),
    fetch("https://api.alquran.cloud/v1/edition?format=audio&language=ar"),
    fetch("https://quranicaudio.com/api/qaris"),
  ]);

  const reciters: Reciter[] = [];

  if (mp3Response.status === "fulfilled" && mp3Response.value.ok) {
    const payload = await mp3Response.value.json();
    for (const reader of payload.reciters ?? []) {
      for (const moshaf of reader.moshaf ?? []) {
        const surahList = toSurahList(moshaf.surah_list);
        reciters.push({
          id: `mp3-${reader.id}-${moshaf.id}`,
          source: "mp3quran",
          name: String(reader.name ?? "قارئ"),
          letter: String(reader.letter ?? ""),
          style: String(moshaf.name ?? "تلاوة"),
          reciterId: Number(reader.id),
          moshafId: Number(moshaf.id),
          server: String(moshaf.server ?? ""),
          totalSurahs: Number(moshaf.surah_total) || surahList.length,
          surahList,
        });
      }
    }
  }

  if (editionsResponse.status === "fulfilled" && editionsResponse.value.ok) {
    const payload = await editionsResponse.value.json();
    for (const edition of payload.data ?? []) {
      reciters.push({
        id: `alquran-${edition.identifier}`,
        source: "alquran",
        edition: String(edition.identifier),
        name: String(edition.name ?? edition.englishName ?? "قارئ"),
        style: edition.type === "versebyverse" ? "آية بآية" : "تلاوة",
        totalSurahs: 114,
      });
    }
  }

  if (quranicResponse.status === "fulfilled" && quranicResponse.value.ok) {
    const payload = await quranicResponse.value.json();
    for (const qari of payload ?? []) {
      const path = String(qari.relative_path ?? "");
      const mp3 = String(qari.file_formats ?? "").includes("mp3");
      if (!path || !mp3) continue;
      reciters.push({
        id: `qa-${qari.id}`,
        source: "quranicaudio",
        name: String(qari.arabic_name || qari.name || "قارئ"),
        style: "تلاوة كاملة",
        reciterId: Number(qari.id),
        server: `https://download.quranicaudio.com/quran/${path}`,
        totalSurahs: 114,
      });
    }
  }

  return reciters
    .filter((r) => r.name && (r.server || r.edition))
    .sort((a, b) => {
      const full = Number((b.totalSurahs ?? 0) >= 114) - Number((a.totalSurahs ?? 0) >= 114);
      if (full) return full;
      return (b.totalSurahs ?? 0) - (a.totalSurahs ?? 0) || a.name.localeCompare(b.name, "ar");
    });
});