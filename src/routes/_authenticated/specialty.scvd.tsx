import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import {
  ShieldAlert, Activity, Droplet, Sparkles, ChevronRight, AlertCircle,
  Stethoscope, BookOpen, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/specialty/scvd")({
  head: () => ({ meta: [{ title: "SCVD 专区 · 心安管家" }] }),
  component: ScvdZone,
});

function ScvdZone() {
  return (
    <div className="pb-8">
      <PageHeader title="SCVD 亚临床心血管病专区" subtitle="无症状期 · 风险早筛 · 主动干预" />

      {/* Hero risk */}
      <section className="mx-4 mt-3 overflow-hidden rounded-3xl bg-gradient-hero p-4 text-primary-foreground shadow-elev">
        <div className="flex items-center gap-2 text-[11px]">
          <ShieldAlert className="h-3.5 w-3.5" /> 我的 SCVD 综合风险
        </div>
        <div className="mt-2 flex items-end gap-3">
          <div className="text-3xl font-extrabold leading-none">中危</div>
          <div className="text-[12px] text-white/85">10 年事件风险约 11.2%</div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[55%] rounded-full bg-white" />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-white/80">
          <span>低危</span><span>中危</span><span>高危</span>
        </div>
        <Link
          to="/questionnaires/$type"
          params={{ type: "scvd" }}
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-brand-deep"
        >
          重新评估 SCVD 风险 <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Risk factors */}
      <section className="px-4 pt-4">
        <H title="风险因子拆解" sub="点亮项目即需重点干预" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { k: "LDL-C", v: "3.6 mmol/L", warn: true },
            { k: "血压", v: "138/88", warn: true },
            { k: "空腹血糖", v: "5.4", warn: false },
            { k: "颈动脉 IMT", v: "0.92mm", warn: true },
            { k: "BMI", v: "26.1", warn: true },
            { k: "吸烟", v: "已戒 2 年", warn: false },
          ].map((f) => (
            <div key={f.k} className="rounded-2xl bg-card p-3 shadow-card">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{f.k}</span>
                {f.warn
                  ? <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <div className={"mt-1 text-[15px] font-bold " + (f.warn ? "text-amber-600" : "text-emerald-600")}>
                {f.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI plan */}
      <section className="px-4 pt-4">
        <H title="AI 降险方案" sub="基于评估自动生成" extraTo="/plan" />
        <div className="rounded-3xl bg-card p-4 shadow-card">
          {[
            { i: Droplet, t: "LDL-C 目标 < 2.6", d: "每日地中海饮食 + 增加可溶性纤维（燕麦、豆类）" },
            { i: Activity, t: "每周 150 分钟中等强度运动", d: "快走、游泳、骑行；分 5 次完成" },
            { i: ShieldAlert, t: "血压晨晚双测", d: "目标 < 130/80；记录至档案触发预警" },
          ].map((x) => {
            const Icon = x.i;
            return (
              <div key={x.t} className="flex gap-3 border-b border-border/60 py-2.5 last:border-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold">{x.t}</div>
                  <div className="text-[11px] text-muted-foreground">{x.d}</div>
                </div>
              </div>
            );
          })}
          <Link to="/plan" className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground">
            查看完整方案 <Sparkles className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Follow-up */}
      <section className="px-4 pt-4">
        <H title="随访闭环" />
        <div className="space-y-2">
          {[
            { t: "3 个月内复查血脂四项", d: "建议本院心内科门诊", cta: "预约" },
            { t: "颈动脉超声 12 个月复查", d: "评估 IMT 与斑块变化", cta: "提醒" },
            { t: "心血管科 1v1 咨询", d: "解读 SCVD 报告", cta: "咨询" },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <Stethoscope className="h-5 w-5 text-brand" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold">{r.t}</div>
                <div className="text-[11px] text-muted-foreground">{r.d}</div>
              </div>
              <button className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                {r.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge */}
      <section className="px-4 pt-4">
        <H title="专区科普" />
        <div className="space-y-2">
          {[
            "什么是 SCVD？它和动脉硬化有什么区别？",
            "颈动脉 IMT 增厚，需要吃他汀吗？",
            "无症状阶段，最有效的 5 个生活方式改变",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-card">
              <BookOpen className="h-4 w-4 text-brand" />
              <span className="flex-1 text-[12px]">{t}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function H({ title, sub, extraTo }: { title: string; sub?: string; extraTo?: any }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <div>
        <h2 className="text-[14px] font-bold">{title}</h2>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </div>
      {extraTo && (
        <Link to={extraTo} className="flex items-center text-[11px] text-brand">
          查看 <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}