import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "../../store.jsx"

export default function Orders() {
  const { orders, products, users, updateOrderStatus, deleteOrder } = useStore()
  const [userFilter, setUserFilter] = useState("")
  const [productFilter, setProductFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const usersById = useMemo(() => {
    const m = new Map()
    for (const u of users) m.set(u.id, u)
    return m
  }, [users])

  const describeUser = (u) => {
    if (!u) return ""
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
    return name ? `${name} (${u.email ?? ""})` : u.email ?? ""
  }

  const filtered = useMemo(() => {
    const q = userFilter.trim().toLowerCase()
    return orders.filter((order) => {
      if (q) {
        const u = usersById.get(order.userId)
        const haystack = [
          String(order.userId),
          u?.firstName,
          u?.lastName,
          u?.email,
          u ? `${u.firstName ?? ""} ${u.lastName ?? ""}` : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (productFilter !== "all") {
        const hasProduct = order.lines.some(
          (l) => String(l.itemId) === String(productFilter),
        )
        if (!hasProduct) return false
      }
      if (fromDate && order.date < fromDate) return false
      if (toDate && order.date > toDate) return false
      return true
    })
  }, [orders, userFilter, productFilter, fromDate, toDate, usersById])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">Orders</h1>
        <Link to="/admin" className="text-sm text-amber-400 underline">
          Back to Admin
        </Link>
      </div>
      <div className="grid gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 text-sm sm:grid-cols-4">
        <input
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filter by customer name, email, or id"
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-neutral-100"
        />
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-neutral-100"
        >
          <option value="all">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-neutral-100"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-neutral-100"
        />
      </div>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        {filtered.length === 0 ? (
          <p className="text-neutral-500">No orders match the selected filters.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="font-semibold text-neutral-100">
                  Order #{order.id}
                </p>
                <p className="text-sm text-neutral-400">
                  Customer:{" "}
                  {describeUser(usersById.get(order.userId)) ||
                    `User #${order.userId}`}
                </p>
                <p className="text-xs text-neutral-500">
                  User ID: {order.userId}
                </p>
                <p className="text-sm text-neutral-400">
                  Total: ${order.total_price?.toFixed(2) ?? "0.00"}
                </p>
                <p className="text-sm text-neutral-400">Date: {order.date}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Order Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-100"
                  >
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {order.status === "placed" && (
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="mt-1 text-sm text-red-400 underline hover:text-red-300"
                  >
                    Delete Order
                  </button>
                )}
                {order.shipTo?.line1 && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Ship to: {order.shipTo.name}, {order.shipTo.line1}
                    {order.shipTo.line2 ? `, ${order.shipTo.line2}` : ""},{" "}
                    {order.shipTo.city}, {order.shipTo.state}{" "}
                    {order.shipTo.postalCode}, {order.shipTo.country}
                  </p>
                )}
                <div className="mt-2 text-sm text-neutral-500">
                  {order.lines.map((line, i) => {
                    const p = products.find(
                      (product) => String(product.id) === String(line.itemId),
                    )
                    return (
                      <p key={`${order.id}-${line.itemId}-${i}`}>
                        {(p?.name ?? `Product ${line.itemId}`)} x {line.qty} @ ${line.unitPrice}
                      </p>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
