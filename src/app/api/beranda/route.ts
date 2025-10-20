/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Folder upload gambar
const uploadDir = path.join(process.cwd(), 'public/uploads');

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Interface data beranda
interface Beranda extends RowDataPacket {
	id_beranda: number;
	gambar_utama: string | null;
	gambar_1: string | null;
	gambar_2: string | null;
	kolom_title_1: string | null;
	kolom_title_2: string | null;
	kolom_title_3: string | null;
	kolom_subtitle_1: string | null;
	kolom_subtitle_2: string | null;
	kolom_subtitle_3: string | null;
	gambar_ct: string | null;
	deskripsi_ct: string | null;
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

// Fungsi untuk menambahkan URL gambar agar bisa diakses di front-end
function addImageUrl(data: Beranda[], baseUrl: string) {
	return data.map((item) => ({
		...item,
		gambar_utama_url: item.gambar_utama && item.gambar_utama !== '' ? `${baseUrl}/${item.gambar_utama}` : null,
		gambar_1_url: item.gambar_1 && item.gambar_1 !== '' ? `${baseUrl}/${item.gambar_1}` : null,
		gambar_2_url: item.gambar_2 && item.gambar_2 !== '' ? `${baseUrl}/${item.gambar_2}` : null,
		gambar_ct_url: item.gambar_ct && item.gambar_ct !== '' ? `${baseUrl}/${item.gambar_ct}` : null
	}));
}

/* ==========================================================
   GET — Ambil data beranda dengan pagination dan pencarian
   (PUBLIC - Bisa diakses tanpa login)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching beranda data...');

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

		let countQuery = 'SELECT COUNT(*) AS total FROM beranda';
		let countParams: any[] = [];

		let dataQuery = 'SELECT * FROM beranda';
		let dataParams: any[] = [];

		if (search) {
			const condition = ' WHERE kolom_title_1 LIKE ? OR kolom_title_2 LIKE ? OR kolom_title_3 LIKE ?';
			countQuery += condition;
			dataQuery += condition;
			const searchParam = `%${search}%`;
			countParams = [searchParam, searchParam, searchParam];
			dataParams = [searchParam, searchParam, searchParam];
		}

		dataQuery += ' ORDER BY id_beranda DESC LIMIT ? OFFSET ?';
		dataParams.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, countParams);
		const [rows] = await db.execute<Beranda[]>(dataQuery, dataParams);

		const totalItems = countRow.total;
		const totalPages = Math.ceil(totalItems / limit);
		const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
		const dataWithUrls = addImageUrl(rows, baseUrl);

		return NextResponse.json(
			{
				success: true,
				data: dataWithUrls,
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
		console.error('Error fetching beranda:', error);
		return NextResponse.json({ message: 'Failed to fetch beranda' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Tambah data baru + upload gambar
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function POST(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Creating new beranda...');

		const formData = await request.formData();

		const kolom_title_1 = formData.get('kolom_title_1') as string;
		const kolom_title_2 = formData.get('kolom_title_2') as string;
		const kolom_title_3 = formData.get('kolom_title_3') as string;
		const kolom_subtitle_1 = formData.get('kolom_subtitle_1') as string;
		const kolom_subtitle_2 = formData.get('kolom_subtitle_2') as string;
		const kolom_subtitle_3 = formData.get('kolom_subtitle_3') as string;
		const deskripsi_ct = formData.get('deskripsi_ct') as string;

		const gambarUtama = formData.get('gambar_utama') as File | null;
		const gambar1 = formData.get('gambar_1') as File | null;
		const gambar2 = formData.get('gambar_2') as File | null;
		const gambarCt = formData.get('gambar_ct') as File | null;

		let gambar_utama: string | null = null;
		let gambar_1: string | null = null;
		let gambar_2: string | null = null;
		let gambar_ct: string | null = null;

		if (gambarUtama && gambarUtama.size > 0) {
			const fileName = `${Date.now()}-${gambarUtama.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambarUtama.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);
			gambar_utama = `/uploads/${fileName}`;
			console.log('File uploaded:', gambar_utama);
		}

		if (gambar1 && gambar1.size > 0) {
			const fileName = `${Date.now()}-${gambar1.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambar1.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);
			gambar_1 = `/uploads/${fileName}`;
			console.log('File uploaded:', gambar_1);
		}

		if (gambar2 && gambar2.size > 0) {
			const fileName = `${Date.now()}-${gambar2.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambar2.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);
			gambar_2 = `/uploads/${fileName}`;
			console.log('File uploaded:', gambar_2);
		}

		if (gambarCt && gambarCt.size > 0) {
			const fileName = `${Date.now()}-${gambarCt.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambarCt.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);
			gambar_ct = `/uploads/${fileName}`;
			console.log('File uploaded:', gambar_ct);
		}

		const [result] = await db.execute<ResultSetHeader>(
			`INSERT INTO beranda (
				gambar_utama, gambar_1, gambar_2,
				kolom_title_1, kolom_title_2, kolom_title_3,
				kolom_subtitle_1, kolom_subtitle_2, kolom_subtitle_3,
				gambar_ct, deskripsi_ct
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				gambar_utama,
				gambar_1,
				gambar_2,
				kolom_title_1,
				kolom_title_2,
				kolom_title_3,
				kolom_subtitle_1,
				kolom_subtitle_2,
				kolom_subtitle_3,
				gambar_ct,
				deskripsi_ct
			]
		);

		console.log('Beranda inserted with ID:', result.insertId);

		return NextResponse.json(
			{
				message: 'Data beranda berhasil ditambahkan',
				id: result.insertId
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating beranda:', error);
		return NextResponse.json({ message: 'Gagal menambahkan data beranda' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update data beranda + ganti gambar jika ada
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function PUT(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Updating beranda...');

		const formData = await request.formData();
		const id_beranda = parseInt(formData.get('id_beranda') as string);

		const kolom_title_1 = formData.get('kolom_title_1') as string;
		const kolom_title_2 = formData.get('kolom_title_2') as string;
		const kolom_title_3 = formData.get('kolom_title_3') as string;
		const kolom_subtitle_1 = formData.get('kolom_subtitle_1') as string;
		const kolom_subtitle_2 = formData.get('kolom_subtitle_2') as string;
		const kolom_subtitle_3 = formData.get('kolom_subtitle_3') as string;
		const deskripsi_ct = formData.get('deskripsi_ct') as string;

		const [existingRows] = await db.execute<Beranda[]>('SELECT * FROM beranda WHERE id_beranda = ?', [id_beranda]);

		if (existingRows.length === 0) {
			return NextResponse.json({ message: 'Data beranda tidak ditemukan' }, { status: 404 });
		}

		const data = existingRows[0];

		let gambar_utama = data.gambar_utama;
		let gambar_1 = data.gambar_1;
		let gambar_2 = data.gambar_2;
		let gambar_ct = data.gambar_ct;

		const gambarUtamaFile = formData.get('gambar_utama') as File | null;
		if (gambarUtamaFile && gambarUtamaFile.size > 0) {
			const fileName = `${Date.now()}-${gambarUtamaFile.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambarUtamaFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			if (gambar_utama) {
				const oldImagePath = path.join(process.cwd(), 'public', gambar_utama);
				if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
			}

			gambar_utama = `/uploads/${fileName}`;
			console.log('Gambar utama updated:', gambar_utama);
		}

		const gambar1File = formData.get('gambar_1') as File | null;
		if (gambar1File && gambar1File.size > 0) {
			const fileName = `${Date.now()}-${gambar1File.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambar1File.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			if (gambar_1) {
				const oldImagePath = path.join(process.cwd(), 'public', gambar_1);
				if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
			}

			gambar_1 = `/uploads/${fileName}`;
			console.log('Gambar 1 updated:', gambar_1);
		}

		const gambar2File = formData.get('gambar_2') as File | null;
		if (gambar2File && gambar2File.size > 0) {
			const fileName = `${Date.now()}-${gambar2File.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambar2File.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			if (gambar_2) {
				const oldImagePath = path.join(process.cwd(), 'public', gambar_2);
				if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
			}

			gambar_2 = `/uploads/${fileName}`;
			console.log('Gambar 2 updated:', gambar_2);
		}

		const gambarCtFile = formData.get('gambar_ct') as File | null;
		if (gambarCtFile && gambarCtFile.size > 0) {
			const fileName = `${Date.now()}-${gambarCtFile.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambarCtFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			if (gambar_ct) {
				const oldImagePath = path.join(process.cwd(), 'public', gambar_ct);
				if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
			}

			gambar_ct = `/uploads/${fileName}`;
			console.log('Gambar CT updated:', gambar_ct);
		}

		await db.execute<ResultSetHeader>(
			`UPDATE beranda SET 
				gambar_utama=?, gambar_1=?, gambar_2=?,
				kolom_title_1=?, kolom_title_2=?, kolom_title_3=?,
				kolom_subtitle_1=?, kolom_subtitle_2=?, kolom_subtitle_3=?,
				gambar_ct=?, deskripsi_ct=?
			 WHERE id_beranda=?`,
			[
				gambar_utama,
				gambar_1,
				gambar_2,
				kolom_title_1,
				kolom_title_2,
				kolom_title_3,
				kolom_subtitle_1,
				kolom_subtitle_2,
				kolom_subtitle_3,
				gambar_ct,
				deskripsi_ct,
				id_beranda
			]
		);

		console.log('Beranda updated successfully');

		return NextResponse.json({ message: 'Data beranda berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('Error updating beranda:', error);
		return NextResponse.json({ message: 'Gagal memperbarui beranda' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus data beranda + hapus gambar fisik
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
		const id_beranda = searchParams.get('id_beranda');

		if (!id_beranda) {
			return NextResponse.json({ message: 'ID beranda wajib diisi' }, { status: 400 });
		}

		const [existingRows] = await db.execute<Beranda[]>('SELECT * FROM beranda WHERE id_beranda = ?', [id_beranda]);

		if (existingRows.length === 0) {
			return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
		}

		const data = existingRows[0];

		await db.execute<ResultSetHeader>('DELETE FROM beranda WHERE id_beranda = ?', [id_beranda]);

		[data.gambar_utama, data.gambar_1, data.gambar_2, data.gambar_ct].forEach((img) => {
			if (img) {
				const imagePath = path.join(process.cwd(), 'public', img);
				if (fs.existsSync(imagePath)) {
					fs.unlinkSync(imagePath);
					console.log('File gambar dihapus:', imagePath);
				}
			}
		});

		return NextResponse.json({ message: 'Data beranda berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting beranda:', error);
		return NextResponse.json({ message: 'Gagal menghapus beranda' }, { status: 500 });
	}
}
