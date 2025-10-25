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

interface KontakData {
	id_kontak: number;
	deskripsi: string | null;
	lokasi: string;
	latitude: number | null;
	longitude: number | null;
	nomor_telpon: string;
	email: string | null;
	jam_operasional: string | null;
	created_at: string;
	updated_at: string;
}

interface BerandaApiResponse {
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

interface KontakApiResponse {
	success: boolean;
	data: KontakData[];
}

export default function HalamanWebProfil() {
	const [loading, setLoading] = React.useState(false);
	const [loadingData, setLoadingData] = React.useState(true);

	// State untuk Beranda
	const [formDataBeranda, setFormDataBeranda] = React.useState({
		kolom_title_1: '',
		kolom_title_2: '',
		kolom_title_3: '',
		kolom_subtitle_1: '',
		kolom_subtitle_2: '',
		kolom_subtitle_3: '',
		deskripsi_ct: ''
	});

	const [originalDataBeranda, setOriginalDataBeranda] = React.useState({
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

	// State untuk Kontak
	const [formDataKontak, setFormDataKontak] = React.useState({
		deskripsi: '',
		lokasi: '',
		latitude: '',
		longitude: '',
		nomor_telpon: '',
		email: '',
		jam_operasional: ''
	});

	const [originalDataKontak, setOriginalDataKontak] = React.useState({
		deskripsi: '',
		lokasi: '',
		latitude: '',
		longitude: '',
		nomor_telpon: '',
		email: '',
		jam_operasional: ''
	});

	React.useEffect(() => {
		fetchAllData();
	}, []);

	const fetchAllData = async () => {
		setLoadingData(true);
		await Promise.all([fetchBerandaData(), fetchKontakData()]);
		setLoadingData(false);
	};

	const fetchBerandaData = async () => {
		try {
			const response = await fetch('/api/beranda');
			const result: BerandaApiResponse = await response.json();

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

					setFormDataBeranda(dataToSet);
					setOriginalDataBeranda(dataToSet);

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
			toast.error('Gagal memuat data beranda');
		}
	};

	const fetchKontakData = async () => {
		try {
			const response = await fetch('/api/kontak');
			const result: KontakApiResponse = await response.json();

			if (result.success && result.data.length > 0) {
				const kontakData = result.data.find((item: KontakData) => item.id_kontak === 1);

				if (kontakData) {
					const dataToSet = {
						deskripsi: kontakData.deskripsi || '',
						lokasi: kontakData.lokasi || '',
						latitude: kontakData.latitude?.toString() || '',
						longitude: kontakData.longitude?.toString() || '',
						nomor_telpon: kontakData.nomor_telpon || '',
						email: kontakData.email || '',
						jam_operasional: kontakData.jam_operasional || ''
					};

					setFormDataKontak(dataToSet);
					setOriginalDataKontak(dataToSet);
				}
			}
		} catch (error) {
			console.error('Error fetching kontak data:', error);
			toast.error('Gagal memuat data kontak');
		}
	};

	const handleInputChangeBeranda = (field: string, value: string) => {
		setFormDataBeranda((prev) => ({ ...prev, [field]: value }));
	};

	const handleInputChangeKontak = (field: string, value: string) => {
		setFormDataKontak((prev) => ({ ...prev, [field]: value }));
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

	const hasChangesBeranda = () => {
		const formChanged = Object.keys(formDataBeranda).some(
			(key) =>
				formDataBeranda[key as keyof typeof formDataBeranda] !==
				originalDataBeranda[key as keyof typeof originalDataBeranda]
		);

		const filesChanged = Object.values(gambarFiles).some((file) => file !== null);

		return formChanged || filesChanged;
	};

	const hasChangesKontak = () => {
		return Object.keys(formDataKontak).some(
			(key) =>
				formDataKontak[key as keyof typeof formDataKontak] !==
				originalDataKontak[key as keyof typeof originalDataKontak]
		);
	};

	const handleSubmitBeranda = async () => {
		try {
			const data = new FormData();
			data.append('id_beranda', '1');
			data.append('kolom_title_1', formDataBeranda.kolom_title_1);
			data.append('kolom_title_2', formDataBeranda.kolom_title_2);
			data.append('kolom_title_3', formDataBeranda.kolom_title_3);
			data.append('kolom_subtitle_1', formDataBeranda.kolom_subtitle_1);
			data.append('kolom_subtitle_2', formDataBeranda.kolom_subtitle_2);
			data.append('kolom_subtitle_3', formDataBeranda.kolom_subtitle_3);
			data.append('deskripsi_ct', formDataBeranda.deskripsi_ct);

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
				toast.success('Data beranda berhasil disimpan!');
				await fetchBerandaData();
				setGambarFiles({
					gambar_utama: null,
					gambar_1: null,
					gambar_2: null,
					gambar_ct: null
				});
			} else {
				toast.error(result.message || 'Gagal menyimpan data beranda');
			}
		} catch (error) {
			console.error('Error saving beranda data:', error);
			toast.error('Terjadi kesalahan saat menyimpan data beranda');
		}
	};

	const handleSubmitKontak = async () => {
		try {
			const data = new FormData();
			data.append('id_kontak', '1');
			data.append('deskripsi', formDataKontak.deskripsi);
			data.append('lokasi', formDataKontak.lokasi);
			data.append('latitude', formDataKontak.latitude);
			data.append('longitude', formDataKontak.longitude);
			data.append('nomor_telpon', formDataKontak.nomor_telpon);
			data.append('email', formDataKontak.email);
			data.append('jam_operasional', formDataKontak.jam_operasional);

			const response = await fetch('/api/kontak', {
				method: 'PUT',
				body: data
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Data kontak berhasil disimpan!');
				await fetchKontakData();
			} else {
				toast.error(result.message || 'Gagal menyimpan data kontak');
			}
		} catch (error) {
			console.error('Error saving kontak data:', error);
			toast.error('Terjadi kesalahan saat menyimpan data kontak');
		}
	};

	const handleCancelAll = () => {
		fetchBerandaData();
		fetchKontakData();
		setGambarFiles({
			gambar_utama: null,
			gambar_1: null,
			gambar_2: null,
			gambar_ct: null
		});
	};

	const handleSaveAll = async () => {
		setLoading(true);
		try {
			if (hasChangesBeranda()) {
				await handleSubmitBeranda();
			}
			if (hasChangesKontak()) {
				await handleSubmitKontak();
			}
		} finally {
			setLoading(false);
		}
	};

	if (loadingData) {
		return <Skeleton variant="loader" />;
	}

	return (
		<section>
			<div className="flex items-center gap-4 mb-6">
				<h1 className="text-2xl font-bold">Profil Web</h1>
			</div>

			{/* BAGIAN BERANDA */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">Beranda</h2>

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
								value={formDataBeranda.kolom_title_1}
								onChange={(e) => handleInputChangeBeranda('kolom_title_1', e.target.value)}
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
								value={formDataBeranda.kolom_title_2}
								onChange={(e) => handleInputChangeBeranda('kolom_title_2', e.target.value)}
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
								value={formDataBeranda.kolom_title_3}
								onChange={(e) => handleInputChangeBeranda('kolom_title_3', e.target.value)}
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
								value={formDataBeranda.kolom_subtitle_1}
								onChange={(e) => handleInputChangeBeranda('kolom_subtitle_1', e.target.value)}
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
								value={formDataBeranda.kolom_subtitle_2}
								onChange={(e) => handleInputChangeBeranda('kolom_subtitle_2', e.target.value)}
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
								value={formDataBeranda.kolom_subtitle_3}
								onChange={(e) => handleInputChangeBeranda('kolom_subtitle_3', e.target.value)}
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
								value={formDataBeranda.deskripsi_ct}
								onChange={(e) => handleInputChangeBeranda('deskripsi_ct', e.target.value)}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* BAGIAN KONTAK */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">Kontak</h2>

				<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
					<div className="mb-4 font-semibold">Informasi Kontak</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="deskripsi-kontak"
								className="mb-2 block"
							>
								Deskripsi
							</Label>
							<Textarea
								id="deskripsi-kontak"
								placeholder="Masukkan deskripsi kontak..."
								value={formDataKontak.deskripsi}
								onChange={(e) => handleInputChangeKontak('deskripsi', e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="lokasi"
								className="mb-2 block"
							>
								Lokasi <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="lokasi"
								placeholder="Masukkan alamat lengkap..."
								value={formDataKontak.lokasi}
								onChange={(e) => handleInputChangeKontak('lokasi', e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="latitude"
								className="mb-2 block"
							>
								Latitude
							</Label>
							<Input
								id="latitude"
								type="number"
								step="any"
								placeholder="Contoh: -6.208763"
								value={formDataKontak.latitude}
								onChange={(e) => handleInputChangeKontak('latitude', e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="longitude"
								className="mb-2 block"
							>
								Longitude
							</Label>
							<Input
								id="longitude"
								type="number"
								step="any"
								placeholder="Contoh: 106.845599"
								value={formDataKontak.longitude}
								onChange={(e) => handleInputChangeKontak('longitude', e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="nomor-telpon"
								className="mb-2 block"
							>
								Nomor Telepon <span className="text-red-500">*</span>
							</Label>
							<Input
								id="nomor-telpon"
								type="tel"
								placeholder="Contoh: 021-12345678"
								value={formDataKontak.nomor_telpon}
								onChange={(e) => handleInputChangeKontak('nomor_telpon', e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="email-kontak"
								className="mb-2 block"
							>
								Email
							</Label>
							<Input
								id="email-kontak"
								type="email"
								placeholder="Contoh: info@perusahaan.com"
								value={formDataKontak.email}
								onChange={(e) => handleInputChangeKontak('email', e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2 md:col-span-2">
							<Label
								htmlFor="jam-operasional"
								className="mb-2 block"
							>
								Jam Operasional
							</Label>
							<Textarea
								id="jam-operasional"
								placeholder="Contoh: Senin - Jumat: 08.00 - 17.00 WIB"
								value={formDataKontak.jam_operasional}
								onChange={(e) => handleInputChangeKontak('jam_operasional', e.target.value)}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* TOMBOL AKSI GABUNGAN */}
			<div className="mt-6 flex gap-2">
				<Button
					variant="outline"
					onClick={handleCancelAll}
					disabled={loading}
					className="flex-1"
				>
					Batal
				</Button>
				<Button
					className="flex-1"
					onClick={handleSaveAll}
					disabled={loading || (!hasChangesBeranda() && !hasChangesKontak())}
				>
					{loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
				</Button>
			</div>
		</section>
	);
}
