"use client";

import { Order } from "@/types/order";
import Badge from "@/components/ui/Badge";

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, status: string) => void;
  onCancel?: (orderId: string) => void;
  showActions?: boolean;
}

/**
 * Format a date string into a readable format
 */
function formatDate(dateString?: string) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * OrderCard component
 * Displays order summary with status badge and action buttons
 */
export default function OrderCard({
  order,
  onStatusChange,
  onCancel,
  showActions = false,
}: OrderCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
          <p className="text-xs text-gray-400">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={getStatusVariant(order.status)}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="mb-4 space-y-2">
        {order.products?.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700">
              {typeof item.product === "object" ? item.product.name : "Product"}{" "}
              × {item.quantity}
            </span>
            <span className="font-medium text-gray-900">
              ${(
                (typeof item.product === "object" ? item.product.price : 0) *
                item.quantity
              ).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-sm font-medium text-gray-500">Total</span>
        <span className="text-lg font-bold text-primary-600">
          ${order.totalAmount?.toFixed(2)}
        </span>
      </div>

      {showActions && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          {onStatusChange && order.status === "pending" && (
            <>
              <button
                onClick={() => onStatusChange(order._id, "shipped")}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
              >
                Mark Shipped
              </button>
              <button
                onClick={() => onStatusChange(order._id, "delivered")}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                Mark Delivered
              </button>
            </>
          )}
          {onCancel && order.status === "pending" && (
            <button
              onClick={() => onCancel(order._id)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
