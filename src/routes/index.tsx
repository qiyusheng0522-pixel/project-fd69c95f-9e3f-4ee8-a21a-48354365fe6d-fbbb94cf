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
