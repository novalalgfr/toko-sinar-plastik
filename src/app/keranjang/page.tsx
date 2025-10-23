'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus, CheckSquare, Square, ShoppingCart } from 'lucide-react';

interface CartItem {
	id: number;
	name: string;
	desc: string;
	price: number;
	oldPrice: number;
	checked: boolean;
	image: string;
	qty?: number;
}

export default function KeranjangPage() {
	const [cartItems, setCartItems] = useState<CartItem[]>([
		{
			id: 1,
			name: 'Lorem Ipsum',
			desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
			price: 9000000,
			oldPrice: 10000000,
			checked: true,
			image: '/images/item1.jpg',
			qty: 1
		},
		{
			id: 2,
			name: 'Lorem Ipsum',
			desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
			price: 6000000,
			oldPrice: 8000000,
			checked: true,
			image: '/images/item2.jpg',
			qty: 1
		},
		{
			id: 3,
			name: 'Lorem Ipsum',
			desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
			price: 6000000,
			oldPrice: 8000000,
			checked: true,
			image: '/images/item3.jpg',
			qty: 1
		}
	]);

	const toggleCheck = (id: number) => {
		setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
	};

	const selectAll = (checked: boolean) => {
		setCartItems((prev) => prev.map((item) => ({ ...item, checked })));
	};

	const deleteItem = (id: number) => {
		setCartItems((prev) => prev.filter((item) => item.id !== id));
	};

	const updateQty = (id: number, change: number) => {
		setCartItems((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					const newQty = Math.max(1, (item.qty || 1) + change);
					return { ...item, qty: newQty };
				}
				return item;
			})
		);
	};

	const total = cartItems.filter((item) => item.checked).reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
	const checkedCount = cartItems.filter((item) => item.checked).length;

	return (
		<div className="min-h-screen py-8 md:py-12">
			<div>
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<ShoppingCart className="w-8 h-8 text-gray-900" />
						<h1 className="text-4xl font-bold text-gray-900">Keranjang Belanja</h1>
					</div>
					<p className="text-gray-600">{cartItems.length} produk tersedia</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* LEFT SIDE - CART ITEMS */}
					<div className="lg:col-span-2 space-y-4">
						{/* Select All Bar */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
							<button
								onClick={() => selectAll(!cartItems.every(item => item.checked))}
								className="flex items-center gap-3 hover:opacity-80 transition-opacity"
							>
								{cartItems.every(item => item.checked) ? (
									<CheckSquare className="w-6 h-6 text-green-600" />
								) : (
									<Square className="w-6 h-6 text-gray-300" />
								)}
								<span className="font-semibold text-gray-900">
									{cartItems.every(item => item.checked) ? 'Batal Pilih Semua' : 'Pilih Semua'}
								</span>
							</button>
							<button className="text-red-500 font-semibold text-sm hover:text-red-600 transition-colors">
								Hapus Terpilih
							</button>
						</div>

						{/* Cart Items */}
						{cartItems.length > 0 ? (
							cartItems.map((item) => (
								<div
									key={item.id}
									className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all"
								>
									<div className="flex gap-4">
										{/* Checkbox */}
										<button
											onClick={() => toggleCheck(item.id)}
											className="flex-shrink-0 mt-1 hover:opacity-70 transition-opacity"
										>
											{item.checked ? (
												<CheckSquare className="w-6 h-6 text-green-600" />
											) : (
												<Square className="w-6 h-6 text-gray-300" />
											)}
										</button>

										{/* Product Image */}
										<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
											<Image
												src={item.image}
												alt={item.name}
												width={96}
												height={96}
												className="object-cover w-full h-full"
											/>
										</div>

										{/* Product Info */}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
										</div>

										{/* Price & Actions */}
										<div className="flex flex-col items-end justify-between">
											<div className="text-right">
												<p className="font-bold text-gray-900 text-lg">
													Rp{(item.price * (item.qty || 1)).toLocaleString('id-ID')}
												</p>
											</div>

											<div className="flex items-center gap-3 mt-3">
												{/* Quantity Control */}
												<div className="flex items-center border-2 border-gray-200 rounded-lg hover:border-green-600 transition-colors">
													<button
														onClick={() => updateQty(item.id, -1)}
														className="p-2 hover:bg-gray-100 transition-colors"
													>
														<Minus className="w-4 h-4 text-gray-600" />
													</button>
													<span className="px-3 font-semibold text-gray-900 min-w-[2.5rem] text-center">
														{item.qty || 1}
													</span>
													<button
														onClick={() => updateQty(item.id, 1)}
														className="p-2 hover:bg-gray-100 transition-colors"
													>
														<Plus className="w-4 h-4 text-gray-600" />
													</button>
												</div>

												{/* Delete Button */}
												<button
													onClick={() => deleteItem(item.id)}
													className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
												>
													<Trash2 className="w-5 h-5" />
												</button>
											</div>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
								<ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-600 text-lg">Keranjang Anda kosong</p>
							</div>
						)}
					</div>

					{/* RIGHT SIDE - ORDER SUMMARY */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
							<h2 className="font-bold text-lg text-gray-900 mb-6">Ringkasan Belanja</h2>

							<div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Subtotal</span>
									<span className="font-semibold text-gray-900">
										Rp{total.toLocaleString('id-ID')}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Ongkos Kirim</span>
									<span className="font-semibold text-gray-900">Gratis</span>
								</div>
							</div>

							<div className="flex justify-between items-center mb-6">
								<span className="font-bold text-gray-900">Total</span>
								<span className="text-2xl font-bold text-green-600">
									Rp{total.toLocaleString('id-ID')}
								</span>
							</div>

							<button
								disabled={checkedCount === 0}
								className={`w-full font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
									checkedCount > 0
										? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
										: 'bg-gray-200 text-gray-400 cursor-not-allowed'
								}`}
							>
								<ShoppingCart className="w-5 h-5" />
								Lanjut Pembayaran
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}