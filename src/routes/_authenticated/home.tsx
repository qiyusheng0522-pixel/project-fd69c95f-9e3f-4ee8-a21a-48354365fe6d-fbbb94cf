import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, ClipboardList, HeartPulse, Bell, Camera, Sparkles, ChevronRight,
  Activity, Pill, Droplet, Stethoscope, MessageSquare, ShieldAlert, Layers,
  PlayCircle, BookOpen, ShoppingBag, CheckCircle2, Circle, Users, Compass,
} from "lucide-react";

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

  const name = profile?.full_name || "朋友";
  const archiveDone = Math.min(
    100,
    20 +
      (profile?.full_name ? 15 : 0) +
      (profile?.birth_date ? 10 : 0) +
      (profile?.chronic_conditions ? 15 : 0) +
      ((counts?.records ?? 0) > 0 ? 20 : 0) +
      ((counts?.qs ?? 0) > 0 ? 20 : 0),
  );

  // 今日行动：在「资料已上传」且「至少完成一份量表」后才生成
  const hasRecords = (counts?.records ?? 0) > 0;
  const hasQs = (counts?.qs ?? 0) > 0;
  const hasMeds = (counts?.meds ?? 0) > 0;
  const actionsReady = hasRecords && hasQs;
  const checkTotal = 4;
  const checkDone = 1 + (hasMeds ? 1 : 0);
  const todos: { icon: any; title: string; sub: string; cta: string }[] = [];
  if (actionsReady) {
    if (hasMeds) {
      todos.push({ icon: Pill, title: "阿托伐他汀 20mg", sub: "20:00 · 睡前服用", cta: "确认" });
    }
    todos.push({ icon: Droplet, title: "晚间血压测量", sub: "未记录 · 目标 < 130/80", cta: "记录" });
    todos.push({ icon: Camera, title: "晚餐饮食打卡", sub: "拍照识别 · 一键完成", cta: "打卡" });
  }

  return (
    <div className="space-y-4 pb-6">
      {/* AI 主治医生卡片 */}
      <section className="relative overflow-hidden bg-gradient-hero px-4 pb-5 pt-3 text-primary-foreground">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        {/* 顶部标题栏 */}
        <div className="relative mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold">
            <HeartPulse className="h-4 w-4" /> 心安管家 · 今日任务
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[11px] ring-1 ring-white/25">
              <Compass className="h-3 w-3" /> 引导
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[11px] ring-1 ring-white/25">
              <Users className="h-3 w-3" /> 入群
            </span>
          </div>
        </div>

        <div className="relative flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
            <HeartPulse className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[11px] text-white/85">
              <Sparkles className="h-3 w-3" /> 心安管家 · 您的 AI 主治医生
            </div>
            <h1 className="mt-1 text-lg font-bold leading-tight">
              {name}，今日 {checkTotal} 项待打卡
            </h1>
            <p className="mt-1 text-[12px] leading-relaxed text-white/90">
              用药 · 血压 · 饮食 · 运动
            </p>
          </div>
        </div>

        {/* 优先待办 */}
        <div className="relative mt-4 rounded-2xl bg-white/15 p-3 ring-1 ring-white/25 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] text-white/85">
            <span>优先待办 · {checkDone}/{checkTotal}</span>
            <span>{Math.round((checkDone / checkTotal) * 100)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(checkDone / checkTotal) * 100}%` }} />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <Pill className="h-4 w-4 text-white/90" />
            <span className="flex-1 truncate text-[12px]">用药 · 阿托伐他汀 · 20:00</span>
            <button className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-brand-deep">确认</button>
          </div>
        </div>

        <div className="relative mt-2 flex items-center gap-2 rounded-full bg-white/18 px-3 py-2 ring-1 ring-white/25 backdrop-blur-md">
          <MessageSquare className="h-4 w-4 text-white/90" />
          <span className="flex-1 text-[12px] text-white/80">向 AI 主治医生提问…</span>
          <Link to="/plan" className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-brand-deep">
            问诊
          </Link>
        </div>
        <div className="relative mt-2 flex flex-wrap gap-1.5">
          {["血压偏高怎么办", "斑块如何稳定", "他汀用药咨询"].map((t) => (
            <span key={t} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white/90 ring-1 ring-white/20">
              {t}
            </span>
          ))}
        </div>
        <div className="relative mt-3 flex gap-2">
          <Link
            to="/profile"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white/95 p-3 text-foreground shadow-elev"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">咨询心血管科医生？</div>
              <div className="truncate text-[11px] text-muted-foreground">
                选择主任 / 主治医生 1v1 · 入院锁定主管医护
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/reminders"
            className="relative flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/95 text-foreground shadow-elev"
          >
            <MessageSquare className="h-5 w-5 text-brand-deep" />
            <span className="mt-0.5 text-[10px] text-muted-foreground">消息</span>
            <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
              3
            </span>
          </Link>
        </div>
      </section>

      {/* 实时指标 */}
      <section className="px-4">
        <div className="grid grid-cols-3 gap-2.5">
          <Metric icon={Droplet} label="今日血压" value="128/82" unit="mmHg" foot="↘ 平稳" />
          <Metric icon={Pill} label="今日用药" value="2/3" unit="次" foot="下次 18:30" />
          <Metric icon={Activity} label="运动" value="36" unit="min" foot="达成 72%" />
        </div>
      </section>

      {/* 快捷入口 */}
      <section className="px-4">
        <div className="grid grid-cols-4 gap-2">
          <Quick to="/records" icon={FileText} label="病历档案" />
          <Quick to="/reminders" icon={Bell} label="用药提醒" />
          <Quick to="/records/upload" icon={Camera} label="拍照录入" />
          <Quick to="/plan" icon={Sparkles} label="我的方案" />
        </div>
      </section>

      {/* 心血管专区 */}
      <section className="px-4">
        <SectionTitle title="心血管专区" sub="斑块管理 · SCVD 早筛" extra="进入专区" to="/specialty" />
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/specialty/scvd"
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a78d8] to-[#5aa0ee] p-3 text-primary-foreground shadow-card"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[11px] opacity-90">无症状期早筛</span>
            </div>
            <div className="mt-1 text-[14px] font-bold">SCVD 专区</div>
            <div className="mt-0.5 text-[10px] text-white/85">10 年事件风险 · 11.2%</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">
              进入 <ChevronRight className="h-3 w-3" />
            </div>
          </Link>
          <Link
            to="/specialty/plaque"
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f5fb8] to-[#3d86d8] p-3 text-primary-foreground shadow-card"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              <span className="text-[11px] opacity-90">稳斑闭环管理</span>
            </div>
            <div className="mt-1 text-[14px] font-bold">斑块管理专区</div>
            <div className="mt-0.5 text-[10px] text-white/85">稳定性 68 · 待复查</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">
              进入 <ChevronRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </section>

      {/* AI 建档 · 拍一拍 */}
      <section className="px-4">
        <Link
          to="/records/upload"
          className="block overflow-hidden rounded-3xl bg-gradient-card p-4 shadow-card ring-1 ring-white/70"
        >
          <div className="flex items-center gap-1 text-[11px] text-brand-deep">
            <Sparkles className="h-3 w-3" /> AI 建档 · 拍一拍
          </div>
          <div className="mt-1 text-[15px] font-semibold">
            拍照上传化验单 / 入院单 / 手术报告
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            AI 自动识别并归档，心血管科主诊医生随访前即可查看
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">健康档案完成度</span>
                <span className="font-semibold text-brand-deep">{archiveDone}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${archiveDone}%` }} />
              </div>
            </div>
            <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-card">
              <Camera className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            <Tag label={`化验单已识别 ${counts?.records ?? 0}`} done />
            <Tag label={`量表已填 ${counts?.qs ?? 0}`} done={(counts?.qs ?? 0) > 0} />
            <Tag label="既往病史待上传" />
            <Tag label="身份证待上传" />
          </div>
        </Link>
      </section>

      {/* 今日行动 */}
      <section className="px-4">
        <SectionTitle
          title="今日行动"
          sub={actionsReady ? "基于你的档案与量表生成" : "完成档案 + 量表后自动生成"}
          extra={actionsReady ? "全部待办" : undefined}
          to={actionsReady ? "/reminders" : undefined}
        />
        {actionsReady ? (
          <div className="space-y-2">
            {todos.map((t) => (
              <Todo key={t.title} icon={t.icon} title={t.title} sub={t.sub} cta={t.cta} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-brand-deep">
              <Sparkles className="h-4 w-4" /> 解锁今日行动
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              上传病历资料并完成至少 1 份专病量表，AI 将每天为你生成可执行的行动事项。
            </p>
            <div className="mt-3 space-y-2">
              <UnlockStep
                done={hasRecords}
                icon={Camera}
                title="上传基础资料"
                sub={hasRecords ? `已上传 ${counts?.records ?? 0} 份资料` : "病历 / 化验单 / 入院单"}
                to="/records/upload"
                cta={hasRecords ? "继续上传" : "去上传"}
              />
              <UnlockStep
                done={hasQs}
                icon={ClipboardList}
                title="完成专病量表"
                sub={hasQs ? `已完成 ${counts?.qs ?? 0} 份评估` : "SCVD / 斑块 / 高血压…任选 1 份"}
                to="/questionnaires"
                cta={hasQs ? "继续评估" : "去填写"}
              />
            </div>
          </div>
        )}
      </section>

      {/* 我的方案 */}
      <section className="px-4">
        <div className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-deep">
            <Sparkles className="h-4 w-4" /> 最新健康方案
          </div>
          {latestPlan ? (
            <div className="mt-3">
              <div className="text-sm font-medium">{latestPlan.title}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{latestPlan.summary}</p>
              <Link to="/plan" className="mt-3 inline-flex items-center rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-medium text-primary-foreground">
                查看完整方案
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">完善档案与量表后，可一键生成 AI 个性化方案。</p>
              <Link to="/plan" className="mt-3 inline-flex items-center rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-medium text-primary-foreground">
                立即生成方案
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 评估中心 — 含 SCVD 与斑块管理 */}
      <section className="px-4">
        <SectionTitle title="评估中心" sub="多维评估 + 专病量表" extra="全部 6 项" to="/questionnaires" />
        <div className="space-y-2">
          <ScaleRow
            to="/questionnaires/$type"
            params={{ type: "scvd" }}
            icon={ShieldAlert}
            tag="首诊推荐"
            title="亚临床心血管病 (SCVD) 风险筛查"
            sub="10 题 · 约 2 分钟，识别无症状期动脉硬化风险"
          />
          <ScaleRow
            to="/questionnaires/$type"
            params={{ type: "plaque" }}
            icon={Layers}
            tag="斑块管理"
            title="颈动脉 / 冠脉斑块管理评估"
            sub="10 题 · 评估斑块稳定性与干预依从性"
          />
          <ScaleRow
            to="/questionnaires/$type"
            params={{ type: "hypertension" }}
            icon={Droplet}
            tag="慢病管理"
            title="高血压自我管理评估"
            sub="8 题 · 评估血压控制与依从性"
          />
        </div>
      </section>

      {/* 健康百科 */}
      <section className="px-4">
        <SectionTitle title="健康百科" sub="看完单篇得积分" extra="进入百科" />
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {[
            { tag: "视频", icon: PlayCircle, title: "斑块稳定的 5 个生活方式细节", meta: "张主任 · 4 分钟 · +50 积分" },
            { tag: "图文", icon: BookOpen, title: "他汀类药物，到底要吃多久？", meta: "心内科药师 · 6 分钟 · +30 积分" },
            { tag: "直播", icon: PlayCircle, title: "本周四 20:00 · 冠脉支架术后随访公开课", meta: "主任医师直播 · +80 积分" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="w-[200px] shrink-0 overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="relative flex h-24 items-center justify-center bg-gradient-hero text-primary-foreground">
                  <Icon className="h-9 w-9 opacity-90" />
                  <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] backdrop-blur">
                    {c.tag}
                  </span>
                </div>
                <div className="p-3">
                  <div className="line-clamp-2 text-[12px] font-semibold leading-snug">{c.title}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{c.meta}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 商城 */}
      <section className="px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-card p-4 shadow-card ring-1 ring-white/70">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-brand-deep">医生甄选</div>
              <div className="text-sm font-semibold">心安管家健康服务商城</div>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            心内科医生 & 营养师联合甄选：低钠营养餐 · 心血管专病服务包 · 家用血压/血脂监测设备
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">已为 8,326 位心友服务</span>
            <button className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
              进入商城
            </button>
          </div>
        </div>
      </section>

      <p className="px-4 text-center text-[10px] text-muted-foreground">
        本应用建议仅供生活方式参考，不能替代医生诊疗
      </p>
    </div>
  );
}

function Metric({ icon: Icon, label, value, unit, foot }: { icon: any; label: string; value: string; unit: string; foot: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5 text-brand" />
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-lg font-bold text-brand-deep leading-none">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-1 text-[10px] text-emerald-600">{foot}</div>
    </div>
  );
}

function Quick({ to, icon: Icon, label }: { to: any; icon: any; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card py-3 shadow-card transition hover:-translate-y-0.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}

function Tag({ label, done }: { label: string; done?: boolean }) {
  return (
    <span className={
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
      (done ? "bg-brand-soft text-brand-deep" : "bg-muted text-muted-foreground")
    }>
      {done ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

function SectionTitle({ title, sub, extra, to }: { title: string; sub?: string; extra?: string; to?: any }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <div>
        <h2 className="text-[15px] font-bold">{title}</h2>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </div>
      {extra && (
        to ? (
          <Link to={to} className="flex items-center text-[11px] text-brand">
            {extra} <ChevronRight className="h-3 w-3" />
          </Link>
        ) : (
          <span className="flex items-center text-[11px] text-brand">
            {extra} <ChevronRight className="h-3 w-3" />
          </span>
        )
      )}
    </div>
  );
}

function Todo({ icon: Icon, title, sub, cta }: { icon: any; title: string; sub: string; cta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <button className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-primary-foreground">
        {cta}
      </button>
    </div>
  );
}

function UnlockStep({
  done, icon: Icon, title, sub, to, cta,
}: { done: boolean; icon: any; title: string; sub: string; to: any; cta: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl bg-muted/40 p-2.5">
      <div className={
        "flex h-8 w-8 items-center justify-center rounded-xl " +
        (done ? "bg-emerald-100 text-emerald-600" : "bg-brand-soft text-brand-deep")
      }>
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold">{title}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
      <span className={
        "rounded-full px-2.5 py-1 text-[10px] font-semibold " +
        (done ? "bg-emerald-500/15 text-emerald-700" : "bg-brand text-primary-foreground")
      }>
        {done ? "已完成" : cta}
      </span>
    </Link>
  );
}

function ScaleRow({
  to, params, icon: Icon, tag, title, sub,
}: { to: any; params: any; icon: any; tag: string; title: string; sub: string }) {
  return (
    <Link to={to} params={params} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-deep">{tag}</span>
          <span className="truncate text-[13px] font-semibold">{title}</span>
        </div>
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}