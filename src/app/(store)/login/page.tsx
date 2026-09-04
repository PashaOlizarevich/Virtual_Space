import type { Metadata } from "next";
import Image from "next/image";

import { AuthForms } from "@/modules/auth/components/auth-forms";

export const metadata: Metadata = { title: "Вход" };

interface LoginPageProps {
  searchParams?: Promise<{ callbackUrl?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const callbackParam = (await searchParams)?.callbackUrl;
  const callbackUrl = typeof callbackParam === "string" ? callbackParam : undefined;
  return (
    <main className="auth-page">
      <div className="auth-page__media">
        <Image
          src="/images/auth/login-interior.png"
          alt="Светлая гостиная с модульным диваном и деревянной консолью"
          fill
          priority
          sizes="(min-width: 900px) 46vw, 100vw"
        />
      </div>
      <AuthForms callbackUrl={callbackUrl} />
    </main>
  );
}
