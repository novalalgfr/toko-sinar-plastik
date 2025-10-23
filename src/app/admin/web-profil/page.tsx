'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Textarea } from '@/components/ui/textarea';
import Skeleton from '@/components/custom/Skeleton';
import { toast } from 'sonner';

interface BerandaData {
	id_beranda: number;
	gambar_utama: string | null;
	gambar_1: string | null;
	gambar_2: string | null;
	kolom_title_1: string | null;
	kolom_title_2: string | null;
	kolom_title_3: string | null;
	kolom_subtitle_1: string | null;
	kolom_subtitle_2: string | null;
	kolom_subtitle_3: string | null;
	gambar_ct: string | null;
	deskripsi_ct: string | null;
	gambar_utama_url: string | null;
	gambar_1_url: string | null;
	gambar_2_url: string | null;
	gambar_ct_url: string | null;
	created_at: string;
	updated_at: string;
}

interface ApiResponse {
	success: boolean;
	data: BerandaData[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
		nextPage: number | null;
		prevPage: number | null;
	};
}

export default function HalamanWebProfil() {
	const [loading, setLoading] = React.useState(false);
	const [loadingData, setLoadingData] = React.useState(true);
	const [formData, setFormData] = React.useState({
		kolom_title_1: '',
		kolom_title_2: '',
		kolom_title_3: '',
		kolom_subtitle_1: '',
		kolom_subtitle_2: '',
		kolom_subtitle_3: '',
		deskripsi_ct: ''
	});

	const [originalData, setOriginalData] = React.useState({
		kolom_title_1: '',
		kolom_title_2: '',
		kolom_title_3: '',
		kolom_subtitle_1: '',
		kolom_subtitle_2: '',
		kolom_subtitle_3: '',
		deskripsi_ct: ''
	});

	const [gambarFiles, setGambarFiles] = React.useState({
		gambar_utama: null as File | null,
		gambar_1: null as File | null,
		gambar_2: null as File | null,
		gambar_ct: null as File | null
	});

	const [gambarPreview, setGambarPreview] = React.useState({
		gambar_utama: '',
		gambar_1: '',
		gambar_2: '',
		gambar_ct: ''
	});

	React.useEffect(() => {
		fetchBerandaData();
	}, []);

	const fetchBerandaData = async () => {
		try {
			setLoadingData(true);
			const response = await fetch('/api/beranda');
			const result: ApiResponse = await response.json();

			if (result.success && result.data.length > 0) {
				const berandaData = result.data.find((item: BerandaData) => item.id_beranda === 1);

				if (berandaData) {
					const dataToSet = {
						kolom_title_1: berandaData.kolom_title_1 || '',
						kolom_title_2: berandaData.kolom_title_2 || '',
						kolom_title_3: berandaData.kolom_title_3 || '',
						kolom_subtitle_1: berandaData.kolom_subtitle_1 || '',
						kolom_subtitle_2: berandaData.kolom_subtitle_2 || '',
						kolom_subtitle_3: berandaData.kolom_subtitle_3 || '',
						deskripsi_ct: berandaData.deskripsi_ct || ''
					};

					setFormData(dataToSet);
					setOriginalData(dataToSet);

					setGambarPreview({
						gambar_utama: berandaData.gambar_utama_url || '',
						gambar_1: berandaData.gambar_1_url || '',
						gambar_2: berandaData.gambar_2_url || '',
						gambar_ct: berandaData.gambar_ct_url || ''
					});
				}
			}
		} catch (error) {
			console.error('Error fetching beranda data:', error);
			alert('Gagal memuat data beranda');
		} finally {
			setLoadingData(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileChange = (field: string, file: File | null) => {
		setGambarFiles((prev) => ({ ...prev, [field]: file }));

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setGambarPreview((prev) => ({ ...prev, [field]: reader.result as string }));
			};
			reader.readAsDataURL(file);
		} else {
			setGambarPreview((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const hasChanges = () => {
		const formChanged = Object.keys(formData).some(
			(key) => formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
		);

		const filesChanged = Object.values(gambarFiles).some((file) => file !== null);

		return formChanged || filesChanged;
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);

			const data = new FormData();
			data.append('id_beranda', '1'); // Selalu update id_beranda = 1
			data.append('kolom_title_1', formData.kolom_title_1);
			data.append('kolom_title_2', formData.kolom_title_2);
			data.append('kolom_title_3', formData.kolom_title_3);
			data.append('kolom_subtitle_1', formData.kolom_subtitle_1);
			data.append('kolom_subtitle_2', formData.kolom_subtitle_2);
			data.append('kolom_subtitle_3', formData.kolom_subtitle_3);
			data.append('deskripsi_ct', formData.deskripsi_ct);

			// Append gambar jika ada yang diubah
			if (gambarFiles.gambar_utama) {
				data.append('gambar_utama', gambarFiles.gambar_utama);
			}
			if (gambarFiles.gambar_1) {
				data.append('gambar_1', gambarFiles.gambar_1);
			}
			if (gambarFiles.gambar_2) {
				data.append('gambar_2', gambarFiles.gambar_2);
			}
			if (gambarFiles.gambar_ct) {
				data.append('gambar_ct', gambarFiles.gambar_ct);
			}

			const response = await fetch('/api/beranda', {
				method: 'PUT',
				body: data
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Data berhasil disimpan!');
				fetchBerandaData();
				// Reset gambar files setelah berhasil simpan
				setGambarFiles({
					gambar_utama: null,
					gambar_1: null,
					gambar_2: null,
					gambar_ct: null
				});
			} else {
				toast.error(result.message || 'Gagal menyimpan data');
			}
		} catch (error) {
			console.error('Error saving data:', error);
			toast.error('Terjadi kesalahan saat menyimpan data');
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		fetchBerandaData(); // Reset ke data awal
		setGambarFiles({
			gambar_utama: null,
			gambar_1: null,
			gambar_2: null,
			gambar_ct: null
		});
	};

	if (loadingData) {
		return <Skeleton variant="loader" />;
	}

	return (
		<section>
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Profil Web</h1>
			</div>

			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="mb-4 font-semibold">Bagian Hero</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<ImageUpload
							id="gambar-utama"
							label="Gambar Utama"
							onFileChange={(file) => handleFileChange('gambar_utama', file)}
							defaultPreview={gambarPreview.gambar_utama}
						/>
					</div>
					<div>
						<ImageUpload
							id="gambar-1"
							label="Gambar 1"
							onFileChange={(file) => handleFileChange('gambar_1', file)}
							defaultPreview={gambarPreview.gambar_1}
						/>
					</div>
					<div>
						<ImageUpload
							id="gambar-2"
							label="Gambar 2"
							onFileChange={(file) => handleFileChange('gambar_2', file)}
							defaultPreview={gambarPreview.gambar_2}
						/>
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="mb-4 font-semibold">Bagian Judul dan Subjudul</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="judul1"
							className="mb-2 block"
						>
							Kolom Judul 1
						</Label>
						<Input
							id="judul1"
							placeholder="Masukkan judul..."
							value={formData.kolom_title_1}
							onChange={(e) => handleInputChange('kolom_title_1', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="judul2"
							className="mb-2 block"
						>
							Kolom Judul 2
						</Label>
						<Input
							id="judul2"
							placeholder="Masukkan judul..."
							value={formData.kolom_title_2}
							onChange={(e) => handleInputChange('kolom_title_2', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="judul3"
							className="mb-2 block"
						>
							Kolom Judul 3
						</Label>
						<Input
							id="judul3"
							placeholder="Masukkan judul..."
							value={formData.kolom_title_3}
							onChange={(e) => handleInputChange('kolom_title_3', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="subjudul1"
							className="mb-2 block"
						>
							Kolom Subjudul 1
						</Label>
						<Textarea
							id="subjudul1"
							placeholder="Masukkan subjudul..."
							value={formData.kolom_subtitle_1}
							onChange={(e) => handleInputChange('kolom_subtitle_1', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="subjudul2"
							className="mb-2 block"
						>
							Kolom Subjudul 2
						</Label>
						<Textarea
							id="subjudul2"
							placeholder="Masukkan subjudul..."
							value={formData.kolom_subtitle_2}
							onChange={(e) => handleInputChange('kolom_subtitle_2', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="subjudul3"
							className="mb-2 block"
						>
							Kolom Subjudul 3
						</Label>
						<Textarea
							id="subjudul3"
							placeholder="Masukkan subjudul..."
							value={formData.kolom_subtitle_3}
							onChange={(e) => handleInputChange('kolom_subtitle_3', e.target.value)}
						/>
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="mb-4 font-semibold">Bagian CTA</div>
				<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
					<div>
						<ImageUpload
							id="gambar-cta"
							label="Gambar Utama"
							onFileChange={(file) => handleFileChange('gambar_ct', file)}
							defaultPreview={gambarPreview.gambar_ct}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="deskripsiCTA"
							className="mb-2 block"
						>
							Deskripsi CTA
						</Label>
						<Textarea
							id="deskripsiCTA"
							placeholder="Masukkan deskripsi..."
							value={formData.deskripsi_ct}
							onChange={(e) => handleInputChange('deskripsi_ct', e.target.value)}
						/>
					</div>
				</div>
			</div>

			<div className="mt-6 flex gap-2">
				<Button
					variant="outline"
					onClick={handleCancel}
					disabled={loading}
					className="flex-1"
				>
					Batal
				</Button>
				<Button
					className="flex-1"
					onClick={handleSubmit}
					disabled={loading || !hasChanges()}
				>
					{loading ? 'Menyimpan...' : 'Simpan'}
				</Button>
			</div>
		</section>
	);
}
