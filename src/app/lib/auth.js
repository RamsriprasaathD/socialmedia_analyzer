// src/lib/auth.ts
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // Use DB sessions (via Prisma Session model)
  session: {
    strategy: "database",
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; // ✅ attach Prisma User ID
      }
      return session;
    },
  },
};
