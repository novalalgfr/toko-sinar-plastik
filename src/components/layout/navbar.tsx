'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History, LogOut, Menu, Settings, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import { Skeleton } from '../ui/skeleton';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useCart } from '@/context/CartContext';

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const { data: session, status } = useSession();

	const { getTotalItems } = useCart();
	const totalItems = getTotalItems();

	const navItems = [
		{ title: 'Beranda', href: '/' },
		{ title: 'Produk', href: '/produk' },
		{ title: 'Cara Belanja', href: '/cara-belanja' },
		{ title: 'Kontak Kami', href: '/kontak-kami' }
	];

	return (
		<nav className="w-full">
			<div className="container mx-auto px-4 md:px-6 lg:px-8 my-6">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center space-x-4">
						<Link href="/">
							<h1 className="font-bold text-xl">Sinar Plastik</h1>
							<h6 className="text-gray-700 text-sm">Kemasan & Bahan Kue</h6>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-1">
						<NavigationMenu>
							<NavigationMenuList>
								{/* Regular Nav Items */}
								{navItems.map((item) => {
									const isActive = pathname === item.href;

									return (
										<NavigationMenuItem key={item.title}>
											<NavigationMenuLink asChild>
												<Link
													href={item.href}
													className={cn(
														'inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm text-black transition-all !bg-transparent',
														isActive
															? 'font-bold text-primary'
															: 'text-gray-600 hover:text-black transition-colors'
													)}
												>
													{item.title}
												</Link>
											</NavigationMenuLink>
										</NavigationMenuItem>
									);
								})}
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					<div className="flex items-center">
						{status === 'loading' && <Skeleton className="h-10 w-20" />}

						{status === 'unauthenticated' && (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									asChild
								>
									<Link href="/login">Masuk</Link>
								</Button>
								<Button asChild>
									<Link href="/register">Daftar</Link>
								</Button>
							</div>
						)}

						{status === 'authenticated' && (
							<div className="flex items-center gap-4">
								<Link href="/keranjang">
									<button
										className={`rounded-full p-3 cursor-pointer border hover:bg-gray-100 ${
											pathname === '/keranjang'
												? 'bg-slate-900 border-0 hover:bg-slate-800'
												: 'border-gray-300'
										}`}
									>
										<ShoppingCart
											size={20}
											className={pathname === '/keranjang' ? 'text-white' : ''}
										/>
										{totalItems > 0 && (
											<Badge className="absolute ml-1 mt-[-8px] h-6 min-w-6 rounded-full px-1.5 font-mono text-xs bg-red-500 hover:bg-red-600 border-2 border-white">
												{totalItems}
											</Badge>
										)}
									</button>
								</Link>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											className={`rounded-full p-3 cursor-pointer border hover:bg-gray-100 ${
												pathname === '/setting' || pathname === '/riwayat-pesanan'
													? 'bg-slate-900 border-0 hover:bg-slate-800'
													: 'border-gray-300'
											}`}
										>
											<User
												size={20}
												className={
													pathname === '/setting' || pathname === '/riwayat-pesanan'
														? 'text-white'
														: ''
												}
											/>
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-48 space-y-1"
									>
										<DropdownMenuItem
											className="cursor-pointer"
											asChild
										>
											<Link href="/riwayat-pesanan">
												<History className="mr-2 h-4 w-4" />
												<span>Riwayat Pesanan</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											className="cursor-pointer"
											asChild
										>
											<Link href="/setting">
												<Settings className="mr-2 h-4 w-4" />
												<span>Setting</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="cursor-pointer"
											onClick={() => signOut({ callbackUrl: '/' })}
										>
											<LogOut className="mr-2 h-4 w-4" />
											<span>Keluar</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden">
						<Sheet
							open={isOpen}
							onOpenChange={setIsOpen}
						>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
								>
									<Menu className="h-5 w-5" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent
								side="right"
								className="w-80"
							>
								<SheetHeader>
									<SheetTitle className="font-black text-2xl">W.</SheetTitle>
								</SheetHeader>
								<div className="flex flex-col p-6">
									<div className="space-y-2">
										{navItems.map((item) => {
											const isActive = pathname === item.href;

											return (
												<Link
													key={item.title}
													href={item.href}
													onClick={() => setIsOpen(false)}
													className={cn(
														'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 hover:bg-white/60 hover:backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-sm',
														isActive
															? 'text-primary bg-black text-white font-semibold ring-1 ring-white/20'
															: 'text-gray-700 hover:text-black'
													)}
												>
													{item.title}
												</Link>
											);
										})}
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
}
