import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { ClipboardList, HeartPulse, Activity, Droplet, ChevronRight, ShieldAlert, Layers } from "lucide-react";

export const Route = createFileRoute("/_authenticated/questionnaires")({
  head: () => ({ meta: [{ title: "专病量表 · 心安管家" }] }),
  component: QListPage,
});

export const SCALES = [
  { id: "hypertension", title: "高血压自我管理评估", desc: "8 题 · 评估血压控制与依从性", icon: Droplet },
  { id: "chd", title: "冠心病症状量表", desc: "10 题 · 西雅图心绞痛简版", icon: HeartPulse },
  { id: "heart_failure", title: "心衰生活质量量表 (MLHFQ)", desc: "21 题 · 评估心衰对生活影响", icon: Activity },
  { id: "scvd", title: "亚临床心血管病 (SCVD) 风险筛查", desc: "10 题 · 早期识别无症状动脉硬化风险", icon: ShieldAlert },
  { id: "plaque", title: "颈动脉/冠脉斑块管理评估", desc: "10 题 · 评估斑块稳定性与生活方式干预", icon: Layers },
  { id: "lifestyle", title: "心血管生活方式评估", desc: "12 题 · 饮食 / 运动 / 睡眠", icon: ClipboardList },
];

function QListPage() {
  const { data } = useQuery({
    queryKey: ["q-history"],
    queryFn: async () =>
      (await supabase
        .from("questionnaire_responses")
        .select("id,questionnaire_type,title,score,result_summary,created_at")
        .order("created_at", { ascending: false })
        .limit(10)).data ?? [],
  });

  return (
    <div>
      <PageHeader title="专病量表" subtitle="定期评估、追踪变化" />
      <div className="space-y-4 px-4 py-4">
        <section>
          <div className="mb-2 text-xs font-medium text-muted-foreground">可用量表</div>
          <div className="space-y-2.5">
            {SCALES.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.id}
                  to="/questionnaires/$type"
                  params={{ type: s.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:shadow-elev"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.title}</div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-2 text-xs font-medium text-muted-foreground">历史记录</div>
          {!data || data.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">暂无填写记录</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()} {r.result_summary ? `· ${r.result_summary}` : ""}
                    </div>
                  </div>
                  {r.score != null && (
                    <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-deep">
                      {r.score} 分
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}