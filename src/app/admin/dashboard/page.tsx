'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data - ganti dengan API call sesungguhnya
const generateMockData = () => {
	const dailyData = Array.from({ length: 7 }, (_, i) => ({
		name: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short'
		}),
		value: Math.floor(Math.random() * 5000000) + 2000000
	}));

	const weeklyData = Array.from({ length: 4 }, (_, i) => ({
		name: `Minggu ${i + 1}`,
		value: Math.floor(Math.random() * 20000000) + 10000000
	}));

	const monthlyData = Array.from({ length: 12 }, (_, i) => ({
		name: new Date(2024, i).toLocaleDateString('id-ID', { month: 'short' }),
		value: Math.floor(Math.random() * 50000000) + 20000000
	}));

	return { dailyData, weeklyData, monthlyData };
};

const mockRecentOrders = [
	{ id: 'ORD-001', date: '2025-01-25 14:30', status: 'completed' as const, total: 1250000 },
	{ id: 'ORD-002', date: '2025-01-25 13:15', status: 'processing' as const, total: 875000 },
	{ id: 'ORD-003', date: '2025-01-25 12:00', status: 'pending' as const, total: 2100000 },
	{ id: 'ORD-004', date: '2025-01-25 10:45', status: 'completed' as const, total: 450000 },
	{ id: 'ORD-005', date: '2025-01-25 09:20', status: 'completed' as const, total: 1800000 }
];

const mockLowStockProducts = [
	{ id: 1, name: 'Laptop ASUS ROG', stock: 2, threshold: 5 },
	{ id: 2, name: 'Mouse Gaming Logitech', stock: 3, threshold: 10 },
	{ id: 3, name: 'Keyboard Mechanical', stock: 1, threshold: 5 },
	{ id: 4, name: 'Monitor LG 27"', stock: 4, threshold: 8 }
];

const chartConfig = {
	value: {
		label: 'Penjualan',
		color: 'hsl(221.2 83.2% 53.3%)'
	}
};

export default function DashboardPage() {
	const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
	const [stats, setStats] = useState({
		todaySales: 0,
		todayRevenue: 0,
		todayOrders: 0,
		totalProducts: 0,
		totalCustomers: 0
	});
	const [chartData] = useState(generateMockData());

	// Simulasi refresh data setiap 5 menit (REQ-08-06)
	useEffect(() => {
		const fetchStats = () => {
			// Ganti dengan API call sesungguhnya
			setStats({
				todaySales: Math.floor(Math.random() * 50) + 20,
				todayRevenue: Math.floor(Math.random() * 10000000) + 5000000,
				todayOrders: Math.floor(Math.random() * 30) + 10,
				totalProducts: 156,
				totalCustomers: 1240
			});
		};

		fetchStats();
		const interval = setInterval(fetchStats, 5 * 60 * 1000); // 5 menit

		return () => clearInterval(interval);
	}, []);

	const getStatusBadge = (status: 'completed' | 'processing' | 'pending') => {
		const variants = {
			completed: 'default',
			processing: 'secondary',
			pending: 'outline'
		} as const;
		const labels = {
			completed: 'Selesai',
			processing: 'Diproses',
			pending: 'Menunggu'
		};
		return <Badge variant={variants[status]}>{labels[status]}</Badge>;
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	};

	const currentChartData =
		chartPeriod === 'daily'
			? chartData.dailyData
			: chartPeriod === 'weekly'
			? chartData.weeklyData
			: chartData.monthlyData;

	return (
		<section className="space-y-4">
			{/* Header */}
			<div className="flex items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600">Penjualan Hari Ini</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">{stats.todaySales}</p>
							<p className="text-xs text-gray-500 mt-1">transaksi</p>
						</div>
						<div className="bg-blue-50 p-3 rounded-lg">
							<ShoppingCart className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</p>
							<p className="text-2xl font-bold text-gray-900 mt-2">
								{formatCurrency(stats.todayRevenue)}
							</p>
							<p className="text-xs text-green-600 mt-1 font-medium">+12% dari kemarin</p>
						</div>
						<div className="bg-green-50 p-3 rounded-lg">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600">Pesanan Hari Ini</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayOrders}</p>
							<p className="text-xs text-gray-500 mt-1">pesanan baru</p>
						</div>
						<div className="bg-purple-50 p-3 rounded-lg">
							<ShoppingCart className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600">Jumlah Produk</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
							<p className="text-xs text-gray-500 mt-1">produk aktif</p>
						</div>
						<div className="bg-orange-50 p-3 rounded-lg">
							<Package className="w-6 h-6 text-orange-600" />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
							<p className="text-xs text-gray-500 mt-1">terdaftar</p>
						</div>
						<div className="bg-indigo-50 p-3 rounded-lg">
							<Users className="w-6 h-6 text-indigo-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Sales Chart */}
			<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
					<h3 className="text-xl font-semibold text-gray-900">Grafik Penjualan</h3>
					<Tabs
						value={chartPeriod}
						onValueChange={(value) => setChartPeriod(value as 'daily' | 'weekly' | 'monthly')}
					>
						<TabsList>
							<TabsTrigger
								value="daily"
								className="cursor-pointer"
							>
								7 Hari
							</TabsTrigger>
							<TabsTrigger
								value="weekly"
								className="cursor-pointer"
							>
								4 Minggu
							</TabsTrigger>
							<TabsTrigger
								value="monthly"
								className="cursor-pointer"
							>
								12 Bulan
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
				<ChartContainer
					config={chartConfig}
					className="h-80 w-full"
				>
					<AreaChart data={currentChartData}>
						<CartesianGrid
							vertical={false}
							strokeDasharray="3 3"
						/>
						<XAxis
							dataKey="name"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => `${value / 1000000}jt`}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>
						<Area
							dataKey="value"
							type="monotone"
							fill="var(--color-value)"
							fillOpacity={0.4}
							stroke="var(--color-value)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<h3 className="text-xl font-semibold text-gray-900 mb-4">Pesanan Terbaru</h3>
					<div className="space-y-3">
						{mockRecentOrders.map((order) => (
							<div
								key={order.id}
								className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<div>
									<p className="font-semibold text-gray-900">{order.id}</p>
									<p className="text-sm text-gray-600 mt-1">{order.date}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
									<div className="mt-2">{getStatusBadge(order.status)}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Low Stock Products */}
				<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
					<div className="flex items-center gap-3 mb-4">
						<div className="bg-orange-50 p-2 rounded-lg">
							<AlertTriangle className="w-5 h-5 text-orange-500" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900">Produk Stok Rendah</h3>
					</div>
					<div className="space-y-3">
						{mockLowStockProducts.map((product) => (
							<div
								key={product.id}
								className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
							>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-gray-900">{product.name}</p>
									<p className="text-sm text-gray-600 mt-1">Stok: {product.stock}</p>
								</div>
								<Button>Restock</Button>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
