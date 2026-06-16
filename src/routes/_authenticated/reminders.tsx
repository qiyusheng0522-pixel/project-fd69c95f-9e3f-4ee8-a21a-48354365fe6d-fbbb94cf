import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Pill, CalendarClock, Plus, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({ meta: [{ title: "提醒中心 · 心安管家" }] }),
  component: RemindersPage,
});

function RemindersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"meds" | "follow">("meds");
  const [open, setOpen] = useState(false);

  const { data: meds } = useQuery({
    queryKey: ["meds"],
    queryFn: async () =>
      (await supabase.from("medication_reminders").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: follows } = useQuery({
    queryKey: ["follows"],
    queryFn: async () =>
      (await supabase.from("follow_ups").select("*").order("scheduled_at", { ascending: true })).data ?? [],
  });

  return (
    <div>
      <PageHeader
        title="提醒中心"
        subtitle="用药与随访不再错过"
        right={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新增
          </button>
        }
      />
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs">
          <TabBtn active={tab === "meds"} onClick={() => setTab("meds")}>用药提醒</TabBtn>
          <TabBtn active={tab === "follow"} onClick={() => setTab("follow")}>复诊随访</TabBtn>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        {tab === "meds"
          ? meds && meds.length > 0
            ? meds.map((m) => (
                <div key={m.id} className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{m.medication_name}</span>
                      {m.active ? (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">进行中</span>
                      ) : (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">已停止</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {[m.dosage, m.frequency].filter(Boolean).join(" · ") || "未设置剂量"}
                    </div>
                    {m.times && m.times.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {m.times.map((t, i) => (
                          <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.from("medication_reminders").delete().eq("id", m.id);
                      qc.invalidateQueries({ queryKey: ["meds"] });
                      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
                    }}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            : <Empty text="暂无用药提醒" />
          : follows && follows.length > 0
            ? follows.map((f) => (
                <div key={f.id} className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{f.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(f.scheduled_at).toLocaleString()}
                      {f.follow_up_type ? ` · ${f.follow_up_type}` : ""}
                    </div>
                    {f.notes && <div className="mt-1 text-xs">{f.notes}</div>}
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.from("follow_ups").delete().eq("id", f.id);
                      qc.invalidateQueries({ queryKey: ["follows"] });
                    }}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            : <Empty text="暂无随访安排" />}
      </div>

      {open && <AddSheet tab={tab} onClose={() => setOpen(false)} />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full py-1.5 transition " + (active ? "bg-card text-brand-deep shadow-card font-semibold" : "text-muted-foreground")
      }
    >
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl bg-card p-10 text-center text-sm text-muted-foreground shadow-card">{text}</div>;
}

function AddSheet({ tab, onClose }: { tab: "meds" | "follow"; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("每日 1 次");
  const [times, setTimes] = useState("08:00");
  const [scheduled, setScheduled] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [type, setType] = useState("门诊复查");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("未登录");
      if (tab === "meds") {
        if (!name) throw new Error("请填写药品名");
        const { error } = await supabase.from("medication_reminders").insert({
          user_id: uid,
          medication_name: name,
          dosage,
          frequency,
          times: times.split(",").map((s) => s.trim()).filter(Boolean),
          active: true,
        } as never);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["meds"] });
        qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      } else {
        if (!name) throw new Error("请填写标题");
        const { error } = await supabase.from("follow_ups").insert({
          user_id: uid,
          title: name,
          follow_up_type: type,
          scheduled_at: new Date(scheduled).toISOString(),
          notes,
        } as never);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["follows"] });
      }
      toast.success("已添加");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-elev md:max-w-[390px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">{tab === "meds" ? "新增用药提醒" : "新增随访"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {tab === "meds" ? (
            <>
              <FormField label="药品名"><Inp value={name} onChange={setName} placeholder="如：阿托伐他汀" /></FormField>
              <FormField label="剂量"><Inp value={dosage} onChange={setDosage} placeholder="如：20mg" /></FormField>
              <FormField label="频次"><Inp value={frequency} onChange={setFrequency} /></FormField>
              <FormField label="服药时间（用英文逗号分隔）"><Inp value={times} onChange={setTimes} placeholder="08:00, 20:00" /></FormField>
            </>
          ) : (
            <>
              <FormField label="标题"><Inp value={name} onChange={setName} placeholder="如：心内科复诊" /></FormField>
              <FormField label="类型"><Inp value={type} onChange={setType} /></FormField>
              <FormField label="时间"><Inp value={scheduled} onChange={setScheduled} type="datetime-local" /></FormField>
              <FormField label="备注"><Inp value={notes} onChange={setNotes} placeholder="选填" /></FormField>
            </>
          )}
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-primary-foreground"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} 保存
        </button>
      </div>
    </div>
  );
}
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
function Inp({ value, onChange, type, placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
    />
  );
}