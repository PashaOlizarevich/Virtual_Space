import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "USER" | "ADMIN";
    credentialsVersion: number;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "USER" | "ADMIN";
      credentialsVersion: number;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    role: "USER" | "ADMIN";
    credentialsVersion: number;
  }
}
