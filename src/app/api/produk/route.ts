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

// Interface data produk
interface Produk extends RowDataPacket {
	id_produk: number;
	nama_produk: string;
	deskripsi: string | null;
	harga: number;
	berat: number;
	stok: number;
	id_kategori: number | null;
	gambar: string | null;
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
function addImageUrl(data: Produk[], baseUrl: string) {
	return data.map((item) => ({
		...item,
		gambar_url: item.gambar && item.gambar !== '' ? `${baseUrl}/${item.gambar}` : null
	}));
}

// Fungsi untuk menambahkan URL gambar untuk single product
function addImageUrlSingle(item: Produk, baseUrl: string) {
	return {
		...item,
		gambar_url: item.gambar && item.gambar !== '' ? `${baseUrl}/${item.gambar}` : null
	};
}

/* ==========================================================
   GET — Menampilkan produk dengan pagination dan pencarian
   ATAU detail produk berdasarkan ID
   (PUBLIC - Bisa diakses tanpa login)
   ========================================================== */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		const nama = searchParams.get('nama'); // 🔹 Tambahan parameter nama

		// CASE 1: Jika ada parameter ID, return detail produk
		if (id) {
			console.log('Fetching produk with ID:', id);

			const productId = parseInt(id);
			if (isNaN(productId)) {
				return NextResponse.json({ message: 'ID produk tidak valid' }, { status: 400 });
			}

			const [rows] = await db.execute<Produk[]>('SELECT * FROM Produk WHERE id_produk = ?', [productId]);

			if (rows.length === 0) {
				return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
			}

			const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
			const productWithUrl = addImageUrlSingle(rows[0], baseUrl);

			return NextResponse.json(
				{
					success: true,
					data: productWithUrl
				},
				{ status: 200 }
			);
		}

		// 🔹 CASE 2: Jika ada parameter nama, return produk berdasarkan nama
		if (nama) {
			console.log('Fetching produk with nama:', nama);

			const [rows] = await db.execute<Produk[]>(
				'SELECT * FROM Produk WHERE nama_produk LIKE ?',
				[`%${nama}%`]
			);

			if (rows.length === 0) {
				return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
			}

			const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
			const dataWithUrls = addImageUrl(rows, baseUrl);

			return NextResponse.json(
				{
					success: true,
					data: dataWithUrls
				},
				{ status: 200 }
			);
		}

		// CASE 3: Jika tidak ada ID atau nama, return list produk dengan pagination
		console.log('Fetching produk list...');

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

		let countQuery = 'SELECT COUNT(*) AS total FROM Produk';
		let countParams: any[] = [];

		let dataQuery = 'SELECT * FROM Produk';
		let dataParams: any[] = [];

		if (search) {
			const condition = ' WHERE nama_produk LIKE ? OR deskripsi LIKE ?';
			countQuery += condition;
			dataQuery += condition;
			const searchParam = `%${search}%`;
			countParams = [searchParam, searchParam];
			dataParams = [searchParam, searchParam];
		}

		dataQuery += ' ORDER BY id_produk DESC LIMIT ? OFFSET ?';
		dataParams.push(limit, offset);

		const [[countRow]] = await db.execute<CountResult[]>(countQuery, countParams);
		const [rows] = await db.execute<Produk[]>(dataQuery, dataParams);

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
		console.error('Error fetching produk:', error);
		return NextResponse.json({ message: 'Failed to fetch produk' }, { status: 500 });
	}
}


/* ==========================================================
   POST — Menambahkan produk baru + upload gambar
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function POST(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Creating new produk...');

		const formData = await request.formData();

		const nama_produk = formData.get('nama_produk') as string;
		const deskripsi = formData.get('deskripsi') as string;
		const harga = parseFloat(formData.get('harga') as string);
		const berat = parseFloat(formData.get('berat') as string);
		const stok = parseInt(formData.get('stok') as string);
		const id_kategori = formData.get('id_kategori') ? parseInt(formData.get('id_kategori') as string) : null;
		const gambarFile = formData.get('gambar') as File | null;

		let gambar: string | null = null;

		if (gambarFile && gambarFile.size > 0) {
			const fileName = `${Date.now()}-${gambarFile.name}`;
			const filePath = path.join(uploadDir, fileName);
			const arrayBuffer = await gambarFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);
			gambar = `/uploads/${fileName}`;
			console.log('File uploaded:', gambar);
		}

		const [result] = await db.execute<ResultSetHeader>(
			'INSERT INTO Produk (nama_produk, deskripsi, harga, berat, stok, id_kategori, gambar) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[nama_produk, deskripsi, harga, berat, stok, id_kategori, gambar]
		);

		console.log('Produk inserted with ID:', result.insertId);

		return NextResponse.json(
			{
				message: 'Produk berhasil ditambahkan',
				id: result.insertId
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating produk:', error);
		return NextResponse.json({ message: 'Gagal menambahkan produk' }, { status: 500 });
	}
}

/* ==========================================================
   PUT — Update produk + ganti gambar jika ada
   (PROTECTED - HANYA ADMIN)
   ========================================================== */
export async function PUT(request: NextRequest) {
	// Auth check untuk ADMIN
	const authCheck = await checkAdminAuth(request);
	if (!authCheck.authenticated) {
		return authCheck.response;
	}

	try {
		console.log('Updating produk...');

		const formData = await request.formData();

		const id_produk = parseInt(formData.get('id_produk') as string);
		const nama_produk = formData.get('nama_produk') as string;
		const deskripsi = formData.get('deskripsi') as string;
		const harga = parseFloat(formData.get('harga') as string);
		const berat = parseFloat(formData.get('berat') as string);
		const stok = parseInt(formData.get('stok') as string);
		const id_kategori = formData.get('id_kategori') ? parseInt(formData.get('id_kategori') as string) : null;
		const gambarFile = formData.get('gambar') as File | null;

		const [existingRows] = await db.execute<Produk[]>('SELECT gambar FROM Produk WHERE id_produk = ?', [id_produk]);

		let gambar = existingRows[0]?.gambar;

		if (gambarFile && gambarFile.size > 0) {
			const fileName = `${Date.now()}-${gambarFile.name}`;
			const filePath = path.join(uploadDir, fileName);

			const arrayBuffer = await gambarFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			if (gambar) {
				const oldImagePath = path.join(process.cwd(), 'public', gambar);
				if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
			}

			gambar = `/uploads/${fileName}`;
			console.log('Gambar updated:', gambar);
		}

		await db.execute<ResultSetHeader>(
			'UPDATE Produk SET nama_produk=?, deskripsi=?, harga=?, berat=?, stok=?, id_kategori=?, gambar=? WHERE id_produk=?',
			[nama_produk, deskripsi, harga, berat, stok, id_kategori, gambar, id_produk]
		);

		console.log('Produk updated successfully');

		return NextResponse.json({ message: 'Produk berhasil diperbarui' }, { status: 200 });
	} catch (error) {
		console.error('Error updating produk:', error);
		return NextResponse.json({ message: 'Gagal memperbarui produk' }, { status: 500 });
	}
}

/* ==========================================================
   DELETE — Hapus produk + hapus gambar fisik
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
		const id_produk = searchParams.get('id_produk');

		if (!id_produk) {
			return NextResponse.json({ message: 'ID produk wajib diisi' }, { status: 400 });
		}

		const [existingRows] = await db.execute<Produk[]>('SELECT gambar FROM Produk WHERE id_produk = ?', [id_produk]);

		const gambar = existingRows[0]?.gambar;

		await db.execute<ResultSetHeader>('DELETE FROM Produk WHERE id_produk = ?', [id_produk]);

		if (gambar) {
			const imagePath = path.join(process.cwd(), 'public', gambar);
			if (fs.existsSync(imagePath)) {
				fs.unlinkSync(imagePath);
				console.log('File gambar dihapus:', imagePath);
			}
		}

		return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting produk:', error);
		return NextResponse.json({ message: 'Gagal menghapus produk' }, { status: 500 });
	}
}
