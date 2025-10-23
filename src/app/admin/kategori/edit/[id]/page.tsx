'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

interface Kategori {
	id_kategori: number;
	nama_kategori: string;
	gambar: string | null;
	image_url: string | null;
	created_at: string;
	updated_at: string;
}

export default function EditKategoriPage() {
	const router = useRouter();
	const params = useParams();
	const id = params.id as string;

	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [currentImage, setCurrentImage] = useState<string | null>(null);
	const [form, setForm] = useState({
		nama_kategori: ''
	});

	// Fetch kategori data berdasarkan id
	useEffect(() => {
		const fetchKategori = async () => {
			try {
				const response = await fetch(`/api/kategori?id=${id}`);
				if (!response.ok) {
					throw new Error('Gagal mengambil data kategori');
				}

				const result = await response.json();
				const kategori: Kategori = result.data;

				setForm({
					nama_kategori: kategori.nama_kategori
				});

				setCurrentImage(kategori.image_url);
			} catch (error) {
				console.error('Error:', error);
				toast.error('Gagal memuat data kategori');
				router.push('/admin/kategori');
			} finally {
				setFetching(false);
			}
		};

		fetchKategori();
	}, [id, router]);

	// Handle perubahan input
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	// Handle perubahan gambar
	const handleImageChange = (file: File | null) => {
		setImageFile(file);
	};

	// Handle submit
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setLoading(true);

			const formData = new FormData();
			formData.append('id_kategori', id);
			formData.append('nama_kategori', form.nama_kategori);

			if (imageFile) {
				formData.append('gambar', imageFile);
			}

			const response = await fetch('/api/kategori', {
				method: 'PUT',
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal mengupdate kategori');
			}

			toast.success('Kategori berhasil diupdate!');
			setTimeout(() => {
				router.push('/admin/kategori');
			}, 1000);
		} catch (error) {
			console.error('Error:', error);
			toast.error('Gagal mengupdate kategori', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		} finally {
			setLoading(false);
		}
	};

	if (fetching) {
		return (
			<section>
				<div className="flex justify-center items-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					<span className="ml-2 text-gray-600">Memuat data kategori...</span>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => router.push('/admin/kategori')}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-2xl font-bold">Edit Kategori</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-4 bg-white p-6 rounded-xl shadow"
			>
				{/* Nama Kategori */}
				<div className="grid w-full gap-2">
					<Label htmlFor="nama_kategori">Nama Kategori *</Label>
					<Input
						id="nama_kategori"
						name="nama_kategori"
						placeholder="Masukkan nama kategori"
						value={form.nama_kategori}
						onChange={handleChange}
						required
					/>
				</div>

				{/* Upload Gambar */}
				<div className="grid w-full md:w-1/2 gap-2">
					<ImageUpload
						id="gambar"
						label="Gambar Kategori"
						onFileChange={handleImageChange}
						defaultPreview={currentImage}
					/>
					<p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah gambar</p>
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push('/admin/kategori')}
						disabled={loading}
						className="flex-1"
					>
						Batal
					</Button>
					<Button
						type="submit"
						disabled={loading}
						className="flex-1"
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Menyimpan...
							</>
						) : (
							'Update Kategori'
						)}
					</Button>
				</div>
			</form>
		</section>
	);
}
