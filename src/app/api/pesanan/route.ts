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
	status_pemesanan: string;
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
		const nama = searchParams.get('nama');

		// Ambil pagination params
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const status = searchParams.get('status') || '';

		if (page < 1 || limit < 1) {
			return NextResponse.json({ message: 'Page dan limit harus lebih dari 0' }, { status: 400 });
		}

		if (limit > 100) {
			return NextResponse.json({ message: 'Limit maksimal adalah 100' }, { status: 400 });
		}

		const offset = (page - 1) * limit;

		// CASE 1: Jika ada parameter ID (by id_pesanan) dengan pagination
		if (id) {
			console.log('📥 Mengambil pesanan dengan ID:', id);

			const [rows] = await db.execute<Pesanan[]>('SELECT * FROM pesanan WHERE id_pesanan = ?', [id]);

			if (rows.length === 0) {
				// Kembalikan response kosong dengan pagination
				return NextResponse.json(
					{
						success: true,
						data: [],
						pagination: {
							currentPage: page,
							totalPages: 0,
							totalItems: 0,
							itemsPerPage: limit,
							hasNextPage: false,
							hasPrevPage: false,
							nextPage: null,
							prevPage: null
						}
					},
					{ status: 200 }
				);
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

			// Return dengan pagination (total 1 item)
			return NextResponse.json(
				{
					success: true,
					data: [pesanan],
					pagination: {
						currentPage: 1,
						totalPages: 1,
						totalItems: 1,
						itemsPerPage: limit,
						hasNextPage: false,
						hasPrevPage: false,
						nextPage: null,
						prevPage: null
					}
				},
				{ status: 200 }
			);
		}

		// CASE 2: Jika ada parameter nama (by nama pelanggan) dengan pagination
		if (nama) {
			console.log('📥 Mengambil pesanan dengan nama pelanggan:', nama);

			const [rows] = await db.execute<Pesanan[]>('SELECT * FROM pesanan WHERE nama_pelanggan = ?', [nama]);

			if (rows.length === 0) {
				// Kembalikan response kosong dengan pagination
				return NextResponse.json(
					{
						success: true,
						data: [],
						pagination: {
							currentPage: page,
							totalPages: 0,
							totalItems: 0,
							itemsPerPage: limit,
							hasNextPage: false,
							hasPrevPage: false,
							nextPage: null,
							prevPage: null
						}
					},
					{ status: 200 }
				);
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

			// Return dengan pagination (total 1 item)
			return NextResponse.json(
				{
					success: true,
					data: [pesanan],
					pagination: {
						currentPage: 1,
						totalPages: 1,
						totalItems: 1,
						itemsPerPage: limit,
						hasNextPage: false,
						hasPrevPage: false,
						nextPage: null,
						prevPage: null
					}
				},
				{ status: 200 }
			);
		}

		// CASE 3: List dengan pagination (tanpa filter khusus)
		console.log('📥 Mengambil daftar pesanan dengan pagination...');

		const search = searchParams.get('search') || '';

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
			conditions.push('status_pemesanan = ?');
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
   POST — Buat pesanan baru (Public)
   ========================================================== */
export async function POST(request: NextRequest) {
	let body;

	try {
		body = await request.json();
		console.log('📥 Raw request body:', JSON.stringify(body, null, 2));
	} catch (error) {
		console.error('⚠️ Error parsing JSON:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Request body tidak valid atau kosong',
				errorDetails: error instanceof Error ? error.message : 'Unknown parsing error'
			},
			{ status: 400 }
		);
	}

	try {
		const {
			id_pesanan,
			nama_pelanggan,
			nomor_telpon,
			email,
			alamat,
			status_pemesanan,
			kurir = 'Lainnya',
			no_resi = null,
			produk
		} = body;

		// Set default status jika tidak ada atau null
		const finalStatus =
			status_pemesanan && status_pemesanan !== 'null' ? status_pemesanan : 'Pembayaran Dikonfirmasi';

		console.log('📥 Data pesanan diterima:', {
			id_pesanan,
			nama_pelanggan,
			nomor_telpon,
			email,
			alamat,
			status_pemesanan: finalStatus,
			kurir,
			produk
		});

		// Validasi input
		if (!nama_pelanggan || !nomor_telpon || !alamat || !produk || produk.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Data tidak lengkap. Pastikan nama, nomor telpon, alamat, dan produk terisi.'
				},
				{ status: 400 }
			);
		}

		// Generate ID jika tidak ada
		const pesananId = id_pesanan || `ORDER-${Date.now()}`;

		console.log('🆔 ID Pesanan yang akan digunakan:', pesananId);

		// Simpan ke database dengan status_pemesanan
		await db.execute<ResultSetHeader>(
			`INSERT INTO pesanan (id_pesanan, nama_pelanggan, nomor_telpon, email, alamat, status_pemesanan, kurir, no_resi)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[pesananId, nama_pelanggan, nomor_telpon, email || null, alamat, finalStatus, kurir, no_resi]
		);

		console.log('✅ Pesanan berhasil disimpan ke tabel pesanan');

		// Simpan detail produk
		let total_harga = 0;
		for (const item of produk) {
			const harga = typeof item.harga === 'string' ? parseFloat(item.harga) : item.harga;
			const subtotal = harga * item.jumlah;
			total_harga += subtotal;

			console.log(
				`📦 Menyimpan produk: ID=${item.id_produk}, Jumlah=${item.jumlah}, Harga=${harga}, Subtotal=${subtotal}`
			);

			await db.execute(
				`INSERT INTO detail_pesanan (id_pesanan, id_produk, jumlah, subtotal)
				 VALUES (?, ?, ?, ?)`,
				[pesananId, item.id_produk, item.jumlah, subtotal]
			);
		}

		console.log(`💰 Total harga pesanan: Rp ${total_harga.toLocaleString('id-ID')}`);

		// Update total harga di tabel pesanan
		await db.execute(`UPDATE pesanan SET total_harga = ? WHERE id_pesanan = ?`, [total_harga, pesananId]);

		console.log('✅ Pesanan berhasil dibuat dengan lengkap');

		return NextResponse.json(
			{
				success: true,
				message: 'Pesanan berhasil dibuat',
				id_pesanan: pesananId,
				total_harga
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('❌ Error creating pesanan:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Gagal menambahkan pesanan',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
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
			status_pemesanan,
			no_resi,
			kurir
		}: {
			id_pesanan: string;
			status_pemesanan?: string;
			no_resi?: string | null;
			kurir?: string;
		} = body;

		if (!id_pesanan) {
			return NextResponse.json({ message: 'ID pesanan tidak boleh kosong' }, { status: 400 });
		}

		// Validasi status pesanan dengan alur baru
		const validStatuses = [
			'Pembayaran Dikonfirmasi',
			'Barang Dikemas',
			'Dalam Pengiriman',
			'Barang Diterima',
			'Dibatalkan'
		];

		if (status_pemesanan && !validStatuses.includes(status_pemesanan)) {
			return NextResponse.json(
				{ message: `Status tidak valid. Status yang diperbolehkan: ${validStatuses.join(', ')}` },
				{ status: 400 }
			);
		}

		// Validasi: jika status "Dalam Pengiriman", no_resi wajib diisi
		if (status_pemesanan === 'Dalam Pengiriman' && !no_resi) {
			return NextResponse.json(
				{ message: 'Nomor resi wajib diisi untuk status "Dalam Pengiriman"' },
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

		if (status_pemesanan) {
			updates.push('status_pemesanan = ?');
			params.push(status_pemesanan);
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

		console.log('✅ Status pesanan berhasil diupdate:', { id_pesanan, status_pemesanan, no_resi, kurir });

		return NextResponse.json({ message: 'Status pesanan berhasil diupdate' }, { status: 200 });
	} catch (error) {
		console.error('❌ Error updating pesanan:', error);
		return NextResponse.json({ message: 'Gagal mengupdate status pesanan' }, { status: 500 });
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
			return NextResponse.json({ message: 'ID pesanan tidak boleh kosong' }, { status: 400 });
		}

		console.log('🗑️ Menghapus pesanan dengan ID:', id_pesanan);

		// Cek apakah pesanan ada
		const [rows] = await db.execute<Pesanan[]>('SELECT * FROM pesanan WHERE id_pesanan = ?', [id_pesanan]);

		if (rows.length === 0) {
			return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 });
		}

		// Hapus detail pesanan terlebih dahulu (foreign key constraint)
		await db.execute('DELETE FROM detail_pesanan WHERE id_pesanan = ?', [id_pesanan]);
		console.log('✅ Detail pesanan berhasil dihapus');

		// Hapus pesanan
		const [result] = await db.execute<ResultSetHeader>('DELETE FROM pesanan WHERE id_pesanan = ?', [id_pesanan]);

		if (result.affectedRows === 0) {
			return NextResponse.json({ message: 'Gagal menghapus pesanan' }, { status: 500 });
		}

		console.log('✅ Pesanan berhasil dihapus');

		return NextResponse.json(
			{
				success: true,
				message: 'Pesanan berhasil dihapus'
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('❌ Error deleting pesanan:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Gagal menghapus pesanan',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}
