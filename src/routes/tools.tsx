import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Map, ChevronRight } from "lucide-react";
import { fetchHijriToday } from "@/lib/islamic";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "أدوات إسلامية — سكينة" },
      { name: "description", content: "التقويم الهجري، دليل الحج والعمرة، الأسماء الحسنى." },
    ],
  }),
  component: ToolsPage,
});

const ISLAMIC_OCCASIONS = [
  { month: 1, day: 1, name: "رأس السنة الهجرية" },
  { month: 1, day: 10, name: "يوم عاشوراء" },
  { month: 3, day: 12, name: "المولد النبوي الشريف" },
  { month: 7, day: 27, name: "ليلة الإسراء والمعراج" },
  { month: 8, day: 15, name: "ليلة النصف من شعبان" },
  { month: 9, day: 1, name: "بداية شهر رمضان" },
  { month: 9, day: 27, name: "ليلة القدر المرجحة" },
  { month: 10, day: 1, name: "عيد الفطر المبارك" },
  { month: 12, day: 9, name: "يوم عرفة" },
  { month: 12, day: 10, name: "عيد الأضحى المبارك" },
];

const HAJJ_STEPS = [
  { step: 1, title: "الإحرام", desc: "النية والتلبية من الميقات — لبيك اللهم لبيك", dua: "لبيك اللهم لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك لا شريك لك" },
  { step: 2, title: "الطواف", desc: "سبعة أشواط حول الكعبة المشرفة ابتداءً من الحجر الأسود", dua: "بسم الله الله أكبر — رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ" },
  { step: 3, title: "السعي", desc: "سبعة أشواط بين الصفا والمروة", dua: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ" },
  { step: 4, title: "الوقوف بعرفة", desc: "ركن الحج الأعظم — الوقوف بعرفة حتى الغروب", dua: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير" },
  { step: 5, title: "المزدلفة", desc: "المبيت بمزدلفة وجمع الحصى", dua: "اللهم إن هذه مزدلفة اللهم اجعل لي فيها حجًا مقبولًا وذنبًا مغفورًا" },
  { step: 6, title: "رمي الجمرات", desc: "رمي جمرة العقبة الكبرى يوم النحر", dua: "الله أكبر (عند كل حصاة)" },
  { step: 7, title: "الهدي والحلق", desc: "ذبح الهدي ثم الحلق أو التقصير", dua: "اللهم هذا منك وإليك، فتقبل مني" },
  { step: 8, title: "طواف الإفاضة", desc: "طواف الزيارة بعد عودة من منى", dua: "اللهم اجعله حجًا مبرورًا وذنبًا مغفورًا" },
  { step: 9, title: "أيام التشريق", desc: "المبيت بمنى ورمي الجمرات الثلاث أيام 11، 12، 13", dua: "الله أكبر، اللهم اجعله موسم خير وبركة" },
  { step: 10, title: "طواف الوداع", desc: "آخر عمل — للمغادرين من خارج مكة", dua: "اللهم لا تجعله آخر عهدنا بهذا البيت" },
];

function ToolsPage() {
  const [tab, setTab] = useState<"hijri" | "hajj" | "occasions">("hijri");
  const hijri = useQuery({ queryKey: ["hijri"], queryFn: fetchHijriToday, staleTime: 1000 * 60 * 60 * 6 });
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const today = hijri.data;
  const nextOccasions = today ? ISLAMIC_OCCASIONS.filter((o) => {
    const occMonth = o.month;
    const occDay = o.day;
    const currMonth = today.month.number;
    const currDay = Number(today.day);
    return (occMonth > currMonth) || (occMonth === currMonth && occDay >= currDay);
  }).slice(0, 5) : [];

  return (
    <div className="fade-up">
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-quran text-3xl">أدوات إسلامية</h1>
        <p className="text-sm text-muted-foreground mt-1">التقويم الهجري ودليل الحج والعمرة</p>
      </header>

      {/* Hijri date card */}
      {today && (
        <div className="mx-4 mb-4 rounded-3xl gradient-hero text-primary-foreground p-6 shadow-elevated pattern-islamic">
          <p className="text-xs opacity-75">التاريخ الهجري اليوم</p>
          <p className="font-quran text-4xl mt-2 text-gradient-gold">{today.day} {today.month.ar} {today.year}</p>
          <p className="text-sm opacity-80 mt-1">{today.weekday.ar}</p>
          {today.gregorian && <p className="text-xs opacity-60 mt-2">{today.gregorian}</p>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mx-4 gap-2 mb-4">
        {([
          { key: "hijri", label: "المناسبات", Icon: CalendarDays },
          { key: "hajj", label: "الحج والعمرة", Icon: Map },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${tab === key ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Islamic occasions */}
      {tab === "hijri" && (
        <ul className="px-4 space-y-2 pb-4">
          {ISLAMIC_OCCASIONS.map((occ, i) => (
            <li key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-soft border border-border/60">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-gold-foreground shrink-0">
                <span className="font-quran text-sm">{toArabic(occ.day)}/{toArabic(occ.month)}</span>
              </div>
              <p className="font-quran text-lg">{occ.name}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Hajj steps */}
      {tab === "hajj" && (
        <ul className="px-4 space-y-2 pb-4">
          {HAJJ_STEPS.map((s) => (
            <li key={s.step}>
              <button
                onClick={() => setExpandedStep(expandedStep === s.step ? null : s.step)}
                className="w-full text-right rounded-2xl bg-card p-4 shadow-soft border border-border/60 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shrink-0 font-bold">
                    {toArabic(s.step)}
                  </span>
                  <div className="flex-1 text-right">
                    <p className="font-quran text-lg">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedStep === s.step ? "rotate-90" : ""}`} />
                </div>
                {expandedStep === s.step && (
                  <div className="mt-3 rounded-xl bg-gold/10 border border-gold/20 p-3 text-right">
                    <p className="text-[11px] text-muted-foreground mb-1">الدعاء:</p>
                    <p className="font-quran text-lg leading-loose">{s.dua}</p>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toArabic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => map[Number(d)] ?? d).join("");
}
