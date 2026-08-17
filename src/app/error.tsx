"use client";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackState, RetryButton } from "@/components/ui/feedback-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell>
      <Container className="route-state">
        <FeedbackState
          kind="error"
          title="Что-то пошло не так"
          description="Не удалось открыть страницу. Попробуйте загрузить её ещё раз."
          action={<RetryButton onRetry={reset} />}
        />
      </Container>
    </PageShell>
  );
}
