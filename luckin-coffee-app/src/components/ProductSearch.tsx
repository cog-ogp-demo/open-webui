'use client';

import { useState } from 'react';
import { searchProducts } from '@/lib/api';
import type { Product, CartItem, Shop } from '@/lib/types';

interface ProductSearchProps {
	token: string;
	shop: Shop;
	cart: CartItem[];
	onAddToCart: (item: CartItem) => void;
}

export default function ProductSearch({ token, shop, cart, onAddToCart }: ProductSearchProps) {
	const [query, setQuery] = useState('');
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	async function handleSearch() {
		if (!query.trim()) return;
		setLoading(true);
		setError('');
		try {
			const result = await searchProducts(token, shop.deptId, query);
			if (result?.data) {
				setProducts(result.data);
			} else if (Array.isArray(result)) {
				setProducts(result);
			} else {
				setProducts([]);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to search products');
		} finally {
			setLoading(false);
		}
	}

	function addProduct(product: Product) {
		const existing = cart.find((c) => c.productId === product.productId);
		onAddToCart({
			productId: product.productId,
			productName: product.productName,
			skuCode: product.skuCode,
			amount: existing ? existing.amount + 1 : 1,
			pictureUrl: product.pictureUrl,
			estimatePrice: product.estimatePrice
		});
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder='Search for coffee, e.g. "Iced Americano"'
					className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
				/>
				<button
					onClick={handleSearch}
					disabled={loading || !query.trim()}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
				>
					{loading ? '...' : 'Search'}
				</button>
			</div>

			{/* Quick search suggestions */}
			<div className="flex gap-2 flex-wrap">
				{['Americano', 'Latte', 'Mocha', 'Cappuccino', 'Matcha'].map((s) => (
					<button
						key={s}
						onClick={() => {
							setQuery(s);
							setTimeout(() => {
								searchProducts(token, shop.deptId, s).then((result) => {
									if (result?.data) setProducts(result.data);
									else if (Array.isArray(result)) setProducts(result);
								});
							}, 0);
						}}
						className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-700 transition"
					>
						{s}
					</button>
				))}
			</div>

			{error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

			{products.length > 0 && (
				<div className="grid gap-3">
					{products.map((product) => {
						const inCart = cart.find((c) => c.productId === product.productId);
						return (
							<div
								key={product.productId}
								className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition"
							>
								{product.pictureUrl && (
									<img
										src={product.pictureUrl}
										alt={product.productName}
										className="w-16 h-16 rounded-lg object-cover"
									/>
								)}
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-gray-900 truncate">{product.productName}</h3>
									{product.tags?.length > 0 && (
										<div className="flex gap-1 mt-1 flex-wrap">
											{product.tags.slice(0, 3).map((tag) => (
												<span
													key={tag}
													className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded"
												>
													{tag}
												</span>
											))}
										</div>
									)}
									<div className="flex items-baseline gap-2 mt-1">
										<span className="text-blue-600 font-semibold">¥{product.estimatePrice}</span>
										{product.initialPrice !== product.estimatePrice && (
											<span className="text-xs text-gray-400 line-through">
												¥{product.initialPrice}
											</span>
										)}
									</div>
								</div>
								<button
									onClick={() => addProduct(product)}
									className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition relative"
								>
									+
									{inCart && (
										<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
											{inCart.amount}
										</span>
									)}
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
