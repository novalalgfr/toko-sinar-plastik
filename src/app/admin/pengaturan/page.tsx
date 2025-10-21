'use client';

import * as React from 'react';
import { DataTable, createSortableHeader } from '@/components/custom/DataTable';

type Pengaturan = {
	id: number;
	name: string;
	email: string;
	peran: string;
	no: number;
	rt: number;
	rw: number;
	kelurahan: string;
	kecamatan: string;
	latitude: number;
	longitude: number;
};

const pengaturanData: Pengaturan[] = [
	{
		id: 1,
		name: 'Aya Pratama',
		email: 'aya@example.com',
		peran: 'Admin',
		no: 15,
		rt: 3,
		rw: 2,
		kelurahan: 'Cempaka Putih',
		kecamatan: 'Menteng',
		latitude: -6.1902,
		longitude: 106.8451
	},
	{
		id: 2,
		name: 'Eja Saputra',
		email: 'eja@example.com',
		peran: 'Petugas',
		no: 27,
		rt: 1,
		rw: 5,
		kelurahan: 'Sukajadi',
		kecamatan: 'Bandung Wetan',
		latitude: -6.9053,
		longitude: 107.6131
	}
];

export default function PengaturanPage() {
	const [data] = React.useState<Pengaturan[]>(pengaturanData);

	const columns = [
		{ accessorKey: 'id', header: createSortableHeader<Pengaturan>('ID') },
		{ accessorKey: 'name', header: createSortableHeader<Pengaturan>('Nama') },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'peran', header: 'Peran' },
		{ accessorKey: 'no', header: 'No Rumah' },
		{ accessorKey: 'rt', header: 'RT' },
		{ accessorKey: 'rw', header: 'RW' },
		{ accessorKey: 'kelurahan', header: 'Kelurahan' },
		{ accessorKey: 'kecamatan', header: 'Kecamatan' },
		{ accessorKey: 'latitude', header: 'Latitude' },
		{ accessorKey: 'longitude', header: 'Longitude' }
	];

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Pengaturan Pengguna</h1>
			<DataTable
				columns={columns}
				data={data}
				searchKey="name"
				searchPlaceholder="Cari nama pengguna..."
				showColumnToggle={false}
			/>
		</section>
	);
}
