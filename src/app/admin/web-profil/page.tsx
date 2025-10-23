'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';

export default function AdminProfilWebsitePage() {
	// frontend-only state (belum terhubung backend)
	const [stats, setStats] = React.useState({
		stat1: '',
		stat2: '',
		stat3: ''
	});

	return (
		<section className="min-h-screen bg-[#e9e9e9] p-5 sm:p-8">
			<h1 className="text-3xl font-extrabold mb-5">Profil Website</h1>

			{/* ===== Hero Section ===== */}
			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="mb-4 inline-block rounded border px-2 py-1 text-sm font-semibold">Hero Section</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Image 1 */}
					<div>
						<Label className="mb-2 block">Image 1</Label>
						<div className="rounded-md border-2 border-dashed border-gray-300 p-3">
							{/* ImageUpload tampil di dalam dashed box */}
							<ImageUpload
								id="hero-image-1"
								label="Klik untuk mengunggah atau seret & lepas PNG & JPG hingga 5MB"
							/>
						</div>
					</div>

					{/* Image 2 */}
					<div>
						<Label className="mb-2 block">Image 2</Label>
						<div className="rounded-md border-2 border-dashed border-gray-300 p-3">
							<ImageUpload
								id="hero-image-2"
								label="Klik untuk mengunggah atau seret & lepas PNG & JPG hingga 5MB"
							/>
						</div>
					</div>

					{/* Image 3 */}
					<div>
						<Label className="mb-2 block">Image 3</Label>
						<div className="rounded-md border-2 border-dashed border-gray-300 p-3">
							<ImageUpload
								id="hero-image-3"
								label="Klik untuk mengunggah atau seret & lepas PNG & JPG hingga 5MB"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* ===== Stat Section ===== */}
			<div className="rounded-lg border bg-white p-4 sm:p-6">
				<div className="mb-4 font-semibold">Stat Section</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Stat 1 */}
					<div>
						<Label
							htmlFor="stat1"
							className="mb-2 block"
						>
							Stat 1
						</Label>
						<Input
							id="stat1"
							placeholder="Lorem Ipsum...."
							value={stats.stat1}
							onChange={(e) => setStats((s) => ({ ...s, stat1: e.target.value }))}
						/>
					</div>

					{/* Stat 2 */}
					<div>
						<Label
							htmlFor="stat2"
							className="mb-2 block"
						>
							Stat 2
						</Label>
						<Input
							id="stat2"
							placeholder="Lorem Ipsum...."
							value={stats.stat2}
							onChange={(e) => setStats((s) => ({ ...s, stat2: e.target.value }))}
						/>
					</div>

					{/* Stat 3 */}
					<div>
						<Label
							htmlFor="stat3"
							className="mb-2 block"
						>
							Stat 3
						</Label>
						<Input
							id="stat3"
							placeholder="Lorem Ipsum...."
							value={stats.stat3}
							onChange={(e) => setStats((s) => ({ ...s, stat3: e.target.value }))}
						/>
					</div>
				</div>

				{/* Aksi (frontend only) */}
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="outline">Batal</Button>
					<Button className="bg-black text-white hover:opacity-90">Simpan</Button>
				</div>
			</div>
		</section>
	);
}
