'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Interface untuk tipe data kategori
interface Kategori {
	id_kategori: number;
	nama_kategori: string;
	gambar: string | null;
	image_url: string | null;
	created_at: string;
	updated_at: string;
}

export default function TambahProdukPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [loadingKategori, setLoadingKategori] = useState(true);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [kategoris, setKategoris] = useState<Kategori[]>([]);
	const [form, setForm] = useState({
		nama_produk: '',
		deskripsi: '',
		harga: '',
		berat: '',
		stok: '',
		id_kategori: ''
	});

	// Fetch kategori dari API
	useEffect(() => {
		const fetchKategori = async () => {
			try {
				setLoadingKategori(true);
				const response = await fetch('/api/kategori');

				if (!response.ok) {
					throw new Error('Gagal mengambil data kategori');
				}

				const result = await response.json();
				setKategoris(result.data || []);
			} catch (error) {
				console.error('Error fetching kategori:', error);
				toast.error('Gagal memuat kategori', {
					description: error instanceof Error ? error.message : 'Terjadi kesalahan'
				});
			} finally {
				setLoadingKategori(false);
			}
		};

		fetchKategori();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;

		// Untuk field harga dan berat, hapus pemisah ribuan sebelum menyimpan
		if (name === 'harga' || name === 'berat') {
			const cleanValue = value.replace(/\./g, '');
			setForm({ ...form, [name]: cleanValue });
		} else {
			setForm({ ...form, [name]: value });
		}
	};

	const handleImageChange = (file: File | null) => {
		setImageFile(file);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setLoading(true);

			// Buat FormData sesuai dengan yang diharapkan API
			const formData = new FormData();
			formData.append('nama_produk', form.nama_produk);
			formData.append('deskripsi', form.deskripsi);
			formData.append('harga', form.harga);
			formData.append('berat', form.berat);
			formData.append('stok', form.stok);

			if (form.id_kategori) {
				formData.append('id_kategori', form.id_kategori);
			}

			if (imageFile) {
				formData.append('gambar', imageFile);
			}

			const response = await fetch('/api/produk', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal menambahkan produk');
			}

			toast.success('Produk berhasil ditambahkan!');

			// Redirect setelah 1 detik untuk memberikan waktu user melihat toast
			setTimeout(() => {
				router.push('/admin/produk');
			}, 1000);
		} catch (error) {
			console.error('Error:', error);
			toast.error('Gagal menambahkan produk', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		} finally {
			setLoading(false);
		}
	};

	const formatAngka = (angka: number) => angka.toLocaleString('id-ID');

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => router.push('/admin/produk')}
					className="cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-2xl font-bold">Tambah Produk</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-4 bg-white p-6 rounded-xl shadow"
			>
				{/* Nama Produk */}
				<div className="grid w-full gap-2">
					<Label htmlFor="nama_produk">Nama Produk *</Label>
					<Input
						id="nama_produk"
						name="nama_produk"
						placeholder="Masukkan nama produk"
						value={form.nama_produk}
						onChange={handleChange}
						required
					/>
				</div>

				{/* Deskripsi Produk */}
				<div className="grid w-full gap-2">
					<Label htmlFor="deskripsi">Deskripsi</Label>
					<Textarea
						id="deskripsi"
						name="deskripsi"
						placeholder="Masukkan deskripsi produk"
						value={form.deskripsi}
						onChange={handleChange}
						rows={4}
					/>
				</div>

				{/* Harga & Berat */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="grid w-full gap-2">
						<Label htmlFor="harga">Harga (Rp) *</Label>
						<Input
							id="harga"
							type="text"
							name="harga"
							placeholder="0"
							value={form.harga ? formatAngka(Number(form.harga)) : ''}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="grid w-full gap-2">
						<Label htmlFor="berat">Berat (gram) *</Label>
						<Input
							id="berat"
							type="text"
							name="berat"
							placeholder="0"
							value={form.berat ? formatAngka(Number(form.berat)) : ''}
							onChange={handleChange}
							required
						/>
					</div>
				</div>

				{/* Stok */}
				<div className="grid w-full gap-2">
					<Label htmlFor="stok">Stok *</Label>
					<Input
						id="stok"
						type="number"
						name="stok"
						placeholder="0"
						value={form.stok}
						onChange={handleChange}
						required
						min="0"
					/>
				</div>

				{/* Kategori - Mengambil dari API */}
				<div className="grid w-full gap-2">
					<Label htmlFor="id_kategori">Kategori</Label>
					<Select
						onValueChange={(value) => setForm((prev) => ({ ...prev, id_kategori: value }))}
						value={form.id_kategori}
						disabled={loadingKategori}
					>
						<SelectTrigger
							id="id_kategori"
							className="w-full cursor-pointer"
						>
							<SelectValue placeholder={loadingKategori ? 'Memuat kategori...' : 'Pilih kategori'} />
						</SelectTrigger>
						<SelectContent>
							{kategoris.length > 0 ? (
								kategoris.map((kategori) => (
									<SelectItem
										key={kategori.id_kategori}
										value={kategori.id_kategori.toString()}
										className="cursor-pointer"
									>
										{kategori.nama_kategori}
									</SelectItem>
								))
							) : (
								<SelectItem
									value="0"
									disabled
								>
									Tidak ada kategori tersedia
								</SelectItem>
							)}
						</SelectContent>
					</Select>
				</div>

				{/* Upload Gambar */}
				<div className="grid w-full md:w-1/2 gap-2">
					<ImageUpload
						id="gambar"
						label="Gambar Produk"
						onFileChange={handleImageChange}
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push('/admin/produk')}
						disabled={loading}
						className="flex-1"
					>
						Batal
					</Button>
					<Button
						type="submit"
						disabled={loading || loadingKategori}
						className="flex-1"
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Menyimpan...
							</>
						) : (
							'Simpan Produk'
						)}
					</Button>
				</div>
			</form>
		</section>
	);
}
