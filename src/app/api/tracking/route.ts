// app/api/tracking/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.BINDERBYTE_API_KEY;
const BASE_URL = 'https://api.binderbyte.com/v1';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const courier = searchParams.get('courier');
		const awb = searchParams.get('awb');

		// Validasi parameter
		if (!courier || !awb) {
			return NextResponse.json(
				{
					success: false,
					error: 'Parameter courier dan awb harus diisi'
				},
				{ status: 400 }
			);
		}

		// Fetch data dari BinderByte API
		const response = await fetch(`${BASE_URL}/track?api_key=${API_KEY}&courier=${courier}&awb=${awb}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			// Cache selama 5 menit
			next: { revalidate: 300 }
		});

		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}

		const data = await response.json();

		// Cek jika response sukses
		if (data.status !== 200) {
			return NextResponse.json(
				{
					success: false,
					error: data.message || 'Gagal mengambil data tracking'
				},
				{ status: 400 }
			);
		}

		// Return data
		return NextResponse.json({
			success: true,
			data: data.data
		});
	} catch (error) {
		console.error('Tracking API Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Terjadi kesalahan pada server'
			},
			{ status: 500 }
		);
	}
}

// Opsional: POST method jika ingin tracking multiple packages
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { courier, awb } = body;

		if (!courier || !awb) {
			return NextResponse.json(
				{
					success: false,
					error: 'Parameter courier dan awb harus diisi'
				},
				{ status: 400 }
			);
		}

		const response = await fetch(`${BASE_URL}/track?api_key=${API_KEY}&courier=${courier}&awb=${awb}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}

		const data = await response.json();

		if (data.status !== 200) {
			return NextResponse.json(
				{
					success: false,
					error: data.message || 'Gagal mengambil data tracking'
				},
				{ status: 400 }
			);
		}

		return NextResponse.json({
			success: true,
			data: data.data
		});
	} catch (error) {
		console.error('Tracking API Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Terjadi kesalahan pada server'
			},
			{ status: 500 }
		);
	}
}
