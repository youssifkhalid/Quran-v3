import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Chrome } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "تسجيل الدخول — سكينة" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/profile" });
    }).catch(() => {});
  }, [navigate]);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "فشل تسجيل الدخول بجوجل");
      setGoogleLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("يرجى إدخال البريد وكلمة المرور");
      return;
    }
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) { toast.error("يرجى إدخال اسمك"); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (e: any) {
      const msg = e.message?.includes("Invalid login") 
        ? "بريد أو كلمة مرور غير صحيحة"
        : e.message || "حدث خطأ، حاول مرة أخرى";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 fade-up"
      style={{ background: "var(--background)" }}>
      
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="grid h-16 w-16 place-items-center rounded-3xl shadow-elevated mb-4"
          style={{ background: "var(--g-primary)" }}>
          <span className="font-quran text-3xl text-white">س</span>
        </div>
        <h1 className="font-quran text-3xl text-foreground">سكينة</h1>
        <p className="text-sm text-muted-foreground mt-1">تطبيقك الإسلامي الشامل</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-elevated p-6">
        {/* Tab switcher */}
        <div className="flex rounded-2xl p-1 mb-6" style={{ background: "var(--muted)" }}>
          {[
            { key: "login", label: "تسجيل الدخول" },
            { key: "signup", label: "إنشاء حساب" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setMode(key as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                mode === key
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 active:scale-[0.97] mb-4"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4 text-blue-500" />
          )}
          المتابعة عبر جوجل
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">أو</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full rounded-2xl bg-muted/50 border border-border px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full rounded-2xl bg-muted/50 border border-border px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
            />
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full rounded-2xl bg-muted/50 border border-border px-4 py-3 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition active:scale-[0.97]"
            style={{ background: "var(--g-primary)" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>
        </form>
      </div>

      {/* Skip */}
      <Link to="/" className="mt-4 text-xs text-muted-foreground underline underline-offset-2">
        المتابعة بدون تسجيل دخول
      </Link>
    </div>
  );
}
