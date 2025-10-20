'use client';

import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<section className="space-y-12 md:space-y-16 container mx-auto">
			{/* Header */}
			<div className="text-center">
				{/* <h1 className="text-[40px] md:text-2xl font-semibold mb-6">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
				</h1> */}

				{/* Image + Stats Section */}
				<div className="grid md:grid-cols-12 gap-6">
					<div className="md:col-span-9 h-[608px] bg-gray-200 rounded-xl" />
					<div className="md:col-span-3 flex flex-col gap-6">
						<div className="h-[292px] bg-gray-200 rounded-xl" />
						<div className="h-[292px] bg-gray-200 rounded-xl" />
					</div>
				</div>
			</div>

			{/* Stats Row */}
			<div className="flex flex-wrap justify-center md:justify-around gap-6 md:gap-10 text-center">
				<div>
					<p className="text-[40px] md:text-2xl font-bold">18K+</p>
					<p className="text-[16px] text-gray-600 max-w-[326px] break-words mx-auto">
						Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
					</p>
				</div>
				<div>
					<p className="text-[40px] md:text-2xl font-bold">700+</p>
					<p className="text-[16px] text-gray-600 max-w-[326px] break-words mx-auto">
						Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
					</p>
				</div>
				<div>
					<p className="text-[40px] md:text-2xl font-bold">95%</p>
					<p className="text-[16px] text-gray-600 max-w-[326px] break-words mx-auto">
						Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
					</p>
				</div>
			</div>

			{/* Kategori Section */}
			<div>
				<h2 className="text-lg md:text-xl font-semibold mb-4">Belanja Berdasarkan Kategori</h2>
				<div className="grid grid-cols-2 md:grid-cols-6 gap-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="w-full h-[300px] bg-gray-200 rounded-xl"
						/>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="w-full h-[400px] bg-gray-200 rounded-xl p-10 flex flex-col justify-center items-start">
				<h3 className="text-[32px] md:text-2xl font-bold max-w-3xl leading-snug mb-6">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
				</h3>
				<Button className="rounded-xl bg-white text-black w-[133px] h-[37px]">Learn More</Button>
			</div>
		</section>
	);
}
