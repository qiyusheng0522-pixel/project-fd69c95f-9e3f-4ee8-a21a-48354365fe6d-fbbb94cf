import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { getRecordSignedUrl } from "@/lib/records.functions";
import { CalendarDays, Hospital, Stethoscope, FlaskConical, FileText, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/records/$id")({
  head: () => ({ meta: [{ title: "病历详情 · 心安管家" }] }),
  component: RecordDetail,
});

function RecordDetail() {
  const { id } = Route.useParams();
  const getUrl = useServerFn(getRecordSignedUrl);
  const { data: record, isLoading } = useQuery({
    queryKey: ["record", id],
    queryFn: async () =>
      (await supabase.from("medical_records").select("*").eq("id", id).maybeSingle()).data,
  });
  const { data: imgUrl } = useQuery({
    queryKey: ["record-img", record?.image_path],
    enabled: !!record?.image_path,
    queryFn: async () => (await getUrl({ data: { path: record!.image_path! } })).url,
  });

  if (isLoading) return <Skeleton />;
  if (!record)
    return (
      <div>
        <PageHeader title="病历详情" back="/records" />
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">未找到记录</div>
      </div>
    );

  const s = (record.structured_data as any) ?? {};
  const diagnosis: string[] = Array.isArray(s.diagnosis) ? s.diagnosis : [];
  const labs: any[] = Array.isArray(s.lab_results) ? s.lab_results : [];
  const meds: any[] = Array.isArray(s.medications) ? s.medications : [];
  const procs: string[] = Array.isArray(s.procedures) ? s.procedures : [];

  return (
    <div>
      <PageHeader title={record.title} subtitle="AI 结构化结果" back="/records" />
      <div className="space-y-4 px-4 py-4">
        {record.status === "processing" && (
          <div className="rounded-xl bg-amber-100 px-3 py-2 text-xs text-amber-800">AI 识别中，请稍后刷新…</div>
        )}
        {record.status === "failed" && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-800">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
            <div>识别失败：{record.notes || "请重新上传更清晰的图片"}</div>
          </div>
        )}

        {imgUrl && (
          <div className="overflow-hidden rounded-2xl bg-muted shadow-card">
            <img src={imgUrl} alt={record.title} className="max-h-72 w-full object-contain" />
          </div>
        )}

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-2 text-xs font-medium text-muted-foreground">基本信息</div>
          <div className="space-y-2 text-sm">
            <Info icon={Hospital} label="医院" value={record.hospital || s.hospital} />
            <Info icon={Stethoscope} label="科室 / 医生" value={[record.department || s.department, record.doctor || s.doctor].filter(Boolean).join(" · ")} />
            <Info icon={CalendarDays} label="就诊日期" value={record.visit_date || s.visit_date} />
          </div>
        </section>

        {s.summary && (
          <section className="rounded-2xl bg-gradient-card p-4 shadow-card">
            <div className="text-xs font-medium text-brand-deep">AI 摘要</div>
            <p className="mt-1.5 text-sm leading-relaxed">{s.summary}</p>
          </section>
        )}

        {diagnosis.length > 0 && (
          <Section title="诊断">
            <div className="flex flex-wrap gap-1.5">
              {diagnosis.map((d, i) => (
                <span key={i} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand-deep">{d}</span>
              ))}
            </div>
          </Section>
        )}

        {labs.length > 0 && (
          <Section title="化验结果" icon={FlaskConical}>
            <div className="divide-y divide-border">
              {labs.map((l, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{l.name}</div>
                    {l.reference && <div className="text-[11px] text-muted-foreground">参考：{l.reference}</div>}
                  </div>
                  <div className={"text-sm font-semibold " + (l.abnormal ? "text-destructive" : "text-foreground")}>
                    {l.value} {l.unit}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {meds.length > 0 && (
          <Section title="用药">
            <ul className="space-y-1.5 text-sm">
              {meds.map((m, i) => (
                <li key={i} className="flex justify-between">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-muted-foreground">{m.dosage}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {procs.length > 0 && (
          <Section title="手术 / 操作">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {procs.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </Section>
        )}

        {record.ocr_text && (
          <Section title="原始文本" icon={FileText}>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{record.ocr_text}</p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-20 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate">{value || "—"}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {title}
      </div>
      {children}
    </section>
  );
}

function Skeleton() {
  return (
    <div>
      <PageHeader title="加载中" back="/records" />
      <div className="space-y-3 px-4 py-4">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}