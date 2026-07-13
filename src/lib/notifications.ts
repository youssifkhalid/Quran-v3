// Prayer time notification scheduler
export async function schedulePrayerNotifications(timings: Record<string, string>) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;

  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  const NAMES: Record<string, string> = {
    Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء",
  };

  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();

  for (const name of order) {
    const time = timings[name]?.slice(0, 5);
    if (!time) continue;
    const at = new Date(`${today}T${time}:00`).getTime();
    const msUntil = at - now;
    if (msUntil < 0 || msUntil > 24 * 60 * 60 * 1000) continue;

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification(`حان وقت صلاة ${NAMES[name]}`, {
          body: `اللهم إني أسألك خير هذه الصلاة`,
          icon: "/icon-192.png",
          tag: `prayer-${name}`,
          dir: "rtl",
          lang: "ar",
        });
      }
    }, msUntil);
  }
}
