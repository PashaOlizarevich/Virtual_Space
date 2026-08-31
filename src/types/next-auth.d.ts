import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "USER" | "ADMIN";
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "USER" | "ADMIN";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    role: "USER" | "ADMIN";
  }
}
