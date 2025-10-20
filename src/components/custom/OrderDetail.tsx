/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, MapPin, Phone, Calendar, RefreshCw } from 'lucide-react';

interface Order {
	id: string;
	orderNumber: string;
	date: string;
	status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
	};
}

interface TrackingDetail {
	origin: string;
	destination: string;
	shipper: string;
	receiver: string;
}

interface TrackingHistory {
	date: string;
	desc: string;
	location: string;
}

interface TrackingSummary {
	awb: string;
	courier: string;
	service: string;
	status: string;
	date: string;
	desc: string;
	amount: string;
	weight: string;
}

interface TrackingInfo {
	summary: TrackingSummary;
	detail: TrackingDetail;
	history: TrackingHistory[];
}

interface OrderDetailProps {
	order: Order;
	onBack: () => void;
}

export default function OrderDetail({ order, onBack }: OrderDetailProps) {
	const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTracking = async () => {
		if (!order.shipping?.trackingNumber) return;

		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch(
				`/api/tracking?courier=${order.shipping.courier}&awb=${order.shipping.trackingNumber}`
			);
			const data = await res.json();

			if (!data.success) throw new Error('Gagal memuat tracking');
			setTrackingData(data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadTracking();
	}, [order]);

	const statusColors: { [key: string]: string } = {
		pending: 'bg-yellow-100 text-yellow-800',
		paid: 'bg-blue-100 text-blue-800',
		processing: 'bg-purple-100 text-purple-800',
		shipped: 'bg-orange-100 text-orange-800',
		delivered: 'bg-green-100 text-green-800',
		cancelled: 'bg-red-100 text-red-800'
	};

	const statusLabels: { [key: string]: string } = {
		pending: 'Menunggu Pembayaran',
		paid: 'Dibayar',
		processing: 'Diproses',
		shipped: 'Dikirim',
		delivered: 'Selesai',
		cancelled: 'Dibatalkan'
	};

	return (
		<div className="container mx-auto space-y-4">
			<Button
				onClick={onBack}
				className="cursor-pointer"
			>
				← Kembali
			</Button>

			{/* Order Info */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle className="text-lg">{order.orderNumber}</CardTitle>
							<div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
								<Calendar size={14} />
								{order.date}
							</div>
						</div>
						<Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Items */}
					<div className="border-b pb-4">
						<h3 className="font-semibold text-base mb-3">Produk Pesanan</h3>
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
					</div>

					{/* Address */}
					{order.shippingAddress && (
						<div className="border-b pb-4">
							<h3 className="font-semibold text-base mb-3 flex items-center gap-2">
								<MapPin size={16} />
								Alamat Pengiriman
							</h3>
							<div className="bg-gray-50 p-3 rounded-lg space-y-2">
								<p className="font-medium text-sm">{order.shippingAddress.name}</p>
								<p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Phone size={14} />
									<span>{order.shippingAddress.phone}</span>
								</div>
							</div>
						</div>
					)}

					{/* Shipping */}
					{order.shipping && (
						<div className="border-b pb-4">
							<h3 className="font-semibold text-base mb-3 flex items-center gap-2">
								<Truck size={16} />
								Informasi Pengiriman
							</h3>
							<div className="bg-blue-50 p-3 rounded-lg space-y-3">
								<div className="flex justify-between">
									<span className="text-xs text-gray-600">Kurir</span>
									<span className="text-sm font-medium">
										{order.shipping.courier} - {order.shipping.service}
									</span>
								</div>
								{order.shipping.trackingNumber && (
									<div className="flex justify-between">
										<span className="text-xs text-gray-600">No. Resi</span>
										<span className="text-sm font-mono font-medium">
											{order.shipping.trackingNumber}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Total */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Subtotal</span>
							<span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
						</div>
						<div className="flex justify-between text-sm pb-3 border-b">
							<span className="text-gray-600">Ongkir</span>
							<span>
								{order.shippingCost === 0
									? 'Gratis'
									: `Rp ${order.shippingCost.toLocaleString('id-ID')}`}
							</span>
						</div>
						<div className="flex justify-between font-bold text-base">
							<span>Total Pembayaran</span>
							<span className="text-blue-600">Rp {order.total.toLocaleString('id-ID')}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tracking */}
			{order.shipping?.trackingNumber && (
				<Card>
					<CardHeader>
						<div className="flex justify-between items-center">
							<CardTitle className="flex items-center gap-2">
								<Package size={18} />
								Lacak Paket
							</CardTitle>
							<Button
								size="sm"
								onClick={loadTracking}
								disabled={isLoading}
								className="cursor-pointer"
							>
								<RefreshCw
									size={14}
									className={isLoading ? 'animate-spin' : ''}
								/>
								<span className="ml-2">Refresh</span>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="text-center py-6 text-gray-500">
								<RefreshCw
									size={20}
									className="animate-spin mx-auto mb-2"
								/>
								Memuat...
							</div>
						) : error ? (
							<div className="bg-red-50 p-3 rounded text-center">
								<p className="text-red-600 text-sm">{error}</p>
								<Button
									size="sm"
									className="mt-2"
									onClick={loadTracking}
									variant="outline"
								>
									Coba Lagi
								</Button>
							</div>
						) : trackingData ? (
							<div className="space-y-4">
								<div className="bg-blue-50 p-3 rounded">
									<p className="text-xs text-gray-600">Status</p>
									<p className="font-bold">{trackingData.summary.status || 'Dalam proses'}</p>
								</div>
								{trackingData.history && trackingData.history.length > 0 && (
									<div className="space-y-3">
										<h4 className="font-semibold">Riwayat</h4>
										{trackingData.history.map((track: TrackingHistory, idx: number) => (
											<div
												key={idx}
												className="border-l-2 border-blue-300 pl-3 py-2"
											>
												<p className="font-medium text-sm">{track.desc}</p>
												{track.location && (
													<p className="text-xs text-gray-600">{track.location}</p>
												)}
												<p className="text-xs text-gray-400 mt-1">{track.date}</p>
											</div>
										))}
									</div>
								)}
							</div>
						) : (
							<p className="text-center text-gray-500 py-6">Tidak ada data tracking</p>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
