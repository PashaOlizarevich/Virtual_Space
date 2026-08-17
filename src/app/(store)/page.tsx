import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { FeedbackState, LoadingState } from "@/components/ui/feedback-state";

export default function HomePage() {
  return (
    <PageShell>
      <Container>
        <Section className="foundation-intro" aria-labelledby="foundation-title">
          <p className="text-label-caps text-secondary">Virtual Space</p>
          <div className="foundation-intro__content">
            <h1 id="foundation-title" className="text-display">
              Основа интерфейса
            </h1>
            <p className="text-heading-lg">Спокойное пространство для важных вещей</p>
            <p className="foundation-intro__description text-body-md text-secondary">
              Адаптивная сетка, типографика и общие состояния готовы для следующих экранов магазина.
            </p>
            <div className="foundation-intro__actions">
              <Button>Основное действие</Button>
              <Button variant="secondary">Вторичное действие</Button>
            </div>
          </div>
        </Section>

        <Section className="foundation-states" aria-labelledby="states-title">
          <div className="foundation-states__heading">
            <h2 id="states-title" className="text-heading-md">
              Системные состояния
            </h2>
            <p className="text-body-sm text-secondary">
              Единые шаблоны для загрузки, пустого результата и ошибки.
            </p>
          </div>
          <div className="foundation-states__grid">
            <LoadingState />
            <FeedbackState
              title="Ничего не найдено"
              description="Измените параметры поиска или вернитесь к каталогу."
            />
            <FeedbackState
              kind="error"
              title="Не удалось загрузить данные"
              description="Проверьте соединение и попробуйте снова."
              action={<Button>Повторить</Button>}
            />
          </div>
        </Section>
      </Container>
    </PageShell>
  );
}
