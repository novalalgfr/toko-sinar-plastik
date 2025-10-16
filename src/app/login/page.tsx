// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false
			});

			if (result?.error) {
				setError('Invalid email or password.');
			} else {
				// Ambil session untuk mendapatkan role
				const session = await getSession();

				// Redirect berdasarkan role
				if (session?.user?.role === 'admin') {
					router.push('/admin/example');
				} else {
					router.push('/');
				}
			}
		} catch (err) {
			setError('An error occurred during login.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid min-h-screen w-full lg:grid-cols-2">
			<div
				className="hidden bg-cover bg-center lg:block bg-gray-300"
				// style={{ backgroundImage: "url('/images/beranda-1.jpg')" }}
			></div>
			<div className="flex items-center justify-center bg-white p-8">
				<div className="w-full max-w-sm space-y-8">
					<div className="text-center">
						<h1 className="font-black text-2xl mb-6">Toko Sinar Plastik</h1>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang kembali</h2>
						<p className="mt-2 text-gray-600">Silahkan masukkan email dan password anda.</p>
					</div>
					<form
						className="space-y-6"
						onSubmit={handleSubmit}
					>
						{error && (
							<div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
								<AlertCircle className="h-4 w-4 flex-shrink-0" />
								<span>{error}</span>
							</div>
						)}
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm font-medium text-gray-700"
							>
								Email
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="h-12"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-medium text-gray-700"
							>
								Password
							</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="h-12"
							/>
						</div>
						<div>
							<Button
								type="submit"
								disabled={loading}
								className="w-full h-12 bg-black text-white hover:bg-gray-800 focus-visible:ring-black cursor-pointer"
							>
								{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
							</Button>
						</div>

						<div className="text-center text-sm">
							<span className="text-gray-600">Belum punya akun? </span>
							<Link
								href="/signup"
								className="font-semibold text-black hover:underline"
							>
								Daftar di sini
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
