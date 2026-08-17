import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/ui/feedback-state";

export default function Loading() {
  return (
    <PageShell>
      <Container className="route-state">
        <LoadingState label="Загрузка страницы" />
      </Container>
    </PageShell>
  );
}
