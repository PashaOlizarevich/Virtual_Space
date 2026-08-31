import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authorizeAdminCredentials } from "@/modules/auth/server/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: authorizeAdminCredentials,
    }),
  ],
  pages: { signIn: "/admin" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
