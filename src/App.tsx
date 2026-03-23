import { useState, useCallback, useMemo } from "react";
import { useCart } from "./hooks/useCart";
import { products } from "./data/products";
import type { Product } from "./types";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import CheckoutModal from "./components/CheckoutModal";
import Toast from "./components/Toast";

function App() {
  const [view, setView] = useState<"shop" | "cart">("shop");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCheckout, setShowCheckout] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const {
    cartItems,
    addToCart,
    removeFromCart,
    incrementQty,
    decrementQty,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount,
  } = useCart();

  const filteredProducts = useMemo(
    () =>
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.category === selectedCategory),
    [selectedCategory]
  );

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "" });
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      showToast(`${product.name} added to cart`);
    },
    [addToCart, showToast]
  );

  const handleRemove = useCallback(
    (id: number) => {
      const item = cartItems.find((i) => i.id === id);
      removeFromCart(id);
      if (item) showToast(`${item.name} removed from cart`);
    },
    [cartItems, removeFromCart, showToast]
  );

  const handlePlaceOrder = useCallback(() => {
    clearCart();
    setShowCheckout(false);
    setView("shop");
    showToast("Order placed successfully!");
  }, [clearCart, showToast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar view={view} onNavigate={setView} itemCount={itemCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "shop" ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === "All"
                    ? "Product Wall"
                    : selectedCategory}
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"}
                </p>
              </div>
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        ) : (
          <Cart
            items={cartItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onIncrement={incrementQty}
            onDecrement={decrementQty}
            onRemove={handleRemove}
            onCheckout={() => setShowCheckout(true)}
            onContinueShopping={() => setView("shop")}
          />
        )}
      </main>

      {showCheckout && (
        <CheckoutModal
          items={cartItems}
          subtotal={subtotal}
          tax={tax}
          total={total}
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
      />
    </div>
  );
}

export default App;
