import { z } from "zod";
import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { type DefaultSession, CredentialsSignin } from "next-auth";

import { client, dbName } from "@/db/mongo";
import { users } from "@/db/schema";
import { NextAuthConfig } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}

declare module "next-auth" {
  interface Session {
    token: {
      id: string
    }
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = "Please use the original sign-up method"
}

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});


export default { 
  adapter: MongoDBAdapter(client, {
    collections: {
      Users: 'auth_users',
      Accounts: 'auth_accounts',
      Sessions: 'auth_sessions',
      VerificationTokens: 'auth_verification_tokens'
    },
    databaseName: dbName
  }),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        pasword: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = CredentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await users.findOne({
            email
          });

        if (!user) {
          return null;
        } else if (!user.password) {
          // User exists, but no password, maybe by OAuth
          throw new InvalidLoginError();
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          user.password,
        );

        if (!passwordsMatch) {
          return null;
        }

        return user;
      },
    }), 
    GitHub, Google],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id as string
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
} satisfies NextAuthConfig