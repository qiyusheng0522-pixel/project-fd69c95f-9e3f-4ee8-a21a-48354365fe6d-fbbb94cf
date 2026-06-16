import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/85 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {back ? (
          <Link
            to={back}
            className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <div className="flex-1">
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}