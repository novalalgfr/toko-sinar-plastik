'use client';

import Link from 'next/link';
import { DataTable, createSortableHeader } from '@/components/custom/DataTable';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

type CategoryRow = {
	id: number;
	name: string;
	category: string;
};

const categories: CategoryRow[] = Array.from({ length: 12 }, (_, i) => ({
	id: i + 1,
	name: 'Lorem Ipsum',
	category: 'Lorem Ipsum'
}));

const columns: ColumnDef<CategoryRow, unknown>[] = [
	{
		id: 'no',
		header: 'No',
		enableSorting: false,
		enableHiding: false,
		cell: ({ row }: { row: Row<CategoryRow> }) => <span>{row.index + 1}.</span>
	},
	{
		accessorKey: 'name',
		header: createSortableHeader<CategoryRow>('Nama Barang'),
		cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue() ?? '')}</span>
	},
	{
		accessorKey: 'category',
		header: createSortableHeader<CategoryRow>('Kategori'),
		cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue() ?? '')}</span>
	}
];

export default function KategoriPage() {
	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Kategori</h1>

			{/* Toolbar kanan: Tambah Kategori */}
			<div className="mb-3 flex justify-end">
				<Link href="/kategori/tambah">
					<Button className="bg-black text-white hover:opacity-90">Tambah Kategori</Button>
				</Link>
			</div>

			{/* Tabel (tetap pakai pagination bawaan: Previous/Next) */}
			<DataTable<CategoryRow, unknown>
				columns={columns}
				data={categories}
				showSearch={false}
				showColumnToggle={false}
				pageSize={4}
				searchKey="name"
				emptyMessage="Tidak ada data."
			/>
		</section>
	);
}
