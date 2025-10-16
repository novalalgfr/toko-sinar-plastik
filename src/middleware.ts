// middleware.ts (di root project)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl;
		const token = req.nextauth.token;

		// Jika sudah login dan mengakses /login, redirect berdasarkan role
		if (pathname === '/login' && token) {
			if (token.role === 'admin') {
				return NextResponse.redirect(new URL('/admin/example', req.url));
			} else {
				return NextResponse.redirect(new URL('/', req.url));
			}
		}

		// Jika user mencoba akses /admin tapi bukan admin
		if (pathname.startsWith('/admin') && token?.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl;

				// Jika akses /admin, harus ada token
				if (pathname.startsWith('/admin')) {
					return !!token;
				}

				// Route lain bisa diakses
				return true;
			}
		}
	}
);

export const config = {
	matcher: ['/admin/:path*', '/login', '/']
};
