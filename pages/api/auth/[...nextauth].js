import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const bcrypt = require("bcryptjs");
import prisma from "../../../lib/prisma";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      async authorize(credentials) {
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user) throw new Error("No user found found with that email");
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Incorrect password");
        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.apiKey = user.apiKey;
      }
      return token;
    },
    session: ({ token, session }) => {
      if (token) {
        session.id = token.id;
        session.apiKey = token.apiKey;
      }
      return session;
    },
  },
});
