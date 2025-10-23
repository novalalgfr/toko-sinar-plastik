'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';

// contoh dummy data (sementara, nanti bisa fetch dari API sesuai ID)
const product = {
	id: 1,
	nama: 'Ember Plastik Besar 20L',
	harga: 45000,
	stok: 150,
	berat: '500g',
	gambar: '/placeholder.png', // ganti sesuai data aslimu
	deskripsi:
		'Ember plastik berkualitas tinggi dengan kapasitas 20 liter. Terbuat dari bahan plastik food grade yang aman dan tahan lama. Cocok untuk berbagai keperluan rumah tangga, usaha laundry, atau kebutuhan industri. Dilengkapi dengan pegangan yang kuat dan nyaman digenggam.'
};

export default function DetailProdukPage() {
	const router = useRouter();
	const [jumlah, setJumlah] = useState<number>(1);

	const tambahJumlah = () => setJumlah((prev) => prev + 1);
	const kurangJumlah = () => setJumlah((prev) => (prev > 1 ? prev - 1 : 1));

	const subtotal = product.harga * jumlah;

	return (
		<section className="container mx-auto px-6 py-8">
			{/* Tombol Kembali */}
			<button
				onClick={() => router.push('/produk')}
				className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Produk
			</button>

			{/* Grid konten utama */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Gambar Produk */}
				<div className="rounded-lg overflow-hidden">
					<Image
						src={product.gambar}
						alt={product.nama}
						width={600}
						height={600}
						className="object-cover w-full h-[400px] md:h-[500px]"
					/>
				</div>

				{/* Card Atur Jumlah Pesanan */}
				<div className="bg-white border rounded-xl shadow-sm p-6 max-h-fit">
					<h3 className="text-lg font-semibold mb-4">Atur Jumlah Pesanan</h3>

					<div className="mb-3">
						<label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
						<div className="flex items-center border rounded-lg w-fit">
							<button
								type="button"
								onClick={kurangJumlah}
								className="px-3 py-1 hover:bg-gray-100"
							>
								<Minus className="w-4 h-4" />
							</button>
							<input
								type="number"
								readOnly
								value={jumlah}
								className="w-12 text-center border-x outline-none"
							/>
							<button
								type="button"
								onClick={tambahJumlah}
								className="px-3 py-1 hover:bg-gray-100"
							>
								<Plus className="w-4 h-4" />
							</button>
						</div>
					</div>

					<div className="flex justify-between items-center mb-6">
						<span className="text-sm text-gray-600">Subtotal</span>
						<span className="text-lg font-semibold text-gray-900">
							Rp {subtotal.toLocaleString('id-ID')}
						</span>
					</div>

					<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
						<ShoppingCart className="w-4 h-4" />
						Tambah ke Keranjang
					</Button>
				</div>
			</div>

			{/* Detail Produk */}
			<div className="mt-8">
				<h2 className="text-2xl font-bold mb-2">{product.nama}</h2>
				<p className="text-blue-600 font-bold text-xl mb-2">Rp {product.harga.toLocaleString('id-ID')}</p>

				<div className="flex items-center gap-8 mb-4 text-sm text-gray-700">
					<p>
						<span className="font-semibold">Stok Tersedia: </span>
						{product.stok} unit
					</p>
					<p>
						<span className="font-semibold">Berat: </span>
						{product.berat}
					</p>
				</div>

				<hr className="mb-4" />

				<h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
				<p className="text-gray-700 leading-relaxed">{product.deskripsi}</p>
			</div>
		</section>
	);
}
