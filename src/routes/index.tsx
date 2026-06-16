import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "心安管家 · 心血管全病程管理" },
      {
        name: "description",
        content: "省人民医院心血管科患者端：拍照录入病历、化验单与手术报告，结合专病量表 AI 生成个性化健康管理方案。",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
  component: () => null,
});
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            <HeartPulse className="h-3.5 w-3.5" /> 省人民医院 · 心血管科
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
            心安管家
            <br />
            <span className="text-white/85">你的心血管全病程管理伙伴</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">
            拍照录入病历、化验单与手术报告，结合基础档案与专病量表，AI 即时生成包含
            饮食、运动、用药与随访的个性化健康管理方案。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-deep shadow-elev hover:bg-white/95"
            >
              立即开始 <Sparkles className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              已有账号登录
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-xl font-semibold text-foreground">核心能力</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ScanLine, title: "OCR 病历录入", desc: "拍照上传病历、化验单、入院单、手术报告，自动结构化关键信息。" },
            { icon: ClipboardList, title: "基础档案与专病量表", desc: "完善基础档案与心衰、冠心病、高血压等量表，建立个人健康画像。" },
            { icon: Sparkles, title: "AI 个性化方案", desc: "结合档案与量表，生成饮食、运动、用药与监测的全病程管理方案。" },
            { icon: Bell, title: "用药与随访提醒", desc: "按时服药、定期复查、化验，重要事项不再遗漏。" },
            { icon: ShieldCheck, title: "隐私与安全", desc: "数据加密存储，仅本人可见，符合医疗信息保护规范。" },
            { icon: HeartPulse, title: "全病程闭环", desc: "从首次就诊到长期随访，记录、评估、干预一站式管理。" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 省人民医院 · 心血管科 全病程管理平台
      </footer>
    </div>
  );
}
