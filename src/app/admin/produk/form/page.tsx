'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductFormPage() {
	const [form, setForm] = useState({
		name: '',
		description: '',
		price: '',
		stock: '',
		category: ''
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Update produk:', form);
	};

	return (
		<section>
			<h1 className="text-2xl font-bold mb-4">Produk</h1>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 bg-white p-6 rounded-xl shadow"
			>
				{/* Nama Produk */}
				<div className="grid w-full gap-2">
					<Label htmlFor="name">Nama Produk</Label>
					<Input
						id="name"
						name="name"
						placeholder="Masukkan nama produk"
						value={form.name}
						onChange={handleChange}
					/>
				</div>

				{/* Deskripsi Produk */}
				<div className="grid w-full gap-2">
					<Label htmlFor="description">Deskripsi</Label>
					<Textarea
						id="description"
						name="description"
						placeholder="Masukkan deskripsi produk"
						value={form.description}
						onChange={handleChange}
					/>
				</div>

				{/* Harga Produk */}
				<div className="grid w-full gap-2">
					<Label htmlFor="price">Harga</Label>
					<Input
						id="price"
						type="number"
						name="price"
						placeholder="Masukkan harga"
						value={form.price}
						onChange={handleChange}
					/>
				</div>

				{/* Stok Produk */}
				<div className="grid w-full gap-2">
					<Label htmlFor="stock">Stok</Label>
					<Input
						id="stock"
						type="number"
						name="stock"
						placeholder="Masukkan jumlah stok"
						value={form.stock}
						onChange={handleChange}
					/>
				</div>

				{/* Kategori */}
				<div className="grid w-full gap-2">
					<Label htmlFor="category">Kategori</Label>
					<Select
						onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
						value={form.category}
					>
						<SelectTrigger
							id="category"
							className="w-full"
						>
							<SelectValue placeholder="Pilih kategori" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Plastik">Mika Plastik</SelectItem>
							<SelectItem value="Kertas">Mika Roti</SelectItem>
							<SelectItem value="Aluminium">Botol Plastik</SelectItem>
						</SelectContent>
					</Select>
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
					Update
				</Button>
			</form>
		</section>
	);
}
