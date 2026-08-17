import type { HTMLAttributes } from "react";

import { cn } from "@/shared/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...props} />;
}
