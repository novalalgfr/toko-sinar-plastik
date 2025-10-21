'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressDetails } from '@/components/custom/LeafletMapPicker';

interface UserDisplayData {
	name: string;
	email: string;
}

interface UpdateFormData {
	alamat: string;
	alamatPeta: string;
	rt: string;
	rw: string;
	kelurahan: string;
	kecamatan: string;
	nomor_telepon: string;
	latitude?: number;
	longitude?: number;
	current_password?: string;
	new_password?: string;
	confirm_password?: string;
}

interface FormErrors {
	nomor_telepon?: string;
	confirm_password?: string;
	rt?: string;
	rw?: string;
}

const defaultCenter: L.LatLngTuple = [-6.2088, 106.8456];

export default function SettingPage() {
	const [userDisplay, setUserDisplay] = useState<UserDisplayData | null>(null);
	const [formData, setFormData] = useState<UpdateFormData>({
		alamat: '',
		alamatPeta: '',
		rt: '',
		rw: '',
		kelurahan: '',
		kecamatan: '',
		nomor_telepon: '',
		latitude: defaultCenter[0],
		longitude: defaultCenter[1],
		current_password: '',
		new_password: '',
		confirm_password: ''
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);

	const LeafletMapPicker = useMemo(
		() =>
			dynamic(() => import('@/components/custom/LeafletMapPicker'), {
				loading: () => (
					<div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
						Memuat Peta...
					</div>
				),
				ssr: false
			}),
		[]
	);

	useEffect(() => {
		const fetchUserData = async () => {
			setIsFetching(true);
			try {
				const res = await fetch('/api/user/profile');
				if (!res.ok) throw new Error('Gagal memuat data pengguna');

				const data = await res.json();
				setUserDisplay({ name: data.name, email: data.email });

				const initialPosition: L.LatLngTuple = [
					data.latitude ? parseFloat(data.latitude) : defaultCenter[0],
					data.longitude ? parseFloat(data.longitude) : defaultCenter[1]
				];

				setFormData((prev) => ({
					...prev,
					alamat: data.alamat || '',
					alamatPeta: data.alamat_peta || '',
					rt: data.rt || '',
					rw: data.rw || '',
					kelurahan: data.kelurahan || '',
					kecamatan: data.kecamatan || '',
					nomor_telepon: data.nomor_telepon || '',
					latitude: initialPosition[0],
					longitude: initialPosition[1]
				}));
			} catch (error) {
				console.error('Error fetching user data:', error);
				toast.error('Gagal memuat data pengguna.', {
					style: {
						background: '#ef4444',
						color: '#ffffff',
						border: 'none'
					}
				});
			} finally {
				setIsFetching(false);
			}
		};
		fetchUserData();
	}, []);

	const handleTextChange = (field: keyof UpdateFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		if (field === 'nomor_telepon') {
			value = value.replace(/[^0-9+]/g, '');
		}
		if (field === 'rt' || field === 'rw') {
			value = value.replace(/[^0-9]/g, '');
		}
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleMapChange = (latlng: L.LatLng) => {
		setFormData((prev) => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }));
	};

	const handleAddressFound = (addressDetails: AddressDetails) => {
		// Hanya update alamatPeta, field lain diisi manual
		setFormData((prev) => ({
			...prev,
			alamatPeta: addressDetails.alamatPeta
		}));
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};
		const phoneRegex = /^(\+62|62|0)8[0-9]{8,11}$/;

		if (formData.nomor_telepon && !phoneRegex.test(formData.nomor_telepon)) {
			newErrors.nomor_telepon = 'Format nomor telepon tidak valid. Contoh: 081234567890';
		}
		if (formData.new_password && formData.new_password !== formData.confirm_password) {
			newErrors.confirm_password = 'Konfirmasi password baru tidak cocok.';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const response = await fetch('/api/user/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message || 'Gagal menyimpan perubahan.');

			toast.success(result.message, {
				style: {
					background: '#10b981',
					color: '#ffffff',
					border: 'none'
				}
			});
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message, {
					style: {
						background: '#ef4444',
						color: '#ffffff',
						border: 'none'
					}
				});
			} else {
				toast.error('Terjadi kesalahan yang tidak diketahui.', {
					style: {
						background: '#ef4444',
						color: '#ffffff',
						border: 'none'
					}
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
		return <div className="w-full h-[700px] animate-pulse bg-gray-200 rounded-md"></div>;
	}

	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="space-y-8"
			>
				<Card>
					<CardHeader>
						<CardTitle>Pengaturan Akun</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nama</Label>
							<Input
								id="name"
								type="text"
								value={userDisplay?.name || ''}
								disabled
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={userDisplay?.email || ''}
								disabled
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="alamat">Alamat Lengkap</Label>
							<Input
								id="alamat"
								type="text"
								placeholder="Masukkan alamat lengkap"
								value={formData.alamat}
								onChange={handleTextChange('alamat')}
							/>
						</div>

						<div className="space-y-2">
							<Label>Pilih Lokasi di Peta</Label>
							<div className="h-[400px] w-full rounded-md z-0 overflow-hidden">
								<LeafletMapPicker
									position={[formData.latitude!, formData.longitude!]}
									onPositionChange={handleMapChange}
									onAddressFound={handleAddressFound}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="alamatPeta">Alamat Peta</Label>
								<Input
									id="alamatPeta"
									type="text"
									placeholder="Terisi otomatis dari peta"
									value={formData.alamatPeta}
									onChange={handleTextChange('alamatPeta')}
								/>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-2">
									<Label htmlFor="rt">RT</Label>
									<Input
										id="rt"
										type="text"
										placeholder="001"
										maxLength={3}
										value={formData.rt}
										onChange={handleTextChange('rt')}
									/>
									{errors.rt && <p className="text-sm text-red-600 pt-1">{errors.rt}</p>}
								</div>
								<div className="space-y-2">
									<Label htmlFor="rw">RW</Label>
									<Input
										id="rw"
										type="text"
										placeholder="002"
										maxLength={3}
										value={formData.rw}
										onChange={handleTextChange('rw')}
									/>
									{errors.rw && <p className="text-sm text-red-600 pt-1">{errors.rw}</p>}
								</div>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="kelurahan">Kelurahan / Desa</Label>
								<Input
									id="kelurahan"
									type="text"
									placeholder="Masukkan kelurahan/desa"
									value={formData.kelurahan}
									onChange={handleTextChange('kelurahan')}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="kecamatan">Kecamatan</Label>
								<Input
									id="kecamatan"
									type="text"
									placeholder="Masukkan kecamatan"
									value={formData.kecamatan}
									onChange={handleTextChange('kecamatan')}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="nomor_telepon">Nomor Telepon</Label>
							<Input
								id="nomor_telepon"
								type="text"
								placeholder="Contoh: 081234567890"
								value={formData.nomor_telepon}
								onChange={handleTextChange('nomor_telepon')}
							/>
							{errors.nomor_telepon && (
								<p className="text-sm text-red-600 pt-1">{errors.nomor_telepon}</p>
							)}
						</div>

						<hr className="my-4" />

						<div className="space-y-2">
							<Label htmlFor="current_password">Password Saat Ini</Label>
							<Input
								id="current_password"
								type="password"
								value={formData.current_password}
								onChange={handleTextChange('current_password')}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new_password">Password Baru</Label>
							<Input
								id="new_password"
								type="password"
								value={formData.new_password}
								onChange={handleTextChange('new_password')}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
							<Input
								id="confirm_password"
								type="password"
								value={formData.confirm_password}
								onChange={handleTextChange('confirm_password')}
							/>
							{errors.confirm_password && (
								<p className="text-sm text-red-600 pt-1">{errors.confirm_password}</p>
							)}
						</div>

						<div className="pt-4">
							<Button
								type="submit"
								disabled={isLoading}
								className="bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
							>
								{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
							</Button>
						</div>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}
