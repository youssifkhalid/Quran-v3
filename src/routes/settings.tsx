import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sun, Moon, Monitor, Type, Bell, Trash2, Info, Download,
  Upload, Shield, BookOpen, Globe, ChevronRight, CheckCircle2,
  Smartphone, Palette
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — سكينة" },
      { name: "description", content: "تخصيص تجربة سكينة: المظهر، الخط، القارئ الافتراضي والإشعارات." },
    ],
  }),
  component: SettingsPage,
});

type Theme = "light" | "dark" | "system";
type PrayerMethod = "2" | "3" | "4" | "5" | "7";

const PRAYER_METHODS = [
  { id: "2",  label: "رابطة العالم الإسلامي (MWL)" },
  { id: "3",  label: "جامعة الكويت / علوم الفلك" },
  { id: "4",  label: "هيئة مكة المكرمة والمدينة" },
  { id: "5",  label: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)" },
  { id: "7",  label: "الهيئة المصرية للمساحة" },
];

const QURAN_FONTS = [
  { id: "amiri-quran", label: "Amiri Quran (الافتراضي)" },
  { id: "scheherazade", label: "Scheherazade New" },
  { id: "arabic-typesetting", label: "Arabic Typesetting" },
];

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h2>
      </div>
      <div className="divide-y divide-border/30">{children}</div>
    </section>
  );
}

function SettingRow({ icon: Icon, label, sub, children }: {
  icon: any; label: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
      role="switch" aria-checked={enabled}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform
        ${enabled ? "translate-x-1 rtl:-translate-x-6" : "translate-x-6 rtl:-translate-x-1"}`} />
    </button>
  );
}

function SettingsPage() {
  const [theme, setTheme]                   = useState<Theme>("system");
  const [fontSize, setFontSize]             = useState(1.6);
  const [quranFont, setQuranFont]           = useState("amiri-quran");
  const [prayerMethod, setPrayerMethod]     = useState<PrayerMethod>("4");
  const [notifications, setNotifications]  = useState(false);
  const [adhan, setAdhan]                   = useState(false);
  const [haptics, setHaptics]               = useState(true);
  const [autoScrollAyah, setAutoScrollAyah] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [version]                           = useState("3.0.0");

  useEffect(() => {
    const t = localStorage.getItem("sakeenah:theme") as Theme | null;
    if (t) setTheme(t);
    const fs = localStorage.getItem("sakeenah:quran-font-size");
    if (fs) setFontSize(Number(fs));
    const qf = localStorage.getItem("sakeenah:quran-font");
    if (qf) setQuranFont(qf);
    const pm = localStorage.getItem("sakeenah:prayer-method") as PrayerMethod | null;
    if (pm) setPrayerMethod(pm);
    setNotifications(localStorage.getItem("sakeenah:prayer-notif") === "true");
    setHaptics(localStorage.getItem("sakeenah:haptics") !== "false");
    setAutoScrollAyah(localStorage.getItem("sakeenah:auto-scroll") !== "false");
    setShowTranslation(localStorage.getItem("sakeenah:show-translation") === "true");
  }, []);

  function applyTheme(t: Theme) {
    setTheme(t);
    localStorage.setItem("sakeenah:theme", t);
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else if (t === "light") root.classList.remove("dark");
    else window.matchMedia("(prefers-color-scheme: dark)").matches
      ? root.classList.add("dark")
      : root.classList.remove("dark");
    toast.success("تم تغيير المظهر");
  }

  function updateFontSize(v: number) {
    setFontSize(v);
    localStorage.setItem("sakeenah:quran-font-size", String(v));
  }

  async function toggleNotifications(v: boolean) {
    if (v) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast.error("لم يُسمح بالإشعارات"); return; }
    }
    setNotifications(v);
    localStorage.setItem("sakeenah:prayer-notif", String(v));
    toast.success(v ? "تم تفعيل إشعارات الصلاة ✓" : "تم إيقاف الإشعارات");
  }

  function updateHaptics(v: boolean) {
    setHaptics(v);
    localStorage.setItem("sakeenah:haptics", String(v));
    if (v && typeof navigator !== "undefined") navigator.vibrate?.(60);
  }

  function exportData() {
    const keys = ["sakeenah:bookmarks","sakeenah:prayer-tracker","sakeenah:khatmah",
      "sakeenah:wird","sakeenah:fasting","sakeenah:tasbeeh-history","sakeenah:hadith-favs"];
    const data: Record<string, any> = {};
    for (const k of keys) {
      try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch {}
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sakeenah-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast.success("تم تصدير البيانات 📦");
  }

  function clearKey(key: string, label: string) {
    if (!confirm(`حذف ${label}؟`)) return;
    localStorage.removeItem(key);
    toast.success(`تم حذف ${label}`);
  }

  return (
    <div className="fade-up pb-8">
      {/* Header */}
      <header className="px-5 pt-7 pb-5">
        <h1 className="font-quran text-3xl">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-1">تخصيص تجربتك في سكينة</p>
      </header>

      <div className="px-4 space-y-4">

        {/* ── APPEARANCE ── */}
        <SettingSection title="المظهر والعرض">
          <SettingRow icon={Palette} label="ثيم التطبيق" sub="فاتح، داكن، أو تلقائي">
            <div className="flex gap-1.5">
              {([["light","☀️"],[  "dark","🌙"],["system","⚙️"]] as [Theme,string][]).map(([t,em]) => (
                <button key={t} onClick={() => applyTheme(t)}
                  className={`h-8 w-8 rounded-xl text-sm transition ${theme===t ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted"}`}>
                  {em}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow icon={Type} label="حجم خط القرآن" sub={`الحجم الحالي: ${fontSize.toFixed(1)}x`}>
            <input type="range" min="1.0" max="2.6" step="0.1" value={fontSize}
              onChange={e => updateFontSize(Number(e.target.value))}
              className="w-28 accent-primary" />
          </SettingRow>
          <div className="px-4 py-3">
            <p className="font-quran text-center leading-loose transition-all"
              style={{ fontSize: `${fontSize}rem` }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        </SettingSection>

        {/* ── QURAN ── */}
        <SettingSection title="القرآن الكريم">
          <SettingRow icon={BookOpen} label="التمرير التلقائي" sub="تتبع الآية أثناء التلاوة">
            <Toggle enabled={autoScrollAyah} onChange={v => { setAutoScrollAyah(v); localStorage.setItem("sakeenah:auto-scroll", String(v)); }} />
          </SettingRow>
          <SettingRow icon={Globe} label="عرض الترجمة" sub="الترجمة الإنجليزية تحت الآيات">
            <Toggle enabled={showTranslation} onChange={v => { setShowTranslation(v); localStorage.setItem("sakeenah:show-translation", String(v)); }} />
          </SettingRow>
        </SettingSection>

        {/* ── PRAYER ── */}
        <SettingSection title="الصلاة والأذان">
          <SettingRow icon={Bell} label="إشعارات الصلاة" sub="تنبيه عند دخول الوقت">
            <Toggle enabled={notifications} onChange={toggleNotifications} />
          </SettingRow>
          <SettingRow icon={Bell} label="صوت الأذان">
            <Toggle enabled={adhan} onChange={v => { setAdhan(v); localStorage.setItem("sakeenah:adhan", String(v)); }} />
          </SettingRow>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2">طريقة الحساب</p>
            <select value={prayerMethod}
              onChange={e => { setPrayerMethod(e.target.value as PrayerMethod); localStorage.setItem("sakeenah:prayer-method", e.target.value); }}
              className="w-full rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm outline-none">
              {PRAYER_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </SettingSection>

        {/* ── EXPERIENCE ── */}
        <SettingSection title="تجربة الاستخدام">
          <SettingRow icon={Smartphone} label="الاهتزاز" sub="اهتزاز عند الضغط والتسبيح">
            <Toggle enabled={haptics} onChange={updateHaptics} />
          </SettingRow>
        </SettingSection>

        {/* ── DATA ── */}
        <SettingSection title="إدارة البيانات">
          <SettingRow icon={Download} label="تصدير بياناتك" sub="نسخ احتياطية JSON">
            <button onClick={exportData}
              className="rounded-xl gradient-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-glow">
              تصدير
            </button>
          </SettingRow>
          {[
            { key:"sakeenah:bookmarks",       label:"الإشارات المرجعية" },
            { key:"sakeenah:khatmah",         label:"بيانات الختمة"     },
            { key:"sakeenah:wird",            label:"بيانات الورد"      },
            { key:"sakeenah:prayer-tracker",  label:"سجل الصلوات"       },
            { key:"sakeenah:fasting",         label:"بيانات الصيام"     },
            { key:"sakeenah:tasbeeh-history", label:"سجل التسبيح"       },
          ].map(({ key, label }) => (
            <SettingRow key={key} icon={Trash2} label={label}>
              <button onClick={() => clearKey(key, label)}
                className="rounded-xl bg-destructive/10 text-destructive px-3 py-1.5 text-xs font-semibold">
                حذف
              </button>
            </SettingRow>
          ))}
        </SettingSection>

        {/* ── ABOUT ── */}
        <SettingSection title="عن التطبيق">
          <SettingRow icon={Info} label="سكينة" sub={`الإصدار ${version} — تطبيق إسلامي متكامل`}>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </SettingRow>
          <SettingRow icon={Shield} label="الخصوصية" sub="لا يُرسَل أي بيانات لخوادمنا">
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded-full">آمن ✓</span>
          </SettingRow>
        </SettingSection>

      </div>
    </div>
  );
}
