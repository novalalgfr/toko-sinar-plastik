/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export interface AddressDetails {
	alamatPeta: string;
	kelurahan: string;
	kecamatan: string;
}

interface LeafletMapPickerProps {
	position: L.LatLngTuple;
	onPositionChange: (latlng: L.LatLng) => void;
	onAddressFound: (details: AddressDetails) => void;
}

const customIcon = new L.Icon({
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

function MapController({ onPositionChange }: { onPositionChange: (latlng: L.LatLng) => void }) {
	const map = useMap();

	useMapEvents({
		click(e) {
			onPositionChange(e.latlng);
		}
	});

	(window as any).flyToLocation = (lat: number, lon: number) => {
		map.flyTo([lat, lon], 15);
	};

	return null;
}

export default function LeafletMapPicker({ position, onPositionChange, onAddressFound }: LeafletMapPickerProps) {
	const [searchQuery, setSearchQuery] = useState('');

	const fetchReverseGeocode = async (lat: number, lon: number) => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
			);
			const data = await response.json();

			if (data && data.address) {
				const addr = data.address;
				const addressDetails: AddressDetails = {
					alamatPeta:
						[addr.road, addr.house_number].filter(Boolean).join(' ') ||
						data.display_name.split(',')[0] ||
						'',
					kelurahan: addr.village || addr.suburb || '',
					kecamatan: addr.city_district || addr.county || ''
				};
				onAddressFound(addressDetails);
			}
		} catch (error) {
			console.error('Gagal melakukan reverse geocoding:', error);
		}
	};

	useEffect(() => {
		const handler = setTimeout(() => {
			fetchReverseGeocode(position[0], position[1]);
		}, 1000);

		return () => clearTimeout(handler);
	}, [position]);

	const handleSearch = async () => {
		if (!searchQuery) return;
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
					searchQuery
				)}&format=json&limit=1&countrycodes=id`
			);
			const data = await response.json();
			if (data && data.length > 0) {
				const { lat, lon } = data[0];
				const newPosition = new L.LatLng(parseFloat(lat), parseFloat(lon));
				onPositionChange(newPosition);
				if ((window as any).flyToLocation) {
					(window as any).flyToLocation(newPosition.lat, newPosition.lng);
				}
			} else {
				alert('Alamat tidak ditemukan.');
			}
		} catch (error) {
			alert('Terjadi kesalahan saat mencari alamat.');
		}
	};

	return (
		<div className="relative h-full w-full">
			<div className="absolute top-2 right-2 z-[1000] w-[90%] max-w-md flex gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Cari alamat..."
					className="flex-grow"
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<Button
					onClick={handleSearch}
					className="bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
				>
					Cari
				</Button>
			</div>
			<MapContainer
				center={position}
				zoom={15}
				style={{ height: '100%', width: '100%' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker
					position={position}
					icon={customIcon}
				/>
				<MapController onPositionChange={onPositionChange} />
			</MapContainer>
		</div>
	);
}
