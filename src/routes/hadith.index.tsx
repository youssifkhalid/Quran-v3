import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, BookOpen, Heart, Share2, Copy, X, Filter, Star } from "lucide-react";
import { NAWAWI_40, HADITH_BOOKS, FAVORITE_HADITHS_KEY } from "@/data/hadith";
import { toast } from "sonner";

export const Route = createFileRoute("/hadith/")({
  head: () => ({
    meta: [
      { title: "مكتبة الحديث الشريف — سكينة" },
      { name: "description", content: "الأربعون النووية وأمهات كتب الحديث: البخاري، مسلم، أبو داود، الترمذي، النسائي، ابن ماجه." },
    ],
  }),
  component: HadithIndex,
});

function HadithIndex() {
  const [tab, setTab] = useState<"nawawi" | "books">("nawawi");
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAVORITE_HADITHS_KEY) ?? "[]")); } catch { return new Set(); }
  });
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "favs">("all");

  const filtered = useMemo(() => {
    let list = NAWAWI_40;
    if (filter === "favs") list = list.filter((h) => favs.has(h.id));
    if (!q.trim()) return list;
    const lower = q.toLowerCase();
    return list.filter((h) =>
      h.arabic.includes(q) ||
      (h.narrator ?? "").includes(q) ||
      (h.chapter ?? "").includes(q) ||
      (h.keywords ?? []).some((k) => k.includes(q))
    );
  }, [q, filter, favs]);

  function toggleFav(id: number) {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(FAVORITE_HADITHS_KEY, JSON.stringify([...next])); } catch {}
      toast.success(next.has(id) ? "أضيف للمحفوظات ❤️" : "أزيل من المحفوظات");
      return next;
    });
  }

  function share(h: any) {
    const text = `${h.arabic}\n\nرواه ${h.narrator}\n${h.book}، رقم ${h.number ?? ""}\n\nسكينة — تطبيقك الإسلامي`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else { navigator.clipboard?.writeText(text).catch(() => {}); toast.success("تم النسخ"); }
  }

  function copyHadith(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast.success("نُسخ الحديث");
  }

  const GRADE_COLOR: Record<string, string> = {
    "متفق عليه": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    "صحيح":       "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    "حسن":        "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "ضعيف":       "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  };

  return (
    <div className="fade-up pb-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-b-[2.5rem] gradient-hero text-primary-foreground pattern-islamic px-5 pt-8 pb-8 shadow-elevated mb-4">
        <div className="relative">
          <h1 className="font-quran heading-page">مكتبة الحديث الشريف</h1>
          <p className="text-sm opacity-80 mt-1">الأربعون النووية وأمهات كتب الحديث</p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur px-4 py-3">
            <Search className="h-4 w-4 opacity-70 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في الأحاديث، الرواة، الكلمات الدلالية…"
              className="flex-1 bg-transparent text-sm placeholder:text-white/50 outline-none"
            />
            {q && <button onClick={() => setQ("")}><X className="h-4 w-4 opacity-70" /></button>}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex mx-4 gap-2 mb-4">
        {[
          { key: "nawawi", label: "الأربعون النووية" },
          { key: "books", label: "أمهات الكتب" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition ${tab === key ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Books grid */}
      {tab === "books" && (
        <div className="px-4 page-grid-2">
          {HADITH_BOOKS.map((book) => (
            <div key={book.id}
              className="rounded-3xl overflow-hidden shadow-soft border border-border/60 active:scale-[0.98] transition cursor-default">
              <div className="h-2" style={{ background: book.color }} />
              <div className="bg-card p-4">
                <p className="font-quran text-lg">{book.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{book.description}</p>
                <p className="text-xs text-primary mt-2 font-semibold">{book.count.toLocaleString("ar")} حديث</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nawawi 40 */}
      {tab === "nawawi" && (
        <>
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-sm font-semibold text-muted-foreground">
              {filtered.length} حديث {filter === "favs" && "• محفوظة"}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setFilter(f => f === "favs" ? "all" : "favs")}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition ${filter === "favs" ? "gradient-gold text-gold-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                <Heart className="h-3 w-3" />
                المحفوظة
              </button>
            </div>
          </div>

          <ul className="px-4 space-y-3">
            {filtered.map((h) => {
              const isFav = favs.has(h.id);
              const isExp = expanded.has(h.id);
              return (
                <li key={h.id}>
                  <div className={`rounded-3xl border shadow-soft transition ${isFav ? "border-gold/40 bg-card" : "border-border/60 bg-card"}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground text-sm font-bold shadow-glow">
                          {h.number}
                        </span>
                        <div>
                          {h.chapter && <p className="text-[11px] font-semibold text-primary">{h.chapter}</p>}
                          {h.narrator && <p className="text-[10px] text-muted-foreground">رواه {h.narrator}</p>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${GRADE_COLOR[h.grade] ?? ""}`}>
                        {h.grade}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="px-4 pb-3">
                      <p className="font-quran text-xl leading-loose">{h.arabic}</p>

                      {/* Keywords */}
                      {h.keywords && isExp && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {h.keywords.map((kw) => (
                            <span key={kw} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{kw}</span>
                          ))}
                        </div>
                      )}

                      {h.explanation && isExp && (
                        <div className="mt-3 rounded-2xl bg-gold/10 border border-gold/20 p-3">
                          <p className="text-xs leading-relaxed">{h.explanation}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-3 pt-2 border-t border-border/40">
                        <button onClick={() => toggleFav(h.id)}
                          className={`flex items-center gap-1.5 text-xs transition ${isFav ? "text-rose-500" : "text-muted-foreground"}`}>
                          <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} /> حفظ
                        </button>
                        <button onClick={() => copyHadith(h.arabic)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Copy className="h-3.5 w-3.5" /> نسخ
                        </button>
                        <button onClick={() => share(h)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Share2 className="h-3.5 w-3.5" /> مشاركة
                        </button>
                        {(h.explanation || h.keywords) && (
                          <button
                            onClick={() => setExpanded(prev => { const n = new Set(prev); n.has(h.id) ? n.delete(h.id) : n.add(h.id); return n; })}
                            className="mr-auto text-xs text-primary font-semibold">
                            {isExp ? "أقل" : "تفسير"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
