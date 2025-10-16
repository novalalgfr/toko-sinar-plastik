import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';

type UserRow = RowDataPacket & {
	id: number;
	name: string;
	email: string;
	password: string;
	role: string; // Tambahan field role
};

// Extend tipe NextAuth untuk menambahkan role
declare module 'next-auth' {
	interface User {
		id: string;
		name: string;
		email: string;
		role: string;
	}

	interface Session {
		user: {
			id: string;
			name: string;
			email: string;
			role: string;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role?: string;
		id?: string;
	}
}

const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					console.log('Missing credentials');
					return null;
				}

				try {
					console.log('=== LOGIN DEBUG ===');
					console.log('Email received:', credentials.email);

					const conn = await mysql.createConnection({
						host: process.env.DB_HOST,
						user: process.env.DB_USER,
						password: process.env.DB_PASS,
						database: process.env.DB_NAME
					});

					// Tambahkan role ke dalam query
					const [rows] = await conn.query<UserRow[]>(
						'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1',
						[credentials.email]
					);

					await conn.end();

					const user = rows[0];
					if (!user) {
						console.log('❌ User not found for email:', credentials.email);
						return null;
					}

					console.log('✅ User found:', {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role
					});

					const isPasswordValid = await compare(credentials.password, user.password);

					if (!isPasswordValid) {
						console.log('❌ Password mismatch!');
						return null;
					}

					console.log('✅ Login successful!');
					return {
						id: String(user.id),
						name: user.name,
						email: user.email,
						role: user.role // Sertakan role
					};
				} catch (error) {
					console.error('❌ Auth error:', error);
					return null;
				}
			}
		})
	],
	pages: {
		signIn: '/login'
	},
	session: {
		strategy: 'jwt'
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as string;
			}
			return session;
		},
		async redirect({ url, baseUrl }) {
			// Jika sudah authenticated, cek dari callback URL atau token
			// Redirect berdasarkan role akan dilakukan di halaman callback
			if (url.startsWith(baseUrl)) {
				return url;
			}
			return baseUrl;
		}
	}
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
