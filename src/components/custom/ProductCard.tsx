import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
	image?: string;
	name: string;
	price: string | number;
	onAddToCart?: () => void;
	className?: string;
	imageAlt?: string;
}

export function ProductCard({
	image,
	name,
	price,
	onAddToCart,
	className = '',
	imageAlt = 'Product Image'
}: ProductCardProps) {
	// ✅ Format harga ke Rupiah
	const formattedPrice = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(Number(price));

	return (
		<div className={`w-full h-[400px] bg-white border border-gray-200 rounded-lg flex flex-col ${className}`}>
			{/* Image area */}
			<div className="relative w-full h-[312px] rounded-t-xl overflow-hidden bg-gray-200">
				{image ? (
					<Image
						src={image}
						alt={imageAlt}
						fill
						className="object-cover"
						sizes="100%"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
						No Image
					</div>
				)}
			</div>

			{/* Content area */}
			<div className="p-4 flex-0 w-full">
				<div className="w-full flex items-center justify-between">
					<p className="text-base font-semibold text-black truncate max-w-[70%]">{name}</p>
					<p className="text-sm font-semibold text-black">{formattedPrice}</p>
				</div>

				<div className="mt-6">
					<Button
						onClick={onAddToCart}
						className="bg-[#0a452f] hover:bg-[#083926] text-white rounded-full text-sm flex items-center justify-center transition cursor-pointer"
					>
						+ Keranjang
					</Button>
				</div>
			</div>
		</div>
	);
}
