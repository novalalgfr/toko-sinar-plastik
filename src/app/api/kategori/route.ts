import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// 📦 Interface untuk tipe data dari tabel kategori
interface Kategori extends RowDataPacket {
	id_kategori: number;
	nama_kategori: string;
	gambar: string | null;
	created_at: Date;
	updated_at: Date;
}

interface CountResult extends RowDataPacket {
	total: number;
}

// 📂 Folder upload
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Pastikan folder upload ada
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔒 Fungsi auth admin
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

// Fungsi untuk menambahkan URL gambar
function addImageUrl(data: Kategori[], baseUrl: string) {
	return data.map((item) => ({
		...item,
		image_url: item.gambar ? `${baseUrl}/uploads/${item.gambar}` : null
	}));
}

// Fungsi untuk menambahkan URL gambar untuk single kategori
function addImageUrlSingle(item: Kategori, baseUrl: string) {
	return {
		...item,
		image_url: item.gambar ? `${baseUrl}/uploads/${item.gambar}` : null
	};
}

/* =========================================================
   🟢 GET: Ambil kategori dengan pagination dan pencarian
   ATAU detail kategori berdasarkan ID (PUBLIC)
========================================================= */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		// CASE 1: Jika ada parameter ID, return detail kategori
		if (id) {
			console.log('📥 Mengambil kategori dengan ID:', id);

			const categoryId = parseInt(id);
			if (isNaN(categoryId)) {
				return NextResponse.json({ message: 'ID kategori tidak valid' }, { status: 400 });
			}

			const [rows] = await db.execute<Kategori[]>('SELECT * FROM kategori WHERE id_kategori = ?', [categoryId]);

			if (rows.length === 0) {
				return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
			}

			const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
			const categoryWithUrl = addImageUrlSingle(rows[0], baseUrl);

			return NextResponse.json(
				{
					success: true,
					data: categoryWithUrl
				},
				{ status: 200 }
			);
		}

		// CASE 2: Jika tidak ada ID, return list kategori dengan pagination
		console.log('📥 Mengambil data kategori dengan pagination...');

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

		let countQuery = 'SELECT COUNT(*) AS total FROM kategori';
		let countParams: string[] = [];

		let dataQuery = 'SELECT * FROM kategori';
		let dataParams: (string | number)[] = [];

		if (search) {
			const condition = ' WHERE nama_kategori LIKE ?';
			countQuery += condition;
			dataQuery += condition;
			const searchParam = `%${search}%`;
			countParams = [searchParam];
			dataParams = [searchParam];
		}

		dataQuery += ' ORDER BY id_kategori DESC LIMIT ? OFFSET ?';
		dataParams.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, countParams);
		const [rows] = await db.execute<Kategori[]>(dataQuery, dataParams);

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
		console.error('❌ Gagal mengambil data kategori:', error);
		return NextResponse.json({ message: 'Koneksi database gagal' }, { status: 500 });
	}
}

/* =========================================================
   🟡 POST: Tambah kategori baru (ADMIN ONLY)
========================================================= */
export async function POST(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		console.log('🆕 Menambahkan kategori baru...');

		const formData = await request.formData();
		const nama_kategori = formData.get('nama_kategori') as string;
		const file = formData.get('gambar') as File | null;

		let gambar: string | null = null;

		if (file && file.size > 0) {
			const fileName = `${Date.now()}-${file.name}`;
			const filePath = path.join(uploadDir, fileName);
			const buffer = Buffer.from(await file.arrayBuffer());
			fs.writeFileSync(filePath, buffer);
			gambar = fileName;
			console.log('🖼️ Gambar berhasil diunggah:', fileName);
		}

		const [result] = await db.execute<ResultSetHeader>(
			'INSERT INTO kategori (nama_kategori, gambar) VALUES (?, ?)',
			[nama_kategori, gambar]
		);

		console.log('✅ Kategori berhasil disimpan dengan ID:', result.insertId);
		return NextResponse.json({ message: 'Kategori berhasil ditambahkan', id: result.insertId }, { status: 201 });
	} catch (error) {
		console.error('❌ Gagal menambahkan kategori:', error);
		return NextResponse.json({ message: 'Gagal menambahkan kategori' }, { status: 500 });
	}
}

/* =========================================================
   🟠 PUT: Update kategori (ADMIN ONLY)
========================================================= */
export async function PUT(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		console.log('✏️ Memperbarui kategori...');

		const formData = await request.formData();
		const id = formData.get('id_kategori') as string;
		const nama_kategori = formData.get('nama_kategori') as string;
		const file = formData.get('gambar') as File | null;

		const [existingRows] = await db.execute<Kategori[]>('SELECT gambar FROM kategori WHERE id_kategori = ?', [id]);
		let gambar = existingRows[0]?.gambar;

		if (file && file.size > 0) {
			// Hapus gambar lama jika ada
			if (gambar) {
				const oldPath = path.join(process.cwd(), 'public', 'uploads', gambar);
				if (fs.existsSync(oldPath)) {
					fs.unlinkSync(oldPath);
					console.log('🗑️ Gambar lama dihapus:', oldPath);
				}
			}

			const fileName = `${Date.now()}-${file.name}`;
			const filePath = path.join(uploadDir, fileName);
			const buffer = Buffer.from(await file.arrayBuffer());
			fs.writeFileSync(filePath, buffer);
			gambar = fileName;
			console.log('🖼️ Gambar baru berhasil diunggah:', fileName);
		}

		await db.execute<ResultSetHeader>('UPDATE kategori SET nama_kategori = ?, gambar = ? WHERE id_kategori = ?', [
			nama_kategori,
			gambar,
			id
		]);

		console.log('✅ Kategori berhasil diperbarui');
		return NextResponse.json({ message: 'Kategori berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('❌ Gagal memperbarui kategori:', error);
		return NextResponse.json({ message: 'Gagal memperbarui kategori' }, { status: 500 });
	}
}

/* =========================================================
   🔴 DELETE: Hapus kategori (ADMIN ONLY)
========================================================= */
export async function DELETE(request: NextRequest) {
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) return authCheck.response;

	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id_kategori');

		if (!id) {
			return NextResponse.json({ message: 'ID kategori diperlukan' }, { status: 400 });
		}

		console.log('🗑️ Menghapus kategori ID:', id);

		const [rows] = await db.execute<Kategori[]>('SELECT gambar FROM kategori WHERE id_kategori = ?', [id]);
		const gambar = rows[0]?.gambar;

		await db.execute<ResultSetHeader>('DELETE FROM kategori WHERE id_kategori = ?', [id]);

		if (gambar) {
			const imagePath = path.join(process.cwd(), 'public', 'uploads', gambar);
			if (fs.existsSync(imagePath)) {
				fs.unlinkSync(imagePath);
				console.log('🖼️ Gambar terkait berhasil dihapus:', imagePath);
			}
		}

		console.log('✅ Kategori berhasil dihapus');
		return NextResponse.json({ message: 'Kategori berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('❌ Gagal menghapus kategori:', error);
		return NextResponse.json({ message: 'Gagal menghapus kategori' }, { status: 500 });
	}
}
