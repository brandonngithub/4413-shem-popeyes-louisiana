import { Link } from "react-router-dom"
import { useStore } from "../../store.jsx"

export default function Orders() {
  const { orders } = useStore()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">Orders</h1>
        <Link to="/admin" className="text-sm text-amber-400 underline">
          Back to Admin
        </Link>
      </div>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        {orders.length === 0 ? (
          <p className="text-neutral-500">No orders available yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="font-semibold text-neutral-100">
                  Order #{order.id}
                </p>
                <p className="text-sm text-neutral-400">
                  User ID: {order.userId}
                </p>
                <p className="text-sm text-neutral-400">
                  Total: ${order.total_price?.toFixed(2) ?? "0.00"}
                </p>
                <p className="text-sm text-neutral-400">Date: {order.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
