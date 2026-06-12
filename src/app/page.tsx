"use client";

import { useState } from "react";
import TokenInput from "@/components/TokenInput";
import ShopFinder from "@/components/ShopFinder";
import ProductSearch from "@/components/ProductSearch";
import Cart from "@/components/Cart";
import OrderPreviewPanel from "@/components/OrderPreviewPanel";
import OrderSuccess from "@/components/OrderSuccess";
import type { Shop, CartItem, OrderResult } from "@/lib/types";

type AppStep = "token" | "shop" | "menu" | "preview" | "success";

export default function Home() {
  const [token, setToken] = useState("");
  const [step, setStep] = useState<AppStep>("token");
  const [shop, setShop] = useState<Shop | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<OrderResult | null>(null);

  function handleTokenSet(t: string) {
    setToken(t);
    setStep("shop");
  }

  function handleShopSelect(s: Shop) {
    setShop(s);
    setStep("menu");
  }

  function handleAddToCart(item: CartItem) {
    setCart((prev) => {
      const existing = prev.findIndex((c) => c.productId === item.productId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = item;
        return updated;
      }
      return [...prev, item];
    });
  }

  function handleUpdateQuantity(productId: number, amount: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, amount } : item
      )
    );
  }

  function handleRemove(productId: number) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleCheckout() {
    setStep("preview");
  }

  function handleOrderCreated(result: OrderResult) {
    setOrder(result);
    setStep("success");
  }

  function handleNewOrder() {
    setCart([]);
    setOrder(null);
    setStep("menu");
  }

  if (step === "token") {
    return <TokenInput onTokenSet={handleTokenSet} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
            <h1 className="font-bold text-gray-900">Luckin Coffee</h1>
          </div>

          {shop && step !== "shop" && (
            <button
              onClick={() => setStep("shop")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Store
            </button>
          )}
        </div>

        {/* Store banner */}
        {shop && step !== "shop" && (
          <div className="max-w-2xl mx-auto px-4 pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{shop.deptName}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {step === "shop" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Find a Store
            </h2>
            <ShopFinder token={token} onShopSelect={handleShopSelect} />
          </div>
        )}

        {step === "menu" && shop && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Menu
              </h2>
              <ProductSearch
                token={token}
                shop={shop}
                cart={cart}
                onAddToCart={handleAddToCart}
              />
            </div>

            {/* Cart section */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Cart
                {cart.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {cart.reduce((sum, i) => sum + i.amount, 0)} items
                  </span>
                )}
              </h3>
              <Cart
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}

        {step === "preview" && shop && (
          <OrderPreviewPanel
            token={token}
            shop={shop}
            cart={cart}
            onOrderCreated={handleOrderCreated}
            onBack={() => setStep("menu")}
          />
        )}

        {step === "success" && order && (
          <OrderSuccess
            token={token}
            order={order}
            onNewOrder={handleNewOrder}
          />
        )}
      </main>
    </div>
  );
}
