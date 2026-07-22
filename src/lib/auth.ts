import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  pages: {
    signIn: "/",
  },
  // basePath: `${process.env.NEXTAUTH_URL}/api/auth`,
  // basePath: `http://localme/api/auth`,
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
