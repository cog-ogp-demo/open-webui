"use client";

import { useState } from "react";
import { previewOrder, createOrder } from "@/lib/api";
import type { CartItem, Shop, OrderPreview, OrderResult } from "@/lib/types";

interface OrderPreviewPanelProps {
  token: string;
  shop: Shop;
  cart: CartItem[];
  onOrderCreated: (result: OrderResult) => void;
  onBack: () => void;
}

export default function OrderPreviewPanel({
  token,
  shop,
  cart,
  onOrderCreated,
  onBack,
}: OrderPreviewPanelProps) {
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadPreview() {
    setLoading(true);
    setError("");
    try {
      const productList = cart.map((item) => ({
        amount: item.amount,
        productId: item.productId,
        skuCode: item.skuCode,
      }));
      const result = await previewOrder(token, shop.deptId, productList);
      if (result?.data) {
        setPreview(result.data);
      } else {
        setPreview(result);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrder() {
    setCreating(true);
    setError("");
    try {
      const productList = cart.map((item) => ({
        amount: item.amount,
        productId: item.productId,
        skuCode: item.skuCode,
      }));
      const result = await createOrder(
        token,
        shop.deptId,
        productList,
        shop.longitude,
        shop.latitude,
        preview?.couponCodeList
      );
      const orderData = result?.data || result;
      onOrderCreated(orderData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setCreating(false);
    }
  }

  // Auto-load preview on mount
  if (!preview && !loading && !error) {
    loadPreview();
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to menu
      </button>

      {loading && (
        <div className="text-center py-8">
          <svg className="animate-spin w-8 h-8 mx-auto text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-2 text-gray-600">Loading order preview...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={loadPreview} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          {/* Store info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{preview.shopInfo?.deptName || shop.deptName}</h3>
            <p className="text-sm text-gray-500">{preview.shopInfo?.address || shop.address}</p>
            {preview.aboutTime && (
              <p className="text-sm text-blue-600 mt-1">
                Ready by: {new Date(preview.aboutTime).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Products */}
          {preview.productInfoList?.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
              {item.breviaryPicUrl && (
                <img src={item.breviaryPicUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                {item.additionDesc && (
                  <p className="text-xs text-gray-500">{item.additionDesc}</p>
                )}
                <p className="text-xs text-gray-400">x{item.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">¥{item.estimatePrice}</p>
                {item.initPrice !== item.estimatePrice && (
                  <p className="text-xs text-gray-400 line-through">¥{item.initPrice}</p>
                )}
              </div>
            </div>
          ))}

          {/* Pricing */}
          <div className="border-t pt-3 space-y-2">
            {preview.totalInitialPrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Original Price</span>
                <span className="text-gray-600">¥{preview.totalInitialPrice}</span>
              </div>
            )}
            {preview.privilegeMoney > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-¥{preview.privilegeMoney}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">¥{preview.discountPrice}</span>
            </div>
          </div>

          {/* Place order button */}
          <button
            onClick={handleCreateOrder}
            disabled={creating}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {creating ? "Creating Order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
}
