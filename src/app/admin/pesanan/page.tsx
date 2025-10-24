'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, createSortableHeader, createInlineActionColumn } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import Skeleton from '@/components/custom/Skeleton';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProdukItem {
	id_produk: number;
	nama_produk: string;
	jumlah: number;
	subtotal: string | number;
}

interface Pesanan {
	id_pesanan: string;
	nama_pelanggan: string;
	nomor_telpon: string;
	email: string | null;
	alamat: string;
	tanggal_pesanan: string;
	status_pemesanan: string;
	kurir: string;
	no_resi: string | null;
	total_harga: number;
	created_at: string;
	updated_at: string;
	produk?: ProdukItem[];
}

interface ApiResponse {
	success: boolean;
	data: Pesanan[];
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
}

export default function PesananPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const pageFromUrl = parseInt(searchParams.get('page') || '1');
	const limitFromUrl = parseInt(searchParams.get('limit') || '10');
	const idFromUrl = searchParams.get('id') || '';

	const [pesanan, setPesanan] = React.useState<Pesanan[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [pagination, setPagination] = React.useState({
		currentPage: 1,
		totalItems: 0,
		totalPages: 1
	});

	// State untuk search input
	const [searchValue, setSearchValue] = React.useState(idFromUrl);

	// State untuk expand/collapse produk
	const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

	// State untuk expand/collapse alamat
	const [expandedAlamat, setExpandedAlamat] = React.useState<Set<string>>(new Set());

	// State untuk delete confirmation
	const [deleteDialog, setDeleteDialog] = React.useState({
		open: false,
		pesanan: null as Pesanan | null
	});

	// State untuk input resi
	const [resiDialog, setResiDialog] = React.useState({
		open: false,
		pesanan: null as Pesanan | null,
		noResi: '',
		kurir: 'JNE'
	});

	const toggleRowExpand = (idPesanan: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(idPesanan)) {
				newSet.delete(idPesanan);
			} else {
				newSet.add(idPesanan);
			}
			return newSet;
		});
	};

	const toggleAlamatExpand = (idPesanan: string) => {
		setExpandedAlamat((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(idPesanan)) {
				newSet.delete(idPesanan);
			} else {
				newSet.add(idPesanan);
			}
			return newSet;
		});
	};

	const updateUrlParams = (page: number, limit: number, id?: string) => {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('limit', limit.toString());
		if (id) {
			params.set('id', id);
		}
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const fetchPesanan = async (page: number = 1, limit: number = 10, id?: string) => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString()
			});

			// Tambahkan parameter id jika ada
			if (id && id.trim()) {
				params.set('id', id.trim());
			}

			const response = await fetch(`/api/pesanan?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Gagal mengambil data pesanan');
			}

			const data: ApiResponse = await response.json();

			setPesanan(data.data);
			setPagination({
				currentPage: data.pagination.currentPage,
				totalItems: data.pagination.totalItems,
				totalPages: data.pagination.totalPages
			});

			updateUrlParams(data.pagination.currentPage, limit, id);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
			console.error('Error fetching pesanan:', err);
			toast.error('Gagal memuat data pesanan');
		} finally {
			setLoading(false);
		}
	};

	// Effect untuk fetch data saat URL params berubah
	React.useEffect(() => {
		fetchPesanan(pageFromUrl, limitFromUrl, idFromUrl);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageFromUrl, limitFromUrl, idFromUrl]);

	// Sync search value dengan URL
	React.useEffect(() => {
		setSearchValue(idFromUrl);
	}, [idFromUrl]);

	// Handler untuk search dengan debounce
	const handleSearch = React.useCallback(
		(value: string) => {
			setSearchValue(value);

			// Debounce search
			const timeoutId = setTimeout(() => {
				// Reset ke halaman 1 saat search
				updateUrlParams(1, limitFromUrl, value);
			}, 500);

			return () => clearTimeout(timeoutId);
		},
		[limitFromUrl]
	);

	const handleStatusChange = async (idPesanan: string, newStatus: string) => {
		// Jika status "Dalam Pengiriman", wajib input resi
		if (newStatus === 'Dalam Pengiriman') {
			const currentPesanan = pesanan.find((p) => p.id_pesanan === idPesanan);
			if (!currentPesanan?.no_resi) {
				setResiDialog({
					open: true,
					pesanan: currentPesanan || null,
					noResi: '',
					kurir: currentPesanan?.kurir || 'JNE'
				});
				return;
			}
		}

		try {
			const response = await fetch('/api/pesanan', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id_pesanan: idPesanan,
					status_pemesanan: newStatus
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal mengupdate status');
			}

			toast.success('Status pesanan berhasil diperbarui!');

			// Update state lokal
			setPesanan((prev) =>
				prev.map((item) => (item.id_pesanan === idPesanan ? { ...item, status_pemesanan: newStatus } : item))
			);
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Gagal mengupdate status pesanan', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		}
	};

	const handleResiSubmit = async () => {
		if (!resiDialog.pesanan || !resiDialog.noResi.trim()) {
			toast.error('Nomor resi tidak boleh kosong!');
			return;
		}

		try {
			const response = await fetch('/api/pesanan', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id_pesanan: resiDialog.pesanan.id_pesanan,
					status_pemesanan: 'Dalam Pengiriman',
					no_resi: resiDialog.noResi,
					kurir: resiDialog.kurir
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal mengupdate resi');
			}

			toast.success('Nomor resi berhasil ditambahkan!');

			// Update state lokal
			setPesanan((prev) =>
				prev.map((item) =>
					item.id_pesanan === resiDialog.pesanan?.id_pesanan
						? {
								...item,
								status_pemesanan: 'Dalam Pengiriman',
								no_resi: resiDialog.noResi,
								kurir: resiDialog.kurir
						  }
						: item
				)
			);

			setResiDialog({ open: false, pesanan: null, noResi: '', kurir: 'JNE' });
		} catch (error) {
			console.error('Error submitting resi:', error);
			toast.error('Gagal menambahkan nomor resi', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		}
	};

	const handleDeleteClick = (pesanan: Pesanan) => {
		setDeleteDialog({
			open: true,
			pesanan
		});
	};

	const handleDeleteConfirm = async () => {
		const currentPesanan = deleteDialog.pesanan;
		if (!currentPesanan) return;

		try {
			const response = await fetch(`/api/pesanan?id_pesanan=${currentPesanan.id_pesanan}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal menghapus pesanan');
			}

			toast.success('Pesanan berhasil dihapus!');
			setDeleteDialog({ open: false, pesanan: null });

			// Handle pagination setelah delete
			const isLastItemOnPage = pesanan.length === 1;
			const isNotFirstPage = pageFromUrl > 1;

			if (isLastItemOnPage && isNotFirstPage) {
				fetchPesanan(pageFromUrl - 1, limitFromUrl, idFromUrl);
			} else {
				fetchPesanan(pageFromUrl, limitFromUrl, idFromUrl);
			}
		} catch (error) {
			console.error('Error deleting pesanan:', error);
			toast.error('Gagal menghapus pesanan', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		}
	};

	const columns = [
		{
			id: 'no',
			header: 'No',
			size: 60,
			cell: ({ row }: { row: Row<Pesanan> }) => {
				return (pagination.currentPage - 1) * limitFromUrl + row.index + 1;
			}
		},
		{
			accessorKey: 'id_pesanan',
			header: 'ID Pesanan',
			size: 120
		},
		{
			accessorKey: 'nama_pelanggan',
			header: 'Nama',
			size: 100
		},
		{
			accessorKey: 'nomor_telpon',
			header: 'No. Telepon',
			size: 130
		},
		{
			accessorKey: 'email',
			header: 'Email',
			size: 100,
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const email = getValue() as string | null;
				return email ? (
					<span className="text-sm">{email}</span>
				) : (
					<span className="text-gray-400 italic">-</span>
				);
			}
		},
		{
			accessorKey: 'alamat',
			header: 'Alamat',
			size: 100,
			cell: ({ getValue, row }: { getValue: () => unknown; row: { original: Pesanan } }) => {
				const alamat = getValue() as string;
				const isExpanded = expandedAlamat.has(row.original.id_pesanan);
				const isLongAddress = alamat.length > 20;

				if (!isLongAddress) {
					return <span className="text-sm">{alamat}</span>;
				}

				return (
					<div className="space-y-2">
						<div className={`text-sm ${isExpanded ? '' : 'line-clamp-1'}`}>{alamat}</div>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs"
							onClick={() => toggleAlamatExpand(row.original.id_pesanan)}
						>
							{isExpanded ? (
								<>
									<ChevronUp className="h-3 w-3 mr-1" />
									Sembunyikan
								</>
							) : (
								<>
									<ChevronDown className="h-3 w-3 mr-1" />
									Selengkapnya
								</>
							)}
						</Button>
					</div>
				);
			}
		},
		{
			accessorKey: 'tanggal_pesanan',
			header: createSortableHeader<Pesanan>('Tanggal'),
			size: 110,
			cell: ({ getValue }: { getValue: () => unknown }) => (
				<span className="text-sm">{new Date(String(getValue())).toLocaleDateString('id-ID')}</span>
			)
		},
		{
			accessorKey: 'status_pemesanan',
			header: 'Status',
			size: 180,
			cell: ({ row }: { row: { original: Pesanan } }) => {
				const currentStatus = row.original.status_pemesanan;
				const idPesanan = row.original.id_pesanan;

				return (
					<Select
						value={currentStatus ?? undefined}
						onValueChange={(value) => handleStatusChange(idPesanan, value)}
					>
						<SelectTrigger className="w-[160px] cursor-pointer text-sm">
							<SelectValue placeholder="Pilih status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								value="Pending"
								className="cursor-pointer"
							>
								Pending
							</SelectItem>
							<SelectItem
								value="Pembayaran Dikonfirmasi"
								className="cursor-pointer"
							>
								Pembayaran Dikonfirmasi
							</SelectItem>
							<SelectItem
								value="Barang Dikemas"
								className="cursor-pointer"
							>
								Barang Dikemas
							</SelectItem>
							<SelectItem
								value="Dalam Pengiriman"
								className="cursor-pointer"
							>
								Dalam Pengiriman
							</SelectItem>
							<SelectItem
								value="Barang Diterima"
								className="cursor-pointer"
							>
								Barang Diterima
							</SelectItem>
						</SelectContent>
					</Select>
				);
			}
		},
		{
			accessorKey: 'kurir',
			header: 'Kurir',
			size: 80,
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const kurir = getValue() as string;
				return kurir ? (
					<span className="text-sm">{kurir}</span>
				) : (
					<span className="text-gray-400 italic">-</span>
				);
			}
		},
		{
			accessorKey: 'no_resi',
			header: 'No. Resi',
			size: 130,
			cell: ({ getValue }: { getValue: () => unknown }) => {
				const resi = getValue() as string | null;
				return resi ? (
					<span className="font-mono text-xs">{resi}</span>
				) : (
					<span className="text-gray-400 italic">-</span>
				);
			}
		},
		{
			id: 'produk',
			header: 'Produk',
			size: 180,
			cell: ({ row }: { row: { original: Pesanan } }) => {
				const isExpanded = expandedRows.has(row.original.id_pesanan);
				const produkList = row.original.produk || [];
				const produkCount = produkList.length;

				if (produkCount === 0) {
					return <span className="text-gray-400 italic text-sm">Tidak ada produk</span>;
				}

				return (
					<div className="space-y-2">
						<Button
							variant="outline"
							size="sm"
							className="w-full justify-between text-xs"
							onClick={() => toggleRowExpand(row.original.id_pesanan)}
						>
							<span>{produkCount} Produk</span>
							{isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
						</Button>

						{isExpanded && (
							<div className="space-y-1.5 mt-2">
								{produkList.map((item, index) => (
									<div
										key={index}
										className="rounded-md bg-muted/50 p-2 border"
									>
										<div className="font-medium text-xs mb-0.5">{item.nama_produk}</div>
										<div className="text-xs text-muted-foreground">
											{item.jumlah}× • Rp {Number(item.subtotal).toLocaleString('id-ID')}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				);
			}
		},
		{
			accessorKey: 'total_harga',
			header: 'Total',
			size: 120,
			cell: ({ getValue }: { getValue: () => unknown }) => (
				<span className="font-semibold text-sm">Rp {Number(getValue()).toLocaleString('id-ID')}</span>
			)
		},
		createInlineActionColumn<Pesanan>((row) => (
			<Button
				size="sm"
				className="bg-red-500 text-white hover:bg-red-600 text-xs"
				onClick={() => handleDeleteClick(row)}
			>
				Hapus
			</Button>
		))
	];

	if (error) {
		return (
			<section className="p-4 bg-white rounded-lg shadow">
				<h1 className="text-2xl font-bold mb-4">Pesanan</h1>
				<div className="text-center py-8">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={() => fetchPesanan(pageFromUrl, limitFromUrl, idFromUrl)}>Coba Lagi</Button>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Pesanan</h1>
			</div>
			{loading ? (
				<Skeleton variant="table" />
			) : (
				<div className="p-4 bg-white rounded-lg shadow overflow-hidden">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={pesanan}
							searchKey="id_pesanan"
							searchPlaceholder="Cari ID pesanan"
							searchValue={searchValue}
							onSearchChange={handleSearch}
							showColumnToggle={false}
							useUrlPagination={true}
							totalItems={pagination.totalItems}
							currentPage={pagination.currentPage}
							pageSize={limitFromUrl}
						/>
					</div>
				</div>
			)}

			{/* Dialog Input Resi */}
			<Dialog
				open={resiDialog.open}
				onOpenChange={(open) => !open && setResiDialog({ ...resiDialog, open })}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Input Nomor Resi</DialogTitle>
						<DialogDescription>
							Masukkan nomor resi untuk pesanan{' '}
							<span className="font-semibold">{resiDialog.pesanan?.nama_pelanggan}</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="kurir">Kurir</Label>
							<div className="px-3 py-1 border rounded-md bg-muted text-[15px]">{resiDialog.kurir}</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="resi">Nomor Resi</Label>
							<Input
								id="resi"
								placeholder="Masukkan nomor resi"
								value={resiDialog.noResi}
								onChange={(e) => setResiDialog({ ...resiDialog, noResi: e.target.value })}
								type="number"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setResiDialog({ open: false, pesanan: null, noResi: '', kurir: 'JNE' })}
						>
							Batal
						</Button>
						<Button onClick={handleResiSubmit}>Simpan</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteDialog.open}
				onOpenChange={(open) => setDeleteDialog({ open, pesanan: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus Pesanan?</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus pesanan dari{' '}
							<span className="font-semibold text-gray-900">
								&quot;{deleteDialog.pesanan?.nama_pelanggan}&quot;
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
