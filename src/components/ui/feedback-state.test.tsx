import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { FeedbackState, LoadingState } from "@/components/ui/feedback-state";

describe("feedback states", () => {
  it("renders accessible empty state content", () => {
    const markup = renderToStaticMarkup(
      <FeedbackState title="Ничего не найдено" description="Измените параметры поиска." />,
    );

    expect(markup).toContain("Ничего не найдено");
    expect(markup).toContain('aria-labelledby="empty-state-title"');
  });

  it("announces loading without exposing skeletons", () => {
    const markup = renderToStaticMarkup(<LoadingState label="Загрузка каталога" />);

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Загрузка каталога");
    expect(markup).toContain('aria-hidden="true"');
  });
});
