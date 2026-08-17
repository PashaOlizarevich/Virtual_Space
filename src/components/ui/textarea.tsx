import type { ComponentProps } from "react";

import { cn } from "@/shared/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn("textarea", className)} {...props} />;
}
