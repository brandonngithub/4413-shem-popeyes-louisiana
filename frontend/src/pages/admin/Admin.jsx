import { Link } from "react-router-dom"

export default function Admin() {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-100">Admin</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/users"
          className="group block rounded-3xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-amber-400 hover:bg-neutral-950"
        >
          <h2 className="text-lg font-semibold text-neutral-100">Users</h2>
          <p className="mt-3 text-sm text-neutral-400">
            View and manage registered users.
          </p>
          <span className="mt-6 inline-flex items-center text-amber-400 transition group-hover:text-amber-300">
            Open users page
          </span>
        </Link>

        <Link
          to="/admin/orders"
          className="group block rounded-3xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-amber-400 hover:bg-neutral-950"
        >
          <h2 className="text-lg font-semibold text-neutral-100">Orders</h2>
          <p className="mt-3 text-sm text-neutral-400">
            Review order history and order details.
          </p>
          <span className="mt-6 inline-flex items-center text-amber-400 transition group-hover:text-amber-300">
            Open orders page
          </span>
        </Link>

        <Link
          to="/admin/products"
          className="group block rounded-3xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-amber-400 hover:bg-neutral-950"
        >
          <h2 className="text-lg font-semibold text-neutral-100">Products</h2>
          <p className="mt-3 text-sm text-neutral-400">
            Manage product inventory and stock levels.
          </p>
          <span className="mt-6 inline-flex items-center text-amber-400 transition group-hover:text-amber-300">
            Open products page
          </span>
        </Link>

        <Link
          to="/admin/create-product"
          className="group block rounded-3xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-amber-400 hover:bg-neutral-950"
        >
          <h2 className="text-lg font-semibold text-neutral-100">
            Create Product
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Add a new product to the catalog.
          </p>
          <span className="mt-6 inline-flex items-center text-amber-400 transition group-hover:text-amber-300">
            Open create product page
          </span>
        </Link>
      </div>
    </div>
  )
}
