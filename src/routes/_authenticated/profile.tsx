import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { ClipboardList, FileText, HeartPulse, Bell, ChevronRight, LogOut, ShieldCheck, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "我的 · 心安管家" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const { data: email } = useQuery({
    queryKey: ["me-email"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.email ?? "",
  });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const age = profile?.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 86400000))
    : null;
  const bmi =
    profile?.height_cm && profile?.weight_kg
      ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
      : null;

  return (
    <div>
      <PageHeader title="我的" subtitle="个人中心" />
      <div className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-elev">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold">{profile?.full_name || "未填写姓名"}</div>
              <div className="truncate text-xs text-white/80">{email}</div>
            </div>
            <Link
              to="/archive"
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur hover:bg-white/25"
            >
              编辑档案
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="年龄" value={age != null ? `${age} 岁` : "—"} />
            <Stat label="性别" value={profile?.gender || "—"} />
            <Stat label="BMI" value={bmi ?? "—"} />
          </div>
        </section>

        <section className="rounded-2xl bg-card p-2 shadow-card">
          <MenuItem to="/archive" icon={ShieldCheck} title="基础档案" desc="个人信息与健康史" />
          <MenuItem to="/records" icon={FileText} title="病历档案" desc="所有 OCR 记录" />
          <MenuItem to="/questionnaires" icon={ClipboardList} title="专病量表" desc="历史评估记录" />
          <MenuItem to="/plan" icon={HeartPulse} title="健康方案" desc="AI 个性化方案" />
          <MenuItem to="/reminders" icon={Bell} title="提醒中心" desc="用药与随访" />
        </section>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3 text-sm font-medium text-destructive shadow-card hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> 退出登录
        </button>

        <p className="text-center text-[11px] text-muted-foreground">心安管家 · 省人民医院心血管科</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 py-2 backdrop-blur">
      <div className="text-sm font-semibold">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/80">{label}</div>
    </div>
  );
}

function MenuItem({ to, icon: Icon, title, desc }: { to: any; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}