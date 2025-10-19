'use client';

import * as React from 'react';
import { DataTable, createSortableHeader } from '@/components/custom/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Pesanan = {
	name: string;
	product: string;
	telp: number;
	email: string;
	address: string;
	date: string;
	status?: string;
};

const productsData: Pesanan[] = [
	{
		name: 'Aya',
		product: 'Golden Fill',
		telp: 628123456789,
		email: 'aya@example.com',
		address: 'Jl. Merdeka No. 45, Jakarta',
		date: '2025-10-19'
	},
	{
		name: 'Eja',
		product: 'Pisang Goreng Madu',
		telp: 628987654321,
		email: 'eja@example.com',
		address: 'Jl. Anggrek Raya No. 12, Bandung',
		date: '2025-10-18',
	}
];

export default function ProdukPage() {
	const [products, setProducts] = React.useState<Pesanan[]>(productsData);

	const handleStatusChange = (name: string, newStatus: string) => {
		setProducts((prev) => prev.map((item) => (item.name === name ? { ...item, status: newStatus } : item)));
	};

	const columns = [
		{ accessorKey: 'name', header: createSortableHeader<Pesanan>('Nama Pelanggan') },
		{ accessorKey: 'product', header: createSortableHeader<Pesanan>('Nama Produk') },
		{ accessorKey: 'telp', header: 'Nomor Telepon' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'address', header: 'Alamat' },
		{ accessorKey: 'date', header: createSortableHeader<Pesanan>('Tanggal Pesanan') },
		{
			accessorKey: 'status',
			header: 'Status Pesanan',
			cell: ({ row }: { row: { original: Pesanan } }) => {
				const currentStatus = row.original.status;
				const name = row.original.name;

				return (
					<Select
						value={currentStatus ?? undefined}
						onValueChange={(value) => handleStatusChange(name, value)}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue
								placeholder="Pilih status"
								className={!currentStatus ? 'text-muted-foreground' : ''}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Menunggu Pembayaran">Menunggu Pembayaran</SelectItem>
							<SelectItem value="Pembayaran Dikonfirmasi">Pembayaran Dikonfirmasi</SelectItem>
							<SelectItem value="Barang Dikemas">Barang Dikemas</SelectItem>
							<SelectItem value="Dalam Pengiriman">Dalam Pengiriman</SelectItem>
							<SelectItem value="Barang Diterima">Barang Diterima</SelectItem>
						</SelectContent>
					</Select>
				);
			}
		}
	];

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Pesanan</h1>
			<DataTable
				columns={columns}
				data={products}
				searchKey="name"
				searchPlaceholder="Cari nama pelanggan..."
			/>
		</section>
	);
}
