import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { useStore } from "../store.jsx"

function formatStatus(order) {
  if (order.status === "cancelled") return "Cancelled"
  if (order.status === "delivered") return "Delivered"
  if (order.status === "shipped") return "Shipped"
  if (order.status === "placed") return "Placed"
}

function statusHint(label) {
  if (label === "Pending") return "payment/verification issues"
  if (label === "Unshipped") return "awaiting dispatch"
  if (label === "Shipped") return "on the way"
  if (label === "Delivered") return "delivered"
  return ""
}

export default function Orders() {
  const { user, orders, products, deleteOrder } = useStore()
  const { state } = useLocation()
  const [showPopup, setShowPopup] = useState(Boolean(state?.orderSuccess))

  const mine = useMemo(
    () => orders.filter((o) => o.userId === user?.id),
    [orders, user?.id],
  )

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">Orders</h1>
        <Link to="/" className="text-sm text-amber-400 underline">
          Continue shopping
        </Link>
      </div>

      {showPopup && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-200">
          <p>
            Order successful. #{state?.orderId} placed for ${state?.totalPrice}.
          </p>
          <button
            type="button"
            onClick={() => setShowPopup(false)}
            className="text-emerald-300 underline"
          >
            Close
          </button>
        </div>
      )}

      {mine.length === 0 ? (
        <p className="text-neutral-500">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {mine.map((o) => {
            const label = formatStatus(o)
            const firstItemId = o.lines[0]?.itemId
            const firstProduct = products.find(
              (p) => String(p.id) === String(firstItemId),
            )
            const iconSrc =
              firstProduct?.image ?? "https://picsum.photos/seed/order/80/80"
            return (
              <li
                key={o.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={iconSrc}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                    <p className="text-sm text-neutral-300">
                      Order #{o.id} • {o.date}
                    </p>
                  </div>
                  <p className="text-sm text-amber-400">${o.total_price}</p>
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  Status: {label}
                  {statusHint(label) ? ` (${statusHint(label)})` : ""}
                </p>
                <ul className="mt-2 text-sm text-neutral-500">
                  {o.lines.map((l, idx) => (
                    <li key={`${o.id}-${l.itemId}-${idx}`}>
                      {products.find((p) => String(p.id) === l.itemId)?.name ?? l.itemId} x {l.qty} @ ${l.unitPrice}
                    </li>
                  ))}
                </ul>

                {o.status === "placed" && (
                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="mt-1 text-sm text-red-400 underline hover:text-red-300"
                  >
                    Delete Order
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
