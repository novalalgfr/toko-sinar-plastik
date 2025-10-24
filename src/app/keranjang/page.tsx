'use client';

import { Trash2, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function KeranjangPage() {
	const router = useRouter();
	const { cartItems, toggleCheck, selectAll, removeFromCart, deleteSelected, updateQty, getCheckedItems, getTotal } =
		useCart();

	const checkedItems = getCheckedItems();
	const total = getTotal();
	const checkedCount = checkedItems.length;
	const allItemsChecked = cartItems.length > 0 && cartItems.every((item) => item.checked);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const handleCheckout = () => {
		if (checkedCount === 0) return;
		router.push('/pembayaran');
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<Card className="p-0 gap-0 border border-gray-200 rounded-lg shadow-none">
					{cartItems.length > 0 ? (
						<>
							{/* Header Pilih Semua */}
							<div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
								<div
									className="flex items-center gap-3 cursor-pointer"
									onClick={() => selectAll(!allItemsChecked)}
								>
									<Checkbox
										checked={allItemsChecked}
										onCheckedChange={() => selectAll(!allItemsChecked)}
									/>
									<span className="font-medium text-gray-700 select-none">
										{allItemsChecked ? 'Batal Pilih Semua' : 'Pilih Semua'}
									</span>
								</div>

								<button
									onClick={deleteSelected}
									disabled={checkedCount === 0}
									className="font-medium text-sm text-red-500 hover:text-red-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
								>
									Hapus Terpilih ({checkedCount})
								</button>
							</div>

							{/* Daftar Item */}
							<div className="px-6">
								{cartItems.map((item, index) => (
									<div
										key={item.id}
										className={`px-0 py-4 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors hover:bg-gray-50/50 ${
											index < cartItems.length - 1 ? 'border-b' : ''
										}`}
									>
										{/* Checkbox + Gambar */}
										<div className="flex-shrink-0 flex items-center gap-4">
											<Checkbox
												checked={item.checked}
												onCheckedChange={() => toggleCheck(item.id)}
												className="cursor-pointer"
											/>
											<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
												<Image
													src={item.image}
													alt={item.name}
													width={96}
													height={96}
													className="object-cover w-full h-full"
												/>
											</div>
										</div>

										{/* Detail Produk */}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 text-base">{item.name}</h3>
											<div className="flex items-baseline gap-2 mt-2">
												<p className="font-bold text-indigo-600 text-base">
													{formatCurrency(item.price)}
												</p>
											</div>
										</div>

										{/* Kontrol Qty + Hapus */}
										<div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
											<div className="flex items-center gap-2">
												<button
													onClick={() => updateQty(item.id, -1)}
													disabled={item.qty <= 1}
													className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
												>
													<Minus className="w-4 h-4 text-gray-600" />
												</button>
												<span className="font-semibold text-gray-900 text-sm min-w-[2.5rem] text-center">
													{item.qty}
												</span>
												<button
													onClick={() => updateQty(item.id, 1)}
													className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
												>
													<Plus className="w-4 h-4 text-gray-600" />
												</button>
											</div>

											<button
												onClick={() => removeFromCart(item.id)}
												className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-all sm:mt-2 cursor-pointer"
												aria-label="Hapus item"
											>
												<Trash2 className="w-5 h-5" />
											</button>
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="p-12 md:p-16 text-center">
							<ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 mb-2">Keranjang Anda Kosong</h3>
							<p className="text-gray-600">Sepertinya Anda belum menambahkan produk apapun.</p>
						</div>
					)}
				</Card>
			</div>

			{/* Ringkasan Belanja */}
			<div className="lg:col-span-1">
				<Card className="sticky top-4 border border-gray-200 rounded-lg shadow-none">
					<CardHeader>
						<CardTitle className="text-lg">Ringkasan Belanja</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Subtotal */}
						<div className="flex justify-between text-sm pb-4">
							<span className="text-gray-600">Subtotal ({checkedCount} produk)</span>
							<span className="font-medium">{formatCurrency(total)}</span>
						</div>

						{/* Total */}
						<div className="flex justify-between pt-4 border-t-2 font-bold text-lg">
							<span>Total</span>
							<span className="text-blue-600">{formatCurrency(total)}</span>
						</div>

						{/* Button */}
						<Button
							disabled={checkedCount === 0}
							className="w-full h-10"
							onClick={handleCheckout}
						>
							<ShoppingCart className="w-5 h-5" />
							Lanjut Pembayaran ({checkedCount})
						</Button>

						{/* Info */}
						<div className="bg-blue-50 border border-blue-200 rounded p-3">
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
	);
}
