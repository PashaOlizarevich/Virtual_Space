import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function StoreLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <SiteFooter />
    </>
  );
}
