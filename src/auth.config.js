/**
 * Konfigurasi Auth.js yang aman untuk Edge (dipakai middleware).
 * Provider Credentials (yang butuh Prisma + bcrypt) ada di src/auth.js.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 }, // 24 jam, sama seperti sebelumnya
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET,
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
