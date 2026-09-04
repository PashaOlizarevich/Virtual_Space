import { describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

const useReducedMotion = jest.fn<() => boolean>();

jest.mock("framer-motion", () => ({
  domAnimation: {},
  LazyMotion: ({ children }: { children: React.ReactNode }) => children,
  m: {
    div: ({
      children,
      initial,
    }: {
      children: React.ReactNode;
      initial: false | { opacity: number; y: number };
    }) => <div data-initial={JSON.stringify(initial)}>{children}</div>,
  },
  useReducedMotion,
}));

describe("RouteTransition", () => {
  it.each([false, true])(
    "keeps the initial render stable when reduced motion is %s",
    async (reduceMotion) => {
      useReducedMotion.mockReturnValue(reduceMotion);
      const { RouteTransition } = await import("@/components/layout/route-transition");

      const markup = renderToStaticMarkup(<RouteTransition>Content</RouteTransition>);

      expect(markup).toContain('data-initial="false"');
    },
  );
});
