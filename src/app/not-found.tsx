import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackState } from "@/components/ui/feedback-state";

export default function NotFound() {
  return (
    <PageShell>
      <Container className="route-state">
        <FeedbackState
          title="Страница не найдена"
          description="Проверьте адрес или вернитесь на главную страницу."
          action={
            <Link className="button button--primary button--default" href="/">
              На главную
            </Link>
          }
        />
      </Container>
    </PageShell>
  );
}
import Link from "next/link";
