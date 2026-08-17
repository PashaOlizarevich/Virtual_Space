import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return <main className={cn("page-shell", className)}>{children}</main>;
}
