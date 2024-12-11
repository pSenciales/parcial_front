import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import axios from "axios";

const LOGS_BASE_API = process.env.NEXT_PUBLIC_LOGS_BASE_API; // Define la base de tu API en variables de entorno

const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Envía el log al servidor
        await axios.post(`${LOGS_BASE_API}`, {
          usuario: user.email, // Correo del usuario
          token: account.access_token, // Token de acceso de GitHub
          caducidad: account.expires_at
        });
        console.log("Log de inicio de sesión registrado con éxito");
        return true; // Permite el inicio de sesión
      } catch (error) {
        console.error("Error registrando el log de inicio de sesión:", error);
        return false; // Bloquea el inicio de sesión si falla el log
      }
    },
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