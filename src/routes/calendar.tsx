import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { fetchHijriToday } from "@/lib/islamic";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "التقويم الهجري — سكينة" },
      { name: "description", content: "التقويم الهجري الشامل مع المناسبات الإسلامية." },
    ],
  }),
  component: CalendarPage,
});

const HIJRI_MONTHS = [
  "محرّم","صفر","ربيع الأول","ربيع الثاني",
  "جمادى الأولى","جمادى الآخرة","رجب","شعبان",
  "رمضان","شوال","ذو القعدة","ذو الحجة"
];

const OCCASIONS = [
  { month:1, day:1, name:"رأس السنة الهجرية", color:"emerald", desc:"بداية العام الهجري الجديد" },
  { month:1, day:10, name:"يوم عاشوراء", color:"blue", desc:"يوم نجّى الله فيه موسى من فرعون، صيامه يكفّر سنة" },
  { month:3, day:12, name:"المولد النبوي الشريف", color:"gold", desc:"ذكرى مولد النبي محمد ﷺ" },
  { month:7, day:27, name:"ليلة الإسراء والمعراج", color:"purple", desc:"رحلة النبي ﷺ إلى السموات العلى" },
  { month:8, day:15, name:"ليلة النصف من شعبان", color:"indigo", desc:"يُستحب فيها الذكر والدعاء والاستغفار" },
  { month:9, day:1, name:"أول رمضان", color:"emerald", desc:"شهر الصيام والقيام وإنزال القرآن" },
  { month:9, day:21, name:"ليالي القدر تبدأ", color:"gold", desc:"ليلة القدر خير من ألف شهر" },
  { month:10, day:1, name:"عيد الفطر المبارك", color:"gold", desc:"عيد الفطر بعد صيام رمضان" },
  { month:12, day:8, name:"يوم التروية", color:"blue", desc:"بداية موسم الحج" },
  { month:12, day:9, name:"يوم عرفة", color:"gold", desc:"أعظم أيام العام، صيامه يكفّر سنتين" },
  { month:12, day:10, name:"عيد الأضحى المبارك", color:"gold", desc:"يوم النحر والحج الأكبر" },
  { month:12, day:11, name:"أول أيام التشريق", color:"blue", desc:"أيام أكل وشرب وذكر لله" },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  gold:    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  blue:    "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  purple:  "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  indigo:  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
};

function CalendarPage() {
  const hijriQ = useQuery({ queryKey: ["hijri"], queryFn: fetchHijriToday, staleTime: 1000 * 60 * 60 });
  const today = hijriQ.data;
  const [viewMonth, setViewMonth] = useState(today?.month?.number ?? 1);
  const [viewYear, setViewYear] = useState(today?.year ? Number(today.year) : 1446);

  const monthOccasions = OCCASIONS.filter((o) => o.month === viewMonth);
  const todayDay = today?.month?.number === viewMonth ? Number(today?.day) : null;
  const daysInMonth = viewMonth === 2 || viewMonth === 4 || viewMonth === 6 || viewMonth === 8 || viewMonth === 10 ? 29 : viewMonth === 12 ? 30 : 30;

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div className="fade-up pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[2.5rem] gradient-hero text-primary-foreground pattern-islamic px-5 pt-8 pb-8 shadow-elevated mb-4">
        <h1 className="font-quran heading-page">التقويم الهجري</h1>
        {today && (
          <p className="mt-2 font-quran text-4xl text-gradient-gold">
            {today.day} {today.month.ar} {today.year}هـ
          </p>
        )}
        <p className="text-sm opacity-80 mt-1">{today?.weekday?.ar ?? ""}</p>
      </div>

      {/* Month navigator */}
      <div className="mx-4 mb-4">
        <div className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 shadow-soft">
          <button onClick={nextMonth} className="grid h-9 w-9 place-items-center rounded-xl bg-card shadow-soft border border-border">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
          <div className="text-center">
            <p className="font-quran text-xl">{HIJRI_MONTHS[viewMonth - 1]}</p>
            <p className="text-xs text-muted-foreground">{viewYear}هـ</p>
          </div>
          <button onClick={prevMonth} className="grid h-9 w-9 place-items-center rounded-xl bg-card shadow-soft border border-border">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="mt-3 rounded-2xl bg-card border border-border p-3 shadow-soft">
          <div className="hijri-grid mb-2">
            {["ج","خ","ر","أ","ن","ث","ح"].map((d, i) => (
              <div key={i} className="hijri-cell text-[10px] font-bold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="hijri-grid">
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === todayDay;
              const hasOccasion = monthOccasions.some((o) => o.day === day);
              return (
                <div key={day}
                  className={`hijri-cell text-sm font-quran relative ${isToday ? "today font-bold" : ""} ${hasOccasion && !isToday ? "occasion" : ""}`}>
                  {day}
                  {hasOccasion && !isToday && (
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-gold" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm gradient-primary inline-block" /> اليوم</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400/40 inline-block" /> مناسبة</span>
          </div>
        </div>
      </div>

      {/* Month occasions */}
      {monthOccasions.length > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">مناسبات {HIJRI_MONTHS[viewMonth - 1]}</h2>
          <div className="space-y-2">
            {monthOccasions.map((o, i) => (
              <div key={i} className={`rounded-2xl border p-4 ${COLOR_MAP[o.color]}`}>
                <div className="flex items-start gap-3">
                  <span className="font-quran text-2xl font-bold shrink-0">{o.day}</span>
                  <div>
                    <p className="font-semibold text-sm">{o.name}</p>
                    <p className="text-xs mt-0.5 opacity-80">{o.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All occasions */}
      <div className="px-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-gold" />
          المناسبات الإسلامية السنوية
        </h2>
        <div className="space-y-2">
          {OCCASIONS.map((o, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-2xl border p-3 ${COLOR_MAP[o.color]}`}>
              <div className="text-center shrink-0 w-12">
                <p className="font-quran text-lg font-bold">{o.day}</p>
                <p className="text-[9px] opacity-75">{HIJRI_MONTHS[o.month - 1]}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{o.name}</p>
                <p className="text-[10px] opacity-75 mt-0.5 truncate">{o.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
