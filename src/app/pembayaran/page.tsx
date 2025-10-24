/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Truck, Store, CheckCircle2, Clock, AlertCircle, Loader2, XCircle, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

interface UserAddress {
	alamat: string;
	alamat_peta: string;
	rt: string;
	rw: string;
	kelurahan: string;
	kecamatan: string;
	nomor_telepon: string;
	latitude: number;
	longitude: number;
}

interface ShippingOption {
	id: number;
	courier: string;
	service: string;
	description: string;
	cost: number;
	etd: string;
	displayName: string;
}

interface StepIndicatorProps {
	stepNum: number;
	title: string;
	completed: boolean;
	active: boolean;
}

declare global {
	interface Window {
		snap: {
			pay: (
				token: string,
				options: {
					onSuccess: (result: any) => void;
					onPending: (result: any) => void;
					onError: (result: any) => void;
					onClose: () => void;
				}
			) => void;
		};
	}
}

export default function PembayaranPage() {
	const router = useRouter();
	const { getCheckedItems, getTotal, getTotalWeight, clearCart } = useCart();

	// Get checked items from cart
	const checkedCartItems = getCheckedItems();

	const STORE_CONFIG = {
		originDestinationId: 31597,
		originPinPoint: '-7.279849431298132,109.35114360314475',
		itemValue: 30000
	};

	const [currentStep, setCurrentStep] = useState<number>(1);
	const [fulfillmentType, setFulfillmentType] = useState<string>('delivery');
	const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
	const [loadingAddress, setLoadingAddress] = useState<boolean>(true);

	const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
	const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
	const [loadingShipping, setLoadingShipping] = useState<boolean>(false);
	const [shippingError, setShippingError] = useState<boolean>(false);
	const [loadingPayment, setLoadingPayment] = useState<boolean>(false);

	// Calculate totals from cart
	const subtotal = getTotal();
	const totalWeight = getTotalWeight();
	const shippingCost = selectedShipping ? selectedShipping.cost : 0;
	const total = subtotal + shippingCost;

	// Redirect if cart is empty
	useEffect(() => {
		if (checkedCartItems.length === 0) {
			toast.error('Keranjang belanja kosong!');
			router.push('/keranjang');
		}
	}, [checkedCartItems, router]);

	// Validasi step
	const canProceedFromStep1 = fulfillmentType;
	const canProceedFromStep2 = fulfillmentType === 'store' || (fulfillmentType === 'delivery' && userAddress);
	const canProceedFromStep3 = fulfillmentType === 'store' || (fulfillmentType === 'delivery' && selectedShipping);

	// Fetch user address from API
	useEffect(() => {
		const fetchUserAddress = async () => {
			setLoadingAddress(true);
			try {
				const res = await fetch('/api/user/profile');
				if (!res.ok) throw new Error('Gagal memuat alamat pengguna');

				const data = await res.json();

				if (data.alamat && data.latitude && data.longitude) {
					setUserAddress({
						alamat: data.alamat || '',
						alamat_peta: data.alamat_peta || '',
						rt: data.rt || '',
						rw: data.rw || '',
						kelurahan: data.kelurahan || '',
						kecamatan: data.kecamatan || '',
						nomor_telepon: data.nomor_telepon || '',
						latitude: parseFloat(data.latitude) || 0,
						longitude: parseFloat(data.longitude) || 0
					});
				} else {
					toast.error('Alamat belum lengkap. Silakan lengkapi profil Anda.');
				}
			} catch (error) {
				console.error('Error fetching user address:', error);
				toast.error('Gagal memuat alamat. Silakan coba lagi.');
			} finally {
				setLoadingAddress(false);
			}
		};

		fetchUserAddress();
	}, []);

	// Fetch ongkir dari RajaOngkir
	useEffect(() => {
		if (userAddress && fulfillmentType === 'delivery' && currentStep === 2) {
			fetchShippingCosts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userAddress, fulfillmentType, currentStep]);

	const fetchShippingCosts = async () => {
		setLoadingShipping(true);
		setShippingOptions([]);
		setSelectedShipping(null);
		setShippingError(false);

		try {
			if (!userAddress) {
				throw new Error('Address not found');
			}

			const cityId = 46116; // Default cityId Purbalingga

			const response = await fetch('/api/rajaongkir/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					shipper_destination_id: STORE_CONFIG.originDestinationId,
					receiver_destination_id: cityId,
					weight: totalWeight,
					item_value: STORE_CONFIG.itemValue,
					origin_pin_point: STORE_CONFIG.originPinPoint,
					destination_pin_point: `${userAddress.latitude},${userAddress.longitude}`
				})
			});

			const data = await response.json();

			if (data.success && data.tariffs && data.tariffs.length > 0) {
				const formattedOptions: ShippingOption[] = data.tariffs.map((item: any, index: number) => ({
					id: index + 1,
					courier: item.courier_name || 'Unknown',
					service: item.courier_service_name || 'Standard',
					description: item.description || 'Layanan pengiriman',
					cost: item.price || 0,
					etd: item.etd || '2-3',
					displayName: `${item.courier_name} - ${item.courier_service_name}`
				}));

				setShippingOptions(formattedOptions);
				setCurrentStep(3);
			} else {
				throw new Error('No tariffs available');
			}
		} catch (error) {
			console.error('Error fetching shipping costs:', error);
			setShippingError(true);
		} finally {
			setLoadingShipping(false);
		}
	};

	const handlePayment = async () => {
		setLoadingPayment(true);

		try {
			// Convert cart items to Midtrans format
			const itemDetails = [
				...checkedCartItems.map((item) => ({
					id: item.id.toString(),
					price: item.price,
					quantity: item.qty,
					name: item.name
				}))
			];

			// Add shipping cost if delivery
			if (fulfillmentType === 'delivery' && selectedShipping) {
				itemDetails.push({
					id: 'SHIPPING',
					price: shippingCost,
					quantity: 1,
					name: `Ongkir ${selectedShipping.displayName}`
				});
			}

			// Format address
			const fullAddress = userAddress
				? `${userAddress.alamat}${
						userAddress.rt || userAddress.rw
							? `, RT ${userAddress.rt || '-'}/RW ${userAddress.rw || '-'}`
							: ''
				  }${userAddress.kelurahan ? `, ${userAddress.kelurahan}` : ''}${
						userAddress.kecamatan ? `, ${userAddress.kecamatan}` : ''
				  }`
				: 'Alamat tidak tersedia';

			// Prepare order data
			const orderData = {
				transaction_details: {
					order_id: `ORDER-${Date.now()}`,
					gross_amount: total
				},
				customer_details: {
					first_name: 'Customer',
					phone: userAddress?.nomor_telepon || '08123456789',
					address: fullAddress
				},
				item_details: itemDetails,
				shipping_address:
					fulfillmentType === 'delivery' && userAddress
						? {
								first_name: 'Customer',
								phone: userAddress.nomor_telepon,
								address: fullAddress,
								city: userAddress.kecamatan || 'Unknown',
								postal_code: '00000'
						  }
						: null
			};

			// Call Midtrans API
			const response = await fetch('/api/midtrans/create-transaction', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(orderData)
			});

			const data = await response.json();

			if (data.success && data.token && window.snap) {
				window.snap.pay(data.token, {
					onSuccess: function (result: any) {
						toast.success('Pembayaran berhasil!', {
							description: 'Pesanan Anda sedang diproses'
						});
						console.log('Success:', result);
						clearCart();
						router.push('/riwayat-pesanan');
					},
					onPending: function (result: any) {
						toast.info('Menunggu Pembayaran', {
							description:
								'Silakan selesaikan pembayaran Anda. Status pembayaran akan diperbarui secara otomatis.'
						});
						console.log('Pending:', result);
						// Tetap di halaman pembayaran untuk pending
					},
					onError: function (result: any) {
						toast.error('Pembayaran Gagal!', {
							description: 'Terjadi kesalahan saat memproses pembayaran'
						});
						console.log('Error:', result);
						// Tetap di halaman pembayaran
					},
					onClose: function () {
						toast.warning('Pembayaran Dibatalkan', {
							description: 'Anda menutup halaman pembayaran'
						});
						// Tetap di halaman pembayaran
					}
				});
			} else {
				throw new Error(data.error || 'Failed to create transaction');
			}
		} catch (error) {
			console.error('Error creating transaction:', error);
			toast.error('Terjadi kesalahan saat memproses pembayaran');
		} finally {
			setLoadingPayment(false);
		}
	};

	const handleNextStep = () => {
		if (currentStep === 1 && !canProceedFromStep1) return;
		if (currentStep === 2 && !canProceedFromStep2) return;
		if (currentStep === 3 && !canProceedFromStep3) return;
		setCurrentStep(currentStep + 1);
	};

	const StepIndicator = ({ stepNum, title, completed, active }: StepIndicatorProps) => (
		<div className={`flex items-center gap-4 pb-6 border-b`}>
			<div
				className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
					completed
						? 'bg-green-500 text-white'
						: active
						? 'bg-blue-500 text-white'
						: 'bg-gray-200 text-gray-600'
				}`}
			>
				{completed ? <CheckCircle2 size={20} /> : stepNum}
			</div>
			<div className="flex-1">
				<h3 className="font-semibold text-sm">{title}</h3>
			</div>
		</div>
	);

	// Load Midtrans Snap script
	useEffect(() => {
		const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
		const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY';

		const script = document.createElement('script');
		script.src = snapScript;
		script.setAttribute('data-client-key', clientKey);
		script.async = true;

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const getFormattedAddress = () => {
		if (!userAddress) return '';

		let address = userAddress.alamat;

		if (userAddress.rt || userAddress.rw) {
			address += `, RT ${userAddress.rt || '-'}/RW ${userAddress.rw || '-'}`;
		}

		if (userAddress.kelurahan) {
			address += `, ${userAddress.kelurahan}`;
		}

		if (userAddress.kecamatan) {
			address += `, ${userAddress.kecamatan}`;
		}

		return address;
	};

	// Show loading if cart is empty
	if (checkedCartItems.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Step 1: Tipe Pengambilan */}
					<Card>
						<CardHeader>
							<StepIndicator
								stepNum={1}
								title="Pilih Tipe Pengambilan"
								completed={currentStep > 1}
								active={currentStep === 1}
							/>
						</CardHeader>
						{currentStep >= 1 && (
							<CardContent>
								<RadioGroup
									value={fulfillmentType}
									onValueChange={setFulfillmentType}
								>
									<div className="space-y-3">
										<div
											className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
											onClick={() => setFulfillmentType('delivery')}
										>
											<RadioGroupItem
												value="delivery"
												id="delivery"
											/>
											<Label
												htmlFor="delivery"
												className="flex-1 cursor-pointer"
											>
												<div className="flex items-center gap-3">
													<Truck
														className="text-blue-600"
														size={20}
													/>
													<div>
														<p className="font-medium">Dikirim</p>
														<p className="text-sm text-gray-500">
															Barang akan dikirim ke alamat Anda
														</p>
													</div>
												</div>
											</Label>
										</div>
										<div
											className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
											onClick={() => setFulfillmentType('store')}
										>
											<RadioGroupItem
												value="store"
												id="store"
											/>
											<Label
												htmlFor="store"
												className="flex-1 cursor-pointer"
											>
												<div className="flex items-center gap-3">
													<Store
														className="text-green-600"
														size={20}
													/>
													<div>
														<p className="font-medium">Ambil di Toko</p>
														<p className="text-sm text-gray-500">
															Jl. Merdeka No. 123, Jakarta Pusat
														</p>
													</div>
												</div>
											</Label>
										</div>
									</div>
								</RadioGroup>
								{currentStep === 1 && (
									<Button
										onClick={handleNextStep}
										disabled={!canProceedFromStep1}
										className="w-full mt-6 cursor-pointer"
									>
										Lanjutkan
									</Button>
								)}
							</CardContent>
						)}
					</Card>

					{/* Step 2: Alamat */}
					{fulfillmentType === 'delivery' && (
						<Card>
							<CardHeader>
								<StepIndicator
									stepNum={2}
									title="Alamat Pengiriman"
									completed={currentStep > 2}
									active={currentStep === 2}
								/>
							</CardHeader>
							{currentStep >= 2 && (
								<CardContent>
									{loadingAddress ? (
										<div className="flex flex-col items-center justify-center py-8">
											<Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
											<p className="text-sm text-gray-600">Memuat alamat...</p>
										</div>
									) : userAddress ? (
										<>
											<div className="space-y-3">
												<div className="p-5 border rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
													<div className="flex items-start justify-between gap-4">
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-3">
																<h3 className="font-semibold text-gray-900">
																	Alamat Pengiriman
																</h3>
															</div>

															<div className="mb-3">
																<p className="text-sm text-gray-800 leading-relaxed">
																	{getFormattedAddress()}
																</p>
															</div>

															{userAddress.alamat_peta && (
																<div className="flex items-start gap-2.5 py-1 rounded-lg mb-2.5">
																	<MapPin
																		size={16}
																		className="text-blue-600 flex-shrink-0 mt-0.5"
																	/>
																	<p className="text-sm font-medium text-gray-700">
																		{userAddress.alamat_peta}
																	</p>
																</div>
															)}

															{userAddress.nomor_telepon && (
																<div className="flex items-center gap-2.5 py-1 rounded-lg">
																	<Phone
																		size={16}
																		className="text-blue-600 flex-shrink-0"
																	/>
																	<p className="text-sm font-medium text-gray-700">
																		{userAddress.nomor_telepon}
																	</p>
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
											{currentStep === 2 && (
												<div className="flex gap-3 mt-6">
													<Button
														onClick={() => setCurrentStep(1)}
														variant="outline"
														className="flex-1 cursor-pointer"
													>
														Kembali
													</Button>
													<Button
														onClick={fetchShippingCosts}
														disabled={loadingShipping}
														className="flex-1 cursor-pointer"
													>
														{loadingShipping ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																Memuat...
															</>
														) : (
															'Lanjutkan'
														)}
													</Button>
												</div>
											)}
										</>
									) : (
										<div className="text-center py-8">
											<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
												<AlertCircle className="mx-auto h-12 w-12 mb-3 text-yellow-500" />
												<h3 className="font-semibold text-yellow-900 mb-2">
													Alamat Belum Lengkap
												</h3>
												<p className="text-sm text-yellow-700 mb-4">
													Silakan lengkapi alamat Anda di halaman Pengaturan terlebih dahulu.
												</p>
												<Button
													onClick={() => (window.location.href = '/settings')}
													className="cursor-pointer"
												>
													Lengkapi Alamat
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							)}
						</Card>
					)}

					{/* Step 3: Pilih Pengiriman */}
					{fulfillmentType === 'delivery' && (
						<Card>
							<CardHeader>
								<StepIndicator
									stepNum={3}
									title="Pilih Metode Pengiriman"
									completed={currentStep > 3}
									active={currentStep === 3}
								/>
							</CardHeader>
							{currentStep >= 3 && (
								<CardContent>
									{loadingShipping ? (
										<div className="flex flex-col items-center justify-center py-8">
											<Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
											<p className="text-sm text-gray-600">Menghitung ongkos kirim...</p>
										</div>
									) : shippingError ? (
										<div className="text-center py-8">
											<div className="bg-red-50 border border-red-200 rounded-lg p-6">
												<XCircle className="mx-auto h-12 w-12 mb-3 text-red-500" />
												<h3 className="font-semibold text-red-900 mb-2">
													Pengiriman Tidak Tersedia
												</h3>
												<p className="text-sm text-red-700 mb-4">
													Maaf, saat ini tidak ada layanan pengiriman yang tersedia untuk
													alamat Anda. Silakan coba lagi nanti.
												</p>
												<Button
													onClick={fetchShippingCosts}
													variant="outline"
													className="border-red-300 text-red-700 hover:bg-red-50"
												>
													Coba Lagi
												</Button>
											</div>
										</div>
									) : shippingOptions.length > 0 ? (
										<>
											<RadioGroup
												value={selectedShipping?.id.toString()}
												onValueChange={(val) => {
													const shipping = shippingOptions.find(
														(s) => s.id === parseInt(val)
													);
													setSelectedShipping(shipping || null);
												}}
											>
												<div className="space-y-3">
													{shippingOptions.map((shipping) => (
														<div
															key={shipping.id}
															className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
															onClick={() => setSelectedShipping(shipping)}
														>
															<RadioGroupItem
																value={shipping.id.toString()}
																id={`ship-${shipping.id}`}
																className="mt-1"
															/>
															<Label
																htmlFor={`ship-${shipping.id}`}
																className="flex-1 cursor-pointer"
															>
																<div className="w-full flex items-center justify-between">
																	<div className="flex flex-col gap-1">
																		<p className="font-medium">
																			{shipping.displayName}
																		</p>
																		<div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
																			<Clock size={14} />
																			{shipping.etd} hari
																		</div>
																	</div>
																	<div>
																		<p className="font-semibold text-blue-600">
																			Rp {shipping.cost.toLocaleString('id-ID')}
																		</p>
																	</div>
																</div>
															</Label>
														</div>
													))}
												</div>
											</RadioGroup>

											<div className="mt-6">
												<Button
													onClick={handlePayment}
													disabled={!selectedShipping || loadingPayment}
													className="w-full cursor-pointer"
												>
													{loadingPayment ? (
														<>
															<Loader2 className="mr-2 h-5 w-5 animate-spin" />
															Memproses...
														</>
													) : (
														'Lakukan Pembayaran'
													)}
												</Button>
											</div>
										</>
									) : (
										<div className="text-center py-8 text-gray-500">
											<AlertCircle className="mx-auto h-12 w-12 mb-3 text-gray-400" />
											<p>Pilih alamat terlebih dahulu untuk melihat opsi pengiriman</p>
										</div>
									)}

									{currentStep === 3 &&
										!shippingError &&
										shippingOptions.length === 0 &&
										!loadingShipping && (
											<div className="flex gap-3 mt-6">
												<Button
													onClick={() => setCurrentStep(2)}
													variant="outline"
													className="flex-1 cursor-pointer"
												>
													Kembali
												</Button>
											</div>
										)}
								</CardContent>
							)}
						</Card>
					)}

					{/* Store Pickup */}
					{fulfillmentType === 'store' && currentStep >= 2 && (
						<Card>
							<CardHeader>
								<CardTitle>Siap untuk Checkout</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
									<div className="flex gap-2">
										<CheckCircle2
											className="text-green-600 flex-shrink-0"
											size={20}
										/>
										<p className="text-sm text-green-700">
											Pesanan Anda siap untuk diambil di toko setelah pembayaran selesai.
										</p>
									</div>
								</div>
								<Button
									className="w-full cursor-pointer"
									onClick={handlePayment}
									disabled={loadingPayment}
								>
									{loadingPayment ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											Memproses...
										</>
									) : (
										'Lakukan Pembayaran'
									)}
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar: Order Summary */}
				<div>
					<Card className="sticky top-4">
						<CardHeader>
							<CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Items */}
							<div className="space-y-3 pb-4 border-b">
								{checkedCartItems.map((item) => (
									<div
										key={item.id}
										className="flex justify-between text-sm"
									>
										<span className="text-gray-600">
											{item.name} x{item.qty}
										</span>
										<span className="font-medium">
											Rp {(item.price * item.qty).toLocaleString('id-ID')}
										</span>
									</div>
								))}
							</div>

							{/* Weight Info */}
							<div className="flex justify-between text-sm text-gray-600">
								<span>Total Berat</span>
								<span>{totalWeight} kg</span>
							</div>

							{/* Subtotal */}
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal</span>
								<span>Rp {subtotal.toLocaleString('id-ID')}</span>
							</div>

							{/* Shipping */}
							{fulfillmentType === 'delivery' && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Ongkir</span>
									{loadingShipping ? (
										<Loader2 className="h-4 w-4 animate-spin text-blue-600" />
									) : (
										<span className={selectedShipping ? 'font-medium' : 'text-gray-400'}>
											{selectedShipping
												? `Rp ${selectedShipping.cost.toLocaleString('id-ID')}`
												: 'Pilih pengiriman'}
										</span>
									)}
								</div>
							)}

							{fulfillmentType === 'store' && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Pengiriman</span>
									<span className="font-medium text-green-600">Gratis (Ambil di toko)</span>
								</div>
							)}

							{/* Total */}
							<div className="flex justify-between pt-4 border-t-2 font-bold text-lg">
								<span>Total</span>
								<span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
							</div>

							{/* Info */}
							<div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
								<div className="flex gap-2 text-xs text-blue-700">
									<AlertCircle
										size={16}
										className="flex-shrink-0 mt-0.5"
									/>
									<p>Pastikan semua data sudah benar sebelum melanjutkan pembayaran.</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
