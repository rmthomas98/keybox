import NextAuth from "next-auth";
import { CredentialsProvider } from "next-auth/providers";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
    },
  ],
});
