'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface Kontak {
	id_kontak: number;
	deskripsi: string;
	lokasi: string;
	latitude: string;
	longitude: string;
	nomor_telpon: string;
	email: string;
	jam_operasional_weekdays: string;
	jam_operasional_weekend: string;
	created_at: string;
	updated_at: string;
}

export default function KontakKamiPage() {
	const [kontak, setKontak] = useState<Kontak | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchKontak = async () => {
			try {
				const res = await fetch('/api/kontak');
				if (!res.ok) throw new Error('Gagal memuat data kontak');
				const result = await res.json();

				if (result.success && result.data.length > 0) {
					setKontak(result.data[0]);
				} else {
					throw new Error('Data kontak kosong');
				}
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError('Terjadi kesalahan tak terduga');
				}
			} finally {
				setLoading(false);
			}
		};

		fetchKontak();
	}, []);

	if (loading) {
		return <p className="text-center py-10 text-gray-500">Memuat data kontak...</p>;
	}

	if (error || !kontak) {
		return <p className="text-center py-10 text-red-500">{error || 'Gagal memuat data kontak.'}</p>;
	}

	return (
		<section className="space-y-12 md:space-y-16">
			<div className="grid grid-cols-1 gap-8">
				<div className="space-y-8">
					{/* Contact Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{/* Lokasi */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
							<div className="flex items-start space-x-4">
								<MapPin className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">Lokasi</p>
									<p className="text-gray-600 text-sm mt-1">{kontak.lokasi}</p>
								</div>
							</div>
						</div>

						{/* Telepon */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
							<div className="flex items-start space-x-4">
								<Phone className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">Telepon</p>
									<p className="text-gray-600 text-sm mt-1">{kontak.nomor_telpon}</p>
								</div>
							</div>
						</div>

						{/* Email */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
							<div className="flex items-start space-x-4">
								<Mail className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">Email</p>
									<p className="text-gray-600 text-sm mt-1">{kontak.email}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Maps */}
					<div className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
						<iframe
							src={`https://www.google.com/maps?q=${kontak.latitude},${kontak.longitude}&hl=id&z=16&output=embed`}
							className="w-full h-96"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>

					{/* Jam Operasional */}
					<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center space-x-3 mb-4">
							<Clock className="w-5 h-5 text-gray-900" />
							<h3 className="font-semibold text-gray-900">Jam Operasional</h3>
						</div>
						{kontak.jam_operasional_weekdays || kontak.jam_operasional_weekend ? (
							<div className="space-y-3 text-sm">
								{kontak.jam_operasional_weekdays && (
									<div className="flex justify-between">
										{/* <span className="text-gray-600">Hari Kerja</span> */}
										<span className="text-gray-900">{kontak.jam_operasional_weekdays}</span>
									</div>
								)}
								{kontak.jam_operasional_weekend && (
									<div className="flex justify-between">
										{/* <span className="text-gray-600">Akhir Pekan</span> */}
										<span className="text-gray-900">{kontak.jam_operasional_weekend}</span>
									</div>
								)}
							</div>
						) : (
							<p className="text-sm text-gray-600">Jam operasional belum tersedia.</p>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
