import type { ComponentProps } from "react";

import { cn } from "@/shared/utils";

export function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("field-group", className)} {...props} />;
}

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("field", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("field__label", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("field__description", className)} {...props} />;
}

export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("field__error", className)} role="alert" {...props} />;
}
