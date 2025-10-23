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

// Tambahkan URL gambar agar bisa diakses di front-end
function addImageUrl(data: Beranda[], baseUrl: string) {
	return data.map((item) => ({
		...item,
		gambar_utama_url: item.gambar_utama ? `${baseUrl}${item.gambar_utama}` : null,
		gambar_1_url: item.gambar_1 ? `${baseUrl}${item.gambar_1}` : null,
		gambar_2_url: item.gambar_2 ? `${baseUrl}${item.gambar_2}` : null,
		gambar_ct_url: item.gambar_ct ? `${baseUrl}${item.gambar_ct}` : null
	}));
}

/* ==========================================================
   GET — Ambil semua data beranda (tanpa pagination)
   (PUBLIC - Bisa diakses tanpa login)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching beranda data...');

		const { searchParams } = new URL(request.url);
		const search = searchParams.get('search') || '';

		let query = 'SELECT * FROM beranda';
		const params: any[] = [];

		if (search) {
			query += ' WHERE kolom_title_1 LIKE ? OR kolom_title_2 LIKE ? OR kolom_title_3 LIKE ?';
			const searchParam = `%${search}%`;
			params.push(searchParam, searchParam, searchParam);
		}

		query += ' ORDER BY id_beranda DESC';

		const [rows] = await db.execute<Beranda[]>(query, params);

		const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
		const dataWithUrls = addImageUrl(rows, baseUrl);

		return NextResponse.json(
			{
				success: true,
				data: dataWithUrls
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
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
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

		async function saveFile(file: File | null) {
			if (file && file.size > 0) {
				const fileName = `${Date.now()}-${file.name}`;
				const filePath = path.join(uploadDir, fileName);
				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				fs.writeFileSync(filePath, buffer);
				return `/uploads/${fileName}`;
			}
			return null;
		}

		gambar_utama = await saveFile(gambarUtama);
		gambar_1 = await saveFile(gambar1);
		gambar_2 = await saveFile(gambar2);
		gambar_ct = await saveFile(gambarCt);

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

		return NextResponse.json(
			{ message: 'Data beranda berhasil ditambahkan', id: result.insertId },
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating beranda:', error);
		return NextResponse.json({ message: 'Gagal menambahkan data beranda' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update data beranda
   ========================================================== */
export async function PUT(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		const formData = await request.formData();
		const id_beranda = parseInt(formData.get('id_beranda') as string);

		const kolom_title_1 = formData.get('kolom_title_1') as string;
		const kolom_title_2 = formData.get('kolom_title_2') as string;
		const kolom_title_3 = formData.get('kolom_title_3') as string;
		const kolom_subtitle_1 = formData.get('kolom_subtitle_1') as string;
		const kolom_subtitle_2 = formData.get('kolom_subtitle_2') as string;
		const kolom_subtitle_3 = formData.get('kolom_subtitle_3') as string;
		const deskripsi_ct = formData.get('deskripsi_ct') as string;

		const [rows] = await db.execute<Beranda[]>('SELECT * FROM beranda WHERE id_beranda = ?', [id_beranda]);
		if (rows.length === 0) {
			return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
		}

		const data = rows[0];
		let gambar_utama = data.gambar_utama;
		let gambar_1 = data.gambar_1;
		let gambar_2 = data.gambar_2;
		let gambar_ct = data.gambar_ct;

		async function replaceFile(oldFile: string | null, newFile: File | null) {
			if (newFile && newFile.size > 0) {
				const fileName = `${Date.now()}-${newFile.name}`;
				const filePath = path.join(uploadDir, fileName);
				const arrayBuffer = await newFile.arrayBuffer();
				fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

				if (oldFile) {
					const oldPath = path.join(process.cwd(), 'public', oldFile);
					if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
				}

				return `/uploads/${fileName}`;
			}
			return oldFile;
		}

		gambar_utama = await replaceFile(data.gambar_utama, formData.get('gambar_utama') as File | null);
		gambar_1 = await replaceFile(data.gambar_1, formData.get('gambar_1') as File | null);
		gambar_2 = await replaceFile(data.gambar_2, formData.get('gambar_2') as File | null);
		gambar_ct = await replaceFile(data.gambar_ct, formData.get('gambar_ct') as File | null);

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

		return NextResponse.json({ message: 'Data beranda berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('Error updating beranda:', error);
		return NextResponse.json({ message: 'Gagal memperbarui data' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus data beranda + gambar
   ========================================================== */
export async function DELETE(request: NextRequest) {
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

		const [rows] = await db.execute<Beranda[]>('SELECT * FROM beranda WHERE id_beranda = ?', [id_beranda]);
		if (rows.length === 0) {
			return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
		}

		const data = rows[0];
		await db.execute<ResultSetHeader>('DELETE FROM beranda WHERE id_beranda = ?', [id_beranda]);

		[data.gambar_utama, data.gambar_1, data.gambar_2, data.gambar_ct].forEach((img) => {
			if (img) {
				const imgPath = path.join(process.cwd(), 'public', img);
				if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
			}
		});

		return NextResponse.json({ message: 'Data beranda berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting beranda:', error);
		return NextResponse.json({ message: 'Gagal menghapus data' }, { status: 500 });
	}
}
