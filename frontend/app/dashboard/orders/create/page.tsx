"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Product } from "@/types/product";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Create Order page
 * Allows users to select products and quantities to create a new order
 */
export default function CreateOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products?inStock=true&limit=100");
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Not enough stock available");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success("Added to order");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product._id !== productId));
      return;
    }
    const product = products.find((p) => p._id === productId);
    if (product && quantity > product.stock) {
      toast.error("Cannot exceed available stock");
      return;
    }
    setCart(
      cart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Please add at least one product to your order");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/orders", {
        products: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
      });
      toast.success("Order placed successfully!");
      router.push("/dashboard/orders");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Order</h1>
        <p className="mt-1 text-gray-600">
          Select products and quantities for your order
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Product List */}
        <div className="lg:col-span-2">
          <button
            onClick={() => setShowProductList(!showProductList)}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
          >
            <span className="font-medium text-gray-900">Available Products</span>
            {showProductList ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showProductList && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <Card key={product._id} padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.category}
                      </p>
                      <p className="mt-1 font-bold text-primary-600">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Stock: {product.stock}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div>
          <Card className="sticky top-24">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Order Summary
            </h3>

            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between border-b border-gray-100 pb-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                        className="rounded border border-gray-300 px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                        className="rounded border border-gray-300 px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={cart.length === 0}
            >
              Place Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
