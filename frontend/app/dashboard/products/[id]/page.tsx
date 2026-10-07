"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Product } from "@/types/product";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

/**
 * Single product detail page
 * Shows full product information including stock status
 */
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToOrder = async () => {
    setIsAddingToCart(true);
    try {
      await api.post("/orders", {
        products: [{ product: productId, quantity }],
      });
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link
          href="/dashboard/products"
          className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/products"
        className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-8xl font-bold text-gray-400">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Product Info */}
        <div>
          <Badge variant="info" className="mb-3">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-lg text-gray-600">{product.description}</p>

          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-4xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="mt-4">
            {product.stock > 0 ? (
              <Badge variant="success">In stock ({product.stock} available)</Badge>
            ) : (
              <Badge variant="danger">Out of stock</Badge>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center rounded-lg border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToOrder}
                isLoading={isAddingToCart}
              >
                <ShoppingCartIcon className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
