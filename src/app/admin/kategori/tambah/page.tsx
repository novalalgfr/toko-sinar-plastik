'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function TambahKategoriPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [form, setForm] = useState({
		nama_kategori: ''
	});

	// ✅ Handle perubahan input text
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	// ✅ Handle perubahan gambar
	const handleImageChange = (file: File | null) => {
		setImageFile(file);
	};

	// ✅ Submit ke API
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.nama_kategori) {
			toast.error('Nama kategori wajib diisi');
			return;
		}

		try {
			setLoading(true);

			// Gunakan FormData agar bisa kirim file juga
			const formData = new FormData();
			formData.append('nama_kategori', form.nama_kategori);

			if (imageFile) {
				formData.append('gambar', imageFile);
			}

			const response = await fetch('/api/kategori', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal menambahkan kategori');
			}

			toast.success('Kategori berhasil ditambahkan!');
			setForm({ nama_kategori: '' });
			setImageFile(null);

			// Redirect setelah 1 detik
			setTimeout(() => {
				router.push('/admin/kategori');
			}, 1000);
		} catch (error) {
			console.error('Error:', error);
			toast.error('Gagal menambahkan kategori', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => router.push('/admin/kategori')}
					className="cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-2xl font-bold">Tambah Kategori</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className="mt-4 space-y-4 bg-white p-6 rounded-xl shadow"
			>
				{/* Nama Kategori */}
				<div className="grid w-full gap-2">
					<Label htmlFor="nama_kategori">Nama Kategori *</Label>
					<Input
						id="nama_kategori"
						type="text"
						name="nama_kategori"
						placeholder="Masukkan nama kategori"
						value={form.nama_kategori}
						onChange={handleChange}
						required
					/>
				</div>

				{/* Upload Gambar */}
				<div className="grid w-1/3 gap-2">
					<ImageUpload
						id="gambar"
						label="Gambar Kategori"
						onFileChange={handleImageChange}
					/>
				</div>

				{/* Tombol Aksi */}
				<Button
					type="submit"
					className="w-full"
					disabled={loading}
				>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Menyimpan...
						</>
					) : (
						'Tambah Kategori'
					)}
				</Button>
			</form>
		</section>
	);
}
