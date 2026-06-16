import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "登录 / 注册 · 心安管家" },
      { name: "description", content: "登录或注册心安管家心血管全病程管理账号。" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/home",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("注册成功，正在进入...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("登录成功");
      }
      navigate({ to: "/home" });
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/home",
    });
    if (res.error) {
      toast.error(res.error.message || "Google 登录失败");
      setLoading(false);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <div className="flex items-center gap-2 text-primary-foreground">
          <HeartPulse className="h-5 w-5" />
          <span className="text-sm font-medium">省人民医院 · 心血管科</span>
        </div>
        <div className="mt-10 rounded-3xl bg-card p-6 shadow-elev">
          <h1 className="text-xl font-semibold">{mode === "login" ? "欢迎回来" : "创建账号"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "登录以查看你的健康档案与方案" : "几秒钟开始管理你的心血管健康"}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pw">密码</Label>
              <Input id="pw" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> 或 <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" onClick={google} disabled={loading} className="w-full">
            使用 Google 继续
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-5 w-full text-center text-sm text-brand hover:underline"
          >
            {mode === "login" ? "还没有账号？立即注册" : "已有账号？返回登录"}
          </button>
        </div>
      </div>
    </div>
  );
}