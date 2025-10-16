'use client';

import { MapPin } from 'lucide-react';

export default function KontakKamiPage() {
	return (
		<section className="space-y-10 md:space-y-8">
			<h1 className="text-3xl tracking-tight font-bold text-gray-900">Kontak Kami</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
				<div className="flex flex-col space-y-6">
					<p className="text-gray-500 leading-relaxed">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium nihil accusantium velit
						sequi sapiente distinctio, perspiciatis obcaecati ratione quam dolorum error excepturi vel ut
						similique tempore aperiam ipsa adipisci corporis!
					</p>

					<div className="space-y-3">
						<div className="flex items-center space-x-3">
							<MapPin />
							<span>Lorem ipsum dolor sit amet</span>
						</div>
						<div className="flex items-center space-x-3">
							<span className="text-xl">📞</span>
							<span>08XX-XXXX-XXXX</span>
						</div>
						<div className="flex items-center space-x-3">
							<span className="text-xl">✉️</span>
							<span>email@sinarplastik.com</span>
						</div>
					</div>
				</div>

				<div className="w-full rounded-lg overflow-hidden shadow-lg">
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!..."
						className="w-full h-full min-h-[500px]"
						loading="lazy"
					></iframe>
				</div>
			</div>
		</section>
	);
}
