"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function RouteTransition({ children }: Readonly<{ children: ReactNode }>) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        id="main-content"
        className="route-transition"
        tabIndex={-1}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
