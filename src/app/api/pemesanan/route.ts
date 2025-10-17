/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/* ==========================================================
   INTERFACE DATA
   ========================================================== */
interface Pemesanan extends RowDataPacket {
	id_pemesanan: number;
	nama_pelanggan: string;
	id_produk: number | null;
	nomor_telpon: string;
	email: string | null;
	alamat: string;
	tanggal_pesanan: Date;
	status_pemesanan: 'Pending' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
	created_at: Date;
	updated_at: Date;
	nama_produk?: string;
}

interface CountResult extends RowDataPacket {
	total: number;
}

/* ==========================================================
   GET — Ambil data pemesanan (pagination + pencarian)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching pemesanan data...');

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
			FROM Pemesanan p
			LEFT JOIN Produk pr ON p.id_produk = pr.id_produk
		`;
		let dataQuery = `
			SELECT p.*, pr.nama_produk 
			FROM Pemesanan p
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

		dataQuery += ` ORDER BY p.id_pemesanan DESC LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, params.slice(0, -2));
		const [rows] = await db.execute<Pemesanan[]>(dataQuery, params);

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
		console.error('Error fetching pemesanan:', error);
		return NextResponse.json({ message: 'Gagal mengambil data pemesanan' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Tambah data pemesanan baru
   ========================================================== */
export async function POST(request: NextRequest) {
	try {
		console.log('Creating new pemesanan...');

		const formData = await request.formData();

		const nama_pelanggan = formData.get('nama_pelanggan') as string;
		const id_produk = formData.get('id_produk') ? parseInt(formData.get('id_produk') as string) : null;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string;
		const alamat = formData.get('alamat') as string;
		const status_pemesanan = (formData.get('status_pemesanan') as string) || 'Pending';

		const [result] = await db.execute<ResultSetHeader>(
			`INSERT INTO Pemesanan 
			 (nama_pelanggan, id_produk, nomor_telpon, email, alamat, status_pemesanan) 
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[nama_pelanggan, id_produk, nomor_telpon, email, alamat, status_pemesanan]
		);

		console.log('Pemesanan created with ID:', result.insertId);

		return NextResponse.json(
			{
				message: 'Pemesanan berhasil ditambahkan',
				id: result.insertId
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating pemesanan:', error);
		return NextResponse.json({ message: 'Gagal menambahkan pemesanan' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update data pemesanan
   ========================================================== */
export async function PUT(request: NextRequest) {
	try {
		console.log('Updating pemesanan...');

		const formData = await request.formData();

		const id_pemesanan = parseInt(formData.get('id_pemesanan') as string);
		const nama_pelanggan = formData.get('nama_pelanggan') as string;
		const id_produk = formData.get('id_produk') ? parseInt(formData.get('id_produk') as string) : null;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string;
		const alamat = formData.get('alamat') as string;
		const status_pemesanan = (formData.get('status_pemesanan') as string) || 'Pending';

		await db.execute<ResultSetHeader>(
			`UPDATE Pemesanan 
			 SET nama_pelanggan=?, id_produk=?, nomor_telpon=?, email=?, alamat=?, status_pemesanan=? 
			 WHERE id_pemesanan=?`,
			[nama_pelanggan, id_produk, nomor_telpon, email, alamat, status_pemesanan, id_pemesanan]
		);

		console.log('Pemesanan updated successfully');

		return NextResponse.json({ message: 'Pemesanan berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('Error updating pemesanan:', error);
		return NextResponse.json({ message: 'Gagal memperbarui pemesanan' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus pemesanan
   ========================================================== */
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id_pemesanan = searchParams.get('id_pemesanan');

		if (!id_pemesanan) {
			return NextResponse.json({ message: 'ID pemesanan wajib diisi' }, { status: 400 });
		}

		await db.execute<ResultSetHeader>(
			'DELETE FROM Pemesanan WHERE id_pemesanan = ?',
			[id_pemesanan]
		);

		console.log('Pemesanan deleted successfully');

		return NextResponse.json({ message: 'Pemesanan berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting pemesanan:', error);
		return NextResponse.json({ message: 'Gagal menghapus pemesanan' }, { status: 500 });
	}
}
