<div align="center">

# سكينة 🌙
### تطبيق إسلامي متكامل — Premium Islamic PWA

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TanStack](https://img.shields.io/badge/TanStack_Start-Latest-orange)](https://tanstack.com/start)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwindcss)](https://tailwindcss.com)

*القرآن الكريم • الصلاة • الأذكار • AI إسلامي • الختمة*

</div>

---

## ✨ المميزات الكاملة

### 📖 القرآن الكريم
- ١١٤ سورة برسم عثماني مع حجم خط قابل للتعديل
- **بحث في الآيات** — ابحث في ٦٢٣٦ آية بالكلمة أو الجملة مع تمييز النتائج
- مصحف شريف ٦٠٤ صفحة مع سحب وانتقال مباشر
- مشغّل صوت عالمي مستمر عبر كل الصفحات (MiniPlayer)
- ٥٠٠+ قارئ من مصادر متعددة (mp3quran، alquran.cloud، quranicaudio)
- إشارات مرجعية لآيات بعينها مع تتبع آخر قراءة
- مشاركة آية واحدة أو نسخها

### 🤲 الأذكار والأدعية
- **حصن المسلم الكامل**: أذكار الصباح والمساء، النوم، الاستيقاظ، الوضوء، السفر، الطعام، الكرب، الرقية الشرعية، أسماء الله الحسنى
- **مجموعة أدعية** قرآنية ونبوية منظمة حسب الموضوع مع المفضلة والمشاركة
- عداد تسبيح تفاعلي باهتزاز، جلسات وسجل تاريخي

### 🕌 الصلاة والقبلة
- مواقيت الصلاة الدقيقة بحسب الموقع الجغرافي
- عدّ تنازلي للصلاة القادمة
- متابعة الصلوات اليومية مع سجل أسبوعي
- اتجاه القبلة مع بوصلة حية والمسافة إلى مكة

### 🤖 المساعد الإسلامي AI (مميزة جديدة!)
- يجيب على أسئلة الفقه والحديث والتفسير والعقيدة
- **كل إجابة مستندة إلى مصادر شرعية موثوقة**: القرآن، البخاري، مسلم، أبو داود، الترمذي...
- يعرض أقوال العلماء: ابن تيمية، ابن القيم، النووي، ابن كثير
- يوضح الخلاف بين المذاهب الأربعة
- سجل محادثات محلي مع إمكانية المشاركة

### 🏆 الختمة والتتبع
- خطة ختمة بمستويات (شهر / شهران / ٣ أشهر / سنة)
- خريطة حرارية لـ ٦٠٤ صفحة بصرية
- إحصائيات يومية ووتيرة مطلوبة
- تقويم هجري ومناسبات إسلامية

---

## 🚀 بدء التشغيل

```bash
# ١. استنسخ المشروع
git clone https://github.com/your-username/sakeenah.git
cd sakeenah

# ٢. أنشئ ملف .env.local
cp .env.example .env.local
# أضف ANTHROPIC_API_KEY للمساعد AI

# ٣. ثبّت التبعيات
bun install

# ٤. شغّل في وضع التطوير
bun dev
```

## 🌐 النشر على Lovable

١. ارفع المشروع على GitHub
٢. اربط الريبو بـ [Lovable](https://lovable.dev)
٣. أضف `ANTHROPIC_API_KEY` في متغيرات البيئة
٤. انشر 🎉

## 🔑 متغيرات البيئة

| المتغير | الوصف | مطلوب |
|---------|--------|--------|
| `ANTHROPIC_API_KEY` | مفتاح API لميزة المساعد AI | لميزة AI فقط |

## 📁 هيكل المشروع

```
src/
├── routes/          # صفحات التطبيق (TanStack Router)
│   ├── index.tsx          # الرئيسية
│   ├── quran.index.tsx    # القرآن الكريم
│   ├── quran.search.tsx   # بحث في الآيات ✨
│   ├── quran.$id.tsx      # سورة بعينها
│   ├── mushaf.$page.tsx   # المصحف صفحة بصفحة
│   ├── reciters/          # الشيوخ والقراء
│   ├── prayer.tsx         # مواقيت الصلاة
│   ├── qibla.tsx          # اتجاه القبلة
│   ├── adhkar/            # الأذكار
│   ├── dua.tsx            # الأدعية ✨
│   ├── tasbeeh.tsx        # المسبحة
│   ├── ai-chat.tsx        # المساعد AI ✨
│   ├── khatmah.tsx        # ختمة القرآن
│   ├── bookmarks.tsx      # الإشارات المرجعية
│   ├── search.tsx         # بحث شامل
│   ├── tools.tsx          # أدوات إسلامية
│   ├── settings.tsx       # الإعدادات
│   └── rakaat.tsx         # عداد الركعات
├── lib/
│   ├── quran.ts           # API القرآن
│   ├── islamic.ts         # مواقيت الصلاة والقبلة
│   ├── ai-islamic.ts      # المساعد AI ✨
│   └── notifications.ts   # إشعارات الصلاة
├── contexts/
│   └── AudioPlayerContext.tsx  # مشغل الصوت العالمي
├── components/
│   ├── AppShell.tsx       # هيكل التطبيق مع التنقل
│   └── MiniPlayer.tsx     # مشغل مصغّر ثابت
└── data/
    └── adhkar.ts          # بيانات الأذكار الكاملة
```

## 🛠 التقنيات المستخدمة

| التقنية | الدور |
|---------|-------|
| **TanStack Start** | Full-Stack SSR Framework |
| **TanStack Router** | File-based routing |
| **TanStack Query** | Server state & caching |
| **React 19** | UI Library |
| **Tailwind CSS v4** | Styling |
| **Anthropic Claude** | AI Islamic Assistant |
| **alquran.cloud API** | Quran text & audio |
| **aladhan.com API** | Prayer times |
| **mp3quran.net** | Reciters database |

## 📜 الترخيص

MIT License — مشروع مفتوح المصدر لخدمة المسلمين

---

<div align="center">
  <p>صُنع بـ ❤️ وإخلاص لخدمة القرآن الكريم</p>
  <p><em>«اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ»</em></p>
</div>
