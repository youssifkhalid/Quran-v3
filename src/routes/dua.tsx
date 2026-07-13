import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Share2, Copy, Search, ChevronDown, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dua")({
  head: () => ({
    meta: [
      { title: "الأدعية القرآنية والنبوية — سكينة" },
      { name: "description", content: "أدعية من القرآن الكريم والسنة النبوية منظمة حسب المواضيع." },
    ],
  }),
  component: DuaPage,
});

interface Dua {
  id: number;
  arabic: string;
  translation?: string;
  source: string;
  sourceType: "quran" | "hadith";
  sourceRef?: string;
  virtue?: string;
  category: string;
}

const DUAS: Dua[] = [
  // القرآن
  { id: 1, arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", translation: "Our Lord, give us good in this world and good in the Hereafter", source: "البقرة: ٢٠١", sourceType: "quran", sourceRef: "٢:٢٠١", category: "عام", virtue: "أجمع دعاء في القرآن" },
  { id: 2, arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً ۚ إِنَّكَ أَنْتَ الْوَهَّابُ", source: "آل عمران: ٨", sourceType: "quran", sourceRef: "٣:٨", category: "الهداية" },
  { id: 3, arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي", source: "طه: ٢٥-٢٨", sourceType: "quran", sourceRef: "٢٠:٢٥", category: "اليسر والتوفيق" },
  { id: 4, arabic: "رَبِّ إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ", source: "الأنبياء: ٨٣", sourceType: "quran", sourceRef: "٢١:٨٣", category: "الشفاء", virtue: "دعاء النبي أيوب" },
  { id: 5, arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", source: "الأنبياء: ٨٧", sourceType: "quran", sourceRef: "٢١:٨٧", category: "الكرب", virtue: "دعاء ذي النون — ما دعا به مكروب إلا فرّج الله عنه" },
  { id: 6, arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ", source: "النمل: ١٩", sourceType: "quran", sourceRef: "٢٧:١٩", category: "الشكر والعمل الصالح" },
  { id: 7, arabic: "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ", source: "آل عمران: ١٦", sourceType: "quran", sourceRef: "٣:١٦", category: "الاستغفار" },
  { id: 8, arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ", source: "إبراهيم: ٤١", sourceType: "quran", sourceRef: "١٤:٤١", category: "الوالدين" },
  { id: 9, arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ", source: "إبراهيم: ٤٠", sourceType: "quran", sourceRef: "١٤:٤٠", category: "الصلاح والذرية" },
  { id: 10, arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", source: "الفرقان: ٧٤", sourceType: "quran", sourceRef: "٢٥:٧٤", category: "الأسرة" },
  { id: 11, arabic: "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَنْ يَحْضُرُونِ", source: "المؤمنون: ٩٧-٩٨", sourceType: "quran", sourceRef: "٢٣:٩٧", category: "الحماية" },
  { id: 12, arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", source: "آل عمران: ١٧٣", sourceType: "quran", sourceRef: "٣:١٧٣", category: "التوكل", virtue: "قالها إبراهيم في النار وقالها النبي ﷺ" },
  // السنة
  { id: 13, arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", source: "سنن أبي داود", sourceType: "hadith", virtue: "من أفضل ما يُسأل", category: "العافية" },
  { id: 14, arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ", source: "البخاري", sourceType: "hadith", category: "الكرب والهم" },
  { id: 15, arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", source: "أبو داود والنسائي", sourceType: "hadith", virtue: "أوصى به النبي ﷺ معاذًا", category: "العبادة" },
  { id: 16, arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", source: "البيهقي والحاكم", sourceType: "hadith", virtue: "من أسماء الله العظمى", category: "الكرب والهم" },
  { id: 17, arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ", source: "متفق عليه", sourceType: "hadith", virtue: "من أجمع أدعية الاستغفار", category: "الاستغفار" },
  { id: 18, arabic: "اللَّهُمَّ لَكَ أَسْلَمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَإِلَيْكَ أَنَبْتُ وَبِكَ خَاصَمْتُ", source: "متفق عليه", sourceType: "hadith", category: "التوكل" },
  { id: 19, arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي", source: "مسلم", sourceType: "hadith", virtue: "دعاء الاستفتاح", category: "الهداية" },
  { id: 20, arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ، وَأَعُوذُ بِكَ مِنَ النَّارِ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ", source: "ابن ماجه", sourceType: "hadith", category: "الجنة والنار" },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(DUAS.map((d) => d.category)))];

function DuaPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [type, setType] = useState<"all" | "quran" | "hadith">("all");
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("sakeenah:dua-favs") ?? "[]")); } catch { return new Set(); }
  });
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = DUAS.filter((d) => {
    if (cat !== "الكل" && d.category !== cat) return false;
    if (type !== "all" && d.sourceType !== type) return false;
    if (q.trim()) return d.arabic.includes(q) || d.category.includes(q) || (d.virtue ?? "").includes(q);
    return true;
  });

  function toggleFav(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("sakeenah:dua-favs", JSON.stringify([...next])); } catch {}
      if (!next.has(id)) toast.success("أزيل من المفضلة");
      else toast.success("أضيف للمفضلة ❤️");
      return next;
    });
  }

  function share(d: Dua) {
    const text = `${d.arabic}\n\n— ${d.source}\n\nسكينة، تطبيقك الإسلامي`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else { navigator.clipboard?.writeText(text).catch(() => {}); toast.success("تم النسخ"); }
  }

  function copy(d: Dua) {
    navigator.clipboard?.writeText(d.arabic).catch(() => {});
    toast.success("نُسخ الدعاء");
  }

  return (
    <div className="fade-up pb-6">
      <header className="px-4 pt-6 pb-3">
        <h1 className="font-quran text-3xl">الأدعية المأثورة</h1>
        <p className="text-sm text-muted-foreground mt-1">من القرآن الكريم والسنة النبوية</p>

        {/* Search */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأدعية…"
            className="flex-1 bg-transparent text-sm outline-none" />
        </div>

        {/* Type filter */}
        <div className="mt-3 flex gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "quran", label: "📖 قرآني" },
            { key: "hadith", label: "📚 نبوي" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setType(key as any)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${type === key ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Category chips */}
      <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar py-1 mb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${cat === c ? "gradient-gold text-gold-foreground shadow-gold" : "bg-card border border-border text-muted-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Stats */}
      <p className="px-4 text-xs text-muted-foreground mb-3">
        {filtered.length} دعاء {favorites.size > 0 && `• ${favorites.size} في المفضلة`}
      </p>

      {/* Duas list */}
      <ul className="px-4 space-y-3">
        {filtered.map((d) => {
          const isFav = favorites.has(d.id);
          const isExp = expanded.has(d.id);
          return (
            <li key={d.id}>
              <div className={`rounded-3xl border transition shadow-soft ${
                isFav ? "bg-card border-gold/40" : "bg-card border-border/60"
              }`}>
                {/* Source badge */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.sourceType === "quran"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}>
                    {d.sourceType === "quran" ? "📖 قرآن" : "📚 حديث"} • {d.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{d.source}</span>
                </div>

                {/* Dua text */}
                <div className="px-4 pb-3">
                  <p className="font-quran text-xl leading-loose">{d.arabic}</p>

                  {/* Virtue */}
                  {d.virtue && (
                    <div className="mt-2 rounded-xl bg-gold/10 border border-gold/20 px-3 py-2">
                      <p className="text-xs text-foreground leading-relaxed">✨ {d.virtue}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-3 pt-2 border-t border-border/40">
                    <button onClick={() => toggleFav(d.id)}
                      className={`flex items-center gap-1.5 text-xs transition ${isFav ? "text-rose-500" : "text-muted-foreground hover:text-rose-400"}`}>
                      <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                      {isFav ? "محفوظ" : "حفظ"}
                    </button>
                    <button onClick={() => copy(d)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                      <Copy className="h-4 w-4" /> نسخ
                    </button>
                    <button onClick={() => share(d)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                      <Share2 className="h-4 w-4" /> مشاركة
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
