import { PrismaAdapter } from "@auth/prisma-adapter";
import { DefaultSession, NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      if ((user && account) || user?.id) {
        const rawToken = jwt.sign(
          {
            userId: user?.id || token.userId,
            email: user?.email || token.email,
            name: user?.name || token.name,
          },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "7d" }
        );
        token.rawToken = rawToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId as string;
      if (token.rawToken) {
        session.rawToken = token.rawToken as string;
      }
      return session;
    },
  },
};
