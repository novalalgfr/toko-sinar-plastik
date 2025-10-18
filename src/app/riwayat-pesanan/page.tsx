'use client';

import { useState, useEffect } from 'react';
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
	Receipt,
	RefreshCw
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
}

// Interface untuk API Response
interface TrackingAPIResponse {
	success: boolean;
	data: {
		summary: {
			awb: string;
			courier: string;
			service: string;
			status: string;
			date: string;
			desc: string;
			amount: string;
			weight: string;
		};
		detail: {
			origin: string;
			destination: string;
			shipper: string;
			receiver: string;
		};
		history: {
			date: string;
			desc: string;
			location: string;
		}[];
	};
}

export default function OrderHistory() {
	// Data dummy - 1 order dengan SiCepat
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
	const [trackingData, setTrackingData] = useState<TrackingAPIResponse | null>(null);
	const [isLoadingTracking, setIsLoadingTracking] = useState(false);
	const [trackingError, setTrackingError] = useState<string | null>(null);

	// Fetch tracking data dari API route
	const fetchTrackingData = async (courier: string, awb: string) => {
		setIsLoadingTracking(true);
		setTrackingError(null);

		try {
			const response = await fetch(`/api/tracking?courier=${courier}&awb=${awb}`);

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Gagal mengambil data tracking');
			}

			setTrackingData(result);
		} catch (error) {
			setTrackingError(error instanceof Error ? error.message : 'Terjadi kesalahan');
			console.error('Error fetching tracking:', error);
		} finally {
			setIsLoadingTracking(false);
		}
	};

	// Auto fetch ketika order dengan shipping dipilih
	useEffect(() => {
		if (selectedOrder?.shipping?.trackingNumber && selectedOrder?.shipping?.courier) {
			fetchTrackingData(selectedOrder.shipping.courier.toLowerCase(), selectedOrder.shipping.trackingNumber);
		} else {
			setTrackingData(null);
		}
	}, [selectedOrder]);

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

	// Map API status ke status badge
	const getDeliveryStatusBadge = (status: string) => {
		const statusMap: { [key: string]: { color: string; label: string } } = {
			DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Terkirim' },
			ON_PROCESS: { color: 'bg-blue-100 text-blue-800', label: 'Dalam Proses' },
			PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu' },
			CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' }
		};
		return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
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
													{selectedOrder.shipping.courier.toUpperCase()} -{' '}
													{selectedOrder.shipping.service}
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

						{/* Tracking Timeline dari API */}
						{selectedOrder.shipping?.trackingNumber && (
							<Card>
								<CardHeader>
									<div className="flex justify-between items-center">
										<CardTitle className="flex items-center gap-2">
											<Package size={20} />
											Lacak Paket
										</CardTitle>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												if (selectedOrder.shipping) {
													fetchTrackingData(
														selectedOrder.shipping.courier.toLowerCase(),
														selectedOrder.shipping.trackingNumber!
													);
												}
											}}
											disabled={isLoadingTracking}
										>
											<RefreshCw
												size={16}
												className={isLoadingTracking ? 'animate-spin' : ''}
											/>
											<span className="ml-2">Refresh</span>
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									{isLoadingTracking ? (
										<div className="flex items-center justify-center py-8">
											<RefreshCw
												size={24}
												className="animate-spin text-blue-500"
											/>
											<span className="ml-3 text-gray-600">Memuat data tracking...</span>
										</div>
									) : trackingError ? (
										<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
											<p className="text-red-600">{trackingError}</p>
											<Button
												variant="outline"
												size="sm"
												className="mt-3"
												onClick={() => {
													if (selectedOrder.shipping) {
														fetchTrackingData(
															selectedOrder.shipping.courier.toLowerCase(),
															selectedOrder.shipping.trackingNumber!
														);
													}
												}}
											>
												Coba Lagi
											</Button>
										</div>
									) : trackingData ? (
										<div className="space-y-6">
											{/* Summary Info */}
											<div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
												<div className="flex justify-between items-start mb-3">
													<div>
														<p className="text-sm text-gray-600">Status Pengiriman</p>
														<p className="font-bold text-lg mt-1">
															{trackingData.data.summary.courier}
														</p>
													</div>
													<Badge
														className={
															getDeliveryStatusBadge(trackingData.data.summary.status)
																.color
														}
													>
														{getDeliveryStatusBadge(trackingData.data.summary.status).label}
													</Badge>
												</div>

												{trackingData.data.detail && (
													<div className="grid grid-cols-2 gap-3 text-sm mt-4 pt-3 border-t border-blue-200">
														<div>
															<p className="text-gray-600">Pengirim</p>
															<p className="font-medium">
																{trackingData.data.detail.shipper}
															</p>
														</div>
														<div>
															<p className="text-gray-600">Penerima</p>
															<p className="font-medium">
																{trackingData.data.detail.receiver}
															</p>
														</div>
														<div>
															<p className="text-gray-600">Asal</p>
															<p className="font-medium">
																{trackingData.data.detail.origin}
															</p>
														</div>
														<div>
															<p className="text-gray-600">Tujuan</p>
															<p className="font-medium">
																{trackingData.data.detail.destination}
															</p>
														</div>
													</div>
												)}
											</div>

											{/* History Timeline */}
											<div className="space-y-4">
												<h4 className="font-semibold text-gray-700">Riwayat Pengiriman</h4>
												{trackingData.data.history.map((track, idx) => (
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
																{idx === 0 ? (
																	<CheckCircle size={20} />
																) : (
																	<Clock size={20} />
																)}
															</div>
															{idx < trackingData.data.history.length - 1 && (
																<div className="w-0.5 h-16 bg-gray-200 my-2" />
															)}
														</div>

														{/* Content */}
														<div className="flex-1 pb-8">
															<p className="font-semibold text-gray-900">{track.desc}</p>
															{track.location && (
																<p className="text-sm text-gray-600 mt-1">
																	{track.location}
																</p>
															)}
															<p className="text-xs text-gray-400 mt-2">{track.date}</p>
														</div>
													</div>
												))}
											</div>
										</div>
									) : (
										<div className="text-center py-8 text-gray-500">
											<Package
												size={48}
												className="mx-auto mb-3 text-gray-300"
											/>
											<p>Data tracking tidak tersedia</p>
										</div>
									)}
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

										{order.shipping && (
											<div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Truck
														size={16}
														className="text-blue-600"
													/>
													<div>
														<span className="text-sm font-medium text-blue-700">
															{order.shipping.courier.toUpperCase()}
														</span>
														<p className="text-xs text-blue-600">
															Resi: {order.shipping.trackingNumber}
														</p>
													</div>
												</div>
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
