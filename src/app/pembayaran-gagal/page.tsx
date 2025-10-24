'use client';

import React from 'react';
import { XCircle, Home, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PembayaranGagalPage() {
	const handleNavigateBeranda = () => {
		window.location.href = '/';
	};

	const handleCobaBayarLagi = () => {
		window.location.href = '/pembayaran';
	};

	const handleHubungiCS = () => {
		// Redirect ke halaman kontak atau WhatsApp CS
		window.location.href = '/kontak-kami';
	};

	return (
		<section className="flex items-center justify-center p-4 bg-gray-50">
			<div className="max-w-md w-full">
				<div className="bg-white border border-gray-200 p-8 text-center">
					{/* Icon Error */}
					<div className="flex justify-center mb-6">
						<div className="bg-red-100 rounded-full p-4">
							<XCircle className="w-16 h-16 text-red-600" />
						</div>
					</div>

					{/* Heading */}
					<h1 className="text-2xl font-bold text-gray-900 mb-3">Pembayaran Gagal</h1>

					{/* Description */}
					<p className="text-sm text-gray-500 mb-8">
						Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi atau hubungi customer service
						jika masalah berlanjut.
					</p>

					{/* Buttons */}
					<div className="space-y-3">
						{/* Button Coba Lagi */}
						<Button
							onClick={handleCobaBayarLagi}
							className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
							size="lg"
						>
							<RefreshCw className="w-5 h-5" />
							<span>Coba Bayar Lagi</span>
						</Button>

						{/* Button Hubungi CS */}
						<Button
							onClick={handleHubungiCS}
							className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
							size="lg"
						>
							<HelpCircle className="w-5 h-5" />
							<span>Hubungi Customer Service</span>
						</Button>

						{/* Button Ke Beranda */}
						<Button
							onClick={handleNavigateBeranda}
							className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
							size="lg"
						>
							<Home className="w-5 h-5" />
							<span>Kembali ke Beranda</span>
						</Button>
					</div>

					{/* Additional Info */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<p className="text-sm text-gray-500">Kemungkinan penyebab:</p>
						<ul className="text-xs text-gray-400 mt-2 space-y-1">
							<li>• Saldo tidak mencukupi</li>
							<li>• Koneksi internet terputus</li>
							<li>• Waktu pembayaran habis</li>
							<li>• Kesalahan sistem</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
