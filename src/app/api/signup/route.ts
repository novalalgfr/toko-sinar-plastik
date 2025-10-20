// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, password } = body;

		// Validasi input
		if (!name || !email || !password) {
			return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
		}

		// Validasi email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validasi password minimal 6 karakter
		if (password.length < 6) {
			return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}

		// Koneksi database
		const conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});

		// Cek apakah email sudah terdaftar
		const [existingUsers] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);

		if (Array.isArray(existingUsers) && existingUsers.length > 0) {
			await conn.end();
			return NextResponse.json({ error: 'Email already signuped' }, { status: 409 });
		}

		// Hash password
		const hashedPassword = await hash(password, 10);

		// Insert user baru dengan role default 'user'
		const [result] = await conn.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
			name,
			email,
			hashedPassword,
			'user'
		]);

		await conn.end();

		console.log('✅ User signuped:', { name, email, role: 'user' });

		return NextResponse.json(
			{
				message: 'User signuped successfully',
				user: {
					name,
					email,
					role: 'user'
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('❌ signup error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
