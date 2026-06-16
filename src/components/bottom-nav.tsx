import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileText, ClipboardList, HeartPulse, User } from "lucide-react";

const items = [
  { to: "/home", label: "首页", icon: Home },
  { to: "/records", label: "病历", icon: FileText },
  { to: "/plan", label: "方案", icon: HeartPulse },
  { to: "/questionnaires", label: "量表", icon: ClipboardList },
  { to: "/profile", label: "我的", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-40 w-full border-t border-border/70 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                className={
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors " +
                  (active ? "text-brand" : "text-muted-foreground hover:text-foreground")
                }
              >
                <span className={"flex h-7 w-7 items-center justify-center rounded-xl transition " + (active ? "bg-brand-soft" : "")}>
                  <Icon className={"h-4.5 w-4.5 " + (active ? "stroke-[2.5]" : "")} />
                </span>
                <span className={active ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}