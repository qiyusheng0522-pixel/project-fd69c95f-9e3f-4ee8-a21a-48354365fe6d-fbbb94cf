import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import {
  Layers, Activity, Pill, ChevronRight, Camera, Sparkles, CalendarClock,
  Stethoscope, BookOpen, Droplet,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/specialty/plaque")({
  head: () => ({ meta: [{ title: "斑块管理专区 · 心安管家" }] }),
  component: PlaqueZone,
});

function PlaqueZone() {
  return (
    <div className="pb-8">
      <PageHeader title="心血管斑块管理专区" subtitle="稳斑 · 抗炎 · 影像复查闭环" />

      {/* Plaque summary */}
      <section className="mx-4 mt-3 overflow-hidden rounded-3xl bg-gradient-hero p-4 text-primary-foreground shadow-elev">
        <div className="flex items-center gap-2 text-[11px]">
          <Layers className="h-3.5 w-3.5" /> 我的斑块画像
        </div>
        <div className="mt-2 flex items-end gap-3">
          <div className="text-3xl font-extrabold leading-none">混合型</div>
          <div className="text-[12px] text-white/85">稳定性中等 · 需积极干预</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { k: "颈动脉", v: "1.8 × 3.2 mm" },
            { k: "冠脉钙化", v: "Agatston 96" },
            { k: "上次复查", v: "180 天前" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-white/15 px-2 py-2 ring-1 ring-white/20 backdrop-blur">
              <div className="text-[10px] text-white/80">{s.k}</div>
              <div className="text-[12px] font-bold">{s.v}</div>
            </div>
          ))}
        </div>
        <Link
          to="/questionnaires/$type"
          params={{ type: "plaque" }}
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-brand-deep"
        >
          重新评估斑块管理 <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Stability score */}
      <section className="px-4 pt-4">
        <H title="斑块稳定性评分" sub="≥80 为稳定" />
        <div className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-brand-deep">68<span className="text-sm text-muted-foreground"> / 100</span></div>
            <div className="text-[11px] text-amber-600">较上次 +6</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
            {[
              { k: "LDL-C", v: "需↓" },
              { k: "hs-CRP", v: "正常" },
              { k: "他汀", v: "依从 86%" },
              { k: "影像", v: "待复查" },
            ].map((x) => (
              <div key={x.k} className="rounded-xl bg-brand-soft/60 p-1.5">
                <div className="font-semibold text-brand-deep">{x.k}</div>
                <div className="text-muted-foreground">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan modules */}
      <section className="px-4 pt-4">
        <H title="稳斑四件套" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { i: Pill, t: "他汀强化降脂", d: "目标 LDL-C < 1.4 mmol/L" },
            { i: Droplet, t: "抗血小板治疗", d: "阿司匹林依从打卡" },
            { i: Activity, t: "稳斑运动处方", d: "中等强度 150min/周" },
            { i: Sparkles, t: "抗炎饮食", d: "Omega-3 + 地中海" },
          ].map((m) => {
            const Icon = m.i;
            return (
              <div key={m.t} className="rounded-2xl bg-card p-3 shadow-card">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-[13px] font-semibold">{m.t}</div>
                <div className="text-[11px] text-muted-foreground">{m.d}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Imaging follow-up */}
      <section className="px-4 pt-4">
        <H title="影像复查时间轴" />
        <div className="rounded-3xl bg-card p-4 shadow-card">
          {[
            { d: "2026-01-08", t: "颈动脉超声", s: "已完成" },
            { d: "2026-07-08", t: "颈动脉超声复查", s: "待预约" },
            { d: "2027-01-08", t: "冠脉 CTA 复查", s: "计划中" },
          ].map((e, i) => (
            <div key={e.d} className="flex items-start gap-3 py-2">
              <div className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                <div className={"h-2.5 w-2.5 rounded-full " + (i === 0 ? "bg-emerald-500" : "bg-brand")} />
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold">{e.t}</div>
                <div className="text-[11px] text-muted-foreground">{e.d} · {e.s}</div>
              </div>
              {i > 0 && (
                <button className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand-deep">
                  预约
                </button>
              )}
            </div>
          ))}
          <Link to="/records/upload" className="mt-2 inline-flex items-center gap-1 text-[11px] text-brand">
            <Camera className="h-3.5 w-3.5" /> 上传最新报告
          </Link>
        </div>
      </section>

      {/* Doctor + Knowledge */}
      <section className="px-4 pt-4 space-y-2">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <Stethoscope className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">心内科主任 · 斑块管理 1v1</div>
            <div className="text-[11px] text-muted-foreground">上传影像后预约解读</div>
          </div>
          <button className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-primary-foreground">咨询</button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <CalendarClock className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">下次随访 · 7 月 12 日</div>
            <div className="text-[11px] text-muted-foreground">已加入提醒</div>
          </div>
          <Link to="/reminders" className="text-[11px] text-brand">查看</Link>
        </div>
      </section>

      <section className="px-4 pt-4">
        <H title="斑块科普" />
        <div className="space-y-2">
          {[
            "什么样的斑块更危险？软斑 vs 硬斑",
            "他汀强化治疗，肝功能怎么管理？",
            "颈动脉斑块能逆转吗？真实数据告诉你",
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

function H({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-[14px] font-bold">{title}</h2>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}