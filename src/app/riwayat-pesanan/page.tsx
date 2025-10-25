'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, ChevronRight, Receipt } from 'lucide-react';
import OrderDetail from '@/components/custom/OrderDetail';

interface Order {
	id: string;
	orderNumber: string;
	date: string;
	status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
	fulfillmentType: 'delivery' | 'store';
	items: {
		name: string;
		quantity: number;
		price: number;
	}[];
	subtotal: number;
	shippingCost: number;
	total: number;
	shippingAddress?: {
		name: string;
		address: string;
		phone: string;
	};
	shipping?: {
		courier: string;
		service: string;
		trackingNumber?: string;
		etd?: string;
	};
}

export default function OrderHistory() {
	const [orders] = useState<Order[]>([
		{
			id: '1',
			orderNumber: 'ORDER-1729123456',
			date: '2025-09-30 18:00',
			status: 'delivered',
			fulfillmentType: 'delivery',
			items: [
				{ name: 'Sepatu Sneakers Nike', quantity: 1, price: 850000 },
				{ name: 'Kaos Kaki Sport', quantity: 2, price: 45000 }
			],
			subtotal: 940000,
			shippingCost: 15000,
			total: 955000,
			shippingAddress: {
				name: 'Rumah Utama',
				address: 'Jl. Mampang Prapatan No. 45, Kota Administrasi Jakarta Selatan',
				phone: '081234567890'
			},
			shipping: {
				courier: 'sicepat',
				service: 'REG',
				trackingNumber: '002929295958',
				etd: '2-3 hari'
			}
		}
	]);

	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	const getStatusBadge = (status: Order['status']) => {
		const styles = {
			pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Pembayaran' },
			paid: { color: 'bg-blue-100 text-blue-800', label: 'Dibayar' },
			processing: { color: 'bg-purple-100 text-purple-800', label: 'Diproses' },
			shipped: { color: 'bg-orange-100 text-orange-800', label: 'Dikirim' },
			delivered: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
			cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' }
		};
		return styles[status];
	};

	if (selectedOrder) {
		return (
			<OrderDetail
				order={selectedOrder}
				onBack={() => setSelectedOrder(null)}
			/>
		);
	}

	return (
		<div className="container mx-auto">
			<div className="space-y-4">
				{orders.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center">
							<Receipt
								size={64}
								className="mx-auto text-gray-300 mb-4"
							/>
							<p className="text-gray-500">Belum ada pesanan</p>
						</CardContent>
					</Card>
				) : (
					orders.map((order) => (
						<Card
							key={order.id}
							className="hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => setSelectedOrder(order)}
						>
							<CardContent className="space-y-4">
								{/* Header */}
								<div className="flex justify-between items-start border-b pb-4">
									<div>
										<p className="font-semibold text-lg">{order.orderNumber}</p>
										<p className="text-xs text-gray-500 mt-1">{order.date}</p>
									</div>
									<Badge className={getStatusBadge(order.status).color}>
										{getStatusBadge(order.status).label}
									</Badge>
								</div>

								{/* Items */}
								<div className="space-y-2">
									{order.items.map((item, idx) => (
										<div
											key={idx}
											className="flex justify-between items-center text-sm"
										>
											<div className="flex-1">
												<p className="text-gray-700">{item.name}</p>
												<p className="text-xs text-gray-500">Qty: {item.quantity}</p>
											</div>
											<p className="font-medium">
												Rp {(item.price * item.quantity).toLocaleString('id-ID')}
											</p>
										</div>
									))}
								</div>

								{/* Shipping Info */}
								{order.shipping && (
									<div className="bg-blue-50 p-3 rounded-lg space-y-2">
										<div className="flex items-center gap-2">
											<Truck
												size={16}
												className="text-blue-600"
											/>
											<span className="text-sm font-medium text-blue-700">
												{order.shipping.courier} - {order.shipping.service}
											</span>
										</div>
										{order.shipping.trackingNumber && (
											<p className="text-xs text-blue-600 ml-6">
												Resi: {order.shipping.trackingNumber}
											</p>
										)}
									</div>
								)}

								{/* Total & Button */}
								<div className="flex justify-between items-center pt-3 border-t">
									<div>
										<p className="text-sm text-gray-600">Total Pembayaran</p>
										<p className="font-bold text-blue-600">
											Rp {order.total.toLocaleString('id-ID')}
										</p>
									</div>
									<Button
										size="sm"
										className="cursor-pointer"
									>
										Lihat Detail
										<ChevronRight
											size={16}
											className="ml-1"
										/>
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
