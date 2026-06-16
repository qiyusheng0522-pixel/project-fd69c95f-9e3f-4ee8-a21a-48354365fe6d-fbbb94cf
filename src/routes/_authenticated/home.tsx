import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ClipboardList, HeartPulse, Bell, Camera, Sparkles, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "首页 · 心安管家" }] }),
  component: Home,
});

function Home() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [r, q, p, m] = await Promise.all([
        supabase.from("medical_records").select("id", { count: "exact", head: true }),
        supabase.from("questionnaire_responses").select("id", { count: "exact", head: true }),
        supabase.from("health_plans").select("id", { count: "exact", head: true }),
        supabase.from("medication_reminders").select("id", { count: "exact", head: true }).eq("active", true),
      ]);
      return { records: r.count ?? 0, qs: q.count ?? 0, plans: p.count ?? 0, meds: m.count ?? 0 };
    },
  });
  const { data: latestPlan } = useQuery({
    queryKey: ["latest-plan"],
    queryFn: async () =>
      (await supabase.from("health_plans").select("id,title,summary,risk_level,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle()).data,
  });

  return (
    <div>
      <header className="bg-gradient-hero px-5 pb-8 pt-10 text-primary-foreground">
        <p className="text-xs text-white/80">省人民医院 · 心血管科</p>
        <h1 className="mt-1 text-2xl font-bold">您好，{profile?.full_name || "朋友"}</h1>
        <p className="mt-1 text-sm text-white/85">今天也要好好照顾自己的心 ❤</p>
        <div className="mt-5 grid grid-cols-4 gap-3 text-center">
          {[
            { label: "病历", value: counts?.records ?? 0 },
            { label: "量表", value: counts?.qs ?? 0 },
            { label: "方案", value: counts?.plans ?? 0 },
            { label: "用药", value: counts?.meds ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/15 px-2 py-3 backdrop-blur">
              <div className="text-lg font-semibold">{s.value}</div>
              <div className="mt-0.5 text-[11px] text-white/80">{s.label}</div>
            </div>
          ))}
        </div>
      </header>
      <div className="space-y-4 px-4 py-5">
        <Link to="/records/upload" className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card hover:shadow-elev transition">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-primary-foreground"><Camera className="h-6 w-6" /></div>
          <div className="flex-1">
            <div className="font-semibold">拍照录入病历</div>
            <div className="text-xs text-muted-foreground">化验单 · 入院单 · 手术报告，OCR 一键识别</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="rounded-2xl bg-gradient-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-deep"><Sparkles className="h-4 w-4" /> 最新健康方案</div>
          {latestPlan ? (
            <div className="mt-3">
              <div className="font-medium">{latestPlan.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{latestPlan.summary}</p>
              <Link to="/plan" className="mt-3 inline-block text-sm font-medium text-brand">查看完整方案 →</Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">完善档案与量表后，可一键生成 AI 个性化方案。</p>
              <Link to="/plan" className="mt-3 inline-block text-sm font-medium text-brand">立即生成方案 →</Link>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard to="/archive" icon={ClipboardList} title="基础档案" desc="完善个人健康信息" />
          <QuickCard to="/questionnaires" icon={HeartPulse} title="专病量表" desc="心衰 / 冠心病 / 高血压" />
          <QuickCard to="/records" icon={FileText} title="病历档案" desc="历史病历与化验结果" />
          <QuickCard to="/reminders" icon={Bell} title="提醒中心" desc="用药与随访提醒" />
        </div>
      </div>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, desc }: { to: any; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="rounded-2xl bg-card p-4 shadow-card hover:shadow-elev transition">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-deep"><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>
    </Link>
  );
}