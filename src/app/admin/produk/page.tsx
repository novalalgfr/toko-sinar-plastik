'use client';

import { DataTable, createSortableHeader, createInlineActionColumn } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import Image from 'next/image';

type Product = {
	id: number;
	name: string;
	desc: string;
	price: number;
	stock: number;
	category: string;
	image: string;
};

const products: Product[] = [
	{
		id: 1,
		name: 'Produk A',
		desc: 'Deskripsi A',
		price: 10000,
		stock: 5,
		category: 'Kategori A',
		image: 'https://placehold.co/600x400/png'
	},
	{
		id: 2,
		name: 'Produk B',
		desc: 'Deskripsi B',
		price: 20000,
		stock: 10,
		category: 'Kategori B',
		image: 'https://placehold.co/600x400/png'
	}
];

const columns = [
	{ accessorKey: 'id', header: 'No' },
	{
		accessorKey: 'image',
		header: 'Gambar Produk',
		cell: ({ getValue }: { getValue: () => unknown }) => (
			<Image
				src={String(getValue() ?? '')}
				alt="Gambar Produk"
				width={64}
				height={64}
				className="w-16 h-16 object-cover rounded"
			/>
		)
	},
	{ accessorKey: 'name', header: 'Nama Produk' },
	{ accessorKey: 'category', header: 'Kategori' },
	{ accessorKey: 'desc', header: 'Deskripsi' },
	{ accessorKey: 'price', header: createSortableHeader<Product>('Harga') },
	{ accessorKey: 'stock', header: 'Stok' },
	createInlineActionColumn<Product>((row) => (
		<ButtonGroup>
			<Button className="bg-blue-500 text-white hover:bg-blue-600">Edit</Button>
			<Button className="bg-red-500 text-white hover:bg-red-600">Hapus</Button>
		</ButtonGroup>
	))
];

export default function ProdukPage() {
	return (
		<section className="p-4 bg-white rounded-lg shadow">
			<h1 className="text-2xl font-bold mb-4">Produk</h1>
			<DataTable
				columns={columns}
				data={products}
				searchKey="name"
				searchPlaceholder="Cari produk..."
				onAdd={() => console.log('Tambah Produk diklik')}
				addLabel="+ Tambah Produk"
				showColumnToggle={false}
			/>
		</section>
	);
}
