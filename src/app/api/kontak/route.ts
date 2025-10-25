/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Kontak extends RowDataPacket {
	id_kontak: number;
	deskripsi: string | null;
	lokasi: string;
	latitude: number | null;
	longitude: number | null;
	nomor_telpon: string;
	email: string | null;
	jam_operasional_weekdays: string | null;
	jam_operasional_weekend: string | null;
	created_at: Date;
	updated_at: Date;
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

	if (token.role !== 'admin') {
		return {
			authenticated: false,
			response: NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 })
		};
	}

	return { authenticated: true, token };
}

/* ==========================================================
   GET — Menampilkan data kontak
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching kontak data...');

		const { searchParams } = new URL(request.url);
		const search = searchParams.get('search') || '';

		let dataQuery = 'SELECT * FROM Kontak';
		let dataParams: any[] = [];

		if (search) {
			dataQuery += `
				WHERE lokasi LIKE ? 
				OR nomor_telpon LIKE ? 
				OR email LIKE ? 
				OR jam_operasional_weekdays LIKE ? 
				OR jam_operasional_weekend LIKE ?`;
			const searchParam = `%${search}%`;
			dataParams = [searchParam, searchParam, searchParam, searchParam, searchParam];
		}

		dataQuery += ' ORDER BY id_kontak DESC';

		const [rows] = await db.execute<Kontak[]>(dataQuery, dataParams);

		return NextResponse.json({ success: true, data: rows }, { status: 200 });
	} catch (error) {
		console.error('Error fetching kontak:', error);
		return NextResponse.json({ message: 'Gagal mengambil data kontak' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Menambahkan kontak baru
   ========================================================== */
export async function POST(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Creating new kontak...');

		const formData = await request.formData();

		const deskripsi = formData.get('deskripsi') as string;
		const lokasi = formData.get('lokasi') as string;
		const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null;
		const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string | null;
		const jam_operasional_weekdays = formData.get('jam_operasional_weekdays') as string | null;
		const jam_operasional_weekend = formData.get('jam_operasional_weekend') as string | null;

		if (!lokasi || !nomor_telpon) {
			return NextResponse.json({ message: 'Lokasi dan nomor telepon wajib diisi' }, { status: 400 });
		}

		if (latitude !== null && (latitude < -90 || latitude > 90)) {
			return NextResponse.json({ message: 'Latitude harus antara -90 dan 90' }, { status: 400 });
		}

		if (longitude !== null && (longitude < -180 || longitude > 180)) {
			return NextResponse.json({ message: 'Longitude harus antara -180 dan 180' }, { status: 400 });
		}

		const [result] = await db.execute<ResultSetHeader>(
			`INSERT INTO Kontak 
			(deskripsi, lokasi, latitude, longitude, nomor_telpon, email, jam_operasional_weekdays, jam_operasional_weekend)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[deskripsi, lokasi, latitude, longitude, nomor_telpon, email, jam_operasional_weekdays, jam_operasional_weekend]
		);

		console.log('Kontak inserted with ID:', result.insertId);

		return NextResponse.json(
			{ message: 'Kontak berhasil ditambahkan', id: result.insertId },
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating kontak:', error);
		return NextResponse.json({ message: 'Gagal menambahkan kontak' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update kontak
   ========================================================== */
export async function PUT(request: NextRequest) {
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
		const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null;
		const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null;
		const nomor_telpon = formData.get('nomor_telpon') as string;
		const email = formData.get('email') as string | null;
		const jam_operasional_weekdays = formData.get('jam_operasional_weekdays') as string | null;
		const jam_operasional_weekend = formData.get('jam_operasional_weekend') as string | null;

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
			`UPDATE Kontak 
			SET deskripsi=?, lokasi=?, latitude=?, longitude=?, nomor_telpon=?, email=?, 
			jam_operasional_weekdays=?, jam_operasional_weekend=? 
			WHERE id_kontak=?`,
			[deskripsi, lokasi, latitude, longitude, nomor_telpon, email, jam_operasional_weekdays, jam_operasional_weekend, id_kontak]
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
   ========================================================== */
export async function DELETE(request: NextRequest) {
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
