import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const RECORD_LABELS: Record<string, string> = {
  medical_history: "病历",
  lab_report: "化验单",
  admission: "入院单",
  surgery: "手术报告",
};

function systemPrompt(recordType: string) {
  const label = RECORD_LABELS[recordType] ?? "医疗文档";
  return `你是一名资深心血管科医疗信息处理助手，需要从${label}图片中识别并结构化关键信息。请仅输出严格的 JSON（不要任何解释、不要 markdown 代码块），字段如下：
{
  "summary": "用中文一句话总结",
  "hospital": "医院名称，如无则留空",
  "department": "科室",
  "doctor": "医生姓名",
  "visit_date": "就诊/检查日期 YYYY-MM-DD",
  "diagnosis": ["主要诊断列表"],
  "lab_results": [{"name":"项目","value":"数值","unit":"单位","reference":"参考范围","abnormal":true/false}],
  "medications": [{"name":"药品","dosage":"用法用量"}],
  "procedures": ["手术或操作"],
  "raw_text": "原始可读文本（提取出的全部主要文字）"
}
无法识别的字段保留空字符串或空数组。`;
}

export const processRecordOcr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ recordId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI 服务未配置");

    const { supabase, userId } = context;

    const { data: record, error: rErr } = await supabase
      .from("medical_records")
      .select("id, record_type, image_path, user_id")
      .eq("id", data.recordId)
      .single();
    if (rErr || !record) throw new Error("病历不存在");
    if (record.user_id !== userId) throw new Error("无权限");
    if (!record.image_path) throw new Error("未上传图片");

    await supabase.from("medical_records").update({ status: "processing" }).eq("id", data.recordId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("medical-records")
      .createSignedUrl(record.image_path, 600);
    if (sErr || !signed) throw new Error("无法读取图片");

    // fetch image and base64 it for the model
    const imgRes = await fetch(signed.signedUrl);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const b64 = buf.toString("base64");
    const mime = imgRes.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${mime};base64,${b64}`;

    try {
      const provider = createLovableAiGatewayProvider(apiKey);
      const model = provider("google/gemini-3-flash-preview");
      const { text } = await generateText({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt(record.record_type) },
              { type: "image", image: dataUrl },
            ],
          },
        ],
      });

      let parsed: Record<string, unknown> = {};
      const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, "");
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { raw_text: text };
      }

      const updates: Record<string, unknown> = {
        ocr_text: typeof parsed.raw_text === "string" ? parsed.raw_text : text,
        structured_data: parsed,
        status: "completed",
      };
      if (typeof parsed.hospital === "string" && parsed.hospital) updates.hospital = parsed.hospital;
      if (typeof parsed.department === "string" && parsed.department) updates.department = parsed.department;
      if (typeof parsed.doctor === "string" && parsed.doctor) updates.doctor = parsed.doctor;
      if (typeof parsed.visit_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.visit_date)) {
        updates.visit_date = parsed.visit_date;
      }

      await supabase.from("medical_records").update(updates).eq("id", data.recordId);
      return { ok: true, structured: parsed };
    } catch (e) {
      await supabase
        .from("medical_records")
        .update({ status: "failed", notes: e instanceof Error ? e.message : String(e) })
        .eq("id", data.recordId);
      throw e;
    }
  });

export const getRecordSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ path: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    if (!data.path.startsWith(context.userId + "/")) throw new Error("无权限");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("medical-records")
      .createSignedUrl(data.path, 3600);
    if (error || !signed) throw new Error("无法生成访问链接");
    return { url: signed.signedUrl };
  });