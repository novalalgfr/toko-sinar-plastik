// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { compare, hash } from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';

type UserRow = RowDataPacket & {
	id: number;
	name: string;
	email: string;
	password?: string;
	alamat?: string | null;
	alamat_peta?: string | null;
	rt_rw?: string | null;
	kelurahan?: string | null;
	kecamatan?: string | null;
	nomor_telepon?: string | null;
	latitude?: number | null;
	longitude?: number | null;
};

type UpdateProfileBody = {
	alamat?: string;
	alamatPeta?: string;
	rt_rw?: string;
	kelurahan?: string;
	kecamatan?: string;
	latitude?: number;
	longitude?: number;
	nomor_telepon?: string;
	current_password?: string;
	new_password?: string;
	confirm_password?: string;
};

export async function GET(request: NextRequest) {
	const token = await getToken({ req: request });
	if (!token?.email) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	let conn;
	try {
		conn = await db.getConnection();

		const [rows] = await conn.query<UserRow[]>(
			`SELECT id, name, email, alamat, alamat_peta, rt_rw, kelurahan, kecamatan, nomor_telepon, latitude, longitude 
             FROM users WHERE email = ? LIMIT 1`,
			[token.email]
		);

		if (rows.length === 0) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 });
		}
		return NextResponse.json(rows[0], { status: 200 });
	} catch (error) {
		console.error('❌ Profile fetch error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	} finally {
		if (conn) conn.release();
	}
}

export async function PUT(request: NextRequest) {
	const token = await getToken({ req: request });
	if (!token?.email) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	let conn;
	try {
		conn = await db.getConnection();
		const body = await request.json();

		const {
			alamat,
			alamatPeta,
			rt_rw,
			kelurahan,
			kecamatan,
			latitude,
			longitude,
			nomor_telepon,
			current_password,
			new_password,
			confirm_password
		} = body;

		const [rows] = await conn.query<UserRow[]>(
			'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
			[token.email]
		);

		const user = rows[0];
		if (!user) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 });
		}

		const updateFields: string[] = [];
		const updateValues: (string | number | null)[] = [];

		if (alamat !== undefined) {
			updateFields.push('alamat = ?');
			updateValues.push(alamat);
		}
		if (alamatPeta !== undefined) {
			updateFields.push('alamat_peta = ?');
			updateValues.push(alamatPeta);
		}
		if (rt_rw !== undefined) {
			updateFields.push('rt_rw = ?');
			updateValues.push(rt_rw);
		}
		if (kelurahan !== undefined) {
			updateFields.push('kelurahan = ?');
			updateValues.push(kelurahan);
		}
		if (kecamatan !== undefined) {
			updateFields.push('kecamatan = ?');
			updateValues.push(kecamatan);
		}
		if (latitude !== undefined) {
			updateFields.push('latitude = ?');
			updateValues.push(latitude);
		}
		if (longitude !== undefined) {
			updateFields.push('longitude = ?');
			updateValues.push(longitude);
		}
		if (nomor_telepon !== undefined) {
			updateFields.push('nomor_telepon = ?');
			updateValues.push(nomor_telepon);
		}

		if (new_password) {
			if (!current_password)
				return NextResponse.json({ message: 'Password saat ini wajib diisi.' }, { status: 400 });
			if (new_password !== confirm_password)
				return NextResponse.json({ message: 'Konfirmasi password baru tidak cocok.' }, { status: 400 });
			const isCurrentPasswordValid = await compare(current_password, user.password!);
			if (!isCurrentPasswordValid)
				return NextResponse.json({ message: 'Password saat ini salah.' }, { status: 401 });
			const hashedNewPassword = await hash(new_password, 10);
			updateFields.push('password = ?');
			updateValues.push(hashedNewPassword);
		}

		if (updateFields.length === 0) {
			return NextResponse.json({ message: 'Tidak ada perubahan yang terdeteksi.' }, { status: 400 });
		}

		updateValues.push(user.id);
		const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;

		await conn.query(query, updateValues);
		return NextResponse.json({ message: 'Profil berhasil diperbarui.' }, { status: 200 });
	} catch (error) {
		console.error('❌ Update user error:', error);
		return NextResponse.json({ message: 'Terjadi kesalahan internal pada server.' }, { status: 500 });
	} finally {
		if (conn) conn.release();
	}
}
