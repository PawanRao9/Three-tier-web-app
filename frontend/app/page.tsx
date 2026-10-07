import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * Landing page for unauthenticated users
 * Features a hero section with call-to-action buttons
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary-600">
              3-Tier App
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              <span className="block">Full-stack</span>
              <span className="block text-primary-600">3-Tier Architecture</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              A production-ready e-commerce application built with Next.js, Node.js,
              Express, and MongoDB. Featuring authentication, role-based access,
              and comprehensive order management.
            </p>
            <div className="mx-auto mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Get started
                <ArrowRightIcon className="ml-2 inline h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:ring-gray-400"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                title: "Authentication",
                desc: "JWT-based auth with role-based access control (admin/user)",
              },
              {
                title: "Product Management",
                desc: "Browse, filter, and manage products with stock tracking",
              },
              {
                title: "Order System",
                desc: "Create orders, track status, and manage inventory",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
