'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
	id: string;
	label: string;
	onFileChange?: (file: File | null) => void;
	defaultPreview?: string | null;
}

export function ImageUpload({ id, label, onFileChange, defaultPreview }: ImageUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(defaultPreview || null);

	// Update preview jika defaultPreview berubah
	useEffect(() => {
		if (defaultPreview && !file) {
			setPreview(defaultPreview);
		}
	}, [defaultPreview, file]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);

			// Buat preview URL
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);

			// Kirim file ke parent component
			if (onFileChange) {
				onFileChange(selectedFile);
			}
		}
	};

	const handleRemove = () => {
		setFile(null);
		setPreview(null);

		// Reset input file
		const input = document.getElementById(id) as HTMLInputElement;
		if (input) {
			input.value = '';
		}

		// Kirim null ke parent component
		if (onFileChange) {
			onFileChange(null);
		}
	};

	return (
		<div className="grid w-full gap-2">
			<Label htmlFor={id}>{label}</Label>

			{preview ? (
				<div className="relative w-full h-48 rounded-lg border-2 border-gray-300 overflow-hidden">
					<Image
						src={preview}
						alt="Preview"
						fill
						className="object-cover"
						unoptimized
					/>
					<button
						type="button"
						onClick={handleRemove}
						className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition z-10"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
			) : (
				<label
					htmlFor={id}
					className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
				>
					<Upload className="h-10 w-10 text-gray-500 mb-2" />
					<span className="text-sm text-gray-500 text-center">
						Klik untuk mengunggah atau seret & lepas
						<br /> PNG & JPG hingga 5MB
					</span>
				</label>
			)}

			<input
				id={id}
				type="file"
				accept="image/png, image/jpeg"
				className="hidden"
				onChange={handleFileChange}
			/>

			{file && <span className="text-sm text-gray-600">File: {file.name}</span>}
		</div>
	);
}
