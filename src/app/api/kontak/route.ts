/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Kontak extends RowDataPacket {
	id_kontak: number;
	deskripsi: string | null;
	lokasi: string;
	nomor_telpon: string;
	email: string | null;
	created_at: Date;
	updated_at: Date;
}

interface CountResult extends RowDataPacket {
	total: number;
}

// Fungsi untuk cek auth ADMIN (untuk POST, PUT, DELETE)
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

	// Cek apakah role adalah admin
	if (token.role !== 'admin') {
		return {
			authenticated: false,
			response: NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 })
		};
	}

	return { authenticated: true, token };
}

/* ==========================================================
   GET — Menampilkan data kontak dengan pagination & search
   (PUBLIC - Bisa diakses tanpa login)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching kontak data...');

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';

		if (page < 1 || limit < 1) {
			return NextResponse.json({ message: 'Page dan limit harus lebih dari 0' }, { status: 400 });
		}

		if (limit > 100) {
			return NextResponse.json({ message: 'Limit maksimal adalah 100' }, { status: 400 });
		}

		const offset = (page - 1) * limit;

		let countQuery = 'SELECT COUNT(*) AS total FROM Kontak';
		let countParams: any[] = [];

		let dataQuery = 'SELECT * FROM Kontak';
		let dataParams: any[] = [];

		if (search) {
			const condition = ' WHERE lokasi LIKE ? OR nomor_telpon LIKE ? OR email LIKE ?';
			countQuery += condition;
			dataQuery += condition;
			const searchParam = `%${search}%`;
			countParams = [searchParam, searchParam, searchParam];
			dataParams = [searchParam, searchParam, searchParam];
		}

		dataQuery += ' ORDER BY id_kontak DESC LIMIT ? OFFSET ?';
		dataParams.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, countParams);
		const [rows] = await db.execute<Kontak[]>(dataQuery, dataParams);

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
		console.error('Error fetching kontak:', error);
		return NextResponse.json({ message: 'Gagal mengambil data kontak' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Menambahkan kontak baru
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function POST(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Creating new kontak...');

		const formData = await request.formData();

		const deskripsi = formData.get('deskripsi') as string;
		const lokasi = formData.get('lokasi') as string;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string | null;

		if (!lokasi || !nomor_telpon) {
			return NextResponse.json({ message: 'Lokasi dan nomor telepon wajib diisi' }, { status: 400 });
		}

		const [result] = await db.execute<ResultSetHeader>(
			'INSERT INTO Kontak (deskripsi, lokasi, nomor_telpon, email) VALUES (?, ?, ?, ?)',
			[deskripsi, lokasi, nomor_telpon, email]
		);

		console.log('Kontak inserted with ID:', result.insertId);

		return NextResponse.json(
			{
				message: 'Kontak berhasil ditambahkan',
				id: result.insertId
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating kontak:', error);
		return NextResponse.json({ message: 'Gagal menambahkan kontak' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update kontak
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function PUT(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Updating kontak...');

		const formData = await request.formData();

		const id_kontak = parseInt(formData.get('id_kontak') as string);
		const deskripsi = formData.get('deskripsi') as string;
		const lokasi = formData.get('lokasi') as string;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string | null;

		if (!id_kontak || !lokasi || !nomor_telpon) {
			return NextResponse.json({ message: 'ID, lokasi, dan nomor telepon wajib diisi' }, { status: 400 });
		}

		const [existingRows] = await db.execute<Kontak[]>('SELECT id_kontak FROM Kontak WHERE id_kontak = ?', [
			id_kontak
		]);

		if (existingRows.length === 0) {
			return NextResponse.json({ message: 'Data kontak tidak ditemukan' }, { status: 404 });
		}

		await db.execute<ResultSetHeader>(
			'UPDATE Kontak SET deskripsi=?, lokasi=?, nomor_telpon=?, email=? WHERE id_kontak=?',
			[deskripsi, lokasi, nomor_telpon, email, id_kontak]
		);

		console.log('Kontak updated successfully');

		return NextResponse.json({ message: 'Kontak berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('Error updating kontak:', error);
		return NextResponse.json({ message: 'Gagal memperbarui kontak' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus kontak
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function DELETE(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		const { searchParams } = new URL(request.url);
		const id_kontak = searchParams.get('id_kontak');

		if (!id_kontak) {
			return NextResponse.json({ message: 'ID kontak wajib diisi' }, { status: 400 });
		}

		const [existingRows] = await db.execute<Kontak[]>('SELECT id_kontak FROM Kontak WHERE id_kontak = ?', [
			id_kontak
		]);

		if (existingRows.length === 0) {
			return NextResponse.json({ message: 'Data kontak tidak ditemukan' }, { status: 404 });
		}

		await db.execute<ResultSetHeader>('DELETE FROM Kontak WHERE id_kontak = ?', [id_kontak]);

		console.log('Kontak deleted successfully');

		return NextResponse.json({ message: 'Kontak berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting kontak:', error);
		return NextResponse.json({ message: 'Gagal menghapus kontak' }, { status: 500 });
	}
}