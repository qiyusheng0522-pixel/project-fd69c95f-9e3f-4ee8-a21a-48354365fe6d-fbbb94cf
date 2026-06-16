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
    <nav className="sticky bottom-0 z-40 w-full border-t border-border bg-card/95 backdrop-blur-xl">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                className={
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors " +
                  (active ? "text-brand" : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className={"h-5 w-5 " + (active ? "stroke-[2.5]" : "")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}