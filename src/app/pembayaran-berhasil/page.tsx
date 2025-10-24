'use client';

import React from 'react';
import { CheckCircle, Home, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PembayaranBerhasilPage() {
	const handleNavigateBeranda = () => {
		// Navigasi ke beranda
		window.location.href = '/';
	};

	const handleNavigateRiwayat = () => {
		// Navigasi ke riwayat pesanan
		window.location.href = '/riwayat-pesanan';
	};

	return (
		<section className="flex items-center justify-center p-4 bg-gray-50">
			<div className="max-w-md w-full">
				<div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
					{/* Icon Success */}
					<div className="flex justify-center mb-6">
						<div className="bg-green-100 rounded-full p-4">
							<CheckCircle className="w-16 h-16 text-green-600" />
						</div>
					</div>

					{/* Heading */}
					<h1 className="text-2xl font-bold text-gray-900 mb-3">Pembayaran Berhasil!</h1>

					{/* Description */}
					<p className="text-base text-gray-600 mb-8">
						Terima kasih! Pembayaran Anda telah berhasil diproses. Pesanan Anda sedang dipersiapkan dan akan
						segera diproses.
					</p>

					{/* Buttons */}
					<div className="space-y-3">
						{/* Button Ke Beranda */}
						<Button
							onClick={handleNavigateBeranda}
							className="w-full bg-gray-900 text-white"
							size="lg"
						>
							<Home className="w-5 h-5" />
							<span>Kembali ke Beranda</span>
						</Button>

						{/* Button Ke Riwayat Pesanan */}
						<Button
							onClick={handleNavigateRiwayat}
							className="w-full bg-white border-2 border-gray-900 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
							size="lg"
						>
							<Clock className="w-5 h-5" />
							<span>Lihat Riwayat Pesanan</span>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
