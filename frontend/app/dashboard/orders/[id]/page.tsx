"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Order } from "@/types/order";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

/**
 * Single order detail page
 * Shows full order information and allows cancellation (for pending orders)
 */
export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setIsCancelling(true);
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Order cancelled successfully");
      setOrder({ ...order!, status: "cancelled" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Link
          href="/dashboard/orders"
          className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to orders
        </Link>
      </div>
    );
  }

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
    <div>
      <Link
        href="/dashboard/orders"
        className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to orders
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order._id.slice(-8)}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Placed on{" "}
                  {new Date(order.createdAt!).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-4">
              {order.products?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {typeof item.product === "object" ? item.product.name : "Product"}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${(item.product as any)?.price?.toFixed(2) || "0.00"} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${((item.product as any)?.price || 0 * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                ${order.totalAmount?.toFixed(2)}
              </span>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="mb-4 font-semibold text-gray-900">
              Order Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">
                  {typeof order.user === "object" ? order.user.name : "Unknown"}
                </p>
                {typeof order.user === "object" && (
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                )}
              </div>
              {order.shippingAddress && (
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="text-sm text-gray-900">
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>

            {order.status === "pending" && (
              <Button
                variant="danger"
                className="mt-6 w-full"
                onClick={handleCancel}
                isLoading={isCancelling}
              >
                <ArrowPathIcon className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
