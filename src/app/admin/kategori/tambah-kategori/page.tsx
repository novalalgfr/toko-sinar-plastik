'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';

export default function ProductFormPage() {
	const [form, setForm] = useState({
		name: '',
		category: ''
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Tambah kategori:', form);
	};

	return (
		<section>
			<h1 className="font-bold">Tambah Kategori</h1>

			<form
				onSubmit={handleSubmit}
				className="mt-4 space-y-4 bg-white p-6 rounded-xl shadow"
			>
				{/* Kategori */}
				<div className="grid w/full gap-2">
					<Label htmlFor="category">Nama Kategori</Label>
					<Input
						id="category"
						type="text"
						name="category"
						placeholder="Masukkan kategori produk"
						value={form.category}
						onChange={handleChange}
					/>
				</div>

				{/* Upload Gambar */}
				<div className="grid w-1/4 gap-2">
					<ImageUpload
						id="picture"
						label="Gambar"
					/>
				</div>

				<Button
					type="submit"
					className="w-full"
				>
					Tambah
				</Button>
			</form>
		</section>
	);
}
