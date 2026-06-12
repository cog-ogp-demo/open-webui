"use client";

import { useState } from "react";
import { getOrderDetail, cancelOrder } from "@/lib/api";
import type { OrderResult, OrderDetail } from "@/lib/types";

interface OrderSuccessProps {
  token: string;
  order: OrderResult;
  onNewOrder: () => void;
}

const STATUS_MAP: Record<number, string> = {
  10: "Pending Payment",
  20: "Order Placed",
  30: "Preparing",
  60: "Ready for Pickup",
  80: "Completed",
  100: "Cancelled",
};

export default function OrderSuccess({
  token,
  order,
  onNewOrder,
}: OrderSuccessProps) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  async function checkStatus() {
    setLoading(true);
    setError("");
    try {
      const result = await getOrderDetail(token, order.orderIdStr);
      const data = result?.data || result;
      setDetail(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get order status");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setError("");
    try {
      await cancelOrder(token, order.orderIdStr);
      await checkStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Order Created!</h2>
        <p className="text-gray-500 mt-1">Order #{order.orderIdStr}</p>
      </div>

      {/* Payment info */}
      {order.needPay && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Payment Required</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Amount: <span className="font-bold">¥{order.discountPrice}</span>
          </p>
          {order.payOrderQrCodeUrl && (
            <div className="text-center">
              <img
                src={order.payOrderQrCodeUrl}
                alt="Payment QR Code"
                className="w-48 h-48 mx-auto border rounded-lg"
              />
              <p className="text-xs text-yellow-600 mt-2">
                Scan with WeChat to pay
              </p>
            </div>
          )}
          {order.payOrderUrl && !order.payOrderQrCodeUrl && (
            <a
              href={order.payOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Pay Now
            </a>
          )}
        </div>
      )}

      {!order.needPay && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-medium">
            No payment needed - Coupon applied!
          </p>
        </div>
      )}

      {/* Order status */}
      {detail && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-medium text-gray-900">
              {STATUS_MAP[detail.orderStatus] || detail.orderStatusName}
            </span>
          </div>
          {detail.takeMealCodeInfo?.code && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup Code</span>
              <span className="font-bold text-2xl text-blue-600">
                {detail.takeMealCodeInfo.code}
              </span>
            </div>
          )}
          {detail.shopInfo && (
            <div className="flex justify-between">
              <span className="text-gray-600">Store</span>
              <span className="text-gray-900">{detail.shopInfo.deptName}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={checkStatus}
          disabled={loading}
          className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition"
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
        <button
          onClick={handleCancel}
          disabled={cancelling || (detail?.orderStatus === 100)}
          className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      </div>

      <button
        onClick={onNewOrder}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        New Order
      </button>
    </div>
  );
}
