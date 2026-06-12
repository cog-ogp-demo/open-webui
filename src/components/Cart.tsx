"use client";

import type { CartItem } from "@/lib/types";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, amount: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
}

export default function Cart({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.estimatePrice * item.amount,
    0
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-2 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <p>Your cart is empty</p>
        <p className="text-sm mt-1">Search for products to add</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          {item.pictureUrl && (
            <img
              src={item.pictureUrl}
              alt={item.productName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.productName}
            </h4>
            <p className="text-sm text-blue-600">
              ¥{item.estimatePrice}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                item.amount > 1
                  ? onUpdateQuantity(item.productId, item.amount - 1)
                  : onRemove(item.productId)
              }
              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-sm font-medium w-4 text-center text-gray-900">
              {item.amount}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.productId, item.amount + 1)
              }
              className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Estimated Total</span>
          <span className="text-xl font-bold text-gray-900">
            ¥{total.toFixed(2)}
          </span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Preview Order
        </button>
      </div>
    </div>
  );
}
