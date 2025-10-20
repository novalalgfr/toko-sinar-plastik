// middleware.ts (di root project)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl;
		const token = req.nextauth.token;

		// Redirect jika sudah login dan akses /login
		if (pathname === '/login' && token) {
			if (token.role === 'admin') {
				return NextResponse.redirect(new URL('/admin/dashboard', req.url));
			} else {
				return NextResponse.redirect(new URL('/', req.url));
			}
		}

		// Proteksi halaman admin
		if (pathname.startsWith('/admin') && token?.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}

		// Fungsi helper untuk cek autentikasi API
		const checkApiAuth = (apiPath: string) => {
			if (pathname.startsWith(apiPath)) {
				const method = req.method;

				// GET adalah public, bisa diakses siapa saja
				if (method === 'GET') {
					return NextResponse.next();
				}

				// POST, PUT, DELETE harus admin
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
			return null;
		};

		// Cek autentikasi untuk semua API
		const apiPaths = ['/api/produk', '/api/beranda', '/api/kontak', '/api/kategori', '/api/pesanan'];

		for (const apiPath of apiPaths) {
			const authResponse = checkApiAuth(apiPath);
			if (authResponse) {
				return authResponse;
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl;

				// Halaman admin harus login
				if (pathname.startsWith('/admin')) {
					return !!token;
				}

				// Semua API endpoint diizinkan masuk ke middleware
				// Autentikasi dilakukan di dalam middleware function
				if (
					pathname.startsWith('/api/produk') ||
					pathname.startsWith('/api/beranda') ||
					pathname.startsWith('/api/kontak') ||
					pathname.startsWith('/api/kategori') ||
					pathname.startsWith('/api/pesanan')
				) {
					return true;
				}

				return true;
			}
		}
	}
);

export const config = {
	matcher: [
		'/admin/:path*',
		'/login',
		'/',
		'/api/produk/:path*',
		'/api/beranda/:path*',
		'/api/kontak/:path*',
		'/api/kategori/:path*',
		'/api/pesanan/:path*'
	]
};
