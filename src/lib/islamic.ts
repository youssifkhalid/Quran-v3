// Aladhan prayer times API
export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  day: string;
  month: { ar: string; en: string; number: number };
  year: string;
  weekday: { ar: string; en: string };
}

export async function fetchPrayerTimes(
  lat: number,
  lng: number,
): Promise<{ timings: PrayerTimes; hijri: HijriDate; gregorian: string }> {
  const r = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`,
  );
  const j = await r.json();
  return {
    timings: j.data.timings,
    hijri: j.data.date.hijri,
    gregorian: j.data.date.readable,
  };
}

export async function fetchHijriToday(): Promise<HijriDate & { gregorian: string }> {
  const r = await fetch(`https://api.aladhan.com/v1/gToH`);
  const j = await r.json();
  return { ...j.data.hijri, gregorian: j.data.gregorian.date };
}

export const PRAYER_NAMES_AR: Record<keyof PrayerTimes, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export function getNextPrayer(timings: PrayerTimes): { name: keyof PrayerTimes; at: Date; in: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const order: (keyof PrayerTimes)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const name of order) {
    const t = timings[name].slice(0, 5);
    const at = new Date(`${today}T${t}:00`);
    if (at > now) return { name, at, in: formatDelta(at.getTime() - now.getTime()) };
  }
  // tomorrow Fajr
  const t = timings.Fajr.slice(0, 5);
  const at = new Date(now.getTime() + 86400000);
  const tomorrow = at.toISOString().slice(0, 10);
  const next = new Date(`${tomorrow}T${t}:00`);
  return { name: "Fajr", at: next, in: formatDelta(next.getTime() - now.getTime()) };
}

function formatDelta(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h} س ${m} د`;
  return `${m} دقيقة`;
}

// Haversine bearing from user to Kaaba (Mecca: 21.4225, 39.8262)
const KAABA = { lat: 21.4225, lng: 39.8262 };
export function qiblaBearing(lat: number, lng: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lng - lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}
