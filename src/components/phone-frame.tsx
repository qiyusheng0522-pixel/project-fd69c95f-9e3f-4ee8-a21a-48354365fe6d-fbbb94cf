import type { ReactNode } from "react";

/**
 * 移动端"小程序"外框。
 * - 在桌面（md+）展示 iPhone 风格的设备外框，内容区固定 390x844 可滚动；
 * - 在移动端直接铺满屏幕。
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(var(--brand)/0.18),transparent_60%),linear-gradient(180deg,#eef2f7,#dde4ee)] md:flex md:items-center md:justify-center md:p-8">
      {/* 设备外壳 */}
      <div className="relative mx-auto h-screen w-full bg-background md:h-[844px] md:w-[390px] md:rounded-[3rem] md:p-[14px] md:bg-slate-900 md:shadow-[0_40px_90px_-30px_rgba(15,23,42,0.55),0_0_0_2px_rgba(255,255,255,0.06)_inset]">
        {/* 屏幕区 */}
        <div className="relative h-full w-full overflow-hidden bg-background md:rounded-[2.25rem]">
          {/* Dynamic Island / 刘海 */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-50 hidden h-7 w-28 -translate-x-1/2 rounded-full bg-slate-900 md:block" />
          {/* 状态栏 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 hidden h-10 items-center justify-between px-7 text-[11px] font-semibold text-foreground/80 md:flex">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm border border-current" />
              <span>100%</span>
            </span>
          </div>
          {/* 内容滚动区 */}
          <div className="h-full w-full overflow-y-auto overflow-x-hidden md:pt-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}