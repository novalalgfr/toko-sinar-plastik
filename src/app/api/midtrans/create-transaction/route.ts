import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

interface TransactionDetails {
	order_id: string;
	gross_amount: number;
}

interface CustomerDetails {
	first_name: string;
	phone: string;
	address: string;
}

interface ItemDetail {
	id: string;
	price: number;
	quantity: number;
	name: string;
}

interface ShippingAddress {
	first_name: string;
	phone: string;
	address: string;
	city: string;
	postal_code: string;
}

interface OrderData {
	transaction_details: TransactionDetails;
	customer_details: CustomerDetails;
	item_details: ItemDetail[];
	shipping_address: ShippingAddress | null;
	payment_type?: string;
}

interface MidtransTransaction {
	token: string;
	redirect_url: string;
}

export async function POST(request: NextRequest) {
	try {
		const orderData = (await request.json()) as OrderData;

		// Create Snap API instance
		const snap = new midtransClient.Snap({
			isProduction: false, // set true untuk production
			serverKey: process.env.MIDTRANS_SERVER_KEY || '',
			clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
		});

		const parameter = {
			transaction_details: orderData.transaction_details,
			customer_details: orderData.customer_details,
			item_details: orderData.item_details,
			shipping_address: orderData.shipping_address
		};

		const transaction = (await snap.createTransaction(parameter)) as MidtransTransaction;

		return NextResponse.json({
			success: true,
			token: transaction.token,
			redirect_url: transaction.redirect_url
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
	}
}
