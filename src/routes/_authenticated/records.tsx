import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { FileText, FlaskConical, Hospital, Stethoscope, Plus, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/records")({
  head: () => ({ meta: [{ title: "病历档案 · 心安管家" }] }),
  component: RecordsPage,
});

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  medical_history: { label: "病历", icon: FileText, color: "bg-blue-100 text-blue-700" },
  lab_report: { label: "化验单", icon: FlaskConical, color: "bg-emerald-100 text-emerald-700" },
  admission: { label: "入院单", icon: Hospital, color: "bg-violet-100 text-violet-700" },
  surgery: { label: "手术报告", icon: Stethoscope, color: "bg-rose-100 text-rose-700" },
};

function RecordsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["records-list"],
    queryFn: async () =>
      (await supabase
        .from("medical_records")
        .select("id,title,record_type,hospital,visit_date,status,created_at")
        .order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div>
      <PageHeader
        title="病历档案"
        subtitle="OCR 一键识别，统一归档"
        right={
          <Link
            to="/records/upload"
            className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新增
          </Link>
        }
      />
      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">加载中…</div>
        ) : !data || data.length === 0 ? (
          <EmptyState />
        ) : (
          data.map((r) => {
            const meta = TYPE_META[r.record_type] ?? TYPE_META.medical_history;
            const Icon = meta.icon;
            return (
              <Link
                key={r.id}
                to="/records/$id"
                params={{ id: r.id }}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:shadow-elev"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {meta.label} · {r.hospital || "未填医院"} · {r.visit_date || new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "待识别", cls: "bg-muted text-muted-foreground" },
    processing: { label: "识别中", cls: "bg-amber-100 text-amber-700" },
    completed: { label: "已完成", cls: "bg-emerald-100 text-emerald-700" },
    failed: { label: "失败", cls: "bg-rose-100 text-rose-700" },
  };
  const m = map[status] ?? map.pending;
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${m.cls}`}>{m.label}</span>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-gradient-card p-8 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-deep">
        <FileText className="h-7 w-7" />
      </div>
      <div className="text-sm font-semibold">还没有病历档案</div>
      <p className="mx-auto mt-1 max-w-[240px] text-xs text-muted-foreground">
        拍照上传病历、化验单、入院单或手术报告，AI 自动结构化关键信息。
      </p>
      <Link
        to="/records/upload"
        className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-xs font-medium text-primary-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> 立即上传
      </Link>
    </div>
  );
}