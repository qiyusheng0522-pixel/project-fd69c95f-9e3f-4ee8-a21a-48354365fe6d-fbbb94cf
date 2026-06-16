import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ShieldAlert, Layers, ChevronRight, Activity, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/_authenticated/specialty")({
  head: () => ({ meta: [{ title: "心血管专区 · 心安管家" }] }),
  component: SpecialtyHub,
});

function SpecialtyHub() {
  return (
    <div className="pb-6">
      <PageHeader title="心血管专区" subtitle="斑块管理 · SCVD 早筛 一站式" />
      <div className="space-y-3 px-4 pt-3">
        <ZoneCard
          to="/specialty/scvd"
          icon={ShieldAlert}
          tone="from-[#3a78d8] to-[#5aa0ee]"
          tag="无症状期早筛"
          title="SCVD 亚临床心血管病专区"
          desc="尚未出现症状，但血管已悄悄变化？10 分钟完成早筛 + AI 个性化降险方案。"
          stats={[
            { k: "10 题", v: "风险评估" },
            { k: "AI", v: "降险方案" },
            { k: "随访", v: "每 3 月" },
          ]}
        />
        <ZoneCard
          to="/specialty/plaque"
          icon={Layers}
          tone="from-[#1f5fb8] to-[#3d86d8]"
          tag="斑块全周期"
          title="心血管斑块管理专区"
          desc="颈动脉 / 冠脉斑块患者专属：稳斑、抗炎、依从性、影像复查闭环管理。"
          stats={[
            { k: "稳斑", v: "饮食运动" },
            { k: "他汀", v: "用药随访" },
            { k: "影像", v: "复查提醒" },
          ]}
        />

        <div className="mt-2 rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <HeartPulse className="h-4 w-4 text-brand" /> 为什么需要专区？
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            斑块与 SCVD 是心血管事件的"沉默期"。专区将<b>评估、方案、用药、复查</b>整合，
            由心内科主诊医生与 AI 共同维护，帮助你在事件发生前完成干预。
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { i: Activity, k: "30%", v: "事件下降" },
              { i: ShieldAlert, k: "↓ LDL", v: "<1.4 mmol/L" },
              { i: Layers, k: "稳定", v: "斑块逆转" },
            ].map(({ i: Icon, k, v }) => (
              <div key={k} className="rounded-2xl bg-brand-soft/60 p-2">
                <Icon className="mx-auto h-4 w-4 text-brand-deep" />
                <div className="mt-1 text-[12px] font-bold text-brand-deep">{k}</div>
                <div className="text-[10px] text-muted-foreground">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoneCard({
  to, icon: Icon, tone, tag, title, desc, stats,
}: {
  to: any; icon: any; tone: string; tag: string; title: string; desc: string;
  stats: { k: string; v: string }[];
}) {
  return (
    <Link
      to={to}
      className={`block overflow-hidden rounded-3xl bg-gradient-to-br ${tone} p-4 text-primary-foreground shadow-elev`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{tag}</div>
          <div className="mt-1 text-[15px] font-bold leading-tight">{title}</div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/90">{desc}</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-white/80" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.k} className="rounded-2xl bg-white/15 px-2 py-2 text-center ring-1 ring-white/20 backdrop-blur">
            <div className="text-[12px] font-bold">{s.k}</div>
            <div className="text-[10px] text-white/85">{s.v}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}