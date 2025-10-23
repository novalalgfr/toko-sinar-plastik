import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/* ==========================================================
   INTERFACE DATA
   ========================================================== */
interface ProdukItem extends RowDataPacket {
	id_produk: number;
	nama_produk: string;
	jumlah: number;
	subtotal: number;
}

interface Pesanan extends RowDataPacket {
	id_pesanan: number;
	nama_pelanggan: string;
	nomor_telpon: string;
	email: string | null;
	alamat: string;
	tanggal_pesanan: Date;
	status_pesanan: string;
	kurir: string;
	no_resi: string | null;
	total_harga?: number;
	created_at: Date;
	updated_at: Date;
	produk?: ProdukItem[];
}

interface CountResult extends RowDataPacket {
	total: number;
}

interface ProdukInput {
	id_produk: number;
	harga: number;
	jumlah: number;
}

type QueryParam = string | number | null;

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
   GET — Ambil semua pesanan dengan pagination (Public)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		const nama = searchParams.get('nama'); // 👈 Tambah parameter nama pelanggan

		// CASE 1: Jika ada parameter ID (by id_pesanan)
		if (id) {
			console.log('📥 Mengambil pesanan dengan ID:', id);

			const pesananId = parseInt(id);
			if (isNaN(pesananId)) {
				return NextResponse.json({ message: 'ID pesanan tidak valid' }, { status: 400 });
			}

			const [rows] = await db.execute<Pesanan[]>(
				'SELECT * FROM pesanan WHERE id_pesanan = ?',
				[pesananId]
			);

			if (rows.length === 0) {
				return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 });
			}

			const pesanan = rows[0];

			// Ambil detail produk untuk pesanan ini
			const [produkRows] = await db.execute<ProdukItem[]>(
				`
				SELECT dp.id_produk, pr.nama_produk, dp.jumlah, dp.subtotal
				FROM detail_pesanan dp
				JOIN produk pr ON dp.id_produk = pr.id_produk
				WHERE dp.id_pesanan = ?
				`,
				[pesanan.id_pesanan]
			);

			pesanan.produk = produkRows;
			pesanan.total_harga = produkRows.reduce((sum, p) => sum + Number(p.subtotal), 0);

			return NextResponse.json({ success: true, data: pesanan }, { status: 200 });
		}

		// CASE 2: Jika ada parameter nama (by nama pelanggan)
		if (nama) {
			console.log('📥 Mengambil pesanan dengan nama pelanggan:', nama);

			const [rows] = await db.execute<Pesanan[]>(
				'SELECT * FROM pesanan WHERE nama_pelanggan = ?',
				[nama]
			);

			if (rows.length === 0) {
				return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 });
			}

			// Ambil hanya satu pesanan (jika lebih dari satu dengan nama yang sama)
			const pesanan = rows[0];

			// Ambil detail produk untuk pesanan ini
			const [produkRows] = await db.execute<ProdukItem[]>(
				`
				SELECT dp.id_produk, pr.nama_produk, dp.jumlah, dp.subtotal
				FROM detail_pesanan dp
				JOIN produk pr ON dp.id_produk = pr.id_produk
				WHERE dp.id_pesanan = ?
				`,
				[pesanan.id_pesanan]
			);

			pesanan.produk = produkRows;
			pesanan.total_harga = produkRows.reduce((sum, p) => sum + Number(p.subtotal), 0);

			return NextResponse.json({ success: true, data: pesanan }, { status: 200 });
		}

		// CASE 3: Jika tidak ada ID atau nama → list dengan pagination
		console.log('📥 Mengambil daftar pesanan dengan pagination...');

		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const status = searchParams.get('status') || '';

		if (page < 1 || limit < 1) {
			return NextResponse.json({ message: 'Page dan limit harus lebih dari 0' }, { status: 400 });
		}

		if (limit > 100) {
			return NextResponse.json({ message: 'Limit maksimal adalah 100' }, { status: 400 });
		}

		const offset = (page - 1) * limit;

		let countQuery = 'SELECT COUNT(*) AS total FROM pesanan';
		const countParams: QueryParam[] = [];

		let dataQuery = 'SELECT * FROM pesanan';
		const dataParams: QueryParam[] = [];

		const conditions: string[] = [];

		if (search) {
			conditions.push('(nama_pelanggan LIKE ? OR nomor_telpon LIKE ? OR email LIKE ? OR no_resi LIKE ?)');
			const searchParam = `%${search}%`;
			countParams.push(searchParam, searchParam, searchParam, searchParam);
			dataParams.push(searchParam, searchParam, searchParam, searchParam);
		}

		if (status) {
			conditions.push('status_pesanan = ?');
			countParams.push(status);
			dataParams.push(status);
		}

		if (conditions.length > 0) {
			const whereClause = ' WHERE ' + conditions.join(' AND ');
			countQuery += whereClause;
			dataQuery += whereClause;
		}

		dataQuery += ' ORDER BY id_pesanan DESC LIMIT ? OFFSET ?';
		dataParams.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, countParams);
		const [pesananRows] = await db.execute<Pesanan[]>(dataQuery, dataParams);

		// Ambil detail produk untuk setiap pesanan
		for (const pesanan of pesananRows) {
			const [produkRows] = await db.execute<ProdukItem[]>(
				`
				SELECT dp.id_produk, pr.nama_produk, dp.jumlah, dp.subtotal
				FROM detail_pesanan dp
				JOIN produk pr ON dp.id_produk = pr.id_produk
				WHERE dp.id_pesanan = ?
				`,
				[pesanan.id_pesanan]
			);

			pesanan.produk = produkRows;
			pesanan.total_harga = produkRows.reduce((sum, p) => sum + Number(p.subtotal), 0);
		}

		const totalItems = countRow.total;
		const totalPages = Math.ceil(totalItems / limit);

		return NextResponse.json(
			{
				success: true,
				data: pesananRows,
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
		console.error('❌ Gagal mengambil data pesanan:', error);
		return NextResponse.json({ message: 'Gagal mengambil data pesanan' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Tambah pesanan baru (Admin Only)
   ========================================================== */
export async function POST(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		const body = await request.json();
		const {
			nama_pelanggan,
			nomor_telpon,
			email,
			alamat,
			status_pesanan = 'Pending',
			kurir = 'Lainnya',
			no_resi = null,
			produk
		}: {
			nama_pelanggan: string;
			nomor_telpon: string;
			email?: string;
			alamat: string;
			status_pesanan?: string;
			kurir?: string;
			no_resi?: string | null;
			produk: ProdukInput[];
		} = body;

		// Validasi input
		if (!nama_pelanggan || !nomor_telpon || !alamat || !produk || produk.length === 0) {
			return NextResponse.json(
				{ message: 'Data tidak lengkap. Pastikan nama, nomor telpon, alamat, dan produk terisi.' },
				{ status: 400 }
			);
		}

		// Simpan ke tabel pesanan dulu
		const [result] = await db.execute<ResultSetHeader>(
			`INSERT INTO pesanan (nama_pelanggan, nomor_telpon, email, alamat, status_pesanan, kurir, no_resi)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[nama_pelanggan, nomor_telpon, email, alamat, status_pesanan, kurir, no_resi]
		);

		const id_pesanan = result.insertId;

		// Simpan detail produk
		let total_harga = 0;
		for (const item of produk) {
			const subtotal = item.harga * item.jumlah;
			total_harga += subtotal;

			await db.execute(
				`INSERT INTO detail_pesanan (id_pesanan, id_produk, jumlah, subtotal)
				 VALUES (?, ?, ?, ?)`,
				[id_pesanan, item.id_produk, item.jumlah, subtotal]
			);
		}

		// Update total harga di tabel pesanan
		await db.execute(`UPDATE pesanan SET total_harga = ? WHERE id_pesanan = ?`, [total_harga, id_pesanan]);

		return NextResponse.json({ message: 'Pesanan berhasil dibuat', id_pesanan, total_harga }, { status: 201 });
	} catch (error) {
		console.error('Error creating pesanan:', error);
		return NextResponse.json({ message: 'Gagal menambahkan pesanan' }, { status: 500 });
	}
}

/* ==========================================================
   PATCH — Update status pesanan (Admin Only)
   ========================================================== */
export async function PATCH(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		const body = await request.json();
		const {
			id_pesanan,
			status_pesanan,
			no_resi,
			kurir
		}: {
			id_pesanan: number;
			status_pesanan?: string;
			no_resi?: string | null;
			kurir?: string;
		} = body;

		if (!id_pesanan) {
			return NextResponse.json({ message: 'ID pesanan tidak boleh kosong' }, { status: 400 });
		}

		// Validasi status pesanan
		const validStatuses = ['Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
		if (status_pesanan && !validStatuses.includes(status_pesanan)) {
			return NextResponse.json(
				{ message: `Status tidak valid. Status yang diperbolehkan: ${validStatuses.join(', ')}` },
				{ status: 400 }
			);
		}

		// Cek apakah pesanan ada
		const [rows] = await db.execute<Pesanan[]>('SELECT * FROM pesanan WHERE id_pesanan = ?', [id_pesanan]);

		if (rows.length === 0) {
			return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 });
		}

		// Build dynamic update query
		const updates: string[] = [];
		const params: QueryParam[] = [];

		if (status_pesanan) {
			updates.push('status_pesanan = ?');
			params.push(status_pesanan);
		}

		if (no_resi !== undefined) {
			updates.push('no_resi = ?');
			params.push(no_resi);
		}

		if (kurir) {
			updates.push('kurir = ?');
			params.push(kurir);
		}

		if (updates.length === 0) {
			return NextResponse.json({ message: 'Tidak ada data yang diupdate' }, { status: 400 });
		}

		updates.push('updated_at = NOW()');
		params.push(id_pesanan);

		const query = `UPDATE pesanan SET ${updates.join(', ')} WHERE id_pesanan = ?`;
		await db.execute(query, params);

		return NextResponse.json({ message: 'Status pesanan berhasil diupdate' }, { status: 200 });
	} catch (error) {
		console.error('Error updating pesanan:', error);
		return NextResponse.json({ message: 'Gagal mengupdate status pesanan' }, { status: 500 });
	}
}
