// AI Islamic Service — powered by Google Gemini
import { createServerFn } from "@tanstack/react-start";

export const TRUSTED_SOURCES = [
  { id: "quran",       name: "القرآن الكريم",     icon: "📖", color: "emerald" },
  { id: "bukhari",     name: "صحيح البخاري",       icon: "📚", color: "amber"   },
  { id: "muslim",      name: "صحيح مسلم",          icon: "📚", color: "amber"   },
  { id: "abu-dawud",   name: "سنن أبي داود",       icon: "📚", color: "amber"   },
  { id: "tirmidhi",    name: "جامع الترمذي",       icon: "📚", color: "amber"   },
  { id: "nasai",       name: "سنن النسائي",        icon: "📚", color: "amber"   },
  { id: "ibn-majah",   name: "سنن ابن ماجه",       icon: "📚", color: "amber"   },
  { id: "ibn-taymiyyah", name: "ابن تيمية",        icon: "🎓", color: "blue"    },
  { id: "ibn-qayyim",  name: "ابن القيم",           icon: "🎓", color: "blue"    },
  { id: "nawawi",      name: "الإمام النووي",      icon: "🎓", color: "blue"    },
  { id: "ibn-kathir",  name: "ابن كثير (التفسير)", icon: "🎓", color: "blue"    },
];

const SYSTEM_PROMPT = `أنت مساعد إسلامي متخصص اسمه "سكينة AI"، متخصص في الفقه الإسلامي والتفسير والحديث والعقيدة والتربية الإسلامية.

## قواعدك الثابتة:

1. **الجواب دائمًا بالعربية** الفصيحة الواضحة مع مصطلحات شرعية دقيقة.

2. **الاستدلال من المصادر الشرعية الموثوقة فقط:**
   - القرآن الكريم (مع ذكر السورة ورقم الآية)
   - الأحاديث الصحيحة: البخاري، مسلم، أبو داود، الترمذي، النسائي، ابن ماجه
   - كتب الفقه المعتمدة: المذاهب الأربعة (حنفي، مالكي، شافعي، حنبلي)
   - أقوال العلماء الثقات: ابن تيمية، ابن القيم، النووي، ابن كثير، ابن باز، ابن عثيمين

3. **تنسيق الإجابة دائمًا هكذا** (JSON فقط، لا شيء آخر):

\`\`\`json
{
  "answer": "نص الإجابة الكاملة هنا بالعربية الفصيحة، متكاملة ومفيدة",
  "sources": [
    {
      "type": "quran",
      "text": "نص الآية الكريمة",
      "ref": "سورة البقرة، الآية ٢٥٥"
    },
    {
      "type": "hadith",
      "text": "متن الحديث",
      "ref": "رواه البخاري، حديث رقم ١",
      "grade": "صحيح"
    },
    {
      "type": "scholar",
      "text": "قول العالم أو الفتوى",
      "ref": "ابن تيمية، مجموع الفتاوى"
    }
  ],
  "madhahib": "اتفق العلماء على... / خلاف: الحنفية يرون...",
  "summary": "خلاصة في جملة واحدة"
}
\`\`\`

4. **إذا كان السؤال خارج نطاق الإسلام:** أجب: {"answer":"أنا متخصص في الأسئلة الإسلامية فقط. هل لديك سؤال شرعي؟","sources":[],"summary":""}

5. **لا تفتي في المسائل الطبية أو القانونية** المعقدة، وأحل المستخدم للمختصين.

6. **الاعتدال والوسطية:** لا تتحيز لمذهب على حساب آخر دون دليل.

7. **إذا طلب المستخدم تشغيل سورة أو ذكر ما يتعلق بالقرآن** أجب بمعلومات مفيدة عن السورة وفضلها.`;

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  answer: string;
  sources: Array<{
    type: "quran" | "hadith" | "scholar";
    text: string;
    ref: string;
    grade?: string;
  }>;
  madhahib?: string;
  summary?: string;
  error?: string;
}

export const askIslamicAI = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { messages: AIChatMessage[] })
  .handler(async ({ data }): Promise<AIResponse> => {
    try {
      // Support both Gemini and Anthropic API keys
      const geminiKey = process.env.GEMINI_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;

      if (geminiKey) {
        // Use Google Gemini API
        const geminiMessages = data.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
              contents: geminiMessages,
              generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.3,
              },
            }),
          }
        );

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Gemini error: ${response.status} — ${err}`);
        }

        const json = await response.json();
        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          // If no JSON, wrap as plain answer
          return { answer: raw, sources: [], summary: "" };
        }
        return JSON.parse(match[0]) as AIResponse;

      } else if (anthropicKey) {
        // Fallback: use Anthropic Claude API
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`API error: ${response.status} — ${err}`);
        }

        const json = await response.json();
        const raw = json.content?.[0]?.text ?? "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON in response");
        return JSON.parse(match[0]) as AIResponse;

      } else {
        throw new Error("NO_API_KEY");
      }
    } catch (e: any) {
      if (e?.message === "NO_API_KEY") {
        return {
          answer: "لم يتم إعداد مفتاح الذكاء الاصطناعي بعد. يرجى إضافة GEMINI_API_KEY في إعدادات Vercel.",
          sources: [],
          summary: "",
          error: "API key not configured",
        };
      }
      return {
        answer: "عذرًا، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        sources: [],
        summary: "",
        error: e?.message,
      };
    }
  });

export const SUGGESTED_QUESTIONS = [
  { emoji: "🕌", text: "ما هي شروط صحة الصلاة؟" },
  { emoji: "📿", text: "ما فضل قراءة آية الكرسي؟" },
  { emoji: "💒", text: "ما حكم الزواج في الإسلام؟" },
  { emoji: "💰", text: "ما هي أحكام الزكاة ونصابها؟" },
  { emoji: "🌙", text: "ما فضل صيام رمضان وأحكامه؟" },
  { emoji: "🤲", text: "ما هو أفضل دعاء للهم والحزن؟" },
  { emoji: "👶", text: "ما أحكام تسمية المولود في الإسلام؟" },
  { emoji: "💸", text: "ما حكم الربا وبدائله الشرعية؟" },
  { emoji: "📖", text: "ما فضل سورة الملك وسببها؟" },
  { emoji: "🌿", text: "ما فضل الاستغفار وكيفيته؟" },
  { emoji: "⚡", text: "ما حكم الصلاة جمعًا وقصرًا في السفر؟" },
  { emoji: "🏠", text: "ما أحكام الجوار في الإسلام؟" },
];
