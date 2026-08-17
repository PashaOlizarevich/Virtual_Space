import type { Metadata } from "next";
import Image from "next/image";

import { AuthForms } from "@/modules/auth/components/auth-forms";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-page__media">
        <Image
          src="/images/home/hero-v2.png"
          alt="Светлая гостиная с современной мебелью"
          fill
          priority
          sizes="(min-width: 900px) 46vw, 100vw"
        />
      </div>
      <AuthForms />
    </main>
  );
}
