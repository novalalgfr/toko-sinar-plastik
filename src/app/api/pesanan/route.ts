/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/* ==========================================================
   INTERFACE DATA
   ========================================================== */
interface Pesanan extends RowDataPacket {
	id_pesanan: number;
	nama_pelanggan: string;
	id_produk: number | null;
	nomor_telpon: string;
	email: string | null;
	alamat: string;
	tanggal_pesanan: Date;
	status_pesanan: 'Pending' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
	kurir: 'JNE' | 'J&T' | 'SiCepat' | 'POS' | 'TIKI' | 'Lainnya';
	no_resi: string | null;
	created_at: Date;
	updated_at: Date;
	nama_produk?: string;
}

interface CountResult extends RowDataPacket {
	total: number;
}

/* ==========================================================
   AUTH FUNCTION (ADMIN ONLY)
   ========================================================== */
async function checkAdminAuth(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET
	});

	if (!token) {
		return {
			authenticated: false,
			response: NextResponse.json({ message: 'Unauthorized. Please login first.' }, { status: 401 })
		};
	}

	if (token.role !== 'admin') {
		return {
			authenticated: false,
			response: NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 })
		};
	}

	return { authenticated: true, token };
}

/* ==========================================================
   GET — Ambil data pesanan (Public)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching pesanan data...');

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';

		if (page < 1 || limit < 1) {
			return NextResponse.json({ message: 'Page dan limit harus lebih dari 0' }, { status: 400 });
		}

		const offset = (page - 1) * limit;

		let countQuery = `
			SELECT COUNT(*) AS total 
			FROM Pesanan p
			LEFT JOIN Produk pr ON p.id_produk = pr.id_produk
		`;
		let dataQuery = `
			SELECT p.*, pr.nama_produk 
			FROM Pesanan p
			LEFT JOIN Produk pr ON p.id_produk = pr.id_produk
		`;
		let params: any[] = [];

		if (search) {
			const condition = ` WHERE p.nama_pelanggan LIKE ? OR pr.nama_produk LIKE ? OR p.nomor_telpon LIKE ?`;
			countQuery += condition;
			dataQuery += condition;
			const like = `%${search}%`;
			params = [like, like, like];
		}

		dataQuery += ` ORDER BY p.id_pesanan DESC LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, params.slice(0, -2));
		const [rows] = await db.execute<Pesanan[]>(dataQuery, params);

		const totalItems = countRow.total;
		const totalPages = Math.ceil(totalItems / limit);

		return NextResponse.json(
			{
				success: true,
				data: rows,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems,
					itemsPerPage: limit,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
					nextPage: page < totalPages ? page + 1 : null,
					prevPage: page > 1 ? page - 1 : null
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching pesanan:', error);
		return NextResponse.json({ message: 'Gagal mengambil data pesanan' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Tambah pesanan baru (Admin Only)
   ========================================================== */
export async function POST(request: NextRequest) {
	// Auth check
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		console.log('Creating new pesanan...');

		const formData = await request.formData();

		const nama_pelanggan = formData.get('nama_pelanggan') as string;
		const id_produk = formData.get('id_produk') ? parseInt(formData.get('id_produk') as string) : null;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string;
		const alamat = formData.get('alamat') as string;
		const status_pesanan = (formData.get('status_pesanan') as string) || 'Pending';
		const kurir = (formData.get('kurir') as string) || 'Lainnya';
		const no_resi = (formData.get('no_resi') as string) || null;

		const [result] = await db.execute<ResultSetHeader>(
			`INSERT INTO Pesanan 
			 (nama_pelanggan, id_produk, nomor_telpon, email, alamat, status_pesanan, kurir, no_resi) 
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[nama_pelanggan, id_produk, nomor_telpon, email, alamat, status_pesanan, kurir, no_resi]
		);

		return NextResponse.json({ message: 'Pesanan berhasil ditambahkan', id: result.insertId }, { status: 201 });
	} catch (error) {
		console.error('Error creating pesanan:', error);
		return NextResponse.json({ message: 'Gagal menambahkan pesanan' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update pesanan (Admin Only)
   ========================================================== */
export async function PUT(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		console.log('Updating pesanan...');

		const formData = await request.formData();

		const id_pesanan = parseInt(formData.get('id_pesanan') as string);
		const nama_pelanggan = formData.get('nama_pelanggan') as string;
		const id_produk = formData.get('id_produk') ? parseInt(formData.get('id_produk') as string) : null;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string;
		const alamat = formData.get('alamat') as string;
		const status_pesanan = (formData.get('status_pesanan') as string) || 'Pending';
		const kurir = (formData.get('kurir') as string) || 'Lainnya';
		const no_resi = (formData.get('no_resi') as string) || null;

		await db.execute<ResultSetHeader>(
			`UPDATE Pesanan 
			 SET nama_pelanggan=?, id_produk=?, nomor_telpon=?, email=?, alamat=?, status_pesanan=?, kurir=?, no_resi=? 
			 WHERE id_pesanan=?`,
			[nama_pelanggan, id_produk, nomor_telpon, email, alamat, status_pesanan, kurir, no_resi, id_pesanan]
		);

		return NextResponse.json({ message: 'Pesanan berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('Error updating pesanan:', error);
		return NextResponse.json({ message: 'Gagal memperbarui pesanan' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus pesanan (Admin Only)
   ========================================================== */
export async function DELETE(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		const { searchParams } = new URL(request.url);
		const id_pesanan = searchParams.get('id_pesanan');

		if (!id_pesanan) {
			return NextResponse.json({ message: 'ID pesanan wajib diisi' }, { status: 400 });
		}

		await db.execute<ResultSetHeader>('DELETE FROM Pesanan WHERE id_pesanan = ?', [id_pesanan]);

		return NextResponse.json({ message: 'Pesanan berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting pesanan:', error);
		return NextResponse.json({ message: 'Gagal menghapus pesanan' }, { status: 500 });
	}
}
