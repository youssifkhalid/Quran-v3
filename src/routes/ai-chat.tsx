import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Sparkles, RotateCcw, BookOpen, Loader2, Copy, Share2,
  ChevronDown, AlertCircle, Lightbulb, Star
} from "lucide-react";
import { askIslamicAI, SUGGESTED_QUESTIONS, type AIChatMessage, type AIResponse } from "@/lib/ai-islamic";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-chat")({
  head: () => ({
    meta: [
      { title: "المساعد الإسلامي AI — سكينة" },
      { name: "description", content: "اسأل عن الفقه والحديث والتفسير بردود مستندة لمصادر إسلامية موثوقة." },
    ],
  }),
  component: AIChatPage,
});

const HISTORY_KEY = "sakeenah:ai-history";

interface ConvMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AIResponse;
  timestamp: number;
}

type SourceType = "quran" | "hadith" | "scholar";

const SOURCE_COLORS: Record<SourceType, { bg: string; text: string; border: string; icon: string }> = {
  quran:   { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/30", icon: "📖" },
  hadith:  { bg: "bg-amber-500/10",   text: "text-amber-700 dark:text-amber-300",     border: "border-amber-500/30",   icon: "📚" },
  scholar: { bg: "bg-blue-500/10",    text: "text-blue-700 dark:text-blue-300",       border: "border-blue-500/30",    icon: "🎓" },
};

const SOURCE_LABELS: Record<SourceType, string> = {
  quran: "قرآن كريم",
  hadith: "حديث شريف",
  scholar: "قول عالم",
};

function AIChatPage() {
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveHistory = useCallback((msgs: ConvMessage[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-40)));
    } catch {}
  }, []);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg: ConvMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      timestamp: Date.now(),
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setLoading(true);

    // Build history for API (last 10 messages)
    const apiHistory: AIChatMessage[] = updatedMsgs.slice(-10).map((m) => ({
      role: m.role,
      content: m.role === "assistant" ? (m.response?.answer ?? m.content) : m.content,
    }));

    try {
      const response = await askIslamicAI({ data: { messages: apiHistory } });

      const assistantMsg: ConvMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        response,
        timestamp: Date.now(),
      };

      const finalMsgs = [...updatedMsgs, assistantMsg];
      setMessages(finalMsgs);
      saveHistory(finalMsgs);
    } catch (e) {
      const errMsg: ConvMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "تعذّر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى.",
        response: { answer: "", sources: [], error: "network" },
        timestamp: Date.now(),
      };
      const finalMsgs = [...updatedMsgs, errMsg];
      setMessages(finalMsgs);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function toggleSources(id: string) {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function copyAnswer(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast.success("تم نسخ الإجابة");
  }

  function shareAnswer(msg: ConvMessage) {
    const text = `سؤال: ${messages.find((m, i, arr) => arr[i + 1]?.id === msg.id)?.content ?? ""}\n\nالإجابة: ${msg.content}\n\n— سكينة AI، تطبيقك الإسلامي`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else copyAnswer(text);
  }

  function clearHistory() {
    if (!confirm("حذف كامل المحادثة؟")) return;
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none">سكينة AI</h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">يجيب من مصادر إسلامية موثوقة</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearHistory} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition rounded-full px-3 py-1.5 hover:bg-destructive/10">
              <RotateCcw className="h-3.5 w-3.5" />
              مسح
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mx-4 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
            الإجابات للاستئناس العلمي فقط. في المسائل الجسيمة استشر عالمًا متخصصًا.
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="fade-up text-center py-6">
            <div className="relative inline-flex">
              <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-primary text-primary-foreground shadow-elevated mx-auto">
                <Sparkles className="h-9 w-9" />
              </div>
              <div className="absolute -inset-2 rounded-3xl gradient-primary opacity-20 blur-xl -z-10" />
            </div>
            <h2 className="font-quran text-2xl mt-4">المساعد الإسلامي</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
              اسأل عن الفقه والحديث والتفسير والعقيدة — سأجيبك بأدلة من المصادر الشرعية الموثوقة
            </p>

            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
                <Lightbulb className="h-3.5 w-3.5" />
                أسئلة مقترحة
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q.text)}
                    className="text-right rounded-2xl bg-card border border-border/60 px-3 py-3 text-xs leading-relaxed shadow-soft hover:border-primary/30 hover:bg-primary/5 transition active:scale-95"
                  >
                    <span className="text-base">{q.emoji}</span>
                    <p className="mt-1">{q.text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages list */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const resp = msg.response;
          const sourcesExpanded = expandedSources.has(msg.id);

          return (
            <div key={msg.id} className={`fade-up flex ${isUser ? "justify-start" : "justify-end"} items-end gap-2`}>
              {/* User bubble */}
              {isUser && (
                <div className="max-w-[82%]">
                  <div className="rounded-3xl rounded-br-md bg-card border border-border/60 px-4 py-3 shadow-soft">
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}

              {/* AI bubble */}
              {!isUser && (
                <div className="max-w-[90%] w-full">
                  <div className="rounded-3xl rounded-bl-md gradient-primary text-primary-foreground shadow-elevated p-4">
                    {/* Answer text */}
                    <p className="text-sm leading-[1.9] font-medium">{resp?.answer ?? msg.content}</p>

                    {/* Summary pill */}
                    {resp?.summary && (
                      <div className="mt-3 rounded-xl bg-gold/20 border border-gold/30 px-3 py-2">
                        <p className="text-xs font-bold text-gold-foreground">
                          🔑 {resp.summary}
                        </p>
                      </div>
                    )}

                    {/* Madhahib */}
                    {resp?.madhahib && (
                      <div className="mt-2 rounded-xl bg-white/10 px-3 py-2">
                        <p className="text-[11px] opacity-90">⚖️ {resp.madhahib}</p>
                      </div>
                    )}

                    {/* Sources toggle */}
                    {resp?.sources && resp.sources.length > 0 && (
                      <button
                        onClick={() => toggleSources(msg.id)}
                        className="mt-3 flex items-center gap-2 text-[11px] bg-white/15 hover:bg-white/20 rounded-full px-3 py-1.5 transition"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {resp.sources.length} مصدر شرعي
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sourcesExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2 border-t border-white/20 pt-2">
                      <button onClick={() => copyAnswer(resp?.answer ?? msg.content)}
                        className="flex items-center gap-1 text-[10px] opacity-75 hover:opacity-100 transition">
                        <Copy className="h-3 w-3" /> نسخ
                      </button>
                      <button onClick={() => shareAnswer(msg)}
                        className="flex items-center gap-1 text-[10px] opacity-75 hover:opacity-100 transition">
                        <Share2 className="h-3 w-3" /> مشاركة
                      </button>
                      <span className="ml-auto text-[10px] opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Sources expanded panel */}
                  {sourcesExpanded && resp?.sources && resp.sources.length > 0 && (
                    <div className="mt-2 space-y-2 fade-up">
                      {resp.sources.map((src, si) => {
                        const colors = SOURCE_COLORS[src.type] ?? SOURCE_COLORS.scholar;
                        return (
                          <div key={si}
                            className={`rounded-2xl border ${colors.border} ${colors.bg} p-3`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm">{colors.icon}</span>
                              <span className={`text-[10px] font-bold ${colors.text}`}>
                                {SOURCE_LABELS[src.type]}
                              </span>
                              {src.grade && (
                                <span className={`text-[9px] ${colors.text} bg-white/30 px-1.5 rounded-full`}>
                                  {src.grade}
                                </span>
                              )}
                            </div>
                            {src.text && (
                              <p className="font-quran text-base leading-loose text-foreground mb-1">
                                {src.text}
                              </p>
                            )}
                            <p className={`text-[10px] ${colors.text} font-semibold`}>{src.ref}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-end fade-up">
            <div className="rounded-3xl rounded-bl-md gradient-primary text-primary-foreground p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">يبحث في المصادر الشرعية…</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                {["القرآن", "الحديث", "الفقه"].map((s, i) => (
                  <span key={i}
                    className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-[5.5rem] z-30 px-3 py-2">
        <div className="rounded-3xl glass shadow-elevated border border-border/50 overflow-hidden">
          {/* Quick reply chips */}
          {messages.length > 0 && !loading && (
            <div className="flex gap-2 px-3 pt-2 pb-1 overflow-x-auto hide-scrollbar">
              {["وضّح أكثر", "اذكر آراء العلماء", "ما الدليل؟", "هل هناك خلاف؟"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setInput(chip); inputRef.current?.focus(); }}
                  className="shrink-0 text-[11px] bg-primary/10 text-primary rounded-full px-3 py-1 hover:bg-primary/20 transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="اسأل عن الفقه والحديث والتفسير…"
              rows={1}
              disabled={loading}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none resize-none leading-relaxed py-2 px-2 placeholder:text-muted-foreground/60 disabled:opacity-50 max-h-[120px]"
              dir="rtl"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none transition active:scale-90"
              aria-label="إرسال"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-1.5">
          Powered by Claude AI • المصادر من كتب الإسلام الموثوقة
        </p>
      </div>
    </div>
  );
}
