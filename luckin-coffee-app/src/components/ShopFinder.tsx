'use client';

import { useState } from 'react';
import { queryShops } from '@/lib/api';
import type { Shop } from '@/lib/types';

interface ShopFinderProps {
	token: string;
	onShopSelect: (shop: Shop) => void;
}

export default function ShopFinder({ token, onShopSelect }: ShopFinderProps) {
	const [shops, setShops] = useState<Shop[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [searchName, setSearchName] = useState('');
	const [located, setLocated] = useState(false);
	const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);

	async function findNearby() {
		setLoading(true);
		setError('');

		try {
			// Try geolocation first; fall back to default coords (Singapore)
			let lng = 103.8198;
			let lat = 1.3521;

			if (navigator.geolocation) {
				try {
					const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
						navigator.geolocation.getCurrentPosition(resolve, reject, {
							timeout: 5000
						})
					);
					lng = pos.coords.longitude;
					lat = pos.coords.latitude;
				} catch {
					// Use default
				}
			}

			setCoords({ lng, lat });
			setLocated(true);

			const result = await queryShops(token, lng, lat, searchName || undefined);
			if (result?.data) {
				setShops(result.data);
			} else if (Array.isArray(result)) {
				setShops(result);
			} else {
				setShops([]);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to find shops');
		} finally {
			setLoading(false);
		}
	}

	async function searchByName() {
		if (!coords) {
			await findNearby();
			return;
		}
		setLoading(true);
		setError('');
		try {
			const result = await queryShops(token, coords.lng, coords.lat, searchName || undefined);
			if (result?.data) {
				setShops(result.data);
			} else if (Array.isArray(result)) {
				setShops(result);
			} else {
				setShops([]);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to search shops');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<input
					type="text"
					value={searchName}
					onChange={(e) => setSearchName(e.target.value)}
					placeholder="Search by store name (optional)"
					className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
				/>
				<button
					onClick={located ? searchByName : findNearby}
					disabled={loading}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
				>
					{loading ? (
						<span className="inline-flex items-center gap-1">
							<svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
									fill="none"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
							Searching
						</span>
					) : located ? (
						'Search'
					) : (
						'Find Nearby'
					)}
				</button>
			</div>

			{error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

			{shops.length > 0 && (
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{shops.map((shop) => (
						<button
							key={shop.deptId}
							onClick={() => onShopSelect(shop)}
							className="w-full text-left p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
						>
							<div className="flex justify-between items-start">
								<div>
									<h3 className="font-medium text-gray-900">{shop.deptName}</h3>
									<p className="text-sm text-gray-500 mt-1">{shop.address}</p>
									{shop.deptTags?.length > 0 && (
										<div className="flex gap-1 mt-2 flex-wrap">
											{shop.deptTags.map((tag) => (
												<span
													key={tag}
													className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
												>
													{tag}
												</span>
											))}
										</div>
									)}
								</div>
								<div className="text-right shrink-0 ml-4">
									{shop.distance != null && (
										<span className="text-sm text-gray-500">
											{shop.distance < 1
												? `${Math.round(shop.distance * 1000)}m`
												: `${shop.distance.toFixed(1)}km`}
										</span>
									)}
									<p className="text-xs text-gray-400 mt-1">
										{shop.workTimeStart} - {shop.workTimeEnd}
									</p>
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			{located && shops.length === 0 && !loading && !error && (
				<p className="text-center text-gray-500 py-4">No stores found. Try a different search.</p>
			)}
		</div>
	);
}
