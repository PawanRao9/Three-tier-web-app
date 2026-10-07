"use client";

import Link from "next/link";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard component
 * Displays a single product in a card format with image placeholder, name, price, and category
 */
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/dashboard/products/${product._id}`}>
      <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-400">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-1">
              {product.name}
            </h3>
          </div>
          <p className="mb-3 text-xs text-gray-500 line-clamp-2">
            {product.description || "No description available"}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {product.category}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500">
              Stock:{" "}
              <span
                className={
                  product.stock > 0 ? "font-medium text-green-600" : "font-medium text-red-600"
                }
              >
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
