import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Resend from '@auth/core/providers/resend';
//import Facebook from '@auth/core/providers/facebook';
import Discord from '@auth/core/providers/discord';
import { defineConfig } from 'auth-astro';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';
import * as schema from "./src/schema";
import { type InferSelectModel } from "drizzle-orm";

export type UserFromSchema = InferSelectModel<typeof schema.users>;

declare module "@auth/core/types" {
  interface Session extends DefaultSession {
    user: UserFromSchema & DefaultSession["user"]; // Mantener otros campos de DefaultSession
  }
}

export default defineConfig({ 
  adapter: DrizzleAdapter(db, {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
    }),
  providers: [
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: import.meta.env.AUTH_GOOGLE_ID,
      clientSecret: import.meta.env.AUTH_GOOGLE_SECRET,
    }),
    Discord({
      clientId: import.meta.env.DISCORD_CLIENT_ID,
      clientSecret: import.meta.env.DISCORD_CLIENT_SECRET,
    }),
    Resend({
        from: import.meta.env.FROM_EMAIL,
    }),
  ],
  pages: {
    signIn: '/login',
    error: "/auth/error",
  },
  callbacks: {
    session({session}) {
      return {
        ...session,
        user: {
          ...session.user,
        }
      }
    },
  },
});
