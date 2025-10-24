import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
	image?: string;
	name: string;
	price: string | number;
	onAddToCart?: () => void;
	onViewDetail?: () => void;
	className?: string;
	imageAlt?: string;
}

export function ProductCard({
	image,
	name,
	price,
	onAddToCart,
	onViewDetail,
	className = '',
	imageAlt = 'Product Image'
}: ProductCardProps) {
	const formattedPrice = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(Number(price));

	return (
		<div
			className={`group relative w-full bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-gray-200/60 hover:border-[#0a452f]/30 hover:shadow-xl ${className}`}
		>
			<div
				className="relative w-full h-[240px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer"
				onClick={onViewDetail}
			>
				{image ? (
					<>
						<Image
							src={image}
							alt={imageAlt}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
							sizes="100%"
						/>
						<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
					</>
				) : (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center">
							<div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
								<svg
									className="w-10 h-10 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<p className="text-gray-400 text-sm font-medium">No Image</p>
						</div>
					</div>
				)}
			</div>

			<div className="p-6">
				<h3
					className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem] cursor-pointer hover:text-[#0a452f] transition-colors leading-snug"
					onClick={onViewDetail}
					title={name}
				>
					{name}
				</h3>

				<div className="flex items-baseline gap-2 mb-5">
					<p className="text-lg font-bold text-[#0a452f]">{formattedPrice}</p>
				</div>

				<div className="flex flex-col gap-2.5">
					<Button
						onClick={onAddToCart}
						className="w-full bg-gradient-to-r from-[#0a452f] to-[#0d5a3d] hover:from-[#083926] hover:to-[#0a452f] text-white rounded-xl text-sm font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						Tambah ke Keranjang
					</Button>

					<Button
						onClick={onViewDetail}
						variant="outline"
						className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#0a452f] hover:text-[#0a452f] hover:bg-[#0a452f]/5 rounded-xl text-sm font-semibold h-11 transition-all duration-300"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Lihat Detail
					</Button>
				</div>
			</div>

			<div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#0a452f]/5 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
		</div>
	);
}
