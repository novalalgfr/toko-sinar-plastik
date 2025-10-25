'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { DataTable } from '@/components/custom/DataTable';

type Pengaturan = {
	id: number;
	name: string;
	email: string;
	peran: string;
	no_telepon: number;
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
		no_telepon: 15,
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
		no_telepon: 27,
		rt: 1,
		rw: 5,
		kelurahan: 'Sukajadi',
		kecamatan: 'Bandung Wetan',
		latitude: -6.9053,
		longitude: 107.6131
	}
];

function PengaturanContent() {
	const [data] = React.useState<Pengaturan[]>(pengaturanData);

	const columns = [
		{
			id: 'no',
			header: 'No',
			enableSorting: false,
			cell: ({ row }: { row: { index: number } }) => <div>{row.index + 1}</div>
		},
		{ accessorKey: 'name', header: 'Nama' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'peran', header: 'Peran' },
		{ accessorKey: 'no_telepon', header: 'No Telepon' },
		{ accessorKey: 'alamat', header: 'Alamat' },
		{ accessorKey: 'rt', header: 'RT' },
		{ accessorKey: 'rw', header: 'RW' },
		{ accessorKey: 'kelurahan', header: 'Kelurahan' },
		{ accessorKey: 'kecamatan', header: 'Kecamatan' },
		{ accessorKey: 'latitude', header: 'Latitude' },
		{ accessorKey: 'longitude', header: 'Longitude' }
	];

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Pengaturan Pengguna</h1>
			</div>
			<div className="p-4 bg-white rounded-lg shadow">
				<DataTable
					columns={columns}
					data={data}
					searchKey="name"
					searchPlaceholder="Cari nama pengguna..."
					showColumnToggle={false}
				/>
			</div>
		</section>
	);
}

export default function PengaturanPage() {
	return (
		<Suspense
			fallback={
				<section>
					<div className="flex items-center gap-4 mb-4">
						<h1 className="text-2xl font-bold">Pengaturan Pengguna</h1>
					</div>
					<div className="p-4 bg-white rounded-lg shadow">
						<div className="animate-pulse space-y-4">
							<div className="h-10 bg-gray-200 rounded" />
							<div className="h-64 bg-gray-200 rounded" />
						</div>
					</div>
				</section>
			}
		>
			<PengaturanContent />
		</Suspense>
	);
}
