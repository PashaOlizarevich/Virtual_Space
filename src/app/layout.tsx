import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";
import { RouteTransition } from "@/components/layout/route-transition";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Virtual Space",
    template: "%s — Virtual Space",
  },
  description: "Интернет-магазин современной мебели Virtual Space",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main-content">
          Перейти к основному содержимому
        </a>
        <Providers>
          <RouteTransition>{children}</RouteTransition>
        </Providers>
      </body>
    </html>
  );
}
