// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // This callback is called whenever a user signs in
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists in our database
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          // Create user if doesn't exist
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
              }
            });
            console.log('User created during sign in:', dbUser);
          }
        } catch (error) {
          console.error('Error handling user in signIn callback:', error);
          // Don't prevent sign in even if database operation fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      // You can add additional data to the session here if needed
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // This event is triggered after successful sign in
      console.log('User signed in:', user.email);
    },
    async signOut({ session, token }) {
      // This event is triggered when user signs out
      console.log('User signed out');
    },
  },
});

export { handler as GET, handler as POST };