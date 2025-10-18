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

// Fungsi untuk menambahkan URL gambar agar bisa diakses di front-end
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
   GET — Menampilkan data beranda
   (PUBLIC - Bisa diakses tanpa login)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		console.log('Fetching beranda data...');

		const [rows] = await db.execute<Beranda[]>('SELECT * FROM beranda LIMIT 1');

		if (rows.length === 0) {
			return NextResponse.json({ message: 'Data beranda belum tersedia' }, { status: 404 });
		}

		const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
		const dataWithUrls = addImageUrl(rows, baseUrl);

		return NextResponse.json(
			{
				success: true,
				data: dataWithUrls[0]
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching beranda:', error);
		return NextResponse.json({ message: 'Failed to fetch beranda' }, { status: 500 });
	}
}

/* ==========================================================
   POST — Tambahkan atau update beranda + upload gambar
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function POST(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Creating or updating beranda...');

		const formData = await request.formData();

		const gambarUtamaFile = formData.get('gambar_utama') as File | null;
		const gambar1File = formData.get('gambar_1') as File | null;
		const gambar2File = formData.get('gambar_2') as File | null;
		const gambarCtFile = formData.get('gambar_ct') as File | null;

		const kolom_title_1 = formData.get('kolom_title_1') as string;
		const kolom_title_2 = formData.get('kolom_title_2') as string;
		const kolom_title_3 = formData.get('kolom_title_3') as string;
		const kolom_subtitle_1 = formData.get('kolom_subtitle_1') as string;
		const kolom_subtitle_2 = formData.get('kolom_subtitle_2') as string;
		const kolom_subtitle_3 = formData.get('kolom_subtitle_3') as string;
		const deskripsi_ct = formData.get('deskripsi_ct') as string;

		const uploadImage = async (file: File | null) => {
			if (file && file.size > 0) {
				const fileName = `${Date.now()}-${file.name}`;
				const filePath = path.join(uploadDir, fileName);
				const buffer = Buffer.from(await file.arrayBuffer());
				fs.writeFileSync(filePath, buffer);
				return `/uploads/${fileName}`;
			}
			return null;
		};

		const gambar_utama = await uploadImage(gambarUtamaFile);
		const gambar_1 = await uploadImage(gambar1File);
		const gambar_2 = await uploadImage(gambar2File);
		const gambar_ct = await uploadImage(gambarCtFile);

		const [existingRows] = await db.execute<Beranda[]>('SELECT id_beranda FROM beranda LIMIT 1');

		if (existingRows.length > 0) {
			const id = existingRows[0].id_beranda;

			await db.execute<ResultSetHeader>(
				`UPDATE beranda 
				 SET gambar_utama=?, gambar_1=?, gambar_2=?, 
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
					id
				]
			);

			return NextResponse.json({ message: 'Beranda berhasil diperbarui' }, { status: 200 });
		} else {
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
				{
					message: 'Beranda berhasil ditambahkan',
					id: result.insertId
				},
				{ status: 201 }
			);
		}
	} catch (error) {
		console.error('Error creating/updating beranda:', error);
		return NextResponse.json({ message: 'Gagal menambahkan atau memperbarui beranda' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus data beranda (jika ada)
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function DELETE(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Deleting beranda...');

		const [existingRows] = await db.execute<Beranda[]>('SELECT * FROM beranda LIMIT 1');

		if (existingRows.length === 0) {
			return NextResponse.json({ message: 'Tidak ada data beranda untuk dihapus' }, { status: 404 });
		}

		const data = existingRows[0];
		const gambarPaths = [data.gambar_utama, data.gambar_1, data.gambar_2, data.gambar_ct];

		await db.execute<ResultSetHeader>('DELETE FROM beranda WHERE id_beranda = ?', [data.id_beranda]);

		gambarPaths.forEach((img) => {
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
