'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, createInlineActionColumn, createSortableHeader } from '@/components/custom/DataTable';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import Skeleton from '@/components/custom/Skeleton';

// === TIPE DATA SESUAI API ===
type Category = {
	id_kategori: number;
	nama_kategori: string;
	gambar: string | null;
	image_url: string | null;
	created_at: string;
	updated_at: string;
};

type ApiResponse = {
	success: boolean;
	data: Category[];
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

function KategoriContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// ambil nilai page & limit dari URL
	const pageFromUrl = parseInt(searchParams.get('page') || '1');
	const limitFromUrl = parseInt(searchParams.get('limit') || '10');

	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalItems: 0,
		totalPages: 1
	});

	// state untuk dialog hapus
	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		category: null as Category | null
	});

	// === fungsi untuk update URL params ===
	const updateUrlParams = (page: number, limit: number) => {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		router.push(`?${params.toString()}`, { scroll: false });
	};

	// === fetch data kategori ===
	const fetchCategories = async (page: number = 1, limit: number = 10) => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString()
			});

			const res = await fetch(`/api/kategori?${params.toString()}`);
			if (!res.ok) throw new Error('Gagal mengambil data kategori');

			const data: ApiResponse = await res.json();

			const sortedData = data.data.sort((a, b) => a.id_kategori - b.id_kategori);

			setCategories(sortedData);
			setPagination({
				currentPage: data.pagination.currentPage,
				totalItems: data.pagination.totalItems,
				totalPages: data.pagination.totalPages
			});

			updateUrlParams(data.pagination.currentPage, limit);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
			toast.error('Gagal memuat data kategori');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories(pageFromUrl, limitFromUrl);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageFromUrl, limitFromUrl]);

	// === aksi edit ===
	const handleEdit = (category: Category) => {
		window.location.href = `/admin/kategori/edit/${category.id_kategori}`;
	};

	// === aksi delete ===
	const handleDeleteClick = (category: Category) => {
		setDeleteDialog({ open: true, category });
	};

	const handleDeleteConfirm = async () => {
		const category = deleteDialog.category;
		if (!category) return;

		try {
			const res = await fetch(`/api/kategori?id_kategori=${category.id_kategori}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Gagal menghapus kategori');
			}

			toast.success('Kategori berhasil dihapus!');
			setDeleteDialog({ open: false, category: null });
			fetchCategories(pageFromUrl, limitFromUrl);
		} catch (err) {
			toast.error('Gagal menghapus kategori', {
				description: err instanceof Error ? err.message : 'Terjadi kesalahan'
			});
		}
	};

	// === kolom tabel ===
	const columns = [
		{
			id: 'no',
			header: 'No',
			enableSorting: false,
			cell: ({ row }: { row: { index: number } }) => (
				<span>{(pagination.currentPage - 1) * limitFromUrl + row.index + 1}.</span>
			)
		},
		{
			accessorKey: 'image_url',
			header: 'Gambar',
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const imageUrl = getValue() as string | null;
				const finalUrl = imageUrl || 'https://placehold.co/400x400/png?text=No+Image';
				return (
					<div className="w-16 h-16 relative">
						<Image
							src={finalUrl}
							alt="Kategori"
							fill
							className="object-cover rounded"
							unoptimized
						/>
					</div>
				);
			}
		},
		{
			accessorKey: 'nama_kategori',
			header: createSortableHeader<Category>('Nama Kategori'),
			cell: ({ getValue }: { getValue: () => unknown }) => (
				<span className="font-medium text-gray-800">{String(getValue() ?? '')}</span>
			)
		},
		createInlineActionColumn<Category>((row) => (
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

	// === error state ===
	if (error) {
		return (
			<section className="p-4 bg-white rounded-lg shadow">
				<h1 className="text-2xl font-bold mb-4">Kategori</h1>
				<div className="text-center py-8">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={() => fetchCategories(pageFromUrl, limitFromUrl)}>Coba Lagi</Button>
				</div>
			</section>
		);
	}

	// === tampilan utama ===
	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Kategori</h1>
			</div>
			{loading ? (
				<Skeleton variant="table" />
			) : (
				<div className="p-4 bg-white rounded-lg shadow">
					<DataTable
						columns={columns}
						data={categories}
						searchKey="nama_kategori"
						searchPlaceholder="Cari kategori..."
						onAdd={() => (window.location.href = '/admin/kategori/tambah')}
						addLabel="+ Tambah Kategori"
						showColumnToggle={false}
						useUrlPagination={true}
						totalItems={pagination.totalItems}
						currentPage={pagination.currentPage}
						pageSize={limitFromUrl}
					/>
				</div>
			)}

			{/* dialog hapus */}
			<AlertDialog
				open={deleteDialog.open}
				onOpenChange={(open) => setDeleteDialog({ open, category: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus kategori{' '}
							<span className="font-semibold text-gray-900">
								&quot;{deleteDialog.category?.nama_kategori}&quot;
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

export default function KategoriPage() {
	return (
		<Suspense fallback={<Skeleton variant="table" />}>
			<KategoriContent />
		</Suspense>
	);
}
