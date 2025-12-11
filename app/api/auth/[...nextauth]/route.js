import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        nipd: { label: 'NIPD', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          let user;
          
          if (credentials.email) {
            user = await query(
              `SELECT u.*, r.name as role_name FROM users u 
               JOIN roles r ON u.role_id = r.id 
               WHERE u.email = ?`,
              [credentials.email]
            );
          } else if (credentials.nipd) {
            user = await query(
              `SELECT u.*, r.name as role_name FROM users u 
               JOIN roles r ON u.role_id = r.id 
               WHERE u.nipd = ?`,
              [credentials.nipd]
            );
          }

          if (user.length === 0) {
            throw new Error('User tidak ditemukan');
          }

          user = user[0];

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!passwordMatch) {
            throw new Error('Password salah');
          }

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            nipd: user.nipd,
            role: user.role_name,
            profile_photo: user.profile_photo
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.nipd = user.nipd;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.nipd = token.nipd;
      session.user.id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  },
  session: {
    strategy: 'jwt'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export { authOptions }; // <-- WAJIB!
