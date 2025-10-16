'use client';

import { DataTable, createSortableHeader, createActionColumn } from '@/components/custom/DataTable';

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
	{ id: 1, name: 'Produk A', desc: 'Deskripsi A', price: 10000, stock: 5, category: 'Kategori A', image: 'img' },
	{ id: 2, name: 'Produk B', desc: 'Deskripsi B', price: 20000, stock: 10, category: 'Kategori B', image: 'img' }
];

const columns = [
	{ accessorKey: 'id', header: 'No' },
	{ accessorKey: 'name', header: createSortableHeader<Product>('Nama Produk') },
	{ accessorKey: 'desc', header: 'Deskripsi' },
	{ accessorKey: 'price', header: createSortableHeader<Product>('Harga') },
	{ accessorKey: 'stock', header: 'Stok' },
	{ accessorKey: 'category', header: 'Kategori' },
	{ accessorKey: 'image', header: 'Gambar' },
	createActionColumn<Product>((row) => (
		<>
			<button className="px-2 py-1 text-sm border rounded">Edit</button>
			<button className="px-2 py-1 text-sm border rounded text-red-600">Delete</button>
		</>
	))
];

export default function ProdukPage() {
	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Produk</h1>
			<DataTable
				columns={columns}
				data={products}
				searchKey="name"
				searchPlaceholder="Cari produk..."
			/>
		</section>
	);
}
