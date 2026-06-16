import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/archive")({
  head: () => ({ meta: [{ title: "基础档案 · 心安管家" }] }),
  component: ArchivePage,
});

type Profile = {
  full_name?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  blood_type?: string | null;
  chronic_conditions?: string | null;
  allergies?: string | null;
  family_history?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
};

function ArchivePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["profile-full"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const [form, setForm] = useState<Profile>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("未登录");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: uid, ...form, updated_at: new Date().toISOString() } as never);
      if (error) throw error;
      toast.success("已保存");
      navigate({ to: "/profile" });
    } catch (e: any) {
      toast.error(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="基础档案" back="/profile" />
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">加载中…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="基础档案" subtitle="完善信息以获得更精准方案" back="/profile" />
      <div className="space-y-4 px-4 py-4 pb-28">
        <Section title="个人信息">
          <Field label="姓名">
            <Input value={form.full_name ?? ""} onChange={(v) => set("full_name", v)} placeholder="请输入姓名" />
          </Field>
          <Field label="性别">
            <div className="flex gap-2">
              {["男", "女"].map((g) => (
                <Chip key={g} active={form.gender === g} onClick={() => set("gender", g)}>{g}</Chip>
              ))}
            </div>
          </Field>
          <Field label="出生日期">
            <Input type="date" value={form.birth_date ?? ""} onChange={(v) => set("birth_date", v)} />
          </Field>
          <Field label="手机号">
            <Input value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="11 位手机号" />
          </Field>
        </Section>

        <Section title="身体指标">
          <div className="grid grid-cols-2 gap-3">
            <Field label="身高 (cm)">
              <Input
                type="number"
                value={form.height_cm?.toString() ?? ""}
                onChange={(v) => set("height_cm", v ? Number(v) : null)}
              />
            </Field>
            <Field label="体重 (kg)">
              <Input
                type="number"
                value={form.weight_kg?.toString() ?? ""}
                onChange={(v) => set("weight_kg", v ? Number(v) : null)}
              />
            </Field>
          </div>
          <Field label="血型">
            <div className="flex flex-wrap gap-2">
              {["A", "B", "AB", "O", "未知"].map((b) => (
                <Chip key={b} active={form.blood_type === b} onClick={() => set("blood_type", b)}>{b}</Chip>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="健康史">
          <Field label="慢性病史">
            <Textarea value={form.chronic_conditions ?? ""} onChange={(v) => set("chronic_conditions", v)} placeholder="如：高血压 10 年" />
          </Field>
          <Field label="药物 / 食物过敏">
            <Textarea value={form.allergies ?? ""} onChange={(v) => set("allergies", v)} placeholder="如：青霉素过敏" />
          </Field>
          <Field label="家族史">
            <Textarea value={form.family_history ?? ""} onChange={(v) => set("family_history", v)} placeholder="父母 / 兄弟姐妹的心血管病史等" />
          </Field>
        </Section>

        <Section title="紧急联系人">
          <Field label="姓名">
            <Input value={form.emergency_contact ?? ""} onChange={(v) => set("emergency_contact", v)} />
          </Field>
          <Field label="电话">
            <Input value={form.emergency_phone ?? ""} onChange={(v) => set("emergency_phone", v)} />
          </Field>
        </Section>
      </div>
      <div className="sticky bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={save}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-primary-foreground shadow-elev disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} 保存档案
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <div className="mb-3 text-xs font-medium text-muted-foreground">{title}</div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
function Input({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
    />
  );
}
function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
    />
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs transition " +
        (active ? "border-brand bg-brand text-primary-foreground" : "border-border bg-card text-foreground")
      }
    >
      {children}
    </button>
  );
}