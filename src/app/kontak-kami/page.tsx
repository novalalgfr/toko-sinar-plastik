'use client';

import { MapPin, Phone, Mail, Send, Clock, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function KontakKamiPage() {
	return (
		<section className="space-y-12 md:space-y-16">
			<div className="grid grid-cols-1 gap-8">
				{/* Left - Contact Info & Map */}
				<div className="space-y-8">
					{/* Contact Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{/* Lokasi */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start space-x-4">
								<div className="mt-1">
									<MapPin className="w-5 h-5 text-gray-900 flex-shrink-0" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">Lokasi</p>
									<p className="text-gray-600 text-sm mt-1">
										Pasir Gn. Sel., Kec. Cimanggis, Kota Depok, Jawa Barat
									</p>
								</div>
							</div>
						</div>

						{/* Telepon */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start space-x-4">
								<div className="mt-1">
									<Phone className="w-5 h-5 text-gray-900 flex-shrink-0" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">Telepon</p>
									<p className="text-gray-600 text-sm mt-1">+62 21 1234 5678</p>
								</div>
							</div>
						</div>

						{/* Email */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start space-x-4">
								<div className="mt-1">
									<Mail className="w-5 h-5 text-gray-900 flex-shrink-0" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">Email</p>
									<p className="text-gray-600 text-sm mt-1">sinar.plastik@gmail.com</p>
								</div>
							</div>
						</div>
					</div>

					{/* Maps */}
					<div className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.386421206585!2d106.8491389!3d-6.3439763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed0046276951%3A0xf4ffa722cfc6be3d!2sToko%20Sinar%20Plastik!5e0!3m2!1sid!2sid!4v1760761213345!5m2!1sid!2sid"
							className="w-full h-96"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						></iframe>
					</div>

					{/* Jam Operasional */}
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
						<div className="flex items-center space-x-3 mb-4">
							<Clock className="w-5 h-5 text-gray-900" />
							<h3 className="font-semibold text-gray-900">Jam Operasional</h3>
						</div>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">Senin - Jumat</span>
								<span className="font-semibold text-gray-900">08:00 - 17:00 WIB</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Sabtu</span>
								<span className="font-semibold text-gray-900">09:00 - 14:00 WIB</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Minggu & Libur</span>
								<span className="font-semibold text-gray-900">Tutup</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
