'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Package,
	Truck,
	CheckCircle,
	Clock,
	MapPin,
	Phone,
	Calendar,
	ChevronRight,
	Store,
	Receipt
} from 'lucide-react';

// Interface untuk Order
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
	tracking?: {
		date: string;
		status: string;
		description: string;
	}[];
}

export default function OrderHistory() {
	// Data contoh - nanti bisa diganti dengan fetch dari API
	const [orders] = useState<Order[]>([
		{
			id: '1',
			orderNumber: 'ORDER-1729123456',
			date: '2025-10-15 14:30',
			status: 'shipped',
			fulfillmentType: 'delivery',
			items: [{ name: 'Produk A', quantity: 1, price: 30000 }],
			subtotal: 30000,
			shippingCost: 15000,
			total: 45000,
			shippingAddress: {
				name: 'Rumah',
				address: 'Jl. Contoh No. 123, Purbalingga',
				phone: '081234567890'
			},
			shipping: {
				courier: 'JNE',
				service: 'REG',
				trackingNumber: 'JNE1234567890',
				etd: '2-3 hari'
			},
			tracking: [
				{
					date: '2025-10-15 15:00',
					status: 'Pesanan Dikonfirmasi',
					description: 'Pembayaran telah diterima dan pesanan sedang diproses'
				},
				{
					date: '2025-10-15 16:30',
					status: 'Dikemas',
					description: 'Pesanan sedang dikemas oleh penjual'
				},
				{
					date: '2025-10-16 09:00',
					status: 'Dikirim',
					description: 'Paket telah diserahkan ke kurir JNE'
				},
				{
					date: '2025-10-17 10:30',
					status: 'Dalam Perjalanan',
					description: 'Paket sedang dalam perjalanan ke alamat tujuan'
				}
			]
		},
		{
			id: '2',
			orderNumber: 'ORDER-1729098765',
			date: '2025-10-10 10:15',
			status: 'delivered',
			fulfillmentType: 'delivery',
			items: [{ name: 'Produk B', quantity: 2, price: 25000 }],
			subtotal: 50000,
			shippingCost: 12000,
			total: 62000,
			shippingAddress: {
				name: 'Rumah',
				address: 'Jl. Contoh No. 123, Purbalingga',
				phone: '081234567890'
			},
			shipping: {
				courier: 'SiCepat',
				service: 'REGULAR',
				trackingNumber: 'SICEPAT987654321',
				etd: '2-3 hari'
			},
			tracking: [
				{
					date: '2025-10-10 11:00',
					status: 'Pesanan Dikonfirmasi',
					description: 'Pembayaran telah diterima'
				},
				{
					date: '2025-10-10 14:00',
					status: 'Dikemas',
					description: 'Pesanan dikemas'
				},
				{
					date: '2025-10-11 08:00',
					status: 'Dikirim',
					description: 'Diserahkan ke kurir'
				},
				{
					date: '2025-10-13 15:30',
					status: 'Terkirim',
					description: 'Paket telah diterima oleh penerima'
				}
			]
		},
		{
			id: '3',
			orderNumber: 'ORDER-1729001122',
			date: '2025-10-12 09:00',
			status: 'paid',
			fulfillmentType: 'store',
			items: [{ name: 'Produk C', quantity: 1, price: 45000 }],
			subtotal: 45000,
			shippingCost: 0,
			total: 45000
		}
	]);

	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	// Status badge styling
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

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto">
				<h1 className="text-3xl font-bold mb-6">Riwayat Pesanan</h1>

				{selectedOrder ? (
					// Detail Order & Tracking
					<div className="space-y-6">
						<Button
							variant="outline"
							onClick={() => setSelectedOrder(null)}
							className="mb-4"
						>
							← Kembali ke Daftar Pesanan
						</Button>

						{/* Info Order */}
						<Card>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle className="text-xl mb-2">{selectedOrder.orderNumber}</CardTitle>
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<Calendar size={16} />
											{selectedOrder.date}
										</div>
									</div>
									<Badge className={getStatusBadge(selectedOrder.status).color}>
										{getStatusBadge(selectedOrder.status).label}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Items */}
								<div>
									<h3 className="font-semibold mb-3">Produk Pesanan</h3>
									{selectedOrder.items.map((item, idx) => (
										<div
											key={idx}
											className="flex justify-between py-2 border-b"
										>
											<span>
												{item.name} x{item.quantity}
											</span>
											<span className="font-medium">
												Rp {(item.price * item.quantity).toLocaleString('id-ID')}
											</span>
										</div>
									))}
								</div>

								{/* Address */}
								{selectedOrder.fulfillmentType === 'delivery' && selectedOrder.shippingAddress && (
									<div>
										<h3 className="font-semibold mb-3 flex items-center gap-2">
											<MapPin size={18} />
											Alamat Pengiriman
										</h3>
										<div className="bg-gray-50 p-4 rounded-lg">
											<p className="font-medium">{selectedOrder.shippingAddress.name}</p>
											<p className="text-sm text-gray-600 mt-1">
												{selectedOrder.shippingAddress.address}
											</p>
											<p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
												<Phone size={14} />
												{selectedOrder.shippingAddress.phone}
											</p>
										</div>
									</div>
								)}

								{/* Shipping Info */}
								{selectedOrder.shipping && (
									<div>
										<h3 className="font-semibold mb-3 flex items-center gap-2">
											<Truck size={18} />
											Informasi Pengiriman
										</h3>
										<div className="bg-blue-50 p-4 rounded-lg space-y-2">
											<div className="flex justify-between">
												<span className="text-sm text-gray-600">Kurir</span>
												<span className="font-medium">
													{selectedOrder.shipping.courier} - {selectedOrder.shipping.service}
												</span>
											</div>
											{selectedOrder.shipping.trackingNumber && (
												<div className="flex justify-between">
													<span className="text-sm text-gray-600">No. Resi</span>
													<span className="font-mono font-medium">
														{selectedOrder.shipping.trackingNumber}
													</span>
												</div>
											)}
											{selectedOrder.shipping.etd && (
												<div className="flex justify-between">
													<span className="text-sm text-gray-600">Estimasi</span>
													<span>{selectedOrder.shipping.etd}</span>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Store Pickup Info */}
								{selectedOrder.fulfillmentType === 'store' && (
									<div>
										<h3 className="font-semibold mb-3 flex items-center gap-2">
											<Store size={18} />
											Ambil di Toko
										</h3>
										<div className="bg-green-50 p-4 rounded-lg">
											<p className="text-sm text-green-800">Silakan ambil pesanan Anda di:</p>
											<p className="font-medium mt-2">Jl. Merdeka No. 123, Jakarta Pusat</p>
											<p className="text-sm text-gray-600 mt-1">
												Buka: Senin - Sabtu, 09:00 - 17:00
											</p>
										</div>
									</div>
								)}

								{/* Total */}
								<div className="border-t pt-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Subtotal</span>
										<span>Rp {selectedOrder.subtotal.toLocaleString('id-ID')}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Ongkir</span>
										<span>
											{selectedOrder.shippingCost === 0
												? 'Gratis'
												: `Rp ${selectedOrder.shippingCost.toLocaleString('id-ID')}`}
										</span>
									</div>
									<div className="flex justify-between font-bold text-lg border-t pt-2">
										<span>Total</span>
										<span className="text-blue-600">
											Rp {selectedOrder.total.toLocaleString('id-ID')}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Tracking Timeline */}
						{selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package size={20} />
										Lacak Paket
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{selectedOrder.tracking.map((track, idx) => (
											<div
												key={idx}
												className="flex gap-4"
											>
												{/* Timeline */}
												<div className="flex flex-col items-center">
													<div
														className={`rounded-full p-2 ${
															idx === 0
																? 'bg-blue-500 text-white'
																: 'bg-gray-200 text-gray-400'
														}`}
													>
														{idx === 0 ? <CheckCircle size={20} /> : <Clock size={20} />}
													</div>
													{idx < selectedOrder.tracking!.length - 1 && (
														<div className="w-0.5 h-16 bg-gray-200 my-2" />
													)}
												</div>

												{/* Content */}
												<div className="flex-1 pb-8">
													<p className="font-semibold text-gray-900">{track.status}</p>
													<p className="text-sm text-gray-500 mt-1">{track.description}</p>
													<p className="text-xs text-gray-400 mt-2">{track.date}</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				) : (
					// List Orders
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
									className="hover:shadow-md transition-shadow cursor-pointer"
									onClick={() => setSelectedOrder(order)}
								>
									<CardContent className="p-6">
										<div className="flex justify-between items-start mb-4">
											<div>
												<p className="font-semibold text-lg">{order.orderNumber}</p>
												<p className="text-sm text-gray-500 mt-1">{order.date}</p>
											</div>
											<Badge className={getStatusBadge(order.status).color}>
												{getStatusBadge(order.status).label}
											</Badge>
										</div>

										<div className="space-y-2 mb-4">
											{order.items.map((item, idx) => (
												<div
													key={idx}
													className="flex justify-between text-sm"
												>
													<span className="text-gray-600">
														{item.name} x{item.quantity}
													</span>
													<span className="font-medium">
														Rp {(item.price * item.quantity).toLocaleString('id-ID')}
													</span>
												</div>
											))}
										</div>

										<div className="flex justify-between items-center pt-4 border-t">
											<div>
												<p className="text-sm text-gray-500">Total Pembayaran</p>
												<p className="font-bold text-lg text-blue-600">
													Rp {order.total.toLocaleString('id-ID')}
												</p>
											</div>
											<Button
												variant="outline"
												size="sm"
											>
												Lihat Detail{' '}
												<ChevronRight
													size={16}
													className="ml-1"
												/>
											</Button>
										</div>

										{order.fulfillmentType === 'store' && (
											<div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
												<Store
													size={16}
													className="text-green-600"
												/>
												<span className="text-sm text-green-700">Ambil di Toko</span>
											</div>
										)}
									</CardContent>
								</Card>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
}
