import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/utils";

export function Section({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return <section className={cn("section", className)} {...props} />;
}
