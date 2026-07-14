import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Sparkles, RotateCcw, BookOpen, Loader2, Copy, Share2,
  ChevronDown, AlertCircle, Lightbulb, Mic2, Volume2,
  BookMarked, Star, Moon, X
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
  quran:   { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/20", icon: "📖" },
  hadith:  { bg: "bg-amber-500/10",   text: "text-amber-700 dark:text-amber-300",     border: "border-amber-500/20",   icon: "📚" },
  scholar: { bg: "bg-blue-500/10",    text: "text-blue-700 dark:text-blue-300",       border: "border-blue-500/20",    icon: "🎓" },
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

  function saveHistory(msgs: ConvMessage[]) {
    try {
      // Keep last 50 messages
      const trimmed = msgs.slice(-50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  const handleSend = useCallback(async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    const userMsg: ConvMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    saveHistory(newMessages);

    try {
      const history: AIChatMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await askIslamicAI({ data: { messages: history } });

      const assistantMsg: ConvMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        response: result,
        timestamp: Date.now(),
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (e) {
      const errorMsg: ConvMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "عذرًا، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        timestamp: Date.now(),
      };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages]);

  function clearHistory() {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
    toast.success("تم مسح المحادثة");
  }

  function copyMsg(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast.success("تم النسخ");
  }

  function shareMsg(text: string) {
    const shareText = `${text}\n\n— سكينة AI، المساعد الإسلامي`;
    if (navigator.share) navigator.share({ text: shareText }).catch(() => {});
    else { navigator.clipboard?.writeText(shareText).catch(() => {}); toast.success("تم النسخ"); }
  }

  function toggleSources(id: string) {
    setExpandedSources(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="ai-fullscreen fade-up">
      {/* Fixed Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/40"
        style={{ background: "color-mix(in oklab, var(--background) 90%, transparent)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-2xl shadow-soft"
            style={{ background: "var(--g-primary)" }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">المساعد الإسلامي AI</p>
            <p className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Gemini • مع المصادر الشرعية
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory}
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-destructive transition">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Welcome state */}
        {isEmpty && (
          <div className="flex flex-col items-center pt-8 pb-4 fade-up">
            <div className="grid h-20 w-20 place-items-center rounded-3xl mb-5 shadow-elevated"
              style={{ background: "var(--g-primary)" }}>
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="font-quran text-2xl text-foreground">سكينة AI</h2>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
              اسأل عن الفقه والحديث والتفسير وأحكام الإسلام
            </p>

            {/* Suggested questions */}
            <div className="mt-6 w-full max-w-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> أسئلة مقترحة
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map(({ emoji, text }) => (
                  <button key={text} onClick={() => handleSend(text)}
                    className="flex items-center gap-2.5 rounded-2xl bg-card border border-border/60 p-3 text-right text-sm text-foreground shadow-soft hover:border-primary/30 active:scale-[0.97] transition">
                    <span className="text-lg shrink-0">{emoji}</span>
                    <span className="text-xs leading-relaxed">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "mr-auto" : "ml-auto"}`}>
              {msg.role === "user" ? (
                <div className="rounded-3xl rounded-tr-lg px-4 py-3 text-white shadow-soft"
                  style={{ background: "var(--g-primary)" }}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="rounded-3xl rounded-tl-lg bg-card border border-border/60 shadow-soft overflow-hidden">
                  {/* Answer text */}
                  <div className="px-4 pt-4 pb-2">
                    <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>

                    {/* Summary */}
                    {msg.response?.summary && (
                      <p className="mt-2 text-xs text-primary font-semibold border-t border-border/30 pt-2">
                        📋 {msg.response.summary}
                      </p>
                    )}

                    {/* Madhahib */}
                    {msg.response?.madhahib && (
                      <div className="mt-2 rounded-xl px-3 py-2 bg-muted/50 text-xs text-muted-foreground">
                        ⚖️ {msg.response.madhahib}
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {msg.response?.sources && msg.response.sources.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleSources(msg.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border/30 text-xs text-muted-foreground hover:bg-muted/30 transition">
                        <span className="flex items-center gap-1.5">
                          <BookMarked className="h-3 w-3 text-primary" />
                          {msg.response.sources.length} مصادر شرعية
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedSources.has(msg.id) ? "rotate-180" : ""}`} />
                      </button>

                      {expandedSources.has(msg.id) && (
                        <div className="px-3 pb-3 space-y-2 fade-up">
                          {msg.response.sources.map((src, i) => {
                            const colors = SOURCE_COLORS[src.type] ?? SOURCE_COLORS.scholar;
                            return (
                              <div key={i} className={`rounded-2xl p-3 border ${colors.bg} ${colors.border}`}>
                                <div className="flex items-start gap-2">
                                  <span className="text-base shrink-0">{colors.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold ${colors.text}`}>
                                      {src.ref}
                                      {src.grade && <span className="mr-1 opacity-75">({src.grade})</span>}
                                    </p>
                                    <p className="text-xs text-foreground mt-1 leading-relaxed font-quran" dir="rtl">
                                      {src.text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 px-3 pb-3 pt-1 border-t border-border/20">
                    <button onClick={() => copyMsg(msg.content)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition">
                      <Copy className="h-3 w-3" /> نسخ
                    </button>
                    <button onClick={() => shareMsg(msg.content)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition">
                      <Share2 className="h-3 w-3" /> مشاركة
                    </button>
                    <span className="mr-auto text-[9px] text-muted-foreground/60">
                      {new Date(msg.timestamp).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-end">
            <div className="rounded-3xl rounded-tl-lg bg-card border border-border/60 px-5 py-4 shadow-soft">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="text-xs text-muted-foreground mr-2">يفكر…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 px-4 py-3"
        style={{ background: "color-mix(in oklab, var(--background) 90%, transparent)", backdropFilter: "blur(20px)" }}>
        {/* Quick suggest while typing */}
        {!isEmpty && input.length === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {SUGGESTED_QUESTIONS.slice(0, 5).map(({ emoji, text }) => (
              <button key={text} onClick={() => handleSend(text)}
                className="shrink-0 text-[11px] rounded-full border border-border/60 bg-card px-3 py-1.5 text-foreground whitespace-nowrap hover:border-primary/30 transition">
                {emoji} {text.slice(0, 18)}…
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2.5">
          <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={handleKey}
              placeholder="اسأل عن الفقه والحديث والتفسير…"
              rows={1}
              dir="rtl"
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              style={{ maxHeight: "120px", overflow: "auto" }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white disabled:opacity-40 transition active:scale-90 shadow-soft"
            style={{ background: "var(--g-primary)" }}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 -scale-x-100" />}
          </button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground/50 mt-2">
          الردود مستندة لمصادر إسلامية • راجع العلماء في المسائل الكبيرة
        </p>
      </div>
    </div>
  );
}
