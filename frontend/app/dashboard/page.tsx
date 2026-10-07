"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

/**
 * Dashboard home page
 * Displays key metrics and quick links for authenticated users
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get("/products?limit=1"),
          api.get("/orders?limit=1"),
          user?.role === "admin" ? api.get("/users?limit=1") : Promise.resolve({ data: { totalUsers: 0 } }),
        ]);

        // Get all orders for revenue calculation
        const allOrdersRes = await api.get("/orders?limit=1000");

        setStats({
          totalProducts: productsRes.data.total || 0,
          totalOrders: ordersRes.data.total || 0,
          totalUsers: usersRes.data.totalUsers || 0,
          totalRevenue: allOrdersRes.data.orders?.reduce(
            (sum: number, order: { totalAmount: number }) => sum + order.totalAmount,
            0
          ) || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.role]);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
      href: "/dashboard/products",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      color: "bg-green-500",
      href: "/dashboard/orders",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: "bg-purple-500",
      href: user?.role === "admin" ? "/dashboard/admin/users" : "/dashboard/orders",
      adminOnly: true,
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "bg-yellow-500",
      href: "/dashboard/orders",
    },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards
          .filter((card) => !card.adminOnly || user?.role === "admin")
          .map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                  <div className={`rounded-lg ${card.color} p-3 text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/products"
              className="rounded-lg border border-gray-200 p-4 text-center hover:border-primary-500 hover:bg-primary-50"
            >
              <ShoppingBagIcon className="mx-auto h-8 w-8 text-primary-600" />
              <p className="mt-2 text-sm font-medium text-gray-700">
                Browse Products
              </p>
            </Link>
            <Link
              href="/dashboard/orders"
              className="rounded-lg border border-gray-200 p-4 text-center hover:border-primary-500 hover:bg-primary-50"
            >
              <ShoppingCartIcon className="mx-auto h-8 w-8 text-primary-600" />
              <p className="mt-2 text-sm font-medium text-gray-700">
                My Orders
              </p>
            </Link>
            {user?.role === "admin" && (
              <>
                <Link
                  href="/dashboard/admin/users"
                  className="rounded-lg border border-gray-200 p-4 text-center hover:border-primary-500 hover:bg-primary-50"
                >
                  <UserGroupIcon className="mx-auto h-8 w-8 text-primary-600" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Manage Users
                  </p>
                </Link>
                <Link
                  href="/dashboard/admin/orders"
                  className="rounded-lg border border-gray-200 p-4 text-center hover:border-primary-500 hover:bg-primary-50"
                >
                  <ArrowTrendingUpIcon className="mx-auto h-8 w-8 text-primary-600" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Manage Orders
                  </p>
                </Link>
              </>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Your Profile
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.name}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Role</span>
              <Badge variant={user?.role === "admin" ? "info" : "default"}>
                {user?.role}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
