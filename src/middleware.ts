// middleware.ts (di root project)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl;
		const token = req.nextauth.token;

		if (pathname === '/login' && token) {
			if (token.role === 'admin') {
				return NextResponse.redirect(new URL('/admin/example', req.url));
			} else {
				return NextResponse.redirect(new URL('/', req.url));
			}
		}

		if (pathname.startsWith('/admin') && token?.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}

		if (pathname.startsWith('/api/produk')) {
			const method = req.method;

			if (method === 'GET') {
				return NextResponse.next();
			}

			if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
				if (!token) {
					return NextResponse.json(
						{
							success: false,
							message: 'Unauthorized. Please login first.'
						},
						{ status: 401 }
					);
				}

				if (token.role !== 'admin') {
					return NextResponse.json(
						{
							success: false,
							message: 'Forbidden. Admin access required.'
						},
						{ status: 403 }
					);
				}
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl;

				if (pathname.startsWith('/admin')) {
					return !!token;
				}

				if (pathname.startsWith('/api/produk')) {
					return true;
				}

				return true;
			}
		}
	}
);

export const config = {
	matcher: ['/admin/:path*', '/login', '/', '/api/produk/:path*']
};
