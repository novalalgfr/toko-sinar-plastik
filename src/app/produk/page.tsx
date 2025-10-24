'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { ProductCard } from '@/components/custom/ProductCard';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';
import { useCart } from '@/context/CartContext';

type Product = {
	id_produk: number;
	nama_produk: string;
	deskripsi: string | null;
	harga: number;
	berat: number;
	stok: number;
	id_kategori: number | null;
	gambar: string | null;
	gambar_url: string | null;
	created_at: string;
	updated_at: string;
};

type ApiResponse = {
	success: boolean;
	data: Product[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
		nextPage: number | null;
		prevPage: number | null;
	};
};

export default function ProductPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { addToCart } = useCart();

	const pageFromUrl = parseInt(searchParams.get('page') || '1');
	const limitFromUrl = parseInt(searchParams.get('limit') || '10');

	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalItems: 0,
		totalPages: 1
	});

	const [search, setSearch] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	const updateUrlParams = (page: number, limit: number) => {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		router.push(`?${params.toString()}`, { scroll: false });
	};

	useEffect(() => {
		const fetchProducts = async (page: number = 1, limit: number = 8) => {
			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams({
					page: page.toString(),
					limit: limit.toString()
				});

				const response = await fetch(`/api/produk?${params.toString()}`);

				if (!response.ok) throw new Error('Gagal memuat data produk');

				const data: ApiResponse = await response.json();

				setProducts(data.data);
				setPagination({
					currentPage: data.pagination.currentPage,
					totalItems: data.pagination.totalItems,
					totalPages: data.pagination.totalPages
				});

				updateUrlParams(data.pagination.currentPage, limit);
			} catch (err) {
				console.error('Error fetching products:', err);
				setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
				toast.error('Gagal memuat produk');
			} finally {
				setLoading(false);
			}
		};

		fetchProducts(pageFromUrl, limitFromUrl);
	}, [pageFromUrl, limitFromUrl, router]);

	const filteredProducts = products
		.filter((p) => p.nama_produk.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => (sortOrder === 'asc' ? a.harga - b.harga : b.harga - a.harga));

	const toggleSortOrder = () => {
		setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	const handleAddToCart = (product: Product) => {
		addToCart({
			id: product.id_produk,
			name: product.nama_produk,
			price: product.harga,
			image: product.gambar_url || '/placeholder.png',
			weight: product.berat || 1
		});
		toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang!`);
	};

	return (
		<section className="w-full container mx-auto py-6">
			<div className="flex justify-between items-center mb-8">
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

				<Button
					onClick={toggleSortOrder}
					className="flex items-center justify-center gap-2 border border-gray-300 rounded-full text-sm font-medium bg-white text-gray-800 hover:bg-gray-100 transition w-[224px] h-[40px]"
				>
					<ArrowUpDown className="w-4 h-4" />
					{sortOrder === 'asc' ? 'Harga: Rendah ke Tinggi' : 'Harga: Tinggi ke Rendah'}
				</Button>
			</div>

			{loading ? (
				<div className="grid sm:grid-cols-4 grid-cols-2 gap-6 animate-pulse">
					{[...Array(10)].map((_, i) => (
						<div
							key={i}
							className="flex flex-col bg-gray-200 rounded-lg h-80 overflow-hidden"
						>
							<div className="w-full h-48 bg-gray-300" />
							<div className="p-4 space-y-3">
								<div className="h-4 w-3/4 bg-gray-300 rounded" />
								<div className="h-4 w-1/2 bg-gray-300 rounded" />
								<div className="h-8 w-full bg-gray-300 rounded-lg" />
							</div>
						</div>
					))}
				</div>
			) : error ? (
				<div className="text-center py-8">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={() => window.location.reload()}>Coba Lagi</Button>
				</div>
			) : (
				<>
					{filteredProducts.length > 0 ? (
						<div className="grid sm:grid-cols-4 grid-cols-2 gap-6">
							{filteredProducts.map((p) => (
								<ProductCard
									key={p.id_produk}
									image={p.gambar_url || '/placeholder.png'}
									name={p.nama_produk}
									price={p.harga}
									onAddToCart={() => handleAddToCart(p)}
								/>
							))}
						</div>
					) : (
						<p className="text-center text-gray-500">Produk tidak ditemukan.</p>
					)}

					<div className="mt-10 flex justify-center">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() => {
											if (pagination.currentPage > 1)
												updateUrlParams(pagination.currentPage - 1, limitFromUrl);
										}}
										className={
											pagination.currentPage === 1
												? 'pointer-events-none opacity-50'
												: 'cursor-pointer'
										}
									/>
								</PaginationItem>
								{Array.from({ length: pagination.totalPages }, (_, i) => (
									<PaginationItem key={i}>
										<PaginationLink
											isActive={pagination.currentPage === i + 1}
											onClick={() => updateUrlParams(i + 1, limitFromUrl)}
											className="cursor-pointer"
										>
											{i + 1}
										</PaginationLink>
									</PaginationItem>
								))}
								<PaginationItem>
									<PaginationNext
										onClick={() => {
											if (pagination.currentPage < pagination.totalPages)
												updateUrlParams(pagination.currentPage + 1, limitFromUrl);
										}}
										className={
											pagination.currentPage === pagination.totalPages
												? 'pointer-events-none opacity-50'
												: 'cursor-pointer'
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				</>
			)}
		</section>
	);
}
