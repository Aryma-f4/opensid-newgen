import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: { username: credentials.username as string },
          include: { user_grup: true },
        })

        if (!user || !user.password) return null
        if (!user.active) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: String(user.id),
          name: user.nama,
          email: user.email,
          username: user.username,
          id_grup: user.id_grup,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.id_grup = (user as any).id_grup
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).username = token.username
        ;(session.user as any).id_grup = token.id_grup
      }
      return session
    },
  },
  pages: {
    signIn: "/siteman",
  },
  session: { strategy: "jwt" },
})
