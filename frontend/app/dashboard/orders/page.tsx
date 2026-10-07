"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import OrderCard from "@/components/OrderCard";
import { Order } from "@/types/order";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ShoppingCartIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

/**
 * User's orders page
 * Displays all orders placed by the authenticated user
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/orders/me?page=${page}&limit=10`);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-gray-600">Track and manage your orders</p>
        </div>
        <Button onClick={() => router.push("/dashboard/orders/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No orders yet
          </h3>
          <p className="mt-2 text-gray-500">
            Get started by creating your first order.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/orders/create")}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancel={handleCancelOrder}
              showActions
            />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
