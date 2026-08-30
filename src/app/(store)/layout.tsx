import type { ReactNode } from "react";
import { connection } from "next/server";

import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();

  return (
    <>
      <Header />
      {children}
      <SiteFooter />
    </>
  );
}
