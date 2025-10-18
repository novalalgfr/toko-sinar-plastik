import { NextRequest, NextResponse } from 'next/server';

interface CalculateRequest {
	shipper_destination_id: number;
	receiver_destination_id: number;
	weight: number;
	item_value: number;
	origin_pin_point: string;
	destination_pin_point: string;
}

interface RajaOngkirTariff {
	shipping_name: string;
	service_name: string;
	weight: number;
	is_cod: boolean;
	shipping_cost: number;
	shipping_cashback: number;
	shipping_cost_net: number;
	grandtotal: number;
	service_fee: number;
	net_income: number;
	etd: string;
}

interface RajaOngkirApiResponse {
	meta: {
		message: string;
		code: number;
		status: string;
	};
	data: {
		calculate_reguler: RajaOngkirTariff[];
	};
}

interface FormattedTariff {
	courier_name: string;
	courier_service_name: string;
	description: string;
	price: number;
	etd: string;
	is_cod: boolean;
}

interface ApiSuccessResponse {
	success: true;
	tariffs: FormattedTariff[];
	raw?: RajaOngkirApiResponse;
}

interface ApiErrorResponse {
	success: false;
	error: string;
	tariffs: [];
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
	try {
		const body = (await request.json()) as CalculateRequest;

		const {
			shipper_destination_id,
			receiver_destination_id,
			weight,
			item_value,
			origin_pin_point,
			destination_pin_point
		} = body;

		if (!shipper_destination_id || !receiver_destination_id || !weight) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required fields: shipper_destination_id, receiver_destination_id, weight',
					tariffs: []
				},
				{ status: 400 }
			);
		}

		const apiKey = process.env.RAJAONGKIR_API_KEY;

		if (!apiKey) {
			console.error('RAJAONGKIR_API_KEY is not configured');
			return NextResponse.json(
				{
					success: false,
					error: 'RajaOngkir API is not configured properly',
					tariffs: []
				},
				{ status: 500 }
			);
		}

		const url = new URL('https://api-sandbox.collaborator.komerce.id/tariff/api/v1/calculate');
		url.searchParams.append('shipper_destination_id', shipper_destination_id.toString());
		url.searchParams.append('receiver_destination_id', receiver_destination_id.toString());
		url.searchParams.append('weight', weight.toString());
		url.searchParams.append('item_value', item_value.toString());
		url.searchParams.append('origin_pin_point', origin_pin_point);
		url.searchParams.append('destination_pin_point', destination_pin_point);

		console.log('Calling RajaOngkir API:', url.toString());

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'x-api-key': apiKey,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('RajaOngkir API error:', response.status, errorText);
			throw new Error(`RajaOngkir API error: ${response.status} - ${errorText}`);
		}

		const data = (await response.json()) as RajaOngkirApiResponse;

		console.log('RajaOngkir API response:', JSON.stringify(data, null, 2));

		const rawTariffs = data.data?.calculate_reguler || [];

		if (!Array.isArray(rawTariffs) || rawTariffs.length === 0) {
			console.warn('No tariffs found in response');
			return NextResponse.json(
				{
					success: false,
					error: 'No shipping options available for this destination',
					tariffs: []
				},
				{ status: 404 }
			);
		}

		const formattedTariffs: FormattedTariff[] = rawTariffs.map((tariff) => ({
			courier_name: tariff.shipping_name,
			courier_service_name: tariff.service_name,
			description: `${tariff.shipping_name} - ${tariff.service_name}${tariff.is_cod ? ' (COD Available)' : ''}`,
			price: tariff.shipping_cost,
			etd: tariff.etd && tariff.etd !== '-' ? tariff.etd.replace(/\s*day[s]?/i, '').trim() : '2-4',
			is_cod: tariff.is_cod
		}));

		return NextResponse.json({
			success: true,
			tariffs: formattedTariffs,
			raw: data
		});
	} catch (error) {
		console.error('Error calculating shipping cost:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		return NextResponse.json(
			{
				success: false,
				error: errorMessage,
				tariffs: []
			},
			{ status: 500 }
		);
	}
}
