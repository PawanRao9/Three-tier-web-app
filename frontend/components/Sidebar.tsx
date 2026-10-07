"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

/**
 * Sidebar component for dashboard navigation
 * Provides quick access to all main sections
 */
export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Products", href: "/dashboard/products", icon: ShoppingBagIcon },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCartIcon },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: ChartBarIcon,
      disabled: true,
    },
  ];

  const adminNavigation = [
    { name: "User Management", href: "/dashboard/admin/users", icon: UserGroupIcon },
    { name: "Order Management", href: "/dashboard/admin/orders", icon: CogIcon },
  ];

  return (
    <aside className="hidden w-64 border-r border-gray-200 bg-white md:block">
      <div className="px-4 py-6">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase">
              Admin
            </p>
          </div>

          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
