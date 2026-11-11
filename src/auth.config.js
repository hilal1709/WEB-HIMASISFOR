// Konfigurasi Auth.js yang aman untuk Edge (dipakai middleware). Jangan impor prisma/bcrypt di sini.
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 }, // 24 jam, sama seperti sebelumnya
  pages: { signIn: "/admin/login" },
  providers: [], // diisi di src/auth.js
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
      return isAdminArea ? !!auth?.user : true;
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.userId) session.user.id = token.userId;
      if (token?.role) session.user.role = token.role;
      return session;
    },
  },
};
