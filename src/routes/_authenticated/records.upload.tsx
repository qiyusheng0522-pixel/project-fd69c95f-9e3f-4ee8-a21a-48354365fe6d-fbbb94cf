import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { processRecordOcr } from "@/lib/records.functions";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/records/upload")({
  head: () => ({ meta: [{ title: "上传病历 · 心安管家" }] }),
  component: UploadPage,
});

const TYPES = [
  { id: "medical_history", label: "病历", desc: "门诊 / 出院" },
  { id: "lab_report", label: "化验单", desc: "血检 / 尿检" },
  { id: "admission", label: "入院单", desc: "住院通知" },
  { id: "surgery", label: "手术报告", desc: "术后报告" },
];

function UploadPage() {
  const navigate = useNavigate();
  const ocr = useServerFn(processRecordOcr);
  const [type, setType] = useState<string>("lab_report");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onPick = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const submit = async () => {
    if (!file) return toast.error("请先选择图片");
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("未登录");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("medical-records").upload(path, file, {
        contentType: file.type || "image/jpeg",
      });
      if (upErr) throw upErr;
      const meta = TYPES.find((t) => t.id === type)!;
      const { data: rec, error: insErr } = await supabase
        .from("medical_records")
        .insert({
          user_id: uid,
          record_type: type,
          title: title || `${meta.label} ${new Date().toLocaleDateString()}`,
          image_path: path,
          status: "pending",
        })
        .select("id")
        .single();
      if (insErr || !rec) throw insErr ?? new Error("创建失败");
      toast.success("已上传，AI 识别中…");
      await ocr({ data: { recordId: rec.id } });
      toast.success("识别完成");
      navigate({ to: "/records/$id", params: { id: rec.id } });
    } catch (e: any) {
      toast.error(e?.message || "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="新增病历" subtitle="拍照或上传，自动结构化识别" back="/records" />
      <div className="space-y-5 px-4 py-4">
        <section>
          <div className="mb-2 text-xs font-medium text-muted-foreground">资料类型</div>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => {
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={
                    "rounded-2xl border p-3 text-left transition " +
                    (active
                      ? "border-brand bg-brand-soft text-brand-deep shadow-card"
                      : "border-border bg-card text-foreground")
                  }
                >
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-medium text-muted-foreground">标题（可选）</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：2026 年 6 月生化全套"
            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
        </section>

        <section>
          <div className="mb-2 text-xs font-medium text-muted-foreground">上传图片</div>
          {preview ? (
            <div className="relative overflow-hidden rounded-2xl bg-muted">
              <img src={preview} alt="预览" className="max-h-72 w-full object-contain" />
              <button
                onClick={() => onPick(null)}
                className="absolute right-2 top-2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white"
              >
                重新选择
              </button>
            </div>
          ) : (
            <label className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground transition hover:border-brand hover:text-brand">
              <Camera className="h-7 w-7" />
              <div className="text-sm font-medium">点击拍照或选择图片</div>
              <div className="text-[11px]">支持 JPG / PNG，单张不超过 10MB</div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </section>

        <div className="rounded-2xl bg-gradient-card p-3 text-xs text-muted-foreground shadow-card">
          <div className="flex items-center gap-1.5 font-medium text-brand-deep">
            <Sparkles className="h-3.5 w-3.5" /> AI 智能识别
          </div>
          <p className="mt-1">上传后系统将自动识别医院、科室、就诊日期、诊断与化验项等关键字段。</p>
        </div>

        <button
          onClick={submit}
          disabled={loading || !file}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-primary-foreground shadow-elev disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "上传识别中…" : "上传并识别"}
        </button>
      </div>
    </div>
  );
}