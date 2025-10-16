// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function SignUpPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		// Validasi password match
		if (password !== confirmPassword) {
			setError('Password tidak cocok');
			setLoading(false);
			return;
		}

		// Validasi password minimal 6 karakter
		if (password.length < 6) {
			setError('Password minimal 6 karakter');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					email,
					password
				})
			});

			const data = await response.json();

			if (!response.ok) {
				// Translate error messages ke Indonesia
				if (data.error === 'Email already registered') {
					setError('Email sudah terdaftar');
				} else if (data.error === 'Invalid email format') {
					setError('Format email tidak valid');
				} else {
					setError(data.error || 'Pendaftaran gagal');
				}
				setLoading(false);
				return;
			}

			setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');

			// Redirect ke login setelah 2 detik
			setTimeout(() => {
				router.push('/login');
			}, 2000);
		} catch (err) {
			console.error('Signup error:', err);
			setError('Terjadi kesalahan saat pendaftaran');
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
						<h2 className="text-3xl font-bold tracking-tight text-gray-900">Buat Akun Baru</h2>
						<p className="mt-2 text-gray-600">Daftar untuk memulai berbelanja</p>
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

						{success && (
							<div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
								<CheckCircle2 className="h-4 w-4 flex-shrink-0" />
								<span>{success}</span>
							</div>
						)}

						<div className="space-y-2">
							<Label
								htmlFor="name"
								className="text-sm font-medium text-gray-700"
							>
								Nama Lengkap
							</Label>
							<Input
								id="name"
								name="name"
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="John Doe"
								className="h-12"
								disabled={loading}
							/>
						</div>

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
								disabled={loading}
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
								disabled={loading}
							/>
							<p className="text-xs text-gray-500">Minimal 6 karakter</p>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="text-sm font-medium text-gray-700"
							>
								Konfirmasi Password
							</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="••••••••"
								className="h-12"
								disabled={loading}
							/>
						</div>

						<div>
							<Button
								type="submit"
								disabled={loading || success !== ''}
								className="w-full h-12 bg-black text-white hover:bg-gray-800 focus-visible:ring-black cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Daftar'}
							</Button>
						</div>

						<div className="text-center text-sm">
							<span className="text-gray-600">Sudah punya akun? </span>
							<Link
								href="/login"
								className="font-semibold text-black hover:underline"
							>
								Login di sini
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
