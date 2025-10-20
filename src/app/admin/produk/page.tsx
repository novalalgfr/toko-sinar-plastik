'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, createSortableHeader, createInlineActionColumn } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

export default function ProdukPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Ambil page dan limit dari URL params
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

	// State untuk delete confirmation dialog
	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		product: null as Product | null
	});

	// Function untuk update URL params
	const updateUrlParams = (page: number, limit: number) => {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const fetchProducts = async (page: number = 1, limit: number = 10) => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString()
			});

			const response = await fetch(`/api/produk?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Gagal mengambil data produk');
			}

			const data: ApiResponse = await response.json();

			setProducts(data.data);
			setPagination({
				currentPage: data.pagination.currentPage,
				totalItems: data.pagination.totalItems,
				totalPages: data.pagination.totalPages
			});

			// Update URL params setelah fetch berhasil
			updateUrlParams(data.pagination.currentPage, limit);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
			console.error('Error fetching products:', err);
			toast.error('Gagal memuat data produk');
		} finally {
			setLoading(false);
		}
	};

	// Effect untuk fetch data ketika URL params berubah
	useEffect(() => {
		fetchProducts(pageFromUrl, limitFromUrl);
	}, [pageFromUrl, limitFromUrl]);

	const handleEdit = (product: Product) => {
		window.location.href = `/admin/produk/edit/${product.id_produk}`;
	};

	const handleDeleteClick = (product: Product) => {
		setDeleteDialog({
			open: true,
			product
		});
	};

	const handleDeleteConfirm = async () => {
		const product = deleteDialog.product;
		if (!product) return;

		try {
			const response = await fetch(`/api/produk?id_produk=${product.id_produk}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal menghapus produk');
			}

			toast.error('Produk berhasil dihapus!');

			setDeleteDialog({ open: false, product: null });

			// Refresh data
			fetchProducts(pageFromUrl, limitFromUrl);
		} catch (error) {
			console.error('Error deleting product:', error);
			toast.error('Gagal menghapus produk', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		}
	};

	const columns = [
		{
			accessorKey: 'id_produk',
			header: 'No',
			cell: ({ row }: { row: { index: number } }) => {
				return (pagination.currentPage - 1) * limitFromUrl + row.index + 1;
			}
		},
		{
			accessorKey: 'gambar_url',
			header: 'Gambar',
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const imageUrl = getValue() as string | null;
				const finalUrl = imageUrl || 'https://placehold.co/400x400/png?text=No+Image';

				return (
					<div className="w-16 h-16 relative">
						<Image
							src={finalUrl}
							alt="Produk"
							fill
							className="object-cover rounded"
							unoptimized
						/>
					</div>
				);
			}
		},
		{
			accessorKey: 'nama_produk',
			header: 'Nama Produk'
		},
		{
			accessorKey: 'deskripsi',
			header: 'Deskripsi',
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const desc = getValue() as string | null;
				return desc ? (
					<span className="line-clamp-2 max-w-xs">{desc}</span>
				) : (
					<span className="text-gray-400 italic">-</span>
				);
			}
		},
		{
			accessorKey: 'harga',
			header: createSortableHeader<Product>('Harga'),
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const price = getValue() as number;
				return new Intl.NumberFormat('id-ID', {
					style: 'currency',
					currency: 'IDR',
					minimumFractionDigits: 0
				}).format(price);
			}
		},
		{
			accessorKey: 'stok',
			header: 'Stok',
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const stock = getValue() as number;
				return (
					<span
						className={`font-semibold ${
							stock === 0 ? 'text-red-600' : stock < 10 ? 'text-yellow-600' : 'text-green-600'
						}`}
					>
						{stock}
					</span>
				);
			}
		},
		{
			accessorKey: 'berat',
			header: 'Berat (gram)',
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const weight = getValue() as number;
				return `${Number(weight).toLocaleString('id-ID')} gr`;
			}
		},
		createInlineActionColumn<Product>((row) => (
			<ButtonGroup>
				<Button
					className="bg-blue-500 text-white hover:bg-blue-600"
					onClick={() => handleEdit(row)}
				>
					Edit
				</Button>
				<Button
					className="bg-red-500 text-white hover:bg-red-600"
					onClick={() => handleDeleteClick(row)}
				>
					Hapus
				</Button>
			</ButtonGroup>
		))
	];

	if (error) {
		return (
			<section className="p-4 bg-white rounded-lg shadow">
				<h1 className="text-2xl font-bold mb-4">Produk</h1>
				<div className="text-center py-8">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={() => fetchProducts(pageFromUrl, limitFromUrl)}>Coba Lagi</Button>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Tambah Produk</h1>
			</div>
			{loading ? (
				<div className="flex justify-center items-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					<span className="ml-2 text-gray-600">Memuat data...</span>
				</div>
			) : (
				<div className="p-4 bg-white rounded-lg shadow">
					<DataTable
						columns={columns}
						data={products}
						searchKey="nama_produk"
						searchPlaceholder="Cari produk..."
						onAdd={() => (window.location.href = '/admin/produk/tambah')}
						addLabel="+ Tambah Produk"
						showColumnToggle={false}
						// Props untuk URL pagination
						useUrlPagination={true}
						totalItems={pagination.totalItems}
						currentPage={pagination.currentPage}
						pageSize={limitFromUrl}
					/>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteDialog.open}
				onOpenChange={(open) => setDeleteDialog({ open, product: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus produk{' '}
							<span className="font-semibold text-gray-900">
								&quot;{deleteDialog.product?.nama_produk}&quot;
							</span>
							?
							<br />
							<span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							Hapus
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
