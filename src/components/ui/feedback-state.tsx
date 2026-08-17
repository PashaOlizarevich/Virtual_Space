import { AlertCircle, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils";

type FeedbackStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  kind?: "empty" | "error";
};

export function FeedbackState({
  title,
  description,
  action,
  className,
  kind = "empty",
}: FeedbackStateProps) {
  const Icon = kind === "error" ? AlertCircle : PackageOpen;

  return (
    <section className={cn("feedback-state", className)} aria-labelledby={`${kind}-state-title`}>
      <Icon aria-hidden="true" className="feedback-state__icon" strokeWidth={1.5} />
      <div className="feedback-state__content">
        <h2 id={`${kind}-state-title`} className="text-heading-md">
          {title}
        </h2>
        <p className="text-body-sm text-secondary">{description}</p>
        {action ? <div className="feedback-state__action">{action}</div> : null}
      </div>
    </section>
  );
}

export function LoadingState({ label = "Загрузка данных" }: { label?: string }) {
  return (
    <section className="loading-state" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      <Skeleton className="skeleton--media" />
      <div className="loading-state__lines">
        <Skeleton className="skeleton--title" />
        <Skeleton className="skeleton--text" />
        <Skeleton className="skeleton--text-short" />
      </div>
    </section>
  );
}

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return <Button onClick={onRetry}>Повторить</Button>;
}
