import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { generateHealthPlan } from "@/lib/plan.functions";
import { Sparkles, Salad, Activity, Pill, Gauge, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({ meta: [{ title: "健康方案 · 心安管家" }] }),
  component: PlanPage,
});

function PlanPage() {
  const qc = useQueryClient();
  const gen = useServerFn(generateHealthPlan);
  const { data: latest, isLoading } = useQuery({
    queryKey: ["latest-plan-full"],
    queryFn: async () =>
      (await supabase
        .from("health_plans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()).data,
  });
  const { data: history } = useQuery({
    queryKey: ["plan-history"],
    queryFn: async () =>
      (await supabase
        .from("health_plans")
        .select("id,title,created_at,risk_level")
        .order("created_at", { ascending: false })
        .range(1, 10)).data ?? [],
  });

  const mut = useMutation({
    mutationFn: async () => gen({ data: undefined } as never),
    onSuccess: () => {
      toast.success("方案已生成");
      qc.invalidateQueries({ queryKey: ["latest-plan-full"] });
      qc.invalidateQueries({ queryKey: ["latest-plan"] });
      qc.invalidateQueries({ queryKey: ["plan-history"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
    onError: (e: any) => toast.error(e?.message || "生成失败"),
  });

  return (
    <div>
      <PageHeader
        title="健康方案"
        subtitle="AI 个性化生成 · 仅供参考"
        right={
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
          >
            {mut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {latest ? "重新生成" : "立即生成"}
          </button>
        }
      />
      <div className="space-y-4 px-4 py-4">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">加载中…</div>
        ) : !latest ? (
          <Empty />
        ) : (
          <PlanView plan={latest} />
        )}

        {history && history.length > 0 && (
          <section className="rounded-2xl bg-card p-4 shadow-card">
            <div className="mb-2 text-xs font-medium text-muted-foreground">历史方案</div>
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="min-w-0 flex-1 truncate">{h.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl bg-gradient-card p-8 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-deep">
        <Sparkles className="h-7 w-7" />
      </div>
      <div className="text-sm font-semibold">还没有健康方案</div>
      <p className="mx-auto mt-1 max-w-[260px] text-xs text-muted-foreground">
        请先完善 <Link to="/archive" className="text-brand">个人档案</Link> 与
        <Link to="/questionnaires" className="text-brand"> 专病量表</Link>，再点击右上角"立即生成"。
      </p>
    </div>
  );
}

const RISK: Record<string, { label: string; cls: string; icon: any }> = {
  low: { label: "低风险", cls: "bg-emerald-100 text-emerald-700", icon: ShieldCheck },
  medium: { label: "中风险", cls: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  high: { label: "高风险", cls: "bg-rose-100 text-rose-700", icon: AlertTriangle },
};

function PlanView({ plan }: { plan: any }) {
  const risk = RISK[plan.risk_level ?? "medium"] ?? RISK.medium;
  const RiskIcon = risk.icon;
  const diet = plan.diet ?? {};
  const exercise = plan.exercise ?? {};
  const medication = plan.medication ?? {};
  const monitoring = plan.monitoring ?? {};
  const advice: string[] = Array.isArray(plan.advice) ? plan.advice : [];

  return (
    <>
      <section className="rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-elev">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/80">个性化方案</div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${risk.cls}`}>
            <RiskIcon className="h-3 w-3" /> {risk.label}
          </span>
        </div>
        <h2 className="mt-2 text-lg font-bold">{plan.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/90">{plan.summary}</p>
      </section>

      {advice.length > 0 && (
        <Card icon={Sparkles} title="核心建议">
          <ul className="space-y-2 text-sm">
            {advice.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card icon={Salad} title="饮食方案">
        {diet.principles && (
          <div className="mb-3">
            <div className="text-[11px] text-muted-foreground">饮食原则</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(diet.principles as string[]).map((p, i) => (
                <span key={i} className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand-deep">{p}</span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <List label="推荐多吃" items={diet.recommend} color="text-emerald-700" />
          <List label="尽量避免" items={diet.avoid} color="text-rose-700" />
        </div>
        {diet.daily_sodium_mg && (
          <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs">
            每日钠摄入控制：<span className="font-semibold text-foreground">{diet.daily_sodium_mg} mg</span>
          </div>
        )}
        {Array.isArray(diet.sample_meals) && diet.sample_meals.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-[11px] text-muted-foreground">参考餐单</div>
            {diet.sample_meals.map((m: any, i: number) => (
              <div key={i} className="rounded-xl bg-muted/60 px-3 py-2 text-xs">
                <span className="font-semibold text-brand-deep">{m.meal}：</span>
                <span className="text-muted-foreground">{(m.items ?? []).join("、")}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card icon={Activity} title="运动方案">
        {exercise.summary && <p className="mb-3 text-sm">{exercise.summary}</p>}
        {Array.isArray(exercise.weekly_plan) && (
          <div className="space-y-1.5">
            {exercise.weekly_plan.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <span className="font-medium text-brand-deep">{d.day}</span>
                <span className="flex-1 px-2 text-muted-foreground">{d.activity}</span>
                <span className="text-xs">{d.duration_min}min · {d.intensity}</span>
              </div>
            ))}
          </div>
        )}
        {Array.isArray(exercise.warnings) && exercise.warnings.length > 0 && (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠ {exercise.warnings.join("；")}
          </div>
        )}
      </Card>

      {medication?.notes && (
        <Card icon={Pill} title="用药提示">
          <p className="text-sm leading-relaxed">{medication.notes}</p>
        </Card>
      )}

      {Array.isArray(monitoring?.metrics) && monitoring.metrics.length > 0 && (
        <Card icon={Gauge} title="监测指标">
          <div className="divide-y divide-border">
            {monitoring.metrics.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.frequency}</div>
                </div>
                <span className="text-xs font-semibold text-brand-deep">{m.target}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="rounded-xl bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        本方案由 AI 基于您的档案、病历与量表数据生成，仅作生活方式参考，不能替代医生诊疗。
      </div>
    </>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
        <Icon className="h-4 w-4" /> {title}
      </div>
      {children}
    </section>
  );
}

function List({ label, items, color }: { label: string; items?: string[]; color: string }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div>
      <div className={"mb-1 text-[11px] font-medium " + color}>{label}</div>
      <ul className="space-y-0.5 text-xs text-foreground">
        {items.map((x, i) => <li key={i}>· {x}</li>)}
      </ul>
    </div>
  );
}