interface SkeletonProps {
	variant?: 'loader' | 'home' | 'table';
}

export default function Skeleton({ variant = 'loader' }: SkeletonProps) {
	if (variant === 'loader') {
		return <LoaderSkeleton />;
	}

	if (variant === 'home') {
		return <HomeSkeleton />;
	}

	if (variant === 'table') {
		return <TableSkeleton />;
	}

	return null;
}

function LoaderSkeleton() {
	return (
		<section className="animate-pulse space-y-6">
			<div className="flex items-center gap-4 mb-4">
				<div className="h-8 w-48 bg-gray-300 rounded"></div>
			</div>
			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex flex-col gap-2"
						>
							<div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
							<div className="h-48 w-full bg-gray-200 rounded-lg"></div>
						</div>
					))}
				</div>
			</div>
			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="h-6 w-48 bg-gray-300 rounded mb-4"></div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div
							key={`title-${i}`}
							className="flex flex-col gap-2"
						>
							<div className="h-4 w-28 bg-gray-300 rounded mb-2"></div>
							<div className="h-10 w-full bg-gray-200 rounded"></div>
						</div>
					))}
					{[1, 2, 3].map((i) => (
						<div
							key={`subtitle-${i}`}
							className="flex flex-col gap-2"
						>
							<div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
							<div className="h-24 w-full bg-gray-200 rounded"></div>
						</div>
					))}
				</div>
			</div>
			<div className="rounded-lg border bg-white p-4 sm:p-6 mb-6">
				<div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
				<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
					<div>
						<div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
						<div className="h-48 w-full bg-gray-200 rounded-lg"></div>
					</div>
					<div className="flex flex-col gap-2">
						<div className="h-4 w-28 bg-gray-300 rounded mb-2"></div>
						<div className="h-24 w-full bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
			<div className="mt-6 flex justify-end gap-3">
				<div className="h-10 w-20 bg-gray-300 rounded"></div>
				<div className="h-10 w-24 bg-gray-300 rounded"></div>
			</div>
		</section>
	);
}

function HomeSkeleton() {
	return (
		<section className="space-y-12 md:space-y-16 container mx-auto animate-pulse">
			<div className="text-center">
				<div className="grid md:grid-cols-12 gap-6">
					<div className="md:col-span-9 h-[608px]">
						<div className="w-full h-full bg-gray-200 rounded-xl" />
					</div>
					<div className="md:col-span-3 flex flex-col gap-6">
						<div className="w-full h-[292px] bg-gray-200 rounded-xl" />
						<div className="w-full h-[292px] bg-gray-200 rounded-xl" />
					</div>
				</div>
			</div>
			<div className="flex flex-wrap justify-center md:justify-around gap-6 md:gap-10 text-center">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="flex flex-col items-center"
					>
						<div className="h-10 w-32 bg-gray-200 rounded mb-2" />
						<div className="h-5 w-40 bg-gray-200 rounded" />
					</div>
				))}
			</div>
			<div>
				<div className="h-7 w-64 bg-gray-200 rounded mb-4" />
				<div className="grid grid-cols-2 md:grid-cols-6 gap-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="w-full h-[300px] bg-gray-200 rounded-xl"
						/>
					))}
				</div>
			</div>
			<div className="w-full h-[400px] relative rounded-xl overflow-hidden flex flex-col justify-center items-start p-10 bg-gray-200">
				<div className="absolute z-10 left-10 top-1/2 -translate-y-1/2 space-y-6">
					<div className="h-10 w-96 bg-gray-300 rounded" />
					<div className="h-12 w-40 bg-gray-300 rounded-xl" />
				</div>
			</div>
		</section>
	);
}

function TableSkeleton() {
	return (
		<div className="p-4 bg-white rounded-lg shadow animate-pulse">
			<div className="flex items-center justify-between mb-4">
				<div className="h-10 w-64 bg-gray-200 rounded"></div>
				<div className="h-10 w-40 bg-gray-200 rounded"></div>
			</div>
			<div className="border rounded-lg overflow-hidden">
				<div className="flex items-center border-b bg-gray-50 p-4">
					<div className="h-4 w-12 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-20 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-32 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-48 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-24 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-16 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-24 bg-gray-200 rounded mr-4"></div>
					<div className="h-4 w-24 bg-gray-200 rounded"></div>
				</div>
				{[...Array(5)].map((_, index) => (
					<div
						key={index}
						className="flex items-center border-b p-4 last:border-b-0"
					>
						<div className="h-4 w-12 bg-gray-200 rounded mr-4"></div>
						<div className="h-16 w-16 bg-gray-200 rounded mr-4"></div>
						<div className="h-4 w-32 bg-gray-200 rounded mr-4"></div>
						<div className="h-4 w-48 bg-gray-200 rounded mr-4"></div>
						<div className="h-4 w-24 bg-gray-200 rounded mr-4"></div>
						<div className="h-4 w-16 bg-gray-200 rounded mr-4"></div>
						<div className="h-4 w-24 bg-gray-200 rounded mr-4"></div>
						<div className="flex gap-2">
							<div className="h-9 w-16 bg-gray-200 rounded"></div>
							<div className="h-9 w-16 bg-gray-200 rounded"></div>
						</div>
					</div>
				))}
			</div>
			<div className="flex items-center justify-between mt-4">
				<div className="h-4 w-48 bg-gray-200 rounded"></div>
				<div className="flex gap-2">
					<div className="h-9 w-24 bg-gray-200 rounded"></div>
					<div className="h-9 w-24 bg-gray-200 rounded"></div>
				</div>
			</div>
		</div>
	);
}
