'use client';
import * as React from 'react';
import { ProductCard } from '@/components/custom/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner'; 

export default function ProductPage() {
	const [search, setSearch] = React.useState('');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

	const products = [
		{ image: '', name: 'Golden Fill', price: 60000 },
		{ image: '', name: 'Plastik Kemasan 1L', price: 8500 },
		{ image: '', name: 'Mika Roti', price: 10000 },
		{ image: '', name: 'Botol Plastik', price: 12000 }
	];

	const filteredProducts = products
		.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));

	const handleAddToCart = (product: { name: string }) => {
		toast.success(`${product.name} berhasil ditambahkan ke keranjang!`);
	};

	const toggleSortOrder = () => {
		setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	return (
		<div className="min-h-screen flex flex-col items-center py-8">
			{/* Wrapper utama biar sejajar */}
			<div className="w-full max-w-[1320px]">
				{/* Search & Filter */}
				<div className="flex justify-between items-center mb-8">
					{/* Search */}
					<div className="relative w-[240px] h-[40px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							type="text"
							placeholder="Cari produk..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#0a452f]"
						/>
					</div>

					{/* Filter Button */}
					<Button
						onClick={toggleSortOrder}
						className="flex items-center justify-center gap-2 border border-gray-300 rounded-full text-sm font-medium bg-white text-gray-800 hover:bg-gray-100 transition w-[224px] h-[40px]"
					>
						<ArrowUpDown className="w-4 h-4" />
						Urutkan Berdasarkan
					</Button>
				</div>

				{/* Product Cards */}
				<div className="flex flex-wrap justify-between gap-y-8">
					{filteredProducts.map((p, i) => (
						<ProductCard
							key={i}
							image={p.image}
							name={p.name}
							price={p.price.toLocaleString('id-ID')}
							onAddToCart={() => handleAddToCart(p)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
