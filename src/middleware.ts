// middleware.ts
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
		const checkApiAuth = (apiPath: string, allowPublicPost = false) => {
			if (pathname.startsWith(apiPath)) {
				const method = req.method;

				// GET adalah public
				if (method === 'GET') {
					return NextResponse.next();
				}

				// POST public jika allowPublicPost = true
				if (method === 'POST' && allowPublicPost) {
					return NextResponse.next();
				}

				// POST, PUT, DELETE, PATCH harus admin
				if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
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

		// ✅ ALLOW POST untuk /api/pesanan TANPA AUTH (untuk customer buat pesanan)
		if (pathname.startsWith('/api/pesanan') && req.method === 'POST') {
			return NextResponse.next();
		}

		// ✅ PATCH /api/pesanan TETAP BUTUH ADMIN AUTH
		if (pathname.startsWith('/api/pesanan') && req.method === 'PATCH') {
			if (!token || token.role !== 'admin') {
				return NextResponse.json(
					{
						success: false,
						message: 'Forbidden. Admin access required.'
					},
					{ status: 403 }
				);
			}
		}

		// Cek autentikasi untuk API lain
		const apiChecks = [
			{ path: '/api/produk', allowPublicPost: false },
			{ path: '/api/beranda', allowPublicPost: false },
			{ path: '/api/kontak', allowPublicPost: false },
			{ path: '/api/kategori', allowPublicPost: false }
		];

		for (const { path, allowPublicPost } of apiChecks) {
			const authResponse = checkApiAuth(path, allowPublicPost);
			if (authResponse) {
				return authResponse;
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ req }) => {
				const { pathname } = req.nextUrl;

				// Halaman admin harus login
				if (pathname.startsWith('/admin')) {
					return true; // Cek token dilakukan di middleware function
				}

				// Semua API endpoint diizinkan masuk
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
