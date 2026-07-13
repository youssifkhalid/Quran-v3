import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";

export const Route = createFileRoute("/rakaat")({
  head: () => ({
    meta: [
      { title: "عداد الركعات — سكينة" },
      { name: "description", content: "عداد بسيط لحساب ركعات الصلاة." },
    ],
  }),
  component: RakaatPage,
});

const PRAYER_RAKAAT: { name: string; count: number; label: string }[] = [
  { name: "الفجر", count: 2, label: "ركعتان" },
  { name: "الظهر", count: 4, label: "٤ ركعات" },
  { name: "العصر", count: 4, label: "٤ ركعات" },
  { name: "المغرب", count: 3, label: "٣ ركعات" },
  { name: "العشاء", count: 4, label: "٤ ركعات" },
  { name: "الوتر", count: 1, label: "ركعة" },
  { name: "التراويح", count: 8, label: "٨ أو ٢٠" },
  { name: "مخصصة", count: 0, label: "حدد" },
];

function RakaatPage() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(4);
  const [selectedPrayer, setSelectedPrayer] = useState(1); // Dhuhr default
  const [done, setDone] = useState(false);

  function tap() {
    if (done) return;
    const next = count + 1;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
    if (next >= target) {
      setDone(true);
      navigator.vibrate?.([40, 60, 80]);
    }
    setCount(next);
  }

  function reset() {
    setCount(0);
    setDone(false);
  }

  function selectPrayer(idx: number) {
    setSelectedPrayer(idx);
    const p = PRAYER_RAKAAT[idx];
    if (p.count > 0) setTarget(p.count);
    reset();
  }

  return (
    <div className="fade-up min-h-[calc(100dvh-7rem)] flex flex-col">
      <header className="px-5 pt-6">
        <h1 className="font-quran text-3xl">عداد الركعات</h1>
        <p className="text-sm text-muted-foreground mt-1">لا تضيع في العد أثناء الصلاة</p>
      </header>

      {/* Prayer selector */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {PRAYER_RAKAAT.map((p, i) => (
          <button
            key={i}
            onClick={() => selectPrayer(i)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition whitespace-nowrap ${selectedPrayer === i ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Target if custom */}
      {PRAYER_RAKAAT[selectedPrayer]?.count === 0 && (
        <div className="px-4 mt-3 flex items-center gap-3">
          <span className="text-sm text-muted-foreground shrink-0">عدد الركعات:</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
              <button key={n} onClick={() => { setTarget(n); reset(); }}
                className={`h-9 w-9 rounded-xl text-sm font-bold transition ${target === n ? "gradient-gold text-gold-foreground" : "bg-card border border-border"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Big counter */}
      <div className="flex-1 grid place-items-center">
        <button
          onClick={tap}
          disabled={done}
          className={`relative grid place-items-center rounded-full shadow-glow transition-transform active:scale-95 disabled:cursor-default ${done ? "gradient-gold text-gold-foreground" : "gradient-primary text-primary-foreground"}`}
          style={{ width: "220px", height: "220px" }}
          aria-label="ركعة"
        >
          {done ? (
            <div className="flex flex-col items-center gap-2">
              <Check className="h-12 w-12" />
              <span className="font-quran text-xl">اكتملت</span>
            </div>
          ) : (
            <>
              <span className="font-quran text-7xl">{toArabic(count)}</span>
              <span className="text-sm opacity-75 -mt-2">من {toArabic(target)}</span>
            </>
          )}
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {Array.from({ length: target }).map((_, i) => (
          <div key={i} className={`h-3 w-3 rounded-full transition ${i < count ? "gradient-gold" : "bg-muted"}`} />
        ))}
      </div>

      <div className="px-5 pb-6 flex justify-center">
        <button onClick={reset} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4" /> إعادة العد
        </button>
      </div>
    </div>
  );
}

function toArabic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
