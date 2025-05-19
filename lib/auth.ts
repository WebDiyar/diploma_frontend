import { PrismaAdapter } from "@auth/prisma-adapter";
import { DefaultSession, NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

console.log("✅ NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
    rawToken?: string;
  }

  interface User {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login", // Custom error page that will display friendly error messages
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing credentials");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password)
          throw new Error("User not found or password not set");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user?.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign-in with credentials regardless of email verification
      if (credentials) {
        return true;
      }

      // For OAuth providers, check if a user with this email already exists
      if (account && account.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        // If no user exists or user exists but doesn't have a Google account
        if (!existingUser) {
          return true; // Allow sign-in & creation
        } else {
          // User exists, let's link the Google account to the existing user
          // Check if this Google account is already linked to the user
          const linkedAccount = existingUser.accounts.find(
            (acc) => acc.provider === "google",
          );

          if (!linkedAccount) {
            // Link the Google account to the existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
          return true;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      // Создаём JWT и добавляем в token
      if (!token.rawToken) {
        const payload = {
          userId: token.userId,
          email: token.email,
          name: token.name,
        };

        const rawToken = jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
          algorithm: "HS256",
          expiresIn: "7d",
        });

        token.rawToken = rawToken;
      }

      return token;
    },

    async session({ session, token }) {
      const user = await prisma.user.findUnique({
        where: { email: token?.email ?? undefined },
      });

      if (!user) {
        throw new Error("User not found");
      }

      session.user.id = token.userId as string;
      if (token.rawToken) {
        session.rawToken = token.rawToken as string;
      }
      return session;
    },
  },
};
