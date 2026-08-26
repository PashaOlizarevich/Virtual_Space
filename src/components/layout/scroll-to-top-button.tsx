"use client";

import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      className="site-footer__to-top"
      type="button"
      onClick={scrollToTop}
      aria-label="Прокрутить страницу наверх"
    >
      <ArrowUp aria-hidden="true" strokeWidth={1.5} />
    </button>
  );
}
