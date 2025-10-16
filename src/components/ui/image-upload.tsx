'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export function ImageUpload({ id, label }: { id: string; label: string }) {
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	return (
		<div className="grid w-full gap-2">
			<Label htmlFor={id}>{label}</Label>
			<label
				htmlFor={id}
				className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
			>
				<Upload className="h-10 w-10 text-gray-500 mb-2" />
				{file ? (
					<span className="text-sm text-gray-700">{file.name}</span>
				) : (
					<span className="text-sm text-gray-500 text-center">
						Klik untuk mengunggah atau seret & lepas
						<br /> PNG & JPG hingga 5MB
					</span>
				)}
			</label>
			<input
				id={id}
				type="file"
				accept="image/png, image/jpeg"
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	);
}
