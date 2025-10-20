'use client';

import Image from 'next/image';
import { DataTable, createInlineActionColumn, createSortableHeader } from '@/components/custom/DataTable';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

type CategoryRow = {
	id: number;
	name: string;
	image: string;
};

const categories: CategoryRow[] = Array.from({ length: 12 }, (_, i) => ({
	id: i + 1,
	name: 'Lorem Ipsum',
	image: 'https://placehold.co/600x400/png'
}));

const columns: ColumnDef<CategoryRow>[] = [
	{
		id: 'no',
		header: 'No',
		enableSorting: false,
		enableHiding: false,
		cell: ({ row }: { row: Row<CategoryRow> }) => <span>{row.index + 1}.</span>
	},
	{
		accessorKey: 'image',
		header: 'Gambar',
		cell: ({ getValue }) => (
			<Image
				src={String(getValue() ?? '')}
				alt="Kategori"
				width={64}
				height={64}
				className="w-16 h-16 object-cover rounded"
			/>
		)
	},
	{
		accessorKey: 'name',
		header: createSortableHeader<CategoryRow>('Nama Kategori'),
		cell: ({ getValue }) => (
			<span className="whitespace-nowrap font-medium text-gray-800">{String(getValue() ?? '')}</span>
		)
	},
	createInlineActionColumn<CategoryRow>(() => (
		<ButtonGroup>
			<Button className="bg-blue-500 text-white hover:bg-blue-600">Edit</Button>
			<Button className="bg-red-500 text-white hover:bg-red-600">Hapus</Button>
		</ButtonGroup>
	))
];

export default function KategoriPage() {
	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Kategori</h1>
			</div>
			<div className="p-4 bg-white rounded-lg shadow">
				<DataTable
					columns={columns}
					data={categories}
					searchKey="name"
					searchPlaceholder="Cari kategori..."
					onAdd={() => console.log('Tambah Kategori diklik')}
					addLabel="+ Tambah Kategori"
					showColumnToggle={false}
				/>
			</div>
		</section>
	);
}
