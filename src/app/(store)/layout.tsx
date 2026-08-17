import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";

export default function StoreLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
