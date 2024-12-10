import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.accessToken = token.accessToken; // Agrega el token a la sesión si lo necesitas
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token; // Guarda el access_token en el JWT
      }
      return token;
    },
  },
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET, // Se recomienda definir un secreto en producción
};

const handler = NextAuth(authOptions);

// Exporta el handler con el método HTTP correspondiente
export { handler as GET, handler as POST };
