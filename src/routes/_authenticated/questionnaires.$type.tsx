import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/questionnaires/$type")({
  head: () => ({ meta: [{ title: "填写量表 · 心安管家" }] }),
  component: QuestionnaireForm,
});

type Q = { id: string; text: string; options: { label: string; score: number }[] };
const FOUR = [
  { label: "从不", score: 0 },
  { label: "偶尔", score: 1 },
  { label: "经常", score: 2 },
  { label: "总是", score: 3 },
];
const YN = [
  { label: "是", score: 1 },
  { label: "否", score: 0 },
];

const FORMS: Record<string, { title: string; questions: Q[] }> = {
  hypertension: {
    title: "高血压自我管理评估",
    questions: [
      { id: "h1", text: "我能按时按量服用降压药", options: FOUR },
      { id: "h2", text: "我每天监测并记录血压", options: FOUR },
      { id: "h3", text: "我饮食低盐（每日 < 5g 食盐）", options: FOUR },
      { id: "h4", text: "我有规律的中等强度运动", options: FOUR },
      { id: "h5", text: "我控制体重并戒烟限酒", options: FOUR },
      { id: "h6", text: "我了解血压控制目标", options: YN },
      { id: "h7", text: "近期出现头晕 / 头痛 / 胸闷", options: FOUR },
      { id: "h8", text: "我能按时复诊", options: FOUR },
    ],
  },
  chd: {
    title: "冠心病症状量表",
    questions: [
      { id: "c1", text: "过去一周出现胸痛或胸闷", options: FOUR },
      { id: "c2", text: "活动时出现心绞痛症状", options: FOUR },
      { id: "c3", text: "静息时出现心绞痛", options: FOUR },
      { id: "c4", text: "因症状影响日常活动", options: FOUR },
      { id: "c5", text: "症状影响情绪或睡眠", options: FOUR },
      { id: "c6", text: "携带急救药物（如硝酸甘油）", options: YN },
      { id: "c7", text: "症状发作频率较前增加", options: FOUR },
      { id: "c8", text: "出汗 / 心悸 / 气短", options: FOUR },
      { id: "c9", text: "对未来发作感到担忧", options: FOUR },
      { id: "c10", text: "按时服用抗血小板药物", options: FOUR },
    ],
  },
  heart_failure: {
    title: "心衰生活质量量表 (MLHFQ 简版)",
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `f${i + 1}`,
      text: [
        "下肢水肿影响活动",
        "夜间因呼吸困难醒来",
        "爬楼或快走时气短",
        "日常活动后疲劳",
        "需要白天休息",
        "影响外出与社交",
        "影响工作或家务",
        "影响食欲",
        "感到情绪低落",
        "感到担忧或焦虑",
      ][i],
      options: FOUR,
    })),
  },
  lifestyle: {
    title: "心血管生活方式评估",
    questions: [
      { id: "l1", text: "每周中等强度运动 ≥ 150 分钟", options: YN },
      { id: "l2", text: "每日饮食包含蔬果 ≥ 5 份", options: YN },
      { id: "l3", text: "每日盐摄入 < 5g", options: YN },
      { id: "l4", text: "BMI < 24", options: YN },
      { id: "l5", text: "不吸烟", options: YN },
      { id: "l6", text: "酒精摄入有节制", options: YN },
      { id: "l7", text: "睡眠 7-8 小时", options: YN },
      { id: "l8", text: "压力管理良好", options: YN },
      { id: "l9", text: "定期体检", options: YN },
      { id: "l10", text: "按医嘱服药", options: YN },
      { id: "l11", text: "情绪稳定", options: YN },
      { id: "l12", text: "有亲友支持", options: YN },
    ],
  },
};

function QuestionnaireForm() {
  const { type } = Route.useParams();
  const navigate = useNavigate();
  const form = FORMS[type];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  if (!form) {
    return (
      <div>
        <PageHeader title="量表不存在" back="/questionnaires" />
      </div>
    );
  }

  const filled = Object.keys(answers).length;
  const total = form.questions.length;
  const score = Object.values(answers).reduce((s, v) => s + v, 0);

  const submit = async () => {
    if (filled < total) return toast.error("还有题目未完成");
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("未登录");
      const summary = interpret(type, score, total);
      const { error } = await supabase.from("questionnaire_responses").insert({
        user_id: uid,
        questionnaire_type: type,
        title: form.title,
        answers: answers as never,
        score,
        result_summary: summary,
      });
      if (error) throw error;
      toast.success("提交成功");
      navigate({ to: "/questionnaires" });
    } catch (e: any) {
      toast.error(e?.message || "提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={form.title}
        subtitle={`已完成 ${filled}/${total}`}
        back="/questionnaires"
      />
      <div className="sticky top-[57px] z-20 h-1 bg-muted">
        <div className="h-full bg-brand transition-all" style={{ width: `${(filled / total) * 100}%` }} />
      </div>
      <div className="space-y-3 px-4 py-4 pb-28">
        {form.questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex gap-2">
              <span className="text-xs font-semibold text-brand">{i + 1}</span>
              <span className="text-sm font-medium">{q.text}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {q.options.map((o) => {
                const active = answers[q.id] === o.score;
                return (
                  <button
                    key={o.label}
                    onClick={() => setAnswers({ ...answers, [q.id]: o.score })}
                    className={
                      "rounded-xl border px-3 py-2 text-xs transition " +
                      (active
                        ? "border-brand bg-brand text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-brand/50")
                    }
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={submit}
          disabled={loading || filled < total}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-primary-foreground shadow-elev disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          提交（当前得分 {score}）
        </button>
      </div>
    </div>
  );
}

function interpret(type: string, score: number, total: number) {
  if (type === "lifestyle") {
    if (score >= total * 0.8) return "生活方式优秀";
    if (score >= total * 0.5) return "生活方式中等，仍有改善空间";
    return "生活方式风险偏高，建议结合方案改进";
  }
  const max = total * 3;
  const pct = score / max;
  if (type === "hypertension") {
    if (pct >= 0.7) return "自我管理较好";
    if (pct >= 0.4) return "管理一般，建议加强";
    return "管理较差，需重视";
  }
  if (pct >= 0.6) return "症状负担较重，建议就诊";
  if (pct >= 0.3) return "症状中等，注意监测";
  return "症状较轻";
}