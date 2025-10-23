'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Skeleton from '@/components/custom/Skeleton';

type Beranda = {
	id_beranda: number;
	gambar_utama_url: string;
	gambar_1_url: string;
	gambar_2_url: string;
	kolom_title_1: string;
	kolom_title_2: string;
	kolom_title_3: string;
	kolom_subtitle_1: string;
	kolom_subtitle_2: string;
	kolom_subtitle_3: string;
	gambar_ct_url: string;
	deskripsi_ct: string;
};

export default function Home() {
	const [data, setData] = useState<Beranda | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch('/api/beranda');
				const json = await res.json();

				if (json.success && json.data.length > 0) {
					setData(json.data[0]);
				}
			} catch (error) {
				console.error('Gagal mengambil data beranda:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <Skeleton variant="home" />;
	}

	if (!data) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Tidak ada data beranda.</p>
			</div>
		);
	}

	return (
		<section className="space-y-12 md:space-y-24 container mx-auto">
			{/* Header & Images */}
			<div className="text-center">
				<div className="grid md:grid-cols-12 gap-6 mb-16">
					{/* Gambar Utama */}
					<div className="md:col-span-9 h-[608px] relative rounded-xl overflow-hidden">
						<Image
							src={data.gambar_utama_url}
							alt="Gambar utama"
							fill
							className="object-cover"
						/>
					</div>

					{/* Dua gambar kecil di kanan */}
					<div className="md:col-span-3 flex flex-col gap-6">
						<div className="h-[292px] relative rounded-xl overflow-hidden">
							<Image
								src={data.gambar_1_url}
								alt="Gambar 1"
								fill
								className="object-cover"
							/>
						</div>
						<div className="h-[292px] relative rounded-xl overflow-hidden">
							<Image
								src={data.gambar_2_url}
								alt="Gambar 2"
								fill
								className="object-cover"
							/>
						</div>
					</div>
				</div>

				{/* Stats Row */}
				<div className="flex flex-wrap justify-center md:justify-around gap-6 md:gap-10 text-center">
					{[
						{ title: data.kolom_title_1, subtitle: data.kolom_subtitle_1 },
						{ title: data.kolom_title_2, subtitle: data.kolom_subtitle_2 },
						{ title: data.kolom_title_3, subtitle: data.kolom_subtitle_3 }
					].map((item, i) => (
						<div key={i}>
							<p className="text-[40px] md:text-3xl font-bold mb-2">{item.title}</p>
							<p className="text-[16px] text-gray-600 max-w-[80%] break-words mx-auto">{item.subtitle}</p>
						</div>
					))}
				</div>
			</div>

			{/* Kategori Section (dummy) */}
			<div>
				<h2 className="text-lg md:text-2xl font-bold mb-4">Belanja Berdasarkan Kategori</h2>
				<div className="grid grid-cols-2 md:grid-cols-6 gap-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="w-full h-[300px] bg-gray-200 rounded-xl"
						/>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="w-full h-[400px] relative rounded-xl overflow-hidden flex flex-col justify-center items-start p-10">
				<Image
					src={data.gambar_ct_url}
					alt="CTA Banner"
					fill
					className="object-cover"
				/>
				<div className="relative z-10 text-white">
					<h3 className="text-[32px] md:text-3xl font-bold max-w-3xl leading-snug mb-6">
						{data.deskripsi_ct}
					</h3>
					<Button
						size="lg"
						className="rounded-xl bg-white text-black hover:bg-gray-100 font-semibold"
					>
						Lebih Lanjut
					</Button>
				</div>
				{/* Overlay agar teks lebih jelas */}
				<div className="absolute inset-0 bg-black/30" />
			</div>
		</section>
	);
}
