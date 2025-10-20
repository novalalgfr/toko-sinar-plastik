'use client';

import * as React from 'react';
import { DataTable, createSortableHeader } from '@/components/custom/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Row } from '@tanstack/react-table';

interface ProdukItem {
	id_produk: number;
	nama_produk: string;
	jumlah: number;
	subtotal: number; // Ubah dari number ke number (konsisten)
}

interface Pesanan {
	id_pesanan: number;
	nama_pelanggan: string;
	nomor_telpon: string;
	email: string | null;
	alamat: string;
	tanggal_pesanan: string; // Ubah dari Date ke string
	status_pesanan: string; // Konsisten dengan nama property
	kurir: string;
	no_resi: string | null;
	total_harga?: number;
	created_at: string; // Ubah dari Date ke string
	updated_at: string; // Ubah dari Date ke string
	produk?: ProdukItem[];
}

const productsData: Pesanan[] = [
	{
		id_pesanan: 7,
		nama_pelanggan: 'Aya',
		nomor_telpon: '628123456789',
		email: 'aya@example.com',
		alamat: 'Jl. Merdeka No. 45',
		total_harga: 152000,
		tanggal_pesanan: '2025-10-20T04:50:28.000Z',
		status_pesanan: 'Pending', // Ubah dari status_pemesanan
		kurir: '',
		no_resi: null,
		created_at: '2025-10-20T04:50:28.000Z',
		updated_at: '2025-10-20T04:55:37.000Z',
		produk: [
			{
				id_produk: 20,
				nama_produk: 'Golden Fill Coklat',
				jumlah: 2,
				subtotal: 100000 // Ubah dari string ke number
			},
			{
				id_produk: 21,
				nama_produk: 'Golden Fill Strawberry',
				jumlah: 1,
				subtotal: 52000 // Ubah dari string ke number
			}
		]
	}
];

export default function PesananPage() {
	const [products, setProducts] = React.useState<Pesanan[]>(productsData);

	// Ubah parameter dari name (string) ke idPesanan (number)
	const handleStatusChange = (idPesanan: number, newStatus: string) => {
		setProducts((prev) =>
			prev.map((item) => (item.id_pesanan === idPesanan ? { ...item, status_pesanan: newStatus } : item))
		);
	};

	const columns = [
		{
			id: 'no',
			header: 'No',
			cell: ({ row }: { row: Row<Pesanan> }) => <span>{row.index + 1}.</span>
		},
		{
			id: 'produk',
			header: 'Produk',
			cell: ({ row }: { row: { original: Pesanan } }) => (
				<div className="space-y-1.5">
					{row.original.produk?.map((item, index) => (
						<div
							key={index}
							className="rounded-md bg-muted/50 p-2"
						>
							<div className="font-medium text-sm mb-0.5">{item.nama_produk}</div>
							<div className="text-xs text-muted-foreground">
								{item.jumlah}× • Rp {Number(item.subtotal).toLocaleString('id-ID')}
							</div>
						</div>
					))}
				</div>
			)
		},
		{
			accessorKey: 'nama_pelanggan',
			header: 'Nama Pelanggan'
		},
		{
			accessorKey: 'nomor_telpon',
			header: 'Nomor Telepon'
		},
		{
			accessorKey: 'email',
			header: 'Email'
		},
		{
			accessorKey: 'alamat',
			header: 'Alamat'
		},
		{
			accessorKey: 'total_harga',
			header: 'Total Harga',
			cell: ({ getValue }: { getValue: () => unknown }) => (
				<span>Rp {Number(getValue()).toLocaleString('id-ID')}</span>
			)
		},
		{
			accessorKey: 'tanggal_pesanan',
			header: createSortableHeader<Pesanan>('Tanggal Pesanan'),
			cell: ({ getValue }: { getValue: () => unknown }) => (
				<span>{new Date(String(getValue())).toLocaleDateString('id-ID')}</span>
			)
		},
		{
			accessorKey: 'status_pesanan',
			header: 'Status Pesanan',
			cell: ({ row }: { row: { original: Pesanan } }) => {
				const currentStatus = row.original.status_pesanan;
				const idPesanan = row.original.id_pesanan;

				return (
					<Select
						value={currentStatus ?? undefined}
						onValueChange={(value) => handleStatusChange(idPesanan, value)}
					>
						<SelectTrigger className="w-[200px] cursor-pointer">
							<SelectValue
								placeholder="Pilih status"
								className={!currentStatus ? 'text-muted-foreground' : ''}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem
								value="Pending"
								className="cursor-pointer"
							>
								Pending
							</SelectItem>
							<SelectItem
								value="Menunggu Pembayaran"
								className="cursor-pointer"
							>
								Menunggu Pembayaran
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
		}
	];

	return (
		<section className="p-4 bg-white rounded-lg shadow">
			{/* <h1 className="text-2xl font-bold mb-4">Pesanan</h1> */}
			<DataTable
				columns={columns}
				data={products}
				searchKey="nama_pelanggan" // Ubah dari "name" ke "nama_pelanggan"
				searchPlaceholder="Cari nama pelanggan..."
				showColumnToggle={false}
			/>
		</section>
	);
}
