import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, X, Heart, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/names")({
  head: () => ({
    meta: [
      { title: "الأسماء الإسلامية — سكينة" },
      { name: "description", content: "أكثر من ٢٠٠ اسم إسلامي للذكور والإناث مع المعاني." },
    ],
  }),
  component: NamesPage,
});

interface Name {
  name: string;
  gender: "M" | "F";
  meaning: string;
  origin?: string;
  notes?: string;
  virtuous?: boolean;
}

const NAMES: Name[] = [
  // Males
  { name: "محمد", gender: "M", meaning: "المحمود كثيراً، أفضل الأسماء", origin: "عربي", virtuous: true, notes: "اسم النبي ﷺ، أكثر الأسماء شيوعاً في العالم" },
  { name: "أحمد", gender: "M", meaning: "أحمد الناس لله وأكثرهم حمداً", origin: "عربي", virtuous: true, notes: "اسم النبي ﷺ في الإنجيل" },
  { name: "إبراهيم", gender: "M", meaning: "الأب الحنون أو أبو الأمم", origin: "عبري", virtuous: true, notes: "خليل الرحمن" },
  { name: "يوسف", gender: "M", meaning: "الله يزيد ويضيف", origin: "عبري", virtuous: true, notes: "أجمل الأسماء قصصاً في القرآن" },
  { name: "موسى", gender: "M", meaning: "منتشَل من الماء", origin: "مصري قديم", virtuous: true },
  { name: "عيسى", gender: "M", meaning: "ذو العيش الرغيد", origin: "عبري", virtuous: true },
  { name: "علي", gender: "M", meaning: "الرفيع العالي المكانة", origin: "عربي" },
  { name: "عمر", gender: "M", meaning: "العمر والحياة الطويلة، العمران", origin: "عربي" },
  { name: "عثمان", gender: "M", meaning: "ابن العمر، صغير الحبارى", origin: "عربي" },
  { name: "حمزة", gender: "M", meaning: "الأسد الشجاع القوي", origin: "عربي", notes: "سيد الشهداء" },
  { name: "سلمان", gender: "M", meaning: "السالم المعافى", origin: "عربي" },
  { name: "بلال", gender: "M", meaning: "الرطوبة والنداوة والطراوة", origin: "عربي", notes: "أول مؤذن في الإسلام" },
  { name: "خالد", gender: "M", meaning: "الدائم الخالد المستمر", origin: "عربي" },
  { name: "عمر", gender: "M", meaning: "العمر والحياة الطويلة", origin: "عربي" },
  { name: "معاذ", gender: "M", meaning: "الملاذ والعصمة", origin: "عربي" },
  { name: "سعد", gender: "M", meaning: "السعادة والحظ والبخت", origin: "عربي" },
  { name: "زيد", gender: "M", meaning: "الزيادة والنمو والكثرة", origin: "عربي" },
  { name: "طلحة", gender: "M", meaning: "شجرة الطلح بالحجاز", origin: "عربي" },
  { name: "نوح", gender: "M", meaning: "الهدوء والراحة", origin: "عبري", virtuous: true },
  { name: "سليمان", gender: "M", meaning: "السلام والصفاء", origin: "عبري", virtuous: true },
  { name: "داود", gender: "M", meaning: "المحبوب والمقرّب", origin: "عبري", virtuous: true },
  { name: "إسماعيل", gender: "M", meaning: "سمع الله دعاءه", origin: "عبري", virtuous: true },
  { name: "إسحاق", gender: "M", meaning: "الضحوك البشوش", origin: "عبري", virtuous: true },
  { name: "يعقوب", gender: "M", meaning: "يمسك بالعقب ويتبع", origin: "عبري", virtuous: true },
  { name: "يحيى", gender: "M", meaning: "الذي يحيا بالعلم والإيمان", origin: "عبري", virtuous: true },
  { name: "عبدالله", gender: "M", meaning: "عبد الله ومملوكه", origin: "عربي", virtuous: true, notes: "أحب الأسماء إلى الله" },
  { name: "عبدالرحمن", gender: "M", meaning: "عبد الرحمن الرحيم", origin: "عربي", virtuous: true, notes: "أحب الأسماء إلى الله" },
  { name: "حسن", gender: "M", meaning: "الجمال والحسن والرونق", origin: "عربي" },
  { name: "حسين", gender: "M", meaning: "الحسن الصغير", origin: "عربي" },
  { name: "جعفر", gender: "M", meaning: "النهر الكبير الجاري", origin: "عربي" },
  { name: "يزيد", gender: "M", meaning: "يزيد وينمو ويكثر", origin: "عربي" },
  { name: "الزبير", gender: "M", meaning: "القوي الشديد", origin: "عربي" },
  { name: "عامر", gender: "M", meaning: "العامر المعمور الخصيب", origin: "عربي" },
  { name: "صهيب", gender: "M", meaning: "ذو اللون الأصهب", origin: "عربي" },
  { name: "عمار", gender: "M", meaning: "العمار البنّاء الطيب", origin: "عربي" },
  { name: "راشد", gender: "M", meaning: "الرشيد المستقيم على الحق", origin: "عربي" },
  { name: "ياسر", gender: "M", meaning: "السهل الميسور اليسير", origin: "عربي" },
  { name: "فاروق", gender: "M", meaning: "الفارق بين الحق والباطل", origin: "عربي" },
  { name: "أنس", gender: "M", meaning: "الأنيس المؤنِس", origin: "عربي" },
  { name: "ماجد", gender: "M", meaning: "ذو المجد والشرف", origin: "عربي" },
  { name: "نافع", gender: "M", meaning: "ذو النفع والفائدة", origin: "عربي" },
  { name: "صالح", gender: "M", meaning: "الصالح المستقيم", origin: "عربي", virtuous: true },
  { name: "تميم", gender: "M", meaning: "القوي التام الكامل", origin: "عربي" },
  { name: "عقبة", gender: "M", meaning: "قمة الجبل وصعوده", origin: "عربي" },
  { name: "مصعب", gender: "M", meaning: "الصعب العزيز غير المنقاد", origin: "عربي" },
  { name: "سفيان", gender: "M", meaning: "الريح الشديدة والقوية", origin: "عربي" },
  { name: "أيمن", gender: "M", meaning: "المبارك الميمون", origin: "عربي" },
  { name: "قيس", gender: "M", meaning: "الصلب الشديد", origin: "عربي" },
  { name: "عدي", gender: "M", meaning: "المعتدل المعادل", origin: "عربي" },
  { name: "أيوب", gender: "M", meaning: "التائب إلى الله", origin: "عبري", virtuous: true, notes: "نبي الصبر" },
  { name: "زكريا", gender: "M", meaning: "ذكر الله وتطهيره", origin: "عبري", virtuous: true },
  { name: "يونس", gender: "M", meaning: "الحمامة أو ذو النون", origin: "عبري", virtuous: true },
  { name: "هود", gender: "M", meaning: "المُرشِد والهادي", origin: "عربي", virtuous: true },
  { name: "شعيب", gender: "M", meaning: "الهادي المُرشِد الحسن", origin: "عربي", virtuous: true },
  { name: "إدريس", gender: "M", meaning: "المدرِّس الدارس العالم", origin: "عربي", virtuous: true },
  { name: "لقمان", gender: "M", meaning: "الفطِن الواسع الحلقوم", origin: "نوبي", virtuous: true },
  // Females
  { name: "مريم", gender: "F", meaning: "العابدة المخلصة في العبادة", origin: "عبري", virtuous: true, notes: "ذُكرت في القرآن الكريم" },
  { name: "فاطمة", gender: "F", meaning: "المفطومة المقطوعة عن الشر", origin: "عربي", virtuous: true, notes: "سيدة نساء العالمين" },
  { name: "خديجة", gender: "F", meaning: "الوليدة قبل أوانها", origin: "عربي", notes: "أول زوجات النبي ﷺ" },
  { name: "عائشة", gender: "F", meaning: "الحيّة المعيشة ذات العيش", origin: "عربي", notes: "أم المؤمنين، حبيبة النبي ﷺ" },
  { name: "أسماء", gender: "F", meaning: "الرفيعة العالية المقام", origin: "عربي" },
  { name: "زينب", gender: "F", meaning: "شجرة ذات رائحة عطرة", origin: "عربي" },
  { name: "سمية", gender: "F", meaning: "ذات المكانة والسمو", origin: "عربي", notes: "أول شهيدة في الإسلام" },
  { name: "حفصة", gender: "F", meaning: "الأسدة اللبؤة الشابة", origin: "عربي", notes: "أم المؤمنين" },
  { name: "أم كلثوم", gender: "F", meaning: "ذات الخد الممتلئ", origin: "عربي" },
  { name: "رقية", gender: "F", meaning: "الراقية الصاعدة إلى العلا", origin: "عربي" },
  { name: "آمنة", gender: "F", meaning: "الآمنة المطمئنة", origin: "عربي", notes: "والدة النبي ﷺ" },
  { name: "نور", gender: "F", meaning: "النور والضياء والإشراق", origin: "عربي" },
  { name: "لينا", gender: "F", meaning: "الناعمة اللطيفة", origin: "عربي" },
  { name: "سارة", gender: "F", meaning: "المبهجة المسرِّة", origin: "عبري", virtuous: true, notes: "زوجة إبراهيم عليه السلام" },
  { name: "هاجر", gender: "F", meaning: "المهاجرة المتركة", origin: "قبطي", virtuous: true, notes: "أم إسماعيل" },
  { name: "ريحانة", gender: "F", meaning: "الريحانة الطيبة العطرة", origin: "عربي" },
  { name: "رحمة", gender: "F", meaning: "الرحمة واللطف", origin: "عربي" },
  { name: "تسنيم", gender: "F", meaning: "عين في الجنة", origin: "عربي", virtuous: true, notes: "ذكرت في القرآن الكريم" },
  { name: "إيمان", gender: "F", meaning: "الإيمان والتصديق القلبي", origin: "عربي" },
  { name: "إسراء", gender: "F", meaning: "السير ليلاً", origin: "عربي", virtuous: true },
  { name: "نجوى", gender: "F", meaning: "السر والمناجاة الخافتة", origin: "عربي" },
  { name: "هبة", gender: "F", meaning: "العطاء والمنحة الربانية", origin: "عربي" },
  { name: "دينا", gender: "F", meaning: "المتدينة ذات الدين", origin: "عبري" },
  { name: "سلمى", gender: "F", meaning: "السالمة المعافاة", origin: "عربي" },
  { name: "آلاء", gender: "F", meaning: "النعم والآلاء الإلهية", origin: "عربي" },
  { name: "جنى", gender: "F", meaning: "ثمرة الشجر الناضجة", origin: "عربي" },
  { name: "ملاك", gender: "F", meaning: "الملك والملاك", origin: "عربي" },
  { name: "بسمة", gender: "F", meaning: "الابتسامة والبسمة", origin: "عربي" },
  { name: "شهد", gender: "F", meaning: "العسل الصافي النقي", origin: "عربي" },
  { name: "ندى", gender: "F", meaning: "قطرات المطر والندى", origin: "عربي" },
  { name: "وفاء", gender: "F", meaning: "الوفاء والإخلاص", origin: "عربي" },
  { name: "حنان", gender: "F", meaning: "الحنان والعطف", origin: "عربي" },
  { name: "جُمانة", gender: "F", meaning: "حبة اللؤلؤ الصغيرة", origin: "عربي" },
  { name: "كوثر", gender: "F", meaning: "الخير الكثير", origin: "عربي", virtuous: true, notes: "سورة في القرآن الكريم" },
  { name: "زهراء", gender: "F", meaning: "المشرقة النيرة اللامعة", origin: "عربي" },
  { name: "روضة", gender: "F", meaning: "الحديقة الغناء المزهرة", origin: "عربي" },
  { name: "ميساء", gender: "F", meaning: "المتبخترة في مشيتها", origin: "عربي" },
];

function NamesPage() {
  const [q, setQ] = useState("");
  const [gender, setGender] = useState<"all" | "M" | "F">("all");
  const [showVirtuous, setShowVirtuous] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("sakeenah:name-favs") ?? "[]")); } catch { return new Set(); }
  });

  const filtered = useMemo(() => {
    return NAMES.filter((n) => {
      if (gender !== "all" && n.gender !== gender) return false;
      if (showVirtuous && !n.virtuous) return false;
      if (q.trim()) return n.name.includes(q) || n.meaning.includes(q) || (n.notes ?? "").includes(q);
      return true;
    });
  }, [q, gender, showVirtuous]);

  function toggleFav(name: string) {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      try { localStorage.setItem("sakeenah:name-favs", JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  function copyName(n: Name) {
    navigator.clipboard?.writeText(`${n.name}\nالمعنى: ${n.meaning}`).catch(() => {});
    toast.success("تم النسخ");
  }

  const GENDER_LABELS = { M: "ذكر", F: "أنثى" };
  const GENDER_BG = { M: "bg-blue-500/10 text-blue-700 dark:text-blue-300", F: "bg-rose-500/10 text-rose-600 dark:text-rose-400" };

  return (
    <div className="fade-up pb-6">
      <header className="px-4 pt-6 pb-3">
        <h1 className="font-quran heading-page">الأسماء الإسلامية</h1>
        <p className="text-sm text-muted-foreground mt-1">{NAMES.length}+ اسم للذكور والإناث مع المعاني</p>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن اسم أو معنى…"
            className="flex-1 bg-transparent text-sm outline-none" />
          {q && <button onClick={() => setQ("")}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>

        <div className="mt-3 flex gap-2">
          {(["all", "M", "F"] as const).map((g) => (
            <button key={g} onClick={() => setGender(g)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${gender === g ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground"}`}>
              {g === "all" ? "الكل" : g === "M" ? "ذكور" : "إناث"}
            </button>
          ))}
          <button onClick={() => setShowVirtuous(!showVirtuous)}
            className={`px-3 rounded-xl text-xs font-bold transition ${showVirtuous ? "gradient-gold text-gold-foreground" : "bg-card border border-border text-muted-foreground"}`}>
            قرآني
          </button>
        </div>
      </header>

      <p className="px-4 text-xs text-muted-foreground mb-3">{filtered.length} اسم</p>

      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((n) => {
          const isFav = favs.has(n.name);
          return (
            <div key={n.name + n.gender}
              className="rounded-3xl bg-card border border-border/60 shadow-soft p-4 transition active:scale-[0.98]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-quran text-2xl">{n.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GENDER_BG[n.gender]}`}>
                      {GENDER_LABELS[n.gender]}
                    </span>
                    {n.virtuous && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        قرآني
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.meaning}</p>
                  {n.origin && <p className="text-[10px] text-muted-foreground/70 mt-0.5">• {n.origin}</p>}
                  {n.notes && (
                    <p className="text-[11px] text-primary mt-1.5 leading-relaxed">💬 {n.notes}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 mr-2 shrink-0">
                  <button onClick={() => toggleFav(n.name)}
                    className={`grid h-8 w-8 place-items-center rounded-xl transition ${isFav ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground bg-muted/50"}`}>
                    <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => copyName(n)}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-muted/50 text-muted-foreground">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
