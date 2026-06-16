import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const generateHealthPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI 服务未配置");
    const { supabase, userId } = context;

    const [{ data: profile }, { data: records }, { data: qs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("medical_records")
        .select("record_type,title,visit_date,hospital,structured_data,ocr_text")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("questionnaire_responses")
        .select("questionnaire_type,title,answers,score,result_summary,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const ctx = {
      profile: profile ?? null,
      records: records ?? [],
      questionnaires: qs ?? [],
    };

    const prompt = `你是省级三甲医院心血管科的专科健康管理师。基于以下用户的真实档案、病历OCR数据与专病量表结果，输出一份个性化、循证、可执行的全病程管理方案。请严格输出 JSON，不要 markdown，不要解释：
{
  "title": "方案标题",
  "summary": "整体情况一段话总结（中文,80-150字）",
  "risk_level": "low|medium|high",
  "advice": ["3-6条生活方式与就医建议，可执行、量化"],
  "diet": {
    "principles": ["DASH/地中海 等饮食原则要点"],
    "recommend": ["建议多吃的食物"],
    "avoid": ["建议少吃/避免"],
    "daily_sodium_mg": 数字,
    "sample_meals": [{"meal":"早餐","items":["..."]}, {"meal":"午餐","items":["..."]}, {"meal":"晚餐","items":["..."]}]
  },
  "exercise": {
    "summary": "运动总原则",
    "weekly_plan": [{"day":"周一","activity":"快走","duration_min":30,"intensity":"中等"}],
    "warnings": ["注意事项"]
  },
  "medication": {
    "notes": "用药依从性建议（不开具新处方，仅复核与依从性提示）"
  },
  "monitoring": {
    "metrics": [{"name":"血压","frequency":"每日早晚","target":"<130/80 mmHg"}]
  }
}

用户数据：${JSON.stringify(ctx).slice(0, 12000)}`;

    const provider = createLovableAiGatewayProvider(apiKey);
    const { text } = await generateText({
      model: provider("google/gemini-3-flash-preview"),
      prompt,
    });
    const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, "");
    let plan: any;
    try {
      plan = JSON.parse(cleaned);
    } catch {
      throw new Error("AI 返回格式异常，请重试");
    }

    const { data: inserted, error } = await supabase
      .from("health_plans")
      .insert({
        user_id: userId,
        title: String(plan.title ?? "心血管健康管理方案"),
        summary: String(plan.summary ?? ""),
        risk_level: String(plan.risk_level ?? "medium"),
        advice: plan.advice ?? null,
        diet: plan.diet ?? null,
        exercise: plan.exercise ?? null,
        medication: plan.medication ?? null,
        monitoring: plan.monitoring ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: inserted.id };
  });